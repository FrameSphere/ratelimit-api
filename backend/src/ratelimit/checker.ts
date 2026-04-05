import { Context } from 'hono';
import { reportErrorToHQ } from '../hq-reporter';

// ── Endpoint pattern matching ─────────────────────────────────────────────────

function endpointMatches(pattern: string, endpoint: string): boolean {
  if (!pattern) return true; // null/empty = global (matches everything)
  if (pattern === endpoint) return true; // exact match
  if (pattern.endsWith('/*')) {
    // Wildcard prefix: /api/* matches /api/users, /api/orders, etc.
    const prefix = pattern.slice(0, -2);
    return endpoint.startsWith(prefix);
  }
  if (pattern.endsWith('*')) {
    const prefix = pattern.slice(0, -1);
    return endpoint.startsWith(prefix);
  }
  return false;
}

// ── Token Bucket algorithm ─────────────────────────────────────────────────────

async function checkTokenBucket(
  c: Context,
  apiKeyId: number,
  configId: number,
  ip: string,
  burstSize: number,
  refillRate: number, // tokens per second
  scope: 'global' | 'per-ip' = 'global'
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const bucketKey = scope === 'per-ip' ? ip : 'global';
  const now = Date.now() / 1000; // seconds

  // Get or create bucket state
  let state = await c.env.DB.prepare(
    'SELECT tokens, last_refill FROM token_bucket_state WHERE api_key_id = ? AND config_id = ? AND ip_address = ?'
  ).bind(apiKeyId, configId, bucketKey).first() as any;

  let tokens: number;
  let lastRefill: number;

  if (!state) {
    // First request → start with full bucket minus 1
    tokens = burstSize - 1;
    lastRefill = now;
    await c.env.DB.prepare(
      'INSERT OR REPLACE INTO token_bucket_state (api_key_id, config_id, ip_address, tokens, last_refill) VALUES (?, ?, ?, ?, ?)'
    ).bind(apiKeyId, configId, bucketKey, tokens, lastRefill).run();
    return { allowed: true, remaining: Math.floor(tokens), resetAt: Math.floor(now + (1 / refillRate)) };
  }

  tokens = state.tokens;
  lastRefill = state.last_refill;

  // Refill tokens based on elapsed time
  const elapsed = now - lastRefill;
  const newTokens = Math.min(burstSize, tokens + elapsed * refillRate);

  if (newTokens < 1) {
    // Not enough tokens
    const timeUntilToken = (1 - newTokens) / refillRate;
    await c.env.DB.prepare(
      'UPDATE token_bucket_state SET tokens = ?, last_refill = ? WHERE api_key_id = ? AND config_id = ? AND ip_address = ?'
    ).bind(newTokens, now, apiKeyId, configId, bucketKey).run();
    return {
      allowed: false,
      remaining: 0,
      resetAt: Math.floor(now + timeUntilToken),
    };
  }

  // Consume one token
  const afterTokens = newTokens - 1;
  await c.env.DB.prepare(
    'UPDATE token_bucket_state SET tokens = ?, last_refill = ? WHERE api_key_id = ? AND config_id = ? AND ip_address = ?'
  ).bind(afterTokens, now, apiKeyId, configId, bucketKey).run();

  return {
    allowed: true,
    remaining: Math.floor(afterTokens),
    resetAt: Math.floor(now + (1 / refillRate)),
  };
}

// ── Main check handler ─────────────────────────────────────────────────────────

