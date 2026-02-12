import { Context } from 'hono';

export async function createFilter(c: Context) {
  try {
    const user = c.get('user');
    const { configId, ruleType, ruleValue, action } = await c.req.json();

    if (!configId || !ruleType || !ruleValue || !action) {
      return c.json({ error: 'All fields are required' }, 400);
    }

    // Verify ownership
    const config = await c.env.DB.prepare(`
      SELECT rc.id FROM ratelimit_configs rc
      JOIN api_keys ak ON rc.api_key_id = ak.id
      WHERE rc.id = ? AND ak.user_id = ?
    `).bind(configId, user.id).first();

    if (!config) {
      return c.json({ error: 'Configuration not found' }, 404);
    }

    const result = await c.env.DB.prepare(
      'INSERT INTO filter_rules (config_id, rule_type, rule_value, action) VALUES (?, ?, ?, ?)'
    ).bind(configId, ruleType, ruleValue, action).run();

    if (!result.success) {
      return c.json({ error: 'Failed to create filter' }, 500);
    }

    return c.json({
      message: 'Filter created successfully',
      filter: {
        id: result.meta.last_row_id,
        ruleType,
        ruleValue,
        action
      }
    }, 201);
  } catch (error) {
    console.error('Create filter error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

export async function getFilters(c: Context) {
  try {
    const user = c.get('user');
    const { configId } = c.req.param();

    // Verify ownership
    const config = await c.env.DB.prepare(`
      SELECT rc.id FROM ratelimit_configs rc
      JOIN api_keys ak ON rc.api_key_id = ak.id
      WHERE rc.id = ? AND ak.user_id = ?
    `).bind(configId, user.id).first();

    if (!config) {
      return c.json({ error: 'Configuration not found' }, 404);
    }

    const { results } = await c.env.DB.prepare(
      'SELECT id, rule_type, rule_value, action, created_at FROM filter_rules WHERE config_id = ?'
    ).bind(configId).all();

    return c.json({ filters: results });
  } catch (error) {
    console.error('Get filters error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

export async function deleteFilter(c: Context) {
  try {
    const user = c.get('user');
    const { id } = c.req.param();

    // Verify ownership
    const filter = await c.env.DB.prepare(`
      SELECT fr.id FROM filter_rules fr
      JOIN ratelimit_configs rc ON fr.config_id = rc.id
      JOIN api_keys ak ON rc.api_key_id = ak.id
      WHERE fr.id = ? AND ak.user_id = ?
    `).bind(id, user.id).first();

    if (!filter) {
      return c.json({ error: 'Filter not found' }, 404);
    }

    await c.env.DB.prepare('DELETE FROM filter_rules WHERE id = ?').bind(id).run();

    return c.json({ message: 'Filter deleted successfully' });
  } catch (error) {
    console.error('Delete filter error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}
