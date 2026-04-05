import { Context } from 'hono';
import { reportErrorToHQ } from '../hq-reporter';

// ── Main Analytics ─────────────────────────────────────────────────────────────

export async function getAnalytics(c: Context) {
  try {
    const user = c.get('user');
    const { apiKeyId } = c.req.param();
    const timeRange = c.req.query('range') || '24h';
    const isPro = user.plan === 'pro' || user.plan === 'enterprise';

    const apiKey = await c.env.DB.prepare(
      'SELECT id FROM api_keys WHERE id = ? AND user_id = ?'
    ).bind(apiKeyId, user.id).first();
    if (!apiKey) return c.json({ error: 'API key not found' }, 404);

    // Free plan: max 24h. Pro: up to 30d. Enterprise: 90d.
    let hoursBack = 24;
    if (isPro) {
      if (timeRange === '7d') hoursBack = 168;
      if (timeRange === '30d') hoursBack = 720;
    }
    const timeAgo = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();

    // ── Core summary ──
    const totalStats = await c.env.DB.prepare(`
      SELECT
        COUNT(*) as total_requests,
        SUM(CASE WHEN blocked = 1 THEN 1 ELSE 0 END) as blocked_requests,
        COUNT(DISTINCT ip_address) as unique_ips,
        SUM(CASE WHEN status_code = 429 THEN 1 ELSE 0 END) as rate_limited_count
      FROM request_logs
      WHERE api_key_id = ? AND timestamp > ?
    `).bind(apiKeyId, timeAgo).first();

    // ── Hourly data ──
    const { results: hourlyData } = await c.env.DB.prepare(`
      SELECT
        strftime('%Y-%m-%d %H:00:00', timestamp) as hour,
        COUNT(*) as requests,
        SUM(CASE WHEN blocked = 1 THEN 1 ELSE 0 END) as blocked
      FROM request_logs
      WHERE api_key_id = ? AND timestamp > ?
      GROUP BY hour ORDER BY hour ASC
    `).bind(apiKeyId, timeAgo).all();

    // ── Top endpoints ──
    const { results: topEndpoints } = await c.env.DB.prepare(`
      SELECT endpoint, COUNT(*) as count,
        SUM(CASE WHEN blocked = 1 THEN 1 ELSE 0 END) as blocked_count
      FROM request_logs
      WHERE api_key_id = ? AND timestamp > ?
      GROUP BY endpoint ORDER BY count DESC LIMIT 10
    `).bind(apiKeyId, timeAgo).all();

    // ── Top IPs ──
    const { results: topIps } = await c.env.DB.prepare(`
      SELECT ip_address, COUNT(*) as count,
        SUM(CASE WHEN blocked = 1 THEN 1 ELSE 0 END) as blocked_count
      FROM request_logs
      WHERE api_key_id = ? AND timestamp > ?
      GROUP BY ip_address ORDER BY count DESC LIMIT 10
    `).bind(apiKeyId, timeAgo).all();

    // ── Pro: Anomaly detection ──
    let anomalySignals: any[] = [];
    let retryPatterns: any[] = [];

    if (isPro) {
      const total = (totalStats as any)?.total_requests || 0;
      const blockedReqs = (totalStats as any)?.blocked_requests || 0;
      const blockRate = total > 0 ? (blockedReqs / total) * 100 : 0;

      // Traffic spike detection: compare last 1h vs average of previous hours
      const lastHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const prevPeriodAgo = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();

      const lastHourCount = await c.env.DB.prepare(`
        SELECT COUNT(*) as count FROM request_logs
        WHERE api_key_id = ? AND timestamp > ?
      `).bind(apiKeyId, lastHourAgo).first() as any;

      const prevPeriodCount = await c.env.DB.prepare(`
        SELECT COUNT(*) as count FROM request_logs
        WHERE api_key_id = ? AND timestamp > ? AND timestamp <= ?
      `).bind(apiKeyId, prevPeriodAgo, lastHourAgo).first() as any;

      const lastHour = lastHourCount?.count || 0;
      const prevAvgPerHour = hoursBack > 1 ? ((prevPeriodCount?.count || 0) / (hoursBack - 1)) : 0;

      if (lastHour > 0 && prevAvgPerHour > 0 && lastHour > prevAvgPerHour * 2) {
        anomalySignals.push({
          type: 'traffic_spike',
          severity: lastHour > prevAvgPerHour * 5 ? 'critical' : 'warning',
          message: `Traffic-Spike erkannt: ${lastHour} Requests in letzter Stunde (Durchschnitt: ${Math.round(prevAvgPerHour)}/h)`,
          value: lastHour,
          baseline: Math.round(prevAvgPerHour),
          multiplier: Math.round(lastHour / prevAvgPerHour),
        });
      }

      // High block rate
      if (blockRate > 20) {
        anomalySignals.push({
          type: 'high_block_rate',
          severity: blockRate > 50 ? 'critical' : 'warning',
          message: `Hohe Blockierrate: ${Math.round(blockRate)}% aller Requests geblockt`,
          value: Math.round(blockRate),
        });
      }

      // Single IP dominance: if top IP is >40% of all traffic
      if ((topIps[0] as any)?.count && total > 0) {
        const topIpPct = ((topIps[0] as any).count / total) * 100;
        if (topIpPct > 40) {
          anomalySignals.push({
            type: 'ip_dominance',
            severity: topIpPct > 70 ? 'critical' : 'warning',
            message: `IP ${(topIps[0] as any).ip_address} verursacht ${Math.round(topIpPct)}% des gesamten Traffics`,
            ip: (topIps[0] as any).ip_address,
            value: Math.round(topIpPct),
          });
        }
      }

      // Retry pattern detection: IPs with high request counts in short windows
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      const { results: burstIps } = await c.env.DB.prepare(`
        SELECT ip_address, COUNT(*) as count,
          MIN(timestamp) as first_seen,
          MAX(timestamp) as last_seen,
          SUM(CASE WHEN blocked = 1 THEN 1 ELSE 0 END) as blocked_count
        FROM request_logs
        WHERE api_key_id = ? AND timestamp > ?
        GROUP BY ip_address
        HAVING count > 10
        ORDER BY count DESC
        LIMIT 10
      `).bind(apiKeyId, twoHoursAgo).all();

      retryPatterns = (burstIps as any[]).map(ip => {
        const duration = ip.first_seen && ip.last_seen
          ? (new Date(ip.last_seen).getTime() - new Date(ip.first_seen).getTime()) / 1000
          : 0;
        const rps = duration > 0 ? (ip.count / duration).toFixed(2) : '—';
        const isAggressive = parseFloat(rps as string) > 1;
        return {
          ip: ip.ip_address,
          count: ip.count,
          blockedCount: ip.blocked_count,
          firstSeen: ip.first_seen,
          lastSeen: ip.last_seen,
          reqPerSecond: rps,
          isAggressive,
          blockRate: ip.count > 0 ? Math.round((ip.blocked_count / ip.count) * 100) : 0,
        };
      });
    }

    // ── Last 5 min realtime (all plans, limited) ──
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const oneMinAgo = new Date(Date.now() - 60 * 1000).toISOString();

    const last5min = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM request_logs WHERE api_key_id = ? AND timestamp > ?'
    ).bind(apiKeyId, fiveMinAgo).first() as any;

    const last1min = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM request_logs WHERE api_key_id = ? AND timestamp > ?'
    ).bind(apiKeyId, oneMinAgo).first() as any;

    return c.json({
      summary: totalStats,
      hourly: hourlyData,
      topEndpoints,
      topIps,
      anomalySignals: isPro ? anomalySignals : [],
      retryPatterns: isPro ? retryPatterns : [],
      realtime: {
        last1min: last1min?.count || 0,
        last5min: last5min?.count || 0,
      },
      meta: { timeRange, hoursBack, isPro },
    });
  } catch (error: any) {
    console.error('Get analytics error:', error);
    reportErrorToHQ(c.env, 'AnalyticsError', error?.message || String(error), { stack: error?.stack });
    return c.json({ error: 'Internal server error' }, 500);
  }
}