export async function checkRateLimit(c: Context) {
  try {
    const apiKey = c.req.header('X-API-Key');
    const endpoint = c.req.query('endpoint') || '/';
    const method = c.req.query('method') || 'GET';
    // Browser JS cannot set User-Agent header → accept it as query param too
    const userAgent = c.req.query('ua') || c.req.header('User-Agent') || '';
    // Custom IP override via query param for sandbox testing
    const customIp = c.req.query('ip');
    const ip = customIp || c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown';

    if (!apiKey) {
      return c.json({ error: 'API key is required' }, 400);
    }

    const apiKeyData = await c.env.DB.prepare(
      'SELECT id, is_active FROM api_keys WHERE api_key = ?'
    ).bind(apiKey).first();

    if (!apiKeyData || !apiKeyData.is_active) {
      setRateLimitHeaders(c, 0, 0, 0, 'sliding_window', null);
      return c.json({ error: 'Invalid or inactive API key', allowed: false }, 401);
    }

    const apiKeyId = apiKeyData.id as number;

    // ── Find best-matching config ──
    // Endpoint-specific configs take priority over global ones.
    const { results: allConfigs } = await c.env.DB.prepare(
      'SELECT id, name, max_requests, window_seconds, algorithm, burst_size, refill_rate, endpoint_pattern FROM ratelimit_configs WHERE api_key_id = ? AND enabled = 1 ORDER BY endpoint_pattern IS NULL ASC, created_at DESC'
    ).bind(apiKeyId).all() as any;

    // Find the most specific matching config
    let config: any = null;
    if (allConfigs && allConfigs.length > 0) {
      // First try endpoint-specific (non-null pattern)
      for (const c_ of allConfigs) {
        if (c_.endpoint_pattern && endpointMatches(c_.endpoint_pattern, endpoint)) {
          config = c_;
          break;
        }
      }
      // Fallback: global config (null pattern)
      if (!config) {
        config = allConfigs.find((c_: any) => !c_.endpoint_pattern) || null;
      }
    }

    if (!config) {
      await logRequest(c, apiKeyId, ip, userAgent, endpoint, method, 200, false, null);
      setRateLimitHeaders(c, 0, 0, 0, 'none', null);
      return c.json({ allowed: true, message: 'No rate limit configured', limit: 0, remaining: 0 });
    }

    // ── Check filters ──
    const filterResult = await checkFilters(c, config.id as number, ip, userAgent);
    if (filterResult.blocked) {
      await logRequest(c, apiKeyId, ip, userAgent, endpoint, method, 403, true, filterResult.reason || 'filter');
      setRateLimitHeaders(c, 0, 0, 0, config.algorithm, null);
      return c.json({ allowed: false, blocked: true, reason: filterResult.reason }, 403);
    }

    const algorithm = (config.algorithm as string) || 'sliding_window';
    const maxRequests = config.max_requests as number;
    const windowSeconds = config.window_seconds as number;
    let allowed: boolean;
    let remaining: number;
    let resetAt: number;

    // ── Algorithm branch ──
    if (algorithm === 'token_bucket') {
      const burstSize = (config.burst_size as number) || maxRequests;
      const refillRate = (config.refill_rate as number) || (maxRequests / windowSeconds);

      const result = await checkTokenBucket(c, apiKeyId, config.id as number, ip, burstSize, refillRate);
      allowed = result.allowed;
      remaining = result.remaining;
      resetAt = result.resetAt;

      if (!allowed) {
        await logRequest(c, apiKeyId, ip, userAgent, endpoint, method, 429, true, 'token_bucket_exhausted');
        setRateLimitHeaders(c, burstSize, 0, resetAt, algorithm, config.burst_size);
        c.res.headers.set('Retry-After', String(Math.max(1, resetAt - Math.floor(Date.now() / 1000))));
        return c.json({ allowed: false, blocked: false, reason: 'Token bucket exhausted', limit: burstSize, remaining: 0, resetAt }, 429);
      }

      await logRequest(c, apiKeyId, ip, userAgent, endpoint, method, 200, false, null);
      setRateLimitHeaders(c, burstSize, remaining, resetAt, algorithm, config.burst_size);
      return c.json({ allowed: true, limit: burstSize, remaining, resetAt, algorithm });

    } else {
      // ── Sliding Window ──
      const windowStart = Math.floor(Date.now() / 1000) - windowSeconds;
      const countResult = await c.env.DB.prepare(
        'SELECT COUNT(*) as count FROM request_logs WHERE api_key_id = ? AND timestamp > datetime(?, "unixepoch")'
      ).bind(apiKeyId, windowStart).first() as any;

      const currentCount = Number(countResult?.count) || 0;
      allowed = currentCount < maxRequests;
      remaining = Math.max(0, maxRequests - currentCount - (allowed ? 1 : 0));
      resetAt = Math.floor(Date.now() / 1000) + windowSeconds;

      if (!allowed) {
        await logRequest(c, apiKeyId, ip, userAgent, endpoint, method, 429, true, 'rate_limit_exceeded');
        setRateLimitHeaders(c, maxRequests, 0, resetAt, algorithm, null);
        c.res.headers.set('Retry-After', String(windowSeconds));
        return c.json({ allowed: false, blocked: false, reason: 'Rate limit exceeded', limit: maxRequests, remaining: 0, resetAt, retryAfter: windowSeconds }, 429);
      }

      await logRequest(c, apiKeyId, ip, userAgent, endpoint, method, 200, false, null);
      setRateLimitHeaders(c, maxRequests, remaining, resetAt, algorithm, null);
      return c.json({ allowed: true, limit: maxRequests, remaining, resetAt, algorithm, configName: config.name, endpointPattern: config.endpoint_pattern || 'global' });
    }

  } catch (error: any) {
    console.error('Rate limit check error:', error);
    reportErrorToHQ(c.env, 'RateLimitCheckError', error?.message || String(error), { stack: error?.stack });
    return c.json({ error: 'Internal server error' }, 500);
  }
}

// ── Live header debug endpoint (returns current state without consuming) ───────

