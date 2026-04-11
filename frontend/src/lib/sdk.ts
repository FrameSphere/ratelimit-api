/**
 * @ratelimit-api/sdk — v1.0.0
 * Official JavaScript/TypeScript SDK for RateLimit API
 * https://ratelimit-api.com/docs/sdk/javascript
 *
 * Installation: npm install @ratelimit-api/sdk
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface RateLimitConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  failureMode?: 'open' | 'closed';
}

export interface CheckOptions {
  ip?: string;
  endpoint?: string;
  method?: string;
  userAgent?: string;
  country?: string;
}

export interface CheckResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetAt: number;
  algorithm?: string;
  reason?: string;
  retryAfter?: number;
  headers?: Record<string, string>;
}

// ── Core Client ───────────────────────────────────────────────────────────────

export class RateLimit {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly failureMode: 'open' | 'closed';

  constructor(config: RateLimitConfig) {
    if (!config.apiKey) throw new Error('[RateLimit SDK] apiKey is required');
    this.apiKey = config.apiKey;
    this.baseUrl = (config.baseUrl ?? 'https://ratelimit-api.workers.dev').replace(/\/$/, '');
    this.timeout = config.timeout ?? 3000;
    this.failureMode = config.failureMode ?? 'open';
  }

  async check(options: CheckOptions = {}): Promise<CheckResult> {
    const params = new URLSearchParams();
    if (options.endpoint)  params.set('endpoint', options.endpoint);
    if (options.method)    params.set('method', options.method);
    if (options.ip)        params.set('ip', options.ip);
    if (options.userAgent) params.set('ua', options.userAgent);
    if (options.country)   params.set('country', options.country);

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeout);

      const res = await fetch(`${this.baseUrl}/check?${params}`, {
        method: 'GET',
        headers: { 'X-API-Key': this.apiKey },
        signal: controller.signal,
      });
      clearTimeout(timer);

      const data = await res.json() as any;
      const headers: Record<string, string> = {};
      ['x-ratelimit-limit','x-ratelimit-remaining','x-ratelimit-reset',
       'x-ratelimit-algorithm','retry-after'].forEach(h => {
        const v = res.headers.get(h);
        if (v) headers[h] = v;
      });

      return {
        allowed: data.allowed ?? (res.status !== 429 && res.status !== 403),
        remaining: data.remaining ?? parseInt(headers['x-ratelimit-remaining'] ?? '0'),
        limit: data.limit ?? parseInt(headers['x-ratelimit-limit'] ?? '0'),
        resetAt: data.resetAt ?? parseInt(headers['x-ratelimit-reset'] ?? '0'),
        algorithm: data.algorithm ?? headers['x-ratelimit-algorithm'],
        reason: data.reason,
        retryAfter: data.retryAfter ?? (parseInt(headers['retry-after'] ?? '0') || undefined),
        headers,
      };
    } catch {
      return this.failureMode === 'closed'
        ? { allowed: false, remaining: 0, limit: 0, resetAt: 0, reason: 'sdk_error' }
        : { allowed: true,  remaining: 0, limit: 0, resetAt: 0, reason: 'sdk_error_open' };
    }
  }

  async status(endpoint = '/') {
    const res = await fetch(
      `${this.baseUrl}/check/status?apiKey=${encodeURIComponent(this.apiKey)}&endpoint=${encodeURIComponent(endpoint)}`,
      { headers: { 'X-API-Key': this.apiKey } }
    );
    return res.json();
  }
}

// ── Express Middleware ────────────────────────────────────────────────────────

export interface ExpressMiddlewareOptions extends RateLimitConfig {
  getIp?: (req: any) => string;
  getEndpoint?: (req: any) => string;
  onBlocked?: (req: any, res: any, result: CheckResult) => void;
  skip?: (req: any) => boolean | Promise<boolean>;
}

export function createExpressMiddleware(options: ExpressMiddlewareOptions) {
  const rl = new RateLimit(options);
  return async function rateLimitMiddleware(req: any, res: any, next: any) {
    if (await options.skip?.(req)) return next();

    const ip       = options.getIp?.(req) ?? req.ip ?? req.connection?.remoteAddress ?? '';
    const endpoint = options.getEndpoint?.(req) ?? req.path ?? '/';

    const result = await rl.check({ ip, endpoint, method: req.method,
      userAgent: req.headers?.['user-agent'] });

    res.set('X-RateLimit-Limit',     result.limit);
    res.set('X-RateLimit-Remaining', result.remaining);
    res.set('X-RateLimit-Reset',     result.resetAt);

    if (!result.allowed) {
      if (result.retryAfter) res.set('Retry-After', result.retryAfter);
      if (options.onBlocked) return options.onBlocked(req, res, result);
      return res.status(429).json({ error: 'Too Many Requests', retryAfter: result.retryAfter });
    }
    next();
  };
}

// ── Next.js Middleware Helper ─────────────────────────────────────────────────

export function createNextMiddleware(options: RateLimitConfig & { getIp?: (req: any) => string }) {
  const rl = new RateLimit(options);
  return async function nextMiddleware(request: Request): Promise<Response | null> {
    const url = new URL(request.url);
    const ip  = options.getIp?.(request as any)
      ?? (request.headers as any).get?.('cf-connecting-ip')
      ?? (request.headers as any).get?.('x-forwarded-for')?.split(',')[0]?.trim()
      ?? '127.0.0.1';

    const result = await rl.check({
      ip, endpoint: url.pathname, method: request.method,
      userAgent: (request.headers as any).get?.('user-agent') ?? '',
    });

    if (!result.allowed) {
      return new Response(JSON.stringify({ error: 'Too Many Requests' }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit':     String(result.limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset':     String(result.resetAt),
          ...(result.retryAfter ? { 'Retry-After': String(result.retryAfter) } : {}),
        },
      });
    }
    return null;
  };
}

// ── Cloudflare Workers Helper ─────────────────────────────────────────────────

export function createCFMiddleware(options: RateLimitConfig) {
  const rl = new RateLimit(options);
  return async function cfMiddleware(request: Request): Promise<Response | null> {
    const url = new URL(request.url);
    const ip  = request.headers.get('CF-Connecting-IP') ?? '127.0.0.1';
    const result = await rl.check({
      ip, endpoint: url.pathname, method: request.method,
      userAgent: request.headers.get('User-Agent') ?? '',
      country: request.headers.get('CF-IPCountry') ?? '',
    });
    if (!result.allowed) {
      return new Response(JSON.stringify({ error: 'Too Many Requests' }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(result.retryAfter ?? 60),
          'X-RateLimit-Limit': String(result.limit),
          'X-RateLimit-Remaining': '0',
        },
      });
    }
    return null;
  };
}

export default RateLimit;
