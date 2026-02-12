import { Context } from 'hono';

export async function getAnalytics(c: Context) {
  try {
    const user = c.get('user');
    const { apiKeyId } = c.req.param();
    const timeRange = c.req.query('range') || '24h'; // 24h, 7d, 30d

    // Verify API key belongs to user
    const apiKey = await c.env.DB.prepare(
      'SELECT id FROM api_keys WHERE id = ? AND user_id = ?'
    ).bind(apiKeyId, user.id).first();

    if (!apiKey) {
      return c.json({ error: 'API key not found' }, 404);
    }

    let hoursBack = 24;
    if (timeRange === '7d') hoursBack = 168;
    if (timeRange === '30d') hoursBack = 720;

    const timeAgo = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();

    // Get total stats
    const totalStats = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as total_requests,
        SUM(CASE WHEN blocked = 1 THEN 1 ELSE 0 END) as blocked_requests,
        COUNT(DISTINCT ip_address) as unique_ips
      FROM request_logs 
      WHERE api_key_id = ? AND timestamp > ?
    `).bind(apiKeyId, timeAgo).first();

    // Get requests by hour
    const { results: hourlyData } = await c.env.DB.prepare(`
      SELECT 
        strftime('%Y-%m-%d %H:00:00', timestamp) as hour,
        COUNT(*) as requests,
        SUM(CASE WHEN blocked = 1 THEN 1 ELSE 0 END) as blocked
      FROM request_logs 
      WHERE api_key_id = ? AND timestamp > ?
      GROUP BY hour
      ORDER BY hour ASC
    `).bind(apiKeyId, timeAgo).all();

    // Get top endpoints
    const { results: topEndpoints } = await c.env.DB.prepare(`
      SELECT 
        endpoint,
        COUNT(*) as count
      FROM request_logs 
      WHERE api_key_id = ? AND timestamp > ?
      GROUP BY endpoint
      ORDER BY count DESC
      LIMIT 10
    `).bind(apiKeyId, timeAgo).all();

    // Get top IPs
    const { results: topIps } = await c.env.DB.prepare(`
      SELECT 
        ip_address,
        COUNT(*) as count
      FROM request_logs 
      WHERE api_key_id = ? AND timestamp > ?
      GROUP BY ip_address
      ORDER BY count DESC
      LIMIT 10
    `).bind(apiKeyId, timeAgo).all();

    return c.json({
      summary: totalStats,
      hourly: hourlyData,
      topEndpoints,
      topIps
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

export async function getRecentLogs(c: Context) {
  try {
    const user = c.get('user');
    const { apiKeyId } = c.req.param();
    const limit = parseInt(c.req.query('limit') || '50');

    // Verify API key belongs to user
    const apiKey = await c.env.DB.prepare(
      'SELECT id FROM api_keys WHERE id = ? AND user_id = ?'
    ).bind(apiKeyId, user.id).first();

    if (!apiKey) {
      return c.json({ error: 'API key not found' }, 404);
    }

    const { results } = await c.env.DB.prepare(`
      SELECT 
        ip_address,
        user_agent,
        endpoint,
        method,
        status_code,
        blocked,
        timestamp
      FROM request_logs 
      WHERE api_key_id = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `).bind(apiKeyId, limit).all();

    return c.json({ logs: results });
  } catch (error) {
    console.error('Get recent logs error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}
