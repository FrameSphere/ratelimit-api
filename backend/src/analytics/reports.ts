import { Context } from 'hono';

// ── Email via Resend (inline to avoid circular import) ────────────────────────

async function sendEmail(env: any, to: string, subject: string, html: string): Promise<boolean> {
  if (!env.RESEND_API_KEY) return false;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${env.RESEND_API_KEY}` },
      body: JSON.stringify({
        from: 'RateLimit API <reports@ratelimit-api.com>',
        to: [to],
        subject,
        html,
      }),
    });
    return res.ok;
  } catch { return false; }
}

// ── Report HTML builder ───────────────────────────────────────────────────────

function buildReportHtml(data: {
  keyName: string;
  period: string;
  totalRequests: number;
  blockedRequests: number;
  blockRatePct: number;
  uniqueIps: number;
  topEndpoints: { endpoint: string; count: number; blocked_count: number }[];
  topBlockedIps: { ip_address: string; blocked_count: number }[];
  trend: 'up' | 'down' | 'stable';
  trendPct: number;
}): string {
  const blockColor = data.blockRatePct > 20 ? '#ef4444' : data.blockRatePct > 5 ? '#f59e0b' : '#10b981';
  const trendIcon = data.trend === 'up' ? '↑' : data.trend === 'down' ? '↓' : '→';
  const trendColor = data.trend === 'up' ? '#10b981' : data.trend === 'down' ? '#ef4444' : '#64748b';

  const endpointRows = data.topEndpoints.slice(0, 5).map(e => {
    const pct = e.count > 0 ? Math.round((e.blocked_count / e.count) * 100) : 0;
    return `
      <tr>
        <td style="padding:8px 12px;font-family:monospace;font-size:12px;color:#94a3b8;border-bottom:1px solid rgba(255,255,255,0.05)">${e.endpoint || '/'}</td>
        <td style="padding:8px 12px;text-align:right;font-size:13px;font-weight:600;color:#f1f5f9;border-bottom:1px solid rgba(255,255,255,0.05)">${e.count.toLocaleString('de-DE')}</td>
        <td style="padding:8px 12px;text-align:right;font-size:13px;color:${pct > 10 ? '#f87171' : '#64748b'};border-bottom:1px solid rgba(255,255,255,0.05)">${pct}%</td>
      </tr>`;
  }).join('');

  const ipRows = data.topBlockedIps.slice(0, 5).map(ip => `
    <tr>
      <td style="padding:8px 12px;font-family:monospace;font-size:12px;color:#fca5a5;border-bottom:1px solid rgba(255,255,255,0.05)">${ip.ip_address}</td>
      <td style="padding:8px 12px;text-align:right;font-size:13px;font-weight:600;color:#f87171;border-bottom:1px solid rgba(255,255,255,0.05)">${ip.blocked_count.toLocaleString('de-DE')}</td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0f172a;font-family:Inter,system-ui,sans-serif;color:#f1f5f9">
<div style="max-width:600px;margin:32px auto;padding:0 16px">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#1e293b,#0f172a);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px;margin-bottom:20px">
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:24px">
      <div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">⚡</div>
      <div>
        <div style="font-size:20px;font-weight:800;letter-spacing:-0.02em">RateLimit API Report</div>
        <div style="font-size:13px;color:#64748b;margin-top:2px">${data.keyName} · ${data.period}</div>
      </div>
    </div>

    <!-- Stats grid -->
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:12px">
      ${[
        { label: 'Requests', value: data.totalRequests.toLocaleString('de-DE'), color: '#60a5fa' },
        { label: 'Blockiert', value: data.blockedRequests.toLocaleString('de-DE'), color: '#f87171' },
        { label: 'Block-Rate', value: `${data.blockRatePct}%`, color: blockColor },
        { label: 'Unique IPs', value: data.uniqueIps.toLocaleString('de-DE'), color: '#a78bfa' },
      ].map(s => `
        <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:14px 12px">
          <div style="font-size:10px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.07em;margin-bottom:6px">${s.label}</div>
          <div style="font-size:22px;font-weight:800;color:${s.color};letter-spacing:-0.03em">${s.value}</div>
        </div>`).join('')}
    </div>

    <!-- Trend -->
    <div style="margin-top:16px;padding:12px 16px;border-radius:10px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;gap:10px">
      <span style="font-size:18px;color:${trendColor};font-weight:800">${trendIcon}</span>
      <span style="font-size:13px;color:#94a3b8">
        Traffic ${data.trend === 'up' ? 'gestiegen' : data.trend === 'down' ? 'gesunken' : 'stabil'} 
        ${data.trendPct > 0 ? `um ${data.trendPct}%` : ''} verglichen mit dem Vorzeitraum
      </span>
    </div>
  </div>

  <!-- Top Endpoints -->
  ${data.topEndpoints.length > 0 ? `
  <div style="background:#1e293b;border:1px solid rgba(255,255,255,0.08);border-radius:12px;margin-bottom:16px;overflow:hidden">
    <div style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.06)">
      <div style="font-size:13px;font-weight:700;color:#f1f5f9">📊 Top Endpoints</div>
    </div>
    <table style="width:100%;border-collapse:collapse">
      <thead>
        <tr style="background:rgba(255,255,255,0.02)">
          <th style="padding:8px 12px;text-align:left;font-size:10px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.07em">Endpoint</th>
          <th style="padding:8px 12px;text-align:right;font-size:10px;font-weight:700;color:#475569;text-transform:uppercase">Requests</th>
          <th style="padding:8px 12px;text-align:right;font-size:10px;font-weight:700;color:#475569;text-transform:uppercase">Block-%</th>
        </tr>
      </thead>
      <tbody>${endpointRows}</tbody>
    </table>
  </div>` : ''}

  <!-- Top Blocked IPs -->
  ${data.topBlockedIps.length > 0 ? `
  <div style="background:#1e293b;border:1px solid rgba(255,255,255,0.08);border-radius:12px;margin-bottom:16px;overflow:hidden">
    <div style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.06)">
      <div style="font-size:13px;font-weight:700;color:#f1f5f9">🚫 Top gesperrte IPs</div>
    </div>
    <table style="width:100%;border-collapse:collapse">
      <thead>
        <tr style="background:rgba(255,255,255,0.02)">
          <th style="padding:8px 12px;text-align:left;font-size:10px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.07em">IP Adresse</th>
          <th style="padding:8px 12px;text-align:right;font-size:10px;font-weight:700;color:#475569;text-transform:uppercase">Geblockt</th>
        </tr>
      </thead>
      <tbody>${ipRows}</tbody>
    </table>
  </div>` : ''}

  <!-- Footer -->
  <div style="padding:16px;text-align:center;font-size:12px;color:#334155">
    <a href="https://ratelimit-api.com/dashboard" style="color:#60a5fa;text-decoration:none;font-weight:600">Dashboard öffnen</a>
    &nbsp;·&nbsp;
    <a href="https://ratelimit-api.com/dashboard" style="color:#475569;text-decoration:none">Report abbestellen</a>
    &nbsp;·&nbsp;
    RateLimit API by FrameSphere
  </div>
</div>
</body>
</html>`;
}

// ── Generate + send report for one API key ────────────────────────────────────

async function sendReportForKey(env: any, keyId: number, keyName: string, reportEmail: string, hoursBack: number) {
  const periodLabel = hoursBack === 24 ? 'Tagesbericht' : hoursBack === 168 ? 'Wochenbericht' : 'Monatsbericht';
  const timeAgo = new Date(Date.now() - hoursBack * 3600 * 1000).toISOString();
  const prevTimeAgo = new Date(Date.now() - hoursBack * 2 * 3600 * 1000).toISOString();

  // Current period stats
  const stats = await env.DB.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN blocked=1 THEN 1 ELSE 0 END) as blocked,
      COUNT(DISTINCT ip_address) as unique_ips
    FROM request_logs
    WHERE api_key_id = ? AND timestamp > ?
  `).bind(keyId, timeAgo).first() as any;

  // Previous period for trend
  const prevStats = await env.DB.prepare(`
    SELECT COUNT(*) as total
    FROM request_logs
    WHERE api_key_id = ? AND timestamp > ? AND timestamp <= ?
  `).bind(keyId, prevTimeAgo, timeAgo).first() as any;

  const total = stats?.total || 0;
  const blocked = stats?.blocked || 0;
  const blockRatePct = total > 0 ? Math.round((blocked / total) * 100) : 0;
  const prevTotal = prevStats?.total || 0;
  let trend: 'up' | 'down' | 'stable' = 'stable';
  let trendPct = 0;
  if (prevTotal > 0) {
    const diff = ((total - prevTotal) / prevTotal) * 100;
    trendPct = Math.abs(Math.round(diff));
    trend = diff > 5 ? 'up' : diff < -5 ? 'down' : 'stable';
  }

  // Top endpoints
  const { results: topEndpoints } = await env.DB.prepare(`
    SELECT endpoint, COUNT(*) as count,
      SUM(CASE WHEN blocked=1 THEN 1 ELSE 0 END) as blocked_count
    FROM request_logs
    WHERE api_key_id = ? AND timestamp > ?
    GROUP BY endpoint ORDER BY count DESC LIMIT 5
  `).bind(keyId, timeAgo).all() as any;

  // Top blocked IPs
  const { results: topBlockedIps } = await env.DB.prepare(`
    SELECT ip_address, COUNT(*) as blocked_count
    FROM request_logs
    WHERE api_key_id = ? AND timestamp > ? AND blocked = 1
    GROUP BY ip_address ORDER BY blocked_count DESC LIMIT 5
  `).bind(keyId, timeAgo).all() as any;

  // Skip if no activity
  if (total === 0) return;

  const html = buildReportHtml({
    keyName,
    period: periodLabel,
    totalRequests: total,
    blockedRequests: blocked,
    blockRatePct,
    uniqueIps: stats?.unique_ips || 0,
    topEndpoints: topEndpoints || [],
    topBlockedIps: topBlockedIps || [],
    trend,
    trendPct,
  });

  await sendEmail(env, reportEmail, `RateLimit API — ${periodLabel} für „${keyName}"`, html);
}

