import { Context } from 'hono';

export async function createConfig(c: Context) {
  try {
    const user = c.get('user');
    const { apiKeyId, name, maxRequests, windowSeconds } = await c.req.json();

    if (!apiKeyId || !name || !maxRequests || !windowSeconds) {
      return c.json({ error: 'All fields are required' }, 400);
    }

    // Verify API key belongs to user
    const apiKey = await c.env.DB.prepare(
      'SELECT id FROM api_keys WHERE id = ? AND user_id = ?'
    ).bind(apiKeyId, user.id).first();

    if (!apiKey) {
      return c.json({ error: 'API key not found' }, 404);
    }

    const result = await c.env.DB.prepare(
      'INSERT INTO ratelimit_configs (api_key_id, name, max_requests, window_seconds) VALUES (?, ?, ?, ?)'
    ).bind(apiKeyId, name, maxRequests, windowSeconds).run();

    if (!result.success) {
      return c.json({ error: 'Failed to create configuration' }, 500);
    }

    return c.json({
      message: 'Configuration created successfully',
      config: {
        id: result.meta.last_row_id,
        name,
        maxRequests,
        windowSeconds
      }
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

    // Verify API key belongs to user
    const apiKey = await c.env.DB.prepare(
      'SELECT id FROM api_keys WHERE id = ? AND user_id = ?'
    ).bind(apiKeyId, user.id).first();

    if (!apiKey) {
      return c.json({ error: 'API key not found' }, 404);
    }

    const { results } = await c.env.DB.prepare(
      'SELECT id, name, max_requests, window_seconds, enabled, created_at FROM ratelimit_configs WHERE api_key_id = ?'
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
    const { name, maxRequests, windowSeconds, enabled } = await c.req.json();

    // Verify ownership
    const config = await c.env.DB.prepare(`
      SELECT rc.id FROM ratelimit_configs rc
      JOIN api_keys ak ON rc.api_key_id = ak.id
      WHERE rc.id = ? AND ak.user_id = ?
    `).bind(id, user.id).first();

    if (!config) {
      return c.json({ error: 'Configuration not found' }, 404);
    }

    await c.env.DB.prepare(
      'UPDATE ratelimit_configs SET name = ?, max_requests = ?, window_seconds = ?, enabled = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(name, maxRequests, windowSeconds, enabled ? 1 : 0, id).run();

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

    // Verify ownership
    const config = await c.env.DB.prepare(`
      SELECT rc.id FROM ratelimit_configs rc
      JOIN api_keys ak ON rc.api_key_id = ak.id
      WHERE rc.id = ? AND ak.user_id = ?
    `).bind(id, user.id).first();

    if (!config) {
      return c.json({ error: 'Configuration not found' }, 404);
    }

    await c.env.DB.prepare('DELETE FROM ratelimit_configs WHERE id = ?').bind(id).run();

    return c.json({ message: 'Configuration deleted successfully' });
  } catch (error) {
    console.error('Delete config error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}
