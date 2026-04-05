import { Context, Next } from 'hono';

export async function corsMiddleware(c: Context, next: Next) {
  c.header('Access-Control-Allow-Origin', '*');
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  c.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-API-Key, X-Forwarded-For, X-Real-IP'
  );
  c.header(
    'Access-Control-Expose-Headers',
    'X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, Retry-After, X-RateLimit-Algorithm, X-RateLimit-Burst'
  );
  c.header('Access-Control-Max-Age', '86400');

  if (c.req.method === 'OPTIONS') {
    return c.text('', 204);
  }

  await next();
}