// ── Cron handler (called from scheduled event) ────────────────────────────────

export async function runScheduledReports(env: any, cronExpression: string) {
  try {
    // Determine report period from cron
    // Daily:   "0 8 * * *"   → 24h
    // Weekly:  "0 8 * * 1"   → 168h
    // Monthly: "0 8 1 * *"   → 720h
    let hoursBack = 24;
    if (cronExpression.includes('* * 1')) hoursBack = 168; // weekly (Monday)
    else if (cronExpression.includes('1 * *')) hoursBack = 720; // monthly (1st)

    // Find all users with report_email configured
    const { results: schedules } = await env.DB.prepare(`
      SELECT rs.api_key_id, rs.report_email, rs.frequency,
             ak.key_name, ak.user_id
      FROM report_schedules rs
      JOIN api_keys ak ON rs.api_key_id = ak.id
      WHERE rs.enabled = 1 AND rs.frequency = ?
    `).bind(hoursBack === 24 ? 'daily' : hoursBack === 168 ? 'weekly' : 'monthly').all() as any;

    for (const sched of (schedules || [])) {
      await sendReportForKey(env, sched.api_key_id, sched.key_name, sched.report_email, hoursBack);
    }

    console.log(`Scheduled reports sent: ${(schedules || []).length} for ${hoursBack}h period`);
  } catch (err) {
    console.error('runScheduledReports error:', err);
  }
}

