import { Context } from 'hono';

// ── POST /api/simulate/:apiKeyId
// Body: { hypotheticalLimit: number, windowSeconds?: number, configId?: number }
// Returns: comparison of current vs simulated limit against real historical data
// ─────────────────────────────────────────────────────────────────────────────

export async function simulateLimit(c: Context) {
  try {
    const user = c.get('user');
    const isPro = user.plan === 'pro' || user.plan === 'enterprise';
    if (!isPro) return c.json({ error: 'Pro plan required' }, 403);

    const { apiKeyId } = c.req.param();
    const body = await c.req.json().catch(() => ({}));
    const { hypotheticalLimit, windowSeconds, configId } = body as any;

    if (!hypotheticalLimit || hypotheticalLimit < 1) {
      return c.json({ error: 'hypotheticalLimit must be a positive number' }, 400);
    }

    // Verify ownership
    const apiKey = await c.env.DB.prepare(
      'SELECT id FROM api_keys WHERE id = ? AND user_id = ?'
    ).bind(apiKeyId, user.id).first();
    if (!apiKey) return c.json({ error: 'API key not found' }, 404);

    // Get config to know current limit & window
    let config: any = null;
    if (configId) {
      config = await c.env.DB.prepare(
        'SELECT * FROM ratelimit_configs WHERE id = ? AND api_key_id = ?'
      ).bind(configId, apiKeyId).first();
    } else {
      config = await c.env.DB.prepare(
        'SELECT * FROM ratelimit_configs WHERE api_key_id = ? AND enabled = 1 ORDER BY created_at ASC LIMIT 1'
      ).bind(apiKeyId).first();
    }

    const currentLimit = config?.max_requests ?? 100;
    const window = windowSeconds ?? config?.window_seconds ?? 60;

    // Pull last 7 days of logs, grouped by sliding minute-windows
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { results: rawLogs } = await c.env.DB.prepare(`
      SELECT ip, endpoint, timestamp
      FROM request_logs
      WHERE api_key_id = ? AND timestamp > ?
      ORDER BY ip, timestamp ASC
    `).bind(apiKeyId, sevenDaysAgo).all() as any;

    if (!rawLogs || rawLogs.length === 0) {
      return c.json({
        message: 'Nicht genug Daten für eine Simulation (mindestens 1 Tag Traffic benötigt)',
        hasData: false,
      });
    }

    // Simulate sliding window per IP
    // For each IP, replay requests and count allowed/blocked with current and hypothetical limit
    const ipGroups: Record<string, number[]> = {};
    for (const log of rawLogs as any[]) {
      const key = `${log.ip}|${log.endpoint}`;
      if (!ipGroups[key]) ipGroups[key] = [];
      ipGroups[key].push(new Date(log.timestamp).getTime());
    }

    let currentAllowed = 0, currentBlocked = 0;
    let simAllowed = 0, simBlocked = 0;

    for (const timestamps of Object.values(ipGroups)) {
      const windowMs = window * 1000;
      let curWindow: number[] = [];
      let simWindow: number[] = [];

      for (const ts of timestamps) {
        // Slide window
        curWindow = curWindow.filter(t => ts - t < windowMs);
        simWindow = simWindow.filter(t => ts - t < windowMs);

        if (curWindow.length < currentLimit) {
          currentAllowed++;
          curWindow.push(ts);
        } else {
          currentBlocked++;
        }

        if (simWindow.length < hypotheticalLimit) {
          simAllowed++;
          simWindow.push(ts);
        } else {
          simBlocked++;
        }
      }
    }

    const total = currentAllowed + currentBlocked;
    const currentBlockPct = total > 0 ? Math.round((currentBlocked / total) * 100 * 10) / 10 : 0;
    const simBlockPct     = total > 0 ? Math.round((simBlocked / total) * 100 * 10) / 10 : 0;
    const blockedDiff     = currentBlocked - simBlocked; // positive = sim blocks fewer
    const blockedDiffPct  = currentBlocked > 0
      ? Math.round(((currentBlocked - simBlocked) / currentBlocked) * 100)
      : 0;

    // Unique IPs affected
    const affectedIpsCurrent = new Set(
      (rawLogs as any[]).filter((_: any, i: number) => {
        // We don't track per log, just estimate from block rate
        return false;
      })
    ).size;

    // Hourly breakdown for chart
    const hourlyMap: Record<string, { curAllowed: number; curBlocked: number; simAllowed: number; simBlocked: number }> = {};
    // Re-run per hour for chart data
    const ipHourGroups: Record<string, Record<string, number[]>> = {};
    for (const log of rawLogs as any[]) {
      const hour = new Date(log.timestamp).toISOString().slice(0, 13);
      const key = `${log.ip}|${log.endpoint}`;
      if (!ipHourGroups[hour]) ipHourGroups[hour] = {};
      if (!ipHourGroups[hour][key]) ipHourGroups[hour][key] = [];
      ipHourGroups[hour][key].push(new Date(log.timestamp).getTime());
    }

    for (const [hour, ipMap] of Object.entries(ipHourGroups)) {
      let hca = 0, hcb = 0, hsa = 0, hsb = 0;
      for (const timestamps of Object.values(ipMap)) {
        const windowMs = window * 1000;
        let cw: number[] = [], sw: number[] = [];
        for (const ts of timestamps) {
          cw = cw.filter(t => ts - t < windowMs);
          sw = sw.filter(t => ts - t < windowMs);
          if (cw.length < currentLimit) { hca++; cw.push(ts); } else hcb++;
          if (sw.length < hypotheticalLimit) { hsa++; sw.push(ts); } else hsb++;
        }
      }
      hourlyMap[hour] = { curAllowed: hca, curBlocked: hcb, simAllowed: hsa, simBlocked: hsb };
    }

    const hourlyChart = Object.entries(hourlyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-48) // last 48 hours
      .map(([hour, d]) => ({ hour, ...d }));

    return c.json({
      hasData: true,
      config: {
        currentLimit,
        hypotheticalLimit,
        windowSeconds: window,
      },
      current: {
        allowed: currentAllowed,
        blocked: currentBlocked,
        blockPct: currentBlockPct,
      },
      simulated: {
        allowed: simAllowed,
        blocked: simBlocked,
        blockPct: simBlockPct,
      },
      delta: {
        blockedDiff,
        blockedDiffPct,
        direction: blockedDiff > 0 ? 'fewer_blocks' : blockedDiff < 0 ? 'more_blocks' : 'no_change',
        summary: blockedDiff > 0
          ? `Mit Limit ${hypotheticalLimit} wären ${Math.abs(blockedDiff).toLocaleString()} Requests weniger blockiert (${Math.abs(blockedDiffPct)}% Reduktion)`
          : blockedDiff < 0
          ? `Mit Limit ${hypotheticalLimit} wären ${Math.abs(blockedDiff).toLocaleString()} Requests mehr blockiert (+${Math.abs(blockedDiffPct)}%)`
          : 'Kein Unterschied bei diesem Limit',
      },
      totalRequests: total,
      hourlyChart,
    });
  } catch (error: any) {
    console.error('Simulation error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}
