import { Context } from 'hono';
import { reportErrorToHQ } from '../hq-reporter';

// ── Schema detection ──────────────────────────────────────────────────────────

let _checkerHasNewCols: boolean | null = null;
async function checkerHasNewCols(db: any): Promise<boolean> {
  if (_checkerHasNewCols !== null) return _checkerHasNewCols;
  try { await db.prepare('SELECT endpoint_pattern FROM ratelimit_configs LIMIT 0').run(); _checkerHasNewCols = true; }
  catch { _checkerHasNewCols = false; }
  return _checkerHasNewCols;
}

let _hasBucketTable: boolean | null = null;
async function hasBucketTable(db: any): Promise<boolean> {
  if (_hasBucketTable !== null) return _hasBucketTable;
  try { await db.prepare('SELECT id FROM token_bucket_state LIMIT 0').run(); _hasBucketTable = true; }
  catch { _hasBucketTable = false; }
  return _hasBucketTable;
}

let _hasBlockReasonCol: boolean | null = null;
async function hasBlockReasonCol(db: any): Promise<boolean> {
  if (_hasBlockReasonCol !== null) return _hasBlockReasonCol;
  try { await db.prepare('SELECT block_reason FROM request_logs LIMIT 0').run(); _hasBlockReasonCol = true; }
  catch { _hasBlockReasonCol = false; }
  return _hasBlockReasonCol;
}

// ── Endpoint pattern matching ─────────────────────────────────────────────────

function endpointMatches(pattern: string | null, endpoint: string): boolean {
  if (!pattern) return true;
  if (pattern === endpoint) return true;
  if (pattern.endsWith('/*')) return endpoint.startsWith(pattern.slice(0, -2));
  if (pattern.endsWith('*')) return endpoint.startsWith(pattern.slice(0, -1));
  return false;
}

// ── Token Bucket ──────────────────────────────────────────────────────────────

async function checkTokenBucket(
  c: Context, apiKeyId: number, configId: number, ip: string,
  burstSize: number, refillRate: number
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const now = Date.now() / 1000;

  let state = await c.env.DB.prepare(
    'SELECT tokens, last_refill FROM token_bucket_state WHERE api_key_id = ? AND config_id = ? AND ip_address = ?'
  ).bind(apiKeyId, configId, 'global').first() as any;

  if (!state) {
    const tokens = burstSize - 1;
    await c.env.DB.prepare(
      'INSERT OR REPLACE INTO token_bucket_state (api_key_id, config_id, ip_address, tokens, last_refill) VALUES (?, ?, ?, ?, ?)'
    ).bind(apiKeyId, configId, 'global', tokens, now).run();
    return { allowed: true, remaining: Math.floor(tokens), resetAt: Math.floor(now + 1 / refillRate) };
  }

  const elapsed = now - state.last_refill;
  const newTokens = Math.min(burstSize, state.tokens + elapsed * refillRate);

  if (newTokens < 1) {
    const timeUntilToken = (1 - newTokens) / refillRate;
    await c.env.DB.prepare(
      'UPDATE token_bucket_state SET tokens = ?, last_refill = ? WHERE api_key_id = ? AND config_id = ? AND ip_address = ?'
    ).bind(newTokens, now, apiKeyId, configId, 'global').run();
    return { allowed: false, remaining: 0, resetAt: Math.floor(now + timeUntilToken) };
  }

  const afterTokens = newTokens - 1;
  await c.env.DB.prepare(
    'UPDATE token_bucket_state SET tokens = ?, last_refill = ? WHERE api_key_id = ? AND config_id = ? AND ip_address = ?'
  ).bind(afterTokens, now, apiKeyId, configId, 'global').run();
  return { allowed: true, remaining: Math.floor(afterTokens), resetAt: Math.floor(now + 1 / refillRate) };
}

// ── Main handler ──────────────────────────────────────────────────────────────