// ── CRUD for report schedules ─────────────────────────────────────────────────

let _hasReportTable: boolean | null = null;
async function hasReportTable(db: any): Promise<boolean> {
  if (_hasReportTable !== null) return _hasReportTable;
  try { await db.prepare('SELECT id FROM report_schedules LIMIT 0').run(); _hasReportTable = true; }
  catch { _hasReportTable = false; }
  return _hasReportTable;
}

export async function getReportSchedule(c: Context) {
  try {
    const user = c.get('user');
    const { apiKeyId } = c.req.param();
    const apiKey = await c.env.DB.prepare('SELECT id FROM api_keys WHERE id=? AND user_id=?').bind(apiKeyId, user.id).first();
    if (!apiKey) return c.json({ error: 'API key not found' }, 404);

    if (!(await hasReportTable(c.env.DB))) return c.json({ schedule: null, migrationRequired: true });

    const schedule = await c.env.DB.prepare('SELECT * FROM report_schedules WHERE api_key_id=?').bind(apiKeyId).first();
    return c.json({ schedule: schedule ?? null });
  } catch (e: any) {
    return c.json({ error: 'Internal server error' }, 500);
  }
}

export async function upsertReportSchedule(c: Context) {
  try {
    const user = c.get('user');
    const isPro = user.plan === 'pro' || user.plan === 'enterprise';
    if (!isPro) return c.json({ error: 'Pro plan required' }, 403);

    const { apiKeyId } = c.req.param();
    const { reportEmail, frequency, enabled } = await c.req.json();
    if (!reportEmail) return c.json({ error: 'reportEmail required' }, 400);

    const apiKey = await c.env.DB.prepare('SELECT id FROM api_keys WHERE id=? AND user_id=?').bind(apiKeyId, user.id).first();
    if (!apiKey) return c.json({ error: 'API key not found' }, 404);

    if (!(await hasReportTable(c.env.DB))) return c.json({ error: 'Migration required', migrationRequired: true }, 503);

    await c.env.DB.prepare(`
      INSERT INTO report_schedules (api_key_id, report_email, frequency, enabled)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(api_key_id) DO UPDATE SET
        report_email=excluded.report_email,
        frequency=excluded.frequency,
        enabled=excluded.enabled,
        updated_at=CURRENT_TIMESTAMP
    `).bind(apiKeyId, reportEmail, frequency || 'weekly', enabled ? 1 : 0).run();

    return c.json({ message: 'Report schedule saved' });
  } catch (e: any) {
    return c.json({ error: 'Internal server error' }, 500);
  }
}

export async function sendTestReport(c: Context) {
  try {
    const user = c.get('user');
    const isPro = user.plan === 'pro' || user.plan === 'enterprise';
    if (!isPro) return c.json({ error: 'Pro plan required' }, 403);

    const { apiKeyId } = c.req.param();
    const { reportEmail } = await c.req.json();
    if (!reportEmail) return c.json({ error: 'reportEmail required' }, 400);

    const apiKey = await c.env.DB.prepare('SELECT id, key_name FROM api_keys WHERE id=? AND user_id=?').bind(apiKeyId, user.id).first() as any;
    if (!apiKey) return c.json({ error: 'API key not found' }, 404);

    await sendReportForKey(c.env, parseInt(apiKeyId), apiKey.key_name, reportEmail, 168);
    return c.json({ message: 'Test-Report gesendet' });
  } catch (e: any) {
    return c.json({ error: 'Internal server error' }, 500);
  }
}
