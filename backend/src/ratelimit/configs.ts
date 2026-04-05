import { Context } from 'hono';

export async function createConfig(c: Context) {
  try {
    const user = c.get('user');
    const body = await c.req.json();
    const { apiKeyId, name, maxRequests, windowSeconds } = body;
    const endpointPattern = body.endpointPattern || null;
    const algorithm = body.algorithm || 'sliding_window';
    const burstSize = body.burstSize || null;
    const refillRate = body.refillRate || null;

    if (!apiKeyId || !name || !maxRequests || !windowSeconds) {
      return c.json({ error: 'apiKeyId, name, maxRequests, windowSeconds are required' }, 400);
    }

    const apiKey = await c.env.DB.prepare(
      'SELECT id FROM api_keys WHERE id = ? AND user_id = ?'
    ).bind(apiKeyId, user.id).first();
    if (!apiKey) return c.json({ error: 'API key not found' }, 404);

    const result = await c.env.DB.prepare(
      `INSERT INTO ratelimit_configs
        (api_key_id, name, max_requests, window_seconds, endpoint_pattern, algorithm, burst_size, refill_rate)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(apiKeyId, name, maxRequests, windowSeconds, endpointPattern, algorithm, burstSize, refillRate).run();

    if (!result.success) return c.json({ error: 'Failed to create configuration' }, 500);

    return c.json({
      message: 'Configuration created successfully',
      config: { id: result.meta.last_row_id, name, maxRequests, windowSeconds, endpointPattern, algorithm, burstSize, refillRate },
    }, 201);
  } catch (error) {
    console.error('Create config error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

export async function getConfigs(c: Context) {
  try {
    const user = c.get('user');
    const { apiKeyId } = c.req.param();

    const apiKey = await c.env.DB.prepare(
      'SELECT id FROM api_keys WHERE id = ? AND user_id = ?'
    ).bind(apiKeyId, user.id).first();
    if (!apiKey) return c.json({ error: 'API key not found' }, 404);

    const { results } = await c.env.DB.prepare(
      `SELECT id, name, max_requests, window_seconds, enabled,
              endpoint_pattern, algorithm, burst_size, refill_rate, created_at
       FROM ratelimit_configs WHERE api_key_id = ? ORDER BY endpoint_pattern IS NULL ASC, created_at DESC`
    ).bind(apiKeyId).all();

    return c.json({ configs: results });
  } catch (error) {
    console.error('Get configs error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

export async function updateConfig(c: Context) {
  try {
    const user = c.get('user');
    const { id } = c.req.param();
    const body = await c.req.json();

    const config = await c.env.DB.prepare(`
      SELECT rc.id FROM ratelimit_configs rc
      JOIN api_keys ak ON rc.api_key_id = ak.id
      WHERE rc.id = ? AND ak.user_id = ?
    `).bind(id, user.id).first();
    if (!config) return c.json({ error: 'Configuration not found' }, 404);

    const {
      name, maxRequests, windowSeconds, enabled,
      endpointPattern = null, algorithm = 'sliding_window',
      burstSize = null, refillRate = null,
    } = body;

    await c.env.DB.prepare(
      `UPDATE ratelimit_configs
       SET name = ?, max_requests = ?, window_seconds = ?, enabled = ?,
           endpoint_pattern = ?, algorithm = ?, burst_size = ?, refill_rate = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    ).bind(name, maxRequests, windowSeconds, enabled ? 1 : 0, endpointPattern, algorithm, burstSize, refillRate, id).run();

    return c.json({ message: 'Configuration updated successfully' });
  } catch (error) {
    console.error('Update config error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

export async function deleteConfig(c: Context) {
  try {
    const user = c.get('user');
    const { id } = c.req.param();

    const config = await c.env.DB.prepare(`
      SELECT rc.id FROM ratelimit_configs rc
      JOIN api_keys ak ON rc.api_key_id = ak.id
      WHERE rc.id = ? AND ak.user_id = ?
    `).bind(id, user.id).first();
    if (!config) return c.json({ error: 'Configuration not found' }, 404);

    await c.env.DB.prepare('DELETE FROM ratelimit_configs WHERE id = ?').bind(id).run();
    // Clean up token bucket state
    await c.env.DB.prepare('DELETE FROM token_bucket_state WHERE config_id = ?').bind(id).run();

    return c.json({ message: 'Configuration deleted successfully' });
  } catch (error) {
    console.error('Delete config error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}
