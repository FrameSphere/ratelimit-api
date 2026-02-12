import { Context } from 'hono';

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  blocked: boolean;
  reason?: string;
}

export async function checkRateLimit(c: Context) {
  try {
    const apiKey = c.req.header('X-API-Key');
    const endpoint = c.req.query('endpoint') || '/';
    const method = c.req.query('method') || 'GET';
    const ip = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown';
    const userAgent = c.req.header('User-Agent') || '';

    if (!apiKey) {
      return c.json({ error: 'API key is required' }, 400);
    }

    // Get API key info
    const apiKeyData = await c.env.DB.prepare(
      'SELECT id, is_active FROM api_keys WHERE api_key = ?'
    ).bind(apiKey).first();

    if (!apiKeyData || !apiKeyData.is_active) {
      return c.json({ error: 'Invalid or inactive API key' }, 401);
    }

    const apiKeyId = apiKeyData.id as number;

    // Get active config
    const config = await c.env.DB.prepare(
      'SELECT id, max_requests, window_seconds FROM ratelimit_configs WHERE api_key_id = ? AND enabled = 1 LIMIT 1'
    ).bind(apiKeyId).first();

    if (!config) {
      // No config = allow by default
      await logRequest(c, apiKeyId, ip, userAgent, endpoint, method, 200, false);
      return c.json({
        allowed: true,
        message: 'No rate limit configured'
      });
    }

    // Check filters
    const filterResult = await checkFilters(c, config.id as number, ip, userAgent);
    if (filterResult.blocked) {
      await logRequest(c, apiKeyId, ip, userAgent, endpoint, method, 429, true);
      return c.json({
        allowed: false,
        blocked: true,
        reason: filterResult.reason
      }, 429);
    }

    // Check rate limit
    const windowSeconds = config.window_seconds as number;
    const maxRequests = config.max_requests as number;
    const windowStart = Math.floor(Date.now() / 1000) - windowSeconds;

    const { results } = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM request_logs WHERE api_key_id = ? AND timestamp > datetime(?, "unixepoch")'
    ).bind(apiKeyId, windowStart).all();

    const currentCount = (results[0] as any).count || 0;
    const allowed = currentCount < maxRequests;
    const remaining = Math.max(0, maxRequests - currentCount - 1);
    const resetAt = Math.floor(Date.now() / 1000) + windowSeconds;

    // Log request
    await logRequest(c, apiKeyId, ip, userAgent, endpoint, method, allowed ? 200 : 429, !allowed);

    const result: RateLimitResult = {
      allowed,
      remaining,
      resetAt,
      blocked: !allowed,
      reason: allowed ? undefined : 'Rate limit exceeded'
    };

    return c.json(result, allowed ? 200 : 429);
  } catch (error) {
    console.error('Rate limit check error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

async function checkFilters(c: Context, configId: number, ip: string, userAgent: string) {
  const { results } = await c.env.DB.prepare(
    'SELECT rule_type, rule_value, action FROM filter_rules WHERE config_id = ?'
  ).bind(configId).all();

  for (const rule of results) {
    const ruleType = rule.rule_type as string;
    const ruleValue = rule.rule_value as string;
    const action = rule.action as string;

    let matches = false;

    switch (ruleType) {
      case 'ip_whitelist':
        matches = ip === ruleValue;
        if (matches && action === 'allow') {
          return { blocked: false };
        }
        break;
      case 'ip_blacklist':
        matches = ip === ruleValue;
        if (matches && action === 'block') {
          return { blocked: true, reason: 'IP blocked by filter' };
        }
        break;
      case 'user_agent':
        matches = userAgent.toLowerCase().includes(ruleValue.toLowerCase());
        if (matches && action === 'block') {
          return { blocked: true, reason: 'User agent blocked by filter' };
        }
        break;
    }
  }

  return { blocked: false };
}

async function logRequest(
  c: Context,
  apiKeyId: number,
  ip: string,
  userAgent: string,
  endpoint: string,
  method: string,
  statusCode: number,
  blocked: boolean
) {
  try {
    await c.env.DB.prepare(
      'INSERT INTO request_logs (api_key_id, ip_address, user_agent, endpoint, method, status_code, blocked) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(apiKeyId, ip, userAgent, endpoint, method, statusCode, blocked ? 1 : 0).run();
  } catch (error) {
    console.error('Failed to log request:', error);
  }
}
