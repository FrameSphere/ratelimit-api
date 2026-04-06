import { Context } from 'hono';

// ── Send email via Resend ──────────────────────────────────────────────────────

async function sendEmail(env: any, to: string, subject: string, html: string): Promise<boolean> {
  if (!env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured — email not sent');
    return false;
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'RateLimit API <alerts@ratelimit-api.com>',
        to: [to],
        subject,
        html,
      }),
    });
    return res.ok;
  } catch (e) {
    console.error('Email send error:', e);
    return false;
  }
}

function buildAlertEmailHtml(event: string, message: string, keyName: string): string {
  return `
    <!DOCTYPE html><html><body style="background:#0f172a;font-family:Inter,sans-serif;color:#f1f5f9;padding:32px">
    <div style="max-width:540px;margin:0 auto;background:#1e293b;border-radius:12px;padding:32px;border:1px solid rgba(255,255,255,0.08)">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px">
        <div style="width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);display:flex;align-items:center;justify-content:center">
          <span style="font-size:18px">⚡</span>
        </div>
        <div>
          <div style="font-size:18px;font-weight:700">RateLimit API Alert</div>
          <div style="font-size:13px;color:#64748b">${event}</div>
        </div>
      </div>
      <div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.25);border-radius:8px;padding:16px;margin-bottom:20px">
        <div style="font-size:14px;color:#fca5a5;font-weight:600">${message}</div>
      </div>
      <div style="font-size:13px;color:#64748b">
        <strong style="color:#94a3b8">API Key:</strong> ${keyName}<br>
        <strong style="color:#94a3b8">Zeit:</strong> ${new Date().toLocaleString('de-DE')}<br>
      </div>
      <div style="margin-top:24px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.06);font-size:12px;color:#475569">
        Gesendet von <a href="https://ratelimit-api.com" style="color:#60a5fa">ratelimit-api.com</a>
        &middot; <a href="https://ratelimit-api.com/dashboard" style="color:#60a5fa">Dashboard öffnen</a>
      </div>
    </div>
    </body></html>
  `;
}

// ── CRUD ──────────────────────────────────────────────────────────────────────

// Schema detection for optional email columns
let _alertHasEmailCols: boolean | null = null;
async function alertHasEmailCols(db: any): Promise<boolean> {
  if (_alertHasEmailCols !== null) return _alertHasEmailCols;
  try {
    await db.prepare('SELECT email FROM alert_configs LIMIT 0').run();
    _alertHasEmailCols = true;
  } catch {
    _alertHasEmailCols = false;
  }
  return _alertHasEmailCols;
}

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
    const {
      apiKeyId, name, webhookUrl, webhookType,
      threshold429Pct, thresholdSpikePct, thresholdNearLimitPct, enabled,
      email, emailEnabled,
    } = body;

    const apiKey = await c.env.DB.prepare(
      'SELECT id FROM api_keys WHERE id = ? AND user_id = ?'
    ).bind(apiKeyId, user.id).first();
    if (!apiKey) return c.json({ error: 'API key not found' }, 404);

    if (!webhookUrl && !email) {
      return c.json({ error: 'Either webhookUrl or email is required' }, 400);
    }

    const hasEmail = await alertHasEmailCols(c.env.DB);
    let result: any;

    if (hasEmail) {
      result = await c.env.DB.prepare(
        `INSERT INTO alert_configs
          (api_key_id, name, webhook_url, webhook_type, email, email_enabled,
           threshold_429_pct, threshold_spike_pct, threshold_near_limit_pct, enabled)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        apiKeyId, name || 'Alert',
        webhookUrl || null, webhookType || 'custom',
        email || null, emailEnabled ? 1 : 0,
        threshold429Pct ?? 10, thresholdSpikePct ?? 200, thresholdNearLimitPct ?? 80,
        enabled ? 1 : 0,
      ).run();
    } else {
      // Legacy schema without email columns
      if (!webhookUrl) return c.json({ error: 'webhookUrl is required (email not yet supported, run migrations)' }, 400);
      result = await c.env.DB.prepare(
        `INSERT INTO alert_configs
          (api_key_id, name, webhook_url, webhook_type,
           threshold_429_pct, threshold_spike_pct, threshold_near_limit_pct, enabled)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        apiKeyId, name || 'Alert',
        webhookUrl, webhookType || 'custom',
        threshold429Pct ?? 10, thresholdSpikePct ?? 200, thresholdNearLimitPct ?? 80,
        enabled ? 1 : 0,
      ).run();
    }

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

    const alert = await c.env.DB.prepare(
      `SELECT a.id FROM alert_configs a
       JOIN api_keys k ON a.api_key_id = k.id
       WHERE a.id = ? AND k.user_id = ?`
    ).bind(id, user.id).first();
    if (!alert) return c.json({ error: 'Alert not found' }, 404);

    const fields: string[] = [];
    const values: any[] = [];
    const map: Record<string, string> = {
      name: 'name', webhookUrl: 'webhook_url', webhookType: 'webhook_type',
      email: 'email', emailEnabled: 'email_enabled',
      threshold429Pct: 'threshold_429_pct', thresholdSpikePct: 'threshold_spike_pct',
      thresholdNearLimitPct: 'threshold_near_limit_pct', enabled: 'enabled',
    };

    for (const [jsKey, dbKey] of Object.entries(map)) {
      if (body[jsKey] !== undefined) {
        fields.push(`${dbKey} = ?`);
        const val = (jsKey === 'enabled' || jsKey === 'emailEnabled') ? (body[jsKey] ? 1 : 0) : body[jsKey];
        values.push(val);
      }
    }

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

