import { Context } from 'hono';

// Known bad bot user-agent patterns (lowercase substrings)
const BAD_UA_PATTERNS = [
  'sqlmap', 'nikto', 'masscan', 'zgrab', 'nmap', 'python-requests',
  'go-http-client', 'curl/', 'wget/', 'scrapy', 'semrushbot', 'ahrefsbot',
  'dotbot', 'mj12bot', 'blexbot', 'petalbot', 'bytespider', 'gptbot',
  'claudebot', 'ccbot', 'dataprovider', 'dataforseo', 'serpstatbot',
  'xenu', 'libwww', 'java/', 'okhttp', 'axios/', 'node-fetch', 'httpclient',
];

function detectBotUA(userAgent: string | null): boolean {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return BAD_UA_PATTERNS.some(p => ua.includes(p));
}

// ── GET /api/reputation/:apiKeyId/ip?ip=1.2.3.4
// Returns reputation score + summary for a single IP
// ─────────────────────────────────────────────────────────────────────────────

export async function getIPReputation(c: Context) {
  try {
    const user = c.get('user');
    const isPro = user.plan === 'pro' || user.plan === 'enterprise';
    if (!isPro) return c.json({ error: 'Pro plan required' }, 403);

    const { apiKeyId } = c.req.param();
    const ip = c.req.query('ip');
    if (!ip) return c.json({ error: 'ip query param required' }, 400);

    const apiKey = await c.env.DB.prepare(
      'SELECT id FROM api_keys WHERE id = ? AND user_id = ?'
    ).bind(apiKeyId, user.id).first();
    if (!apiKey) return c.json({ error: 'API key not found' }, 404);

    const score = await computeIPReputation(c.env.DB, apiKeyId, ip);
    return c.json(score);
  } catch (err: any) {
    return c.json({ error: 'Internal server error' }, 500);
  }
}

// ── GET /api/reputation/:apiKeyId/top
// Returns top suspicious IPs sorted by reputation score
// ─────────────────────────────────────────────────────────────────────────────

export async function getTopSuspiciousIPs(c: Context) {
  try {
    const user = c.get('user');
    const isPro = user.plan === 'pro' || user.plan === 'enterprise';
    if (!isPro) return c.json({ error: 'Pro plan required' }, 403);

    const { apiKeyId } = c.req.param();
    const apiKey = await c.env.DB.prepare(
      'SELECT id FROM api_keys WHERE id = ? AND user_id = ?'
    ).bind(apiKeyId, user.id).first();
    if (!apiKey) return c.json({ error: 'API key not found' }, 404);

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { results: topIPs } = await c.env.DB.prepare(`
      SELECT
        ip,
        COUNT(*) as total_requests,
        SUM(CASE WHEN blocked = 1 THEN 1 ELSE 0 END) as blocked_count,
        MAX(user_agent) as user_agent
      FROM request_logs
      WHERE api_key_id = ? AND timestamp > ?
      GROUP BY ip
      ORDER BY blocked_count DESC, total_requests DESC
      LIMIT 20
    `).bind(apiKeyId, since).all() as any;

    const enriched = (topIPs as any[]).map(row => {
      const blockRate = row.total_requests > 0
        ? row.blocked_count / row.total_requests
        : 0;

      let score = 0;
      // Block rate: 0-50 pts
      score += Math.round(blockRate * 50);
      // High volume: up to 20 pts
      if (row.total_requests > 1000) score += 20;
      else if (row.total_requests > 500) score += 10;
      else if (row.total_requests > 100) score += 5;
      // Bad UA: 30 pts
      if (detectBotUA(row.user_agent)) score += 30;

      score = Math.min(score, 100);

      return {
        ip: row.ip,
        totalRequests: Number(row.total_requests),
        blockedCount: Number(row.blocked_count),
        blockRatePct: Math.round(blockRate * 100),
        userAgent: row.user_agent || null,
        isBotUA: detectBotUA(row.user_agent),
        reputationScore: score,
        risk: score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low',
      };
    });

    // Sort by score desc
    enriched.sort((a, b) => b.reputationScore - a.reputationScore);

    return c.json({ ips: enriched.slice(0, 10) });
  } catch (err: any) {
    console.error('Reputation error:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

// ── Helper: compute reputation for a single IP
// ─────────────────────────────────────────────────────────────────────────────

export async function computeIPReputation(
  db: any,
  apiKeyId: string,
  ip: string
): Promise<{
  ip: string;
  reputationScore: number;
  risk: 'low' | 'medium' | 'high';
  factors: string[];
  stats: {
    totalRequests: number;
    blockedCount: number;
    blockRatePct: number;
    distinctEndpoints: number;
    isBotUA: boolean;
    isAutoBlocked: boolean;
  };
}> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const stats = await db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN blocked = 1 THEN 1 ELSE 0 END) as blocked,
      COUNT(DISTINCT endpoint) as endpoints,
      MAX(user_agent) as ua
    FROM request_logs
    WHERE api_key_id = ? AND ip = ? AND timestamp > ?
  `).bind(apiKeyId, ip, since).first() as any;

  const autoBlocked = await db.prepare(
    'SELECT 1 FROM auto_blocked_ips WHERE api_key_id = ? AND ip = ? LIMIT 1'
  ).bind(apiKeyId, ip).first();

  const total = Number(stats?.total || 0);
  const blocked = Number(stats?.blocked || 0);
  const blockRate = total > 0 ? blocked / total : 0;
  const endpoints = Number(stats?.endpoints || 0);
  const ua = stats?.ua || null;
  const botUA = detectBotUA(ua);
  const isAutoBlocked = !!autoBlocked;

  let score = 0;
  const factors: string[] = [];

  // Block rate (0–50 pts)
  const blockPts = Math.round(blockRate * 50);
  score += blockPts;
  if (blockRate > 0.5) factors.push(`Hohe Blockierrate: ${Math.round(blockRate * 100)}%`);

  // High volume (0–20 pts)
  if (total > 1000) { score += 20; factors.push(`Sehr hohes Volumen: ${total} Requests/24h`); }
  else if (total > 500) { score += 10; factors.push(`Hohes Volumen: ${total} Requests/24h`); }
  else if (total > 100) { score += 5; }

  // Bot UA (30 pts)
  if (botUA) { score += 30; factors.push('Bekannter Bot/Scraper User-Agent erkannt'); }

  // Auto-blocked (20 pts)
  if (isAutoBlocked) { score += 20; factors.push('IP ist aktuell automatisch blockiert'); }

  // Endpoint scanning (10 pts)
  if (endpoints > 10) { score += 10; factors.push(`Scannt viele Endpoints: ${endpoints} verschiedene`); }

  score = Math.min(score, 100);

  return {
    ip,
    reputationScore: score,
    risk: score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low',
    factors,
    stats: {
      totalRequests: total,
      blockedCount: blocked,
      blockRatePct: Math.round(blockRate * 100),
      distinctEndpoints: endpoints,
      isBotUA: botUA,
      isAutoBlocked,
    },
  };
}
