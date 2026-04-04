import { Context } from 'hono';

export async function getAlerts(c: Context) {
  try {
    const user = c.get('user');
    const { apiKeyId } = c.req.param();

    const apiKey = await c.env.DB.prepare(
      'SELECT id FROM api_keys WHERE id = ? AND user_id = ?'
    ).bind(apiKeyId, user.id).first();
    if (!apiKey) return c.json({ error: 'API key not found' }, 404);

    const { results } = await c.env.DB.prepare(
      'SELECT * FROM alert_configs WHERE api_key_id = ? ORDER BY created_at DESC'
    ).bind(apiKeyId).all();

    return c.json({ alerts: results });
  } catch (error) {
    console.error('Get alerts error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

export async function createAlert(c: Context) {
  try {
    const user = c.get('user');
    const body = await c.req.json();
    const { apiKeyId, name, webhookUrl, webhookType, threshold429Pct, thresholdSpikePct, thresholdNearLimitPct, enabled } = body;

    const apiKey = await c.env.DB.prepare(
      'SELECT id FROM api_keys WHERE id = ? AND user_id = ?'
    ).bind(apiKeyId, user.id).first();
    if (!apiKey) return c.json({ error: 'API key not found' }, 404);

    if (!webhookUrl) return c.json({ error: 'Webhook URL is required' }, 400);

    const result = await c.env.DB.prepare(
      `INSERT INTO alert_configs (api_key_id, name, webhook_url, webhook_type, threshold_429_pct, threshold_spike_pct, threshold_near_limit_pct, enabled)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      apiKeyId,
      name || 'Alert',
      webhookUrl,
      webhookType || 'custom',
      threshold429Pct ?? 10,
      thresholdSpikePct ?? 200,
      thresholdNearLimitPct ?? 80,
      enabled ? 1 : 0
    ).run();

    return c.json({ alert: { id: result.meta.last_row_id, ...body } }, 201);
  } catch (error) {
    console.error('Create alert error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

export async function updateAlert(c: Context) {
  try {
    const user = c.get('user');
    const { id } = c.req.param();
    const body = await c.req.json();

    // Verify ownership via join
    const alert = await c.env.DB.prepare(
      `SELECT a.id FROM alert_configs a
       JOIN api_keys k ON a.api_key_id = k.id
       WHERE a.id = ? AND k.user_id = ?`
    ).bind(id, user.id).first();
    if (!alert) return c.json({ error: 'Alert not found' }, 404);

    const fields: string[] = [];
    const values: any[] = [];

    if (body.name !== undefined)                 { fields.push('name = ?');                  values.push(body.name); }
    if (body.webhookUrl !== undefined)           { fields.push('webhook_url = ?');            values.push(body.webhookUrl); }
    if (body.webhookType !== undefined)          { fields.push('webhook_type = ?');           values.push(body.webhookType); }
    if (body.threshold429Pct !== undefined)      { fields.push('threshold_429_pct = ?');      values.push(body.threshold429Pct); }
    if (body.thresholdSpikePct !== undefined)    { fields.push('threshold_spike_pct = ?');    values.push(body.thresholdSpikePct); }
    if (body.thresholdNearLimitPct !== undefined){ fields.push('threshold_near_limit_pct = ?');values.push(body.thresholdNearLimitPct); }
    if (body.enabled !== undefined)              { fields.push('enabled = ?');                values.push(body.enabled ? 1 : 0); }

    if (fields.length > 0) {
      values.push(id);
      await c.env.DB.prepare(`UPDATE alert_configs SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run();
    }

    return c.json({ message: 'Alert updated' });
  } catch (error) {
    console.error('Update alert error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

export async function deleteAlert(c: Context) {
  try {
    const user = c.get('user');
    const { id } = c.req.param();

    const alert = await c.env.DB.prepare(
      `SELECT a.id FROM alert_configs a
       JOIN api_keys k ON a.api_key_id = k.id
       WHERE a.id = ? AND k.user_id = ?`
    ).bind(id, user.id).first();
    if (!alert) return c.json({ error: 'Alert not found' }, 404);

    await c.env.DB.prepare('DELETE FROM alert_configs WHERE id = ?').bind(id).run();
    return c.json({ message: 'Alert deleted' });
  } catch (error) {
    console.error('Delete alert error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

export async function testWebhook(c: Context) {
  try {
    const { webhookUrl, webhookType } = await c.req.json();
    if (!webhookUrl) return c.json({ error: 'Webhook URL required' }, 400);

    const payload = webhookType === 'slack'
      ? { text: '✅ *RateLimit API*: Webhook Test erfolgreich! Dein Alert-System ist aktiv.' }
      : webhookType === 'discord'
        ? { content: '✅ **RateLimit API**: Webhook Test erfolgreich! Dein Alert-System ist aktiv.' }
        : { event: 'test', message: 'RateLimit API webhook test successful', timestamp: new Date().toISOString() };

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      return c.json({ success: false, message: `Webhook returned ${res.status}` });
    }
    return c.json({ success: true, message: 'Test-Nachricht erfolgreich gesendet!' });
  } catch (error) {
    console.error('Test webhook error:', error);
    return c.json({ success: false, message: 'Webhook konnte nicht erreicht werden.' });
  }
}