// ── Test webhook & email ──────────────────────────────────────────────────────

export async function testWebhook(c: Context) {
  try {
    const { webhookUrl, webhookType, email } = await c.req.json();

    const results: any = {};

    // Test webhook
    if (webhookUrl) {
      const payload = webhookType === 'slack'
        ? { text: '✅ *RateLimit API*: Test-Alert erfolgreich! Dein Webhook funktioniert.' }
        : webhookType === 'discord'
          ? { content: '✅ **RateLimit API**: Test-Alert erfolgreich! Dein Webhook funktioniert.' }
          : { event: 'test', message: 'RateLimit API webhook test successful', timestamp: new Date().toISOString() };

      try {
        const res = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        results.webhook = { success: res.ok, status: res.status, message: res.ok ? 'Webhook erfolgreich!' : `HTTP ${res.status}` };
      } catch (e: any) {
        results.webhook = { success: false, message: `Webhook nicht erreichbar: ${e.message}` };
      }
    }

    // Test email
    if (email) {
      const sent = await sendEmail(
        c.env, email,
        'RateLimit API — Test Alert',
        buildAlertEmailHtml('Test Event', 'Dies ist eine Test-Benachrichtigung von RateLimit API. Dein Email-Alert funktioniert korrekt!', 'Test Key')
      );
      results.email = { success: sent, message: sent ? 'Test-Email gesendet!' : 'Email konnte nicht gesendet werden (RESEND_API_KEY fehlt?)' };
    }

    const anySuccess = Object.values(results).some((r: any) => r.success);
    return c.json({
      success: anySuccess,
      results,
      message: anySuccess ? 'Test erfolgreich!' : 'Test fehlgeschlagen',
    });
  } catch (error) {
    console.error('Test webhook error:', error);
    return c.json({ success: false, message: 'Fehler beim Test' }, 500);
  }
}

// ── Trigger alerts (called by alert-check job or analytics) ──────────────────

export async function triggerAlerts(env: any, apiKeyId: number, eventType: string, message: string, keyName: string) {
  try {
    const { results } = await env.DB.prepare(
      'SELECT * FROM alert_configs WHERE api_key_id = ? AND enabled = 1'
    ).bind(apiKeyId).all() as any;

    for (const alert of results) {
      // Webhook
      if (alert.webhook_url) {
        const payload = alert.webhook_type === 'slack'
          ? { text: `🚨 *RateLimit API Alert* [${eventType}]\n${message}\nKey: ${keyName}` }
          : alert.webhook_type === 'discord'
            ? { embeds: [{ title: `🚨 RateLimit API — ${eventType}`, description: `${message}\n\n**Key:** ${keyName}`, color: 0xef4444 }] }
            : { event: eventType, message, apiKey: keyName, timestamp: new Date().toISOString() };

        fetch(alert.webhook_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }).catch(() => {});
      }

      // Email
      if (alert.email_enabled && alert.email) {
        sendEmail(env, alert.email, `RateLimit API — ${eventType}`, buildAlertEmailHtml(eventType, message, keyName));
      }
    }
  } catch (e) {
    console.error('Trigger alerts error:', e);
  }
}