// ── Recent Logs (with filters) ─────────────────────────────────────────────────

export async function getRecentLogs(c: Context) {
  try {
    const user = c.get('user');
    const { apiKeyId } = c.req.param();
    const limit = Math.min(parseInt(c.req.query('limit') || '100'), 500);
    const ipFilter = c.req.query('ip') || '';
    const endpointFilter = c.req.query('endpoint') || '';
    const statusFilter = c.req.query('status') || ''; // 'blocked' | 'allowed' | ''
    const methodFilter = c.req.query('method') || '';

    const apiKey = await c.env.DB.prepare(
      'SELECT id FROM api_keys WHERE id = ? AND user_id = ?'
    ).bind(apiKeyId, user.id).first();
    if (!apiKey) return c.json({ error: 'API key not found' }, 404);

    let whereClause = 'WHERE api_key_id = ?';
    const params: any[] = [apiKeyId];

    if (ipFilter) { whereClause += ' AND ip_address LIKE ?'; params.push(`%${ipFilter}%`); }
    if (endpointFilter) { whereClause += ' AND endpoint LIKE ?'; params.push(`%${endpointFilter}%`); }
    if (statusFilter === 'blocked') { whereClause += ' AND blocked = 1'; }
    if (statusFilter === 'allowed') { whereClause += ' AND blocked = 0'; }
    if (methodFilter) { whereClause += ' AND method = ?'; params.push(methodFilter.toUpperCase()); }

    params.push(limit);

    const { results } = await c.env.DB.prepare(`
      SELECT ip_address, user_agent, endpoint, method, status_code, blocked, timestamp
      FROM request_logs ${whereClause}
      ORDER BY timestamp DESC LIMIT ?
    `).bind(...params).all();

    return c.json({ logs: results });
  } catch (error: any) {
    console.error('Get recent logs error:', error);
    reportErrorToHQ(c.env, 'LogsError', error?.message || String(error), { stack: error?.stack });
    return c.json({ error: 'Internal server error' }, 500);
  }
}