export async function getRateLimitStatus(c: Context) {
  try {
    const apiKey = c.req.header('X-API-Key') || c.req.query('apiKey');
    const endpoint = c.req.query('endpoint') || '/';

    if (!apiKey) return c.json({ error: 'API key required' }, 400);

    const apiKeyData = await c.env.DB.prepare(
      'SELECT id, is_active, key_name FROM api_keys WHERE api_key = ?'
    ).bind(apiKey).first() as any;
    if (!apiKeyData || !apiKeyData.is_active) return c.json({ error: 'Invalid API key' }, 401);

    const apiKeyId = apiKeyData.id as number;
    const { results: allConfigs } = await c.env.DB.prepare(
      'SELECT * FROM ratelimit_configs WHERE api_key_id = ? AND enabled = 1 ORDER BY endpoint_pattern IS NULL ASC'
    ).bind(apiKeyId).all() as any;

    const configs = await Promise.all((allConfigs || []).map(async (cfg: any) => {
      const algorithm = cfg.algorithm || 'sliding_window';
      let used = 0, limit = cfg.max_requests, remaining = limit;

      if (algorithm === 'token_bucket') {
        const state = await c.env.DB.prepare(
          'SELECT tokens, last_refill FROM token_bucket_state WHERE api_key_id = ? AND config_id = ? AND ip_address = ?'
        ).bind(apiKeyId, cfg.id, 'global').first() as any;
        const burstSize = cfg.burst_size || cfg.max_requests;
        if (state) {
          const elapsed = (Date.now() / 1000) - state.last_refill;
          const refillRate = cfg.refill_rate || (cfg.max_requests / cfg.window_seconds);
          const tokens = Math.min(burstSize, state.tokens + elapsed * refillRate);
          remaining = Math.floor(tokens);
          used = burstSize - remaining;
          limit = burstSize;
        } else {
          remaining = burstSize; limit = burstSize;
        }
      } else {
        const windowStart = Math.floor(Date.now() / 1000) - cfg.window_seconds;
        const r = await c.env.DB.prepare(
          'SELECT COUNT(*) as count FROM request_logs WHERE api_key_id = ? AND timestamp > datetime(?, "unixepoch")'
        ).bind(apiKeyId, windowStart).first() as any;
        used = Number(r?.count) || 0;
        remaining = Math.max(0, limit - used);
      }

      const usagePct = limit > 0 ? Math.round((used / limit) * 100) : 0;

      return {
        configId: cfg.id,
        name: cfg.name,
        endpointPattern: cfg.endpoint_pattern || 'global',
        algorithm,
        limit,
        used,
        remaining,
        usagePct,
        windowSeconds: cfg.window_seconds,
        burstSize: cfg.burst_size,
        refillRate: cfg.refill_rate,
        resetAt: Math.floor(Date.now() / 1000) + cfg.window_seconds,
        headers: {
          'X-RateLimit-Limit': String(limit),
          'X-RateLimit-Remaining': String(remaining),
          'X-RateLimit-Reset': String(Math.floor(Date.now() / 1000) + cfg.window_seconds),
          'Retry-After': String(cfg.window_seconds),
          'X-RateLimit-Algorithm': algorithm,
          'X-RateLimit-Policy': `${limit};w=${cfg.window_seconds}`,
        },
      };
    }));

    return c.json({
      apiKeyName: apiKeyData.key_name,
      configs,
      matchedConfig: configs.find(cfg => endpointMatches(cfg.endpointPattern, endpoint)) || configs[0] || null,
    });
  } catch (error: any) {
    console.error('Rate limit status error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function setRateLimitHeaders(c: Context, limit: number, remaining: number, resetAt: number, algorithm: string, burst: number | null) {
  c.res.headers.set('X-RateLimit-Limit', String(limit));
  c.res.headers.set('X-RateLimit-Remaining', String(remaining));
  c.res.headers.set('X-RateLimit-Reset', String(resetAt));
  c.res.headers.set('X-RateLimit-Algorithm', algorithm);
  if (burst !== null) c.res.headers.set('X-RateLimit-Burst', String(burst));
}

async function checkFilters(c: Context, configId: number, ip: string, userAgent: string) {
  const { results } = await c.env.DB.prepare(
    'SELECT rule_type, rule_value, action FROM filter_rules WHERE config_id = ?'
  ).bind(configId).all();

  for (const rule of results) {
    const ruleType = rule.rule_type as string;
    const ruleValue = rule.rule_value as string;
    const action = rule.action as string;

    switch (ruleType) {
      case 'ip_whitelist':
        if (ip === ruleValue && action === 'allow') return { blocked: false };
        break;
      case 'ip_blacklist':
        if (ip === ruleValue && action === 'block') return { blocked: true, reason: `IP ${ip} is blacklisted` };
        break;
      case 'user_agent':
        if (userAgent.toLowerCase().includes(ruleValue.toLowerCase()) && action === 'block')
          return { blocked: true, reason: `User-Agent matches blocked pattern: ${ruleValue}` };
        break;
    }
  }
  return { blocked: false };
}

async function logRequest(
  c: Context, apiKeyId: number, ip: string, userAgent: string,
  endpoint: string, method: string, statusCode: number, blocked: boolean, blockReason: string | null
) {
  try {
    await c.env.DB.prepare(
      'INSERT INTO request_logs (api_key_id, ip_address, user_agent, endpoint, method, status_code, blocked, block_reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(apiKeyId, ip, userAgent, endpoint, method, statusCode, blocked ? 1 : 0, blockReason).run();
  } catch (error) {
    console.error('Failed to log request:', error);
  }
}