export async function checkRateLimit(c: Context) {
  try {
    const apiKey = c.req.header('X-API-Key');
    const endpoint = c.req.query('endpoint') || '/';
    const method = c.req.query('method') || 'GET';
    const userAgent = c.req.query('ua') || c.req.header('User-Agent') || '';
    const ip = c.req.query('ip') || c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown';

    if (!apiKey) return c.json({ error: 'API key is required' }, 400);

    const apiKeyData = await c.env.DB.prepare(
      'SELECT id, is_active FROM api_keys WHERE api_key = ?'
    ).bind(apiKey).first();

    if (!apiKeyData || !apiKeyData.is_active) {
      setRLHeaders(c, 0, 0, 0, 'none', null);
      return c.json({ error: 'Invalid or inactive API key', allowed: false }, 401);
    }

    const apiKeyId = apiKeyData.id as number;
    const newCols = await checkerHasNewCols(c.env.DB);

    // ── Load configs ──
    let allConfigs: any[];
    if (newCols) {
      const { results } = await c.env.DB.prepare(
        `SELECT id, name, max_requests, window_seconds, algorithm, burst_size, refill_rate, endpoint_pattern
         FROM ratelimit_configs WHERE api_key_id = ? AND enabled = 1
         ORDER BY endpoint_pattern IS NULL ASC, created_at DESC`
      ).bind(apiKeyId).all() as any;
      allConfigs = results || [];
    } else {
      const { results } = await c.env.DB.prepare(
        'SELECT id, name, max_requests, window_seconds FROM ratelimit_configs WHERE api_key_id = ? AND enabled = 1 ORDER BY created_at DESC'
      ).bind(apiKeyId).all() as any;
      allConfigs = (results || []).map((r: any) => ({
        ...r, algorithm: 'sliding_window', endpoint_pattern: null, burst_size: null, refill_rate: null,
      }));
    }

    // ── Match config ──
    let config: any = null;
    if (allConfigs.length > 0) {
      for (const cfg of allConfigs) {
        if (cfg.endpoint_pattern && endpointMatches(cfg.endpoint_pattern, endpoint)) { config = cfg; break; }
      }
      if (!config) config = allConfigs.find((cfg: any) => !cfg.endpoint_pattern) || allConfigs[0];
    }

    if (!config) {
      await logRequest(c, apiKeyId, ip, userAgent, endpoint, method, 200, false, null);
      setRLHeaders(c, 0, 0, 0, 'none', null);
      return c.json({ allowed: true, message: 'No rate limit configured', limit: 0, remaining: 0 });
    }

    // ── Check filters ──
    const filterResult = await checkFilters(c, config.id as number, ip, userAgent);
    if (filterResult.blocked) {
      await logRequest(c, apiKeyId, ip, userAgent, endpoint, method, 403, true, filterResult.reason || 'filter');
      setRLHeaders(c, 0, 0, 0, config.algorithm || 'sliding_window', null);
      return c.json({ allowed: false, blocked: true, reason: filterResult.reason }, 403);
    }

    const algorithm = (config.algorithm as string) || 'sliding_window';
    const maxRequests = config.max_requests as number;
    const windowSeconds = config.window_seconds as number;

    // ── Token Bucket ──
    const bucketAvailable = algorithm === 'token_bucket' && await hasBucketTable(c.env.DB);

    if (bucketAvailable) {
      const burstSize = (config.burst_size as number) || maxRequests;
      const refillRate = (config.refill_rate as number) || (maxRequests / windowSeconds);
      const result = await checkTokenBucket(c, apiKeyId, config.id as number, ip, burstSize, refillRate);

      if (!result.allowed) {
        await logRequest(c, apiKeyId, ip, userAgent, endpoint, method, 429, true, 'token_bucket_exhausted');
        setRLHeaders(c, burstSize, 0, result.resetAt, algorithm, config.burst_size);
        c.res.headers.set('Retry-After', String(Math.max(1, result.resetAt - Math.floor(Date.now() / 1000))));
        return c.json({ allowed: false, reason: 'Token bucket exhausted', limit: burstSize, remaining: 0, resetAt: result.resetAt }, 429);
      }

      await logRequest(c, apiKeyId, ip, userAgent, endpoint, method, 200, false, null);
      setRLHeaders(c, burstSize, result.remaining, result.resetAt, algorithm, config.burst_size);
      return c.json({ allowed: true, limit: burstSize, remaining: result.remaining, resetAt: result.resetAt, algorithm });
    }

    // ── Sliding Window (default + fallback from token_bucket if table missing) ──
    const effectiveAlgorithm = bucketAvailable ? algorithm : 'sliding_window';
    const windowStart = Math.floor(Date.now() / 1000) - windowSeconds;
    const countResult = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM request_logs WHERE api_key_id = ? AND timestamp > datetime(?, "unixepoch")'
    ).bind(apiKeyId, windowStart).first() as any;

    const currentCount = Number(countResult?.count) || 0;
    const allowed = currentCount < maxRequests;
    const remaining = Math.max(0, maxRequests - currentCount - (allowed ? 1 : 0));
    const resetAt = Math.floor(Date.now() / 1000) + windowSeconds;

    if (!allowed) {
      await logRequest(c, apiKeyId, ip, userAgent, endpoint, method, 429, true, 'rate_limit_exceeded');
      setRLHeaders(c, maxRequests, 0, resetAt, effectiveAlgorithm, null);
      c.res.headers.set('Retry-After', String(windowSeconds));
      return c.json({ allowed: false, reason: 'Rate limit exceeded', limit: maxRequests, remaining: 0, resetAt, retryAfter: windowSeconds }, 429);
    }

    await logRequest(c, apiKeyId, ip, userAgent, endpoint, method, 200, false, null);
    setRLHeaders(c, maxRequests, remaining, resetAt, effectiveAlgorithm, null);
    return c.json({
      allowed: true, limit: maxRequests, remaining, resetAt,
      algorithm: effectiveAlgorithm,
      configName: config.name,
      endpointPattern: config.endpoint_pattern || 'global',
    });

  } catch (error: any) {
    console.error('Rate limit check error:', error);
    reportErrorToHQ(c.env, 'RateLimitCheckError', error?.message || String(error), { stack: error?.stack });
    return c.json({ error: 'Internal server error' }, 500);
  }
}