// ── CSV Export (Pro only) ──────────────────────────────────────────────────────

export async function exportLogsCsv(c: Context) {
  try {
    const user = c.get('user');
    const isPro = user.plan === 'pro' || user.plan === 'enterprise';
    if (!isPro) return c.json({ error: 'Pro plan required' }, 403);

    const { apiKeyId } = c.req.param();
    const range = c.req.query('range') || '7d';

    const apiKey = await c.env.DB.prepare(
      'SELECT id, key_name FROM api_keys WHERE id = ? AND user_id = ?'
    ).bind(apiKeyId, user.id).first() as any;
    if (!apiKey) return c.json({ error: 'API key not found' }, 404);

    let hoursBack = 168;
    if (range === '24h') hoursBack = 24;
    if (range === '30d') hoursBack = 720;
    const timeAgo = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();

    const { results } = await c.env.DB.prepare(`
      SELECT timestamp, ip_address, method, endpoint, status_code, blocked, user_agent
      FROM request_logs
      WHERE api_key_id = ? AND timestamp > ?
      ORDER BY timestamp DESC LIMIT 50000
    `).bind(apiKeyId, timeAgo).all();

    const header = 'timestamp,ip_address,method,endpoint,status_code,blocked,user_agent\n';
    const rows = (results as any[]).map(r =>
      `"${r.timestamp}","${r.ip_address}","${r.method}","${r.endpoint}",${r.status_code},${r.blocked},"${(r.user_agent || '').replace(/"/g, '""')}"`
    ).join('\n');

    const csv = header + rows;
    const filename = `ratelimit-logs-${apiKey.key_name}-${range}.csv`;

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    console.error('Export CSV error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

// ── Current Window Usage (Near-Limit) ─────────────────────────────────────────

export async function getCurrentUsage(c: Context) {
  try {
    const user = c.get('user');
    const { apiKeyId } = c.req.param();

    const apiKey = await c.env.DB.prepare(
      'SELECT id FROM api_keys WHERE id = ? AND user_id = ?'
    ).bind(apiKeyId, user.id).first();
    if (!apiKey) return c.json({ error: 'API key not found' }, 404);

    // Get active config for this key
    const config = await c.env.DB.prepare(
      'SELECT id, max_requests, window_seconds FROM ratelimit_configs WHERE api_key_id = ? AND enabled = 1 LIMIT 1'
    ).bind(apiKeyId).first() as any;

    if (!config) return c.json({ usage: null, message: 'No active config' });

    const windowStart = new Date(Date.now() - config.window_seconds * 1000).toISOString();
    const countResult = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM request_logs WHERE api_key_id = ? AND timestamp > ?'
    ).bind(apiKeyId, windowStart).first() as any;

    const used = countResult?.count || 0;
    const pct = Math.min(Math.round((used / config.max_requests) * 100), 100);

    return c.json({
      usage: {
        used,
        max: config.max_requests,
        windowSeconds: config.window_seconds,
        pct,
        windowStart,
        nearLimit: pct >= 80,
        critical: pct >= 95,
      },
    });
  } catch (error: any) {
    console.error('Get current usage error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

// ── All keys usage snapshot (Pro, for overview) ───────────────────────────────

export async function getAllKeysUsage(c: Context) {
  try {
    const user = c.get('user');
    const isPro = user.plan === 'pro' || user.plan === 'enterprise';
    if (!isPro) return c.json({ error: 'Pro plan required' }, 403);

    const { results: keys } = await c.env.DB.prepare(
      'SELECT id, key_name, is_active FROM api_keys WHERE user_id = ?'
    ).bind(user.id).all() as any;

    const usageData = await Promise.all((keys as any[]).map(async (key) => {
      const config = await c.env.DB.prepare(
        'SELECT id, max_requests, window_seconds FROM ratelimit_configs WHERE api_key_id = ? AND enabled = 1 LIMIT 1'
      ).bind(key.id).first() as any;

      if (!config) return { keyId: key.id, keyName: key.key_name, isActive: key.is_active, usage: null };

      const windowStart = new Date(Date.now() - config.window_seconds * 1000).toISOString();
      const countResult = await c.env.DB.prepare(
        'SELECT COUNT(*) as count FROM request_logs WHERE api_key_id = ? AND timestamp > ?'
      ).bind(key.id, windowStart).first() as any;

      const used = countResult?.count || 0;
      const pct = Math.min(Math.round((used / config.max_requests) * 100), 100);

      return {
        keyId: key.id,
        keyName: key.key_name,
        isActive: key.is_active,
        usage: { used, max: config.max_requests, windowSeconds: config.window_seconds, pct, nearLimit: pct >= 80, critical: pct >= 95 },
      };
    }));

    return c.json({ keys: usageData });
  } catch (error: any) {
    console.error('Get all keys usage error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}
