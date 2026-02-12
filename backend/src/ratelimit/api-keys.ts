import { Context } from 'hono';

export async function createApiKey(c: Context) {
  try {
    const user = c.get('user');
    const { keyName } = await c.req.json();

    if (!keyName) {
      return c.json({ error: 'Key name is required' }, 400);
    }

    // Generate random API key
    const apiKey = generateRandomKey();

    const result = await c.env.DB.prepare(
      'INSERT INTO api_keys (user_id, key_name, api_key) VALUES (?, ?, ?)'
    ).bind(user.id, keyName, apiKey).run();

    if (!result.success) {
      return c.json({ error: 'Failed to create API key' }, 500);
    }

    return c.json({
      message: 'API key created successfully',
      apiKey: {
        id: result.meta.last_row_id,
        keyName,
        apiKey
      }
    }, 201);
  } catch (error) {
    console.error('Create API key error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

export async function getApiKeys(c: Context) {
  try {
    const user = c.get('user');

    const { results } = await c.env.DB.prepare(
      'SELECT id, key_name, api_key, created_at, is_active FROM api_keys WHERE user_id = ?'
    ).bind(user.id).all();

    return c.json({ apiKeys: results });
  } catch (error) {
    console.error('Get API keys error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

export async function deleteApiKey(c: Context) {
  try {
    const user = c.get('user');
    const { id } = c.req.param();

    // Verify ownership
    const apiKey = await c.env.DB.prepare(
      'SELECT id FROM api_keys WHERE id = ? AND user_id = ?'
    ).bind(id, user.id).first();

    if (!apiKey) {
      return c.json({ error: 'API key not found' }, 404);
    }

    await c.env.DB.prepare('DELETE FROM api_keys WHERE id = ?').bind(id).run();

    return c.json({ message: 'API key deleted successfully' });
  } catch (error) {
    console.error('Delete API key error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

function generateRandomKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = 'rlapi_';
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}
