import { Context } from 'hono';

// ── Compute adaptive suggestion for a config ──────────────────────────────────

export async function getAdaptiveSuggestions(c: Context) {
  try {
    const user = c.get('user');
    const isPro = user.plan === 'pro' || user.plan === 'enterprise';
    if (!isPro) return c.json({ error: 'Pro plan required' }, 403);

    const { apiKeyId } = c.req.param();

    const apiKey = await c.env.DB.prepare(
      'SELECT id FROM api_keys WHERE id = ? AND user_id = ?'
    ).bind(apiKeyId, user.id).first();
    if (!apiKey) return c.json({ error: 'API key not found' }, 404);

    const { results: configs } = await c.env.DB.prepare(
      'SELECT * FROM ratelimit_configs WHERE api_key_id = ? AND enabled = 1'
    ).bind(apiKeyId).all() as any;

    const suggestions = await Promise.all((configs as any[]).map(async (config) => {
      // Analyze last 7 days of traffic
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const stats = await c.env.DB.prepare(`
        SELECT
          COUNT(*) as total,
          SUM(CASE WHEN blocked = 1 THEN 1 ELSE 0 END) as blocked_count,
          strftime('%Y-%m-%d %H:00:00', timestamp) as hour
        FROM request_logs
        WHERE api_key_id = ? AND timestamp > ?
        GROUP BY hour
        ORDER BY total DESC
      `).bind(apiKeyId, sevenDaysAgo).all() as any;

      const hours = stats.results || [];
      if (hours.length === 0) return null;

      const totalReqs = hours.reduce((s: number, h: any) => s + Number(h.total), 0);
      const totalBlocked = hours.reduce((s: number, h: any) => s + Number(h.blocked_count), 0);
      const avgRph = totalReqs / Math.max(hours.length, 1);
      const peakRph = Number(hours[0]?.total) || 0;
      const blockRatePct = totalReqs > 0 ? (totalBlocked / totalReqs) * 100 : 0;

      const currentLimit = config.max_requests;
      const windowHours = config.window_seconds / 3600;
      const currentLimitPerHour = currentLimit / windowHours;

      let suggestedMax = currentLimit;
      let reason = '';
      let type: 'increase' | 'decrease' | 'ok' = 'ok';

      if (blockRatePct > 30) {
        // Too many blocked = limit too tight or under attack
        // Suggest increase IF peak is significantly higher than limit
        if (peakRph > currentLimitPerHour * 1.5) {
          suggestedMax = Math.ceil(peakRph * windowHours * 1.2);
          type = 'increase';
          reason = `${Math.round(blockRatePct)}% aller Requests werden blockiert. Peak-Traffic (${Math.round(peakRph)}/h) überschreitet dein Limit (${Math.round(currentLimitPerHour)}/h). Empfehlung: Limit erhöhen.`;
        } else {
          reason = `${Math.round(blockRatePct)}% Blockierrate — möglicherweise ein Angriff. Limit passt aber zum normalen Traffic.`;
        }
      } else if (blockRatePct < 1 && avgRph < currentLimitPerHour * 0.2) {
        // Very low usage — limit might be too generous
        suggestedMax = Math.max(Math.ceil(peakRph * windowHours * 2), 10);
        type = 'decrease';
        reason = `Nur ${Math.round(avgRph)}/h Ø-Traffic bei einem Limit von ${currentLimit}. Limit kann sicher gesenkt werden um Missbrauch besser zu erkennen.`;
      } else if (blockRatePct >= 5 && blockRatePct <= 30) {
        reason = `${Math.round(blockRatePct)}% Blockierrate liegt im normalen Bereich. Limit passt gut zum Traffic.`;
      } else {
        reason = `Traffic-Muster ist stabil. Kein Handlungsbedarf.`;
      }

      const changed = suggestedMax !== currentLimit;

      return {
        configId: config.id,
        configName: config.name,
        endpointPattern: config.endpoint_pattern || 'global',
        algorithm: config.algorithm,
        currentLimit,
        suggestedMax: changed ? suggestedMax : null,
        type,
        reason,
        stats: {
          avgRph: Math.round(avgRph),
          peakRph: Math.round(peakRph),
          blockRatePct: Math.round(blockRatePct),
          hoursAnalyzed: hours.length,
          totalRequests: totalReqs,
        },
        canApply: type !== 'ok' && changed,
      };
    }));

    return c.json({ suggestions: suggestions.filter(Boolean) });
  } catch (error: any) {
    console.error('Adaptive suggestions error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

export async function applyAdaptiveSuggestion(c: Context) {
  try {
    const user = c.get('user');
    const isPro = user.plan === 'pro' || user.plan === 'enterprise';
    if (!isPro) return c.json({ error: 'Pro plan required' }, 403);

    const { configId } = await c.req.json();
    if (!configId) return c.json({ error: 'configId required' }, 400);

    // Re-compute suggestion for this config
    const config = await c.env.DB.prepare(`
      SELECT rc.* FROM ratelimit_configs rc
      JOIN api_keys ak ON rc.api_key_id = ak.id
      WHERE rc.id = ? AND ak.user_id = ?
    `).bind(configId, user.id).first() as any;
    if (!config) return c.json({ error: 'Config not found' }, 404);

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const stats = await c.env.DB.prepare(`
      SELECT COUNT(*) as total, strftime('%Y-%m-%d %H:00:00', timestamp) as hour
      FROM request_logs WHERE api_key_id = ? AND timestamp > ?
      GROUP BY hour ORDER BY total DESC
    `).bind(config.api_key_id, sevenDaysAgo).all() as any;

    const hours = stats.results || [];
    const peakRph = Number(hours[0]?.total) || 0;
    const windowHours = config.window_seconds / 3600;
    const suggestedMax = Math.max(Math.ceil(peakRph * windowHours * 1.2), 10);

    await c.env.DB.prepare(
      'UPDATE ratelimit_configs SET max_requests = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(suggestedMax, configId).run();

    return c.json({ message: 'Adaptive suggestion applied', newLimit: suggestedMax });
  } catch (error: any) {
    console.error('Apply adaptive error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}