// ── Live Status (no token consumed) ──────────────────────────────────────────

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
    const newCols = await checkerHasNewCols(c.env.DB);
    const bucketOk = await hasBucketTable(c.env.DB);

    let rawConfigs: any[] = [];
    if (newCols) {
      const { results } = await c.env.DB.prepare(
        'SELECT * FROM ratelimit_configs WHERE api_key_id = ? AND enabled = 1 ORDER BY endpoint_pattern IS NULL ASC'
      ).bind(apiKeyId).all() as any;
      rawConfigs = results || [];
    } else {
      const { results } = await c.env.DB.prepare(
        'SELECT id, name, max_requests, window_seconds, enabled FROM ratelimit_configs WHERE api_key_id = ? AND enabled = 1'
      ).bind(apiKeyId).all() as any;
      rawConfigs = (results || []).map((r: any) => ({ ...r, algorithm: 'sliding_window', endpoint_pattern: null }));
    }

    const configs = await Promise.all(rawConfigs.map(async (cfg: any) => {
      const algorithm = cfg.algorithm || 'sliding_window';
      let used = 0, limit = cfg.max_requests, remaining = limit;

      if (algorithm === 'token_bucket' && bucketOk) {
        const state = await c.env.DB.prepare(
          'SELECT tokens, last_refill FROM token_bucket_state WHERE api_key_id = ? AND config_id = ? AND ip_address = ?'
        ).bind(apiKeyId, cfg.id, 'global').first() as any;
        const burstSize = cfg.burst_size || cfg.max_requests;
        if (state) {
          const elapsed = Date.now() / 1000 - state.last_refill;
          const refillRate = cfg.refill_rate || (cfg.max_requests / cfg.window_seconds);
          const tokens = Math.min(burstSize, state.tokens + elapsed * refillRate);
          remaining = Math.floor(tokens); used = burstSize - remaining; limit = burstSize;
        } else { remaining = burstSize; limit = burstSize; }
      } else {
        const windowStart = Math.floor(Date.now() / 1000) - cfg.window_seconds;
        const r = await c.env.DB.prepare(
          'SELECT COUNT(*) as count FROM request_logs WHERE api_key_id = ? AND timestamp > datetime(?, "unixepoch")'
        ).bind(apiKeyId, windowStart).first() as any;
        used = Number(r?.count) || 0;
        remaining = Math.max(0, limit - used);
      }

      const usagePct = limit > 0 ? Math.round((used / limit) * 100) : 0;
      const resetAt = Math.floor(Date.now() / 1000) + cfg.window_seconds;

      return {
        configId: cfg.id, name: cfg.name,
        endpointPattern: cfg.endpoint_pattern || 'global',
        algorithm, limit, used, remaining, usagePct,
        windowSeconds: cfg.window_seconds,
        headers: {
          'X-RateLimit-Limit': String(limit),
          'X-RateLimit-Remaining': String(remaining),
          'X-RateLimit-Reset': String(resetAt),
          'Retry-After': String(cfg.window_seconds),
          'X-RateLimit-Algorithm': algorithm,
          'X-RateLimit-Policy': `${limit};w=${cfg.window_seconds}`,
        },
      };
    }));

    const matched = configs.find(cfg => endpointMatches(cfg.endpointPattern, endpoint))
      || configs.find(cfg => cfg.endpointPattern === 'global')
      || configs[0]
      || null;

    return c.json({ apiKeyName: apiKeyData.key_name, endpoint, configs, matchedConfig: matched });
  } catch (error: any) {
    console.error('Rate limit status error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function setRLHeaders(c: Context, limit: number, remaining: number, resetAt: number, algorithm: string, burst: number | null) {
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
    const { rule_type: type, rule_value: value, action } = rule as any;
    if (type === 'ip_whitelist' && ip === value && action === 'allow') return { blocked: false };
    if (type === 'ip_blacklist' && ip === value && action === 'block') return { blocked: true, reason: `IP ${ip} is blacklisted` };
    if (type === 'user_agent' && userAgent.toLowerCase().includes((value as string).toLowerCase()) && action === 'block')
      return { blocked: true, reason: `User-Agent blocked: ${value}` };
  }
  return { blocked: false };
}

async function logRequest(
  c: Context, apiKeyId: number, ip: string, userAgent: string,
  endpoint: string, method: string, statusCode: number, blocked: boolean, blockReason: string | null
) {
  try {
    const hasReason = await hasBlockReasonCol(c.env.DB);
    if (hasReason) {
      await c.env.DB.prepare(
        'INSERT INTO request_logs (api_key_id, ip_address, user_agent, endpoint, method, status_code, blocked, block_reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(apiKeyId, ip, userAgent, endpoint, method, statusCode, blocked ? 1 : 0, blockReason).run();
    } else {
      await c.env.DB.prepare(
        'INSERT INTO request_logs (api_key_id, ip_address, user_agent, endpoint, method, status_code, blocked) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).bind(apiKeyId, ip, userAgent, endpoint, method, statusCode, blocked ? 1 : 0).run();
    }
  } catch (error) {
    console.error('Failed to log request:', error);
  }
}
