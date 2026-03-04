/**
 * hq-reporter.ts
 * Sends errors and notifications from the Ratelimit API backend
 * to WebControl HQ so they appear in the correct site tab.
 *
 * Uses fire-and-forget (ctx.waitUntil / no-await) so it never
 * delays a response to the end user.
 */

interface HQEnv {
  HQ_API_URL?: string;
  HQ_SITE_ID?: string;
  HQ_AUTH_TOKEN?: string;
}

/**
 * Report an error to WebControl HQ.
 * Safe to call without await – swallows all fetch errors internally.
 */
export function reportErrorToHQ(
  env: HQEnv,
  errorType: string,
  message: string,
  options?: { stack?: string; path?: string; statusCode?: number }
): void {
  const url = env.HQ_API_URL;
  if (!url) return; // silently skip if not configured

  const siteId = env.HQ_SITE_ID || 'ratelimit';
  const body = {
    site_id:    siteId,
    error_type: errorType,
    message:    String(message).slice(0, 500),
    stack:      options?.stack  ? String(options.stack).slice(0, 2000) : undefined,
    path:       options?.path   || undefined,
    status_code: options?.statusCode || undefined,
  };

  // fire-and-forget
  fetch(`${url}/api/errors`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  }).catch(() => {
    // intentionally ignored – HQ reporting must never crash the API
  });
}

/**
 * Send a notification to WebControl HQ.
 * Also fire-and-forget.
 */
export function notifyHQ(
  env: HQEnv,
  type: 'info' | 'warning' | 'error' | 'success',
  title: string,
  message?: string
): void {
  const url = env.HQ_API_URL;
  if (!url) return;

  const siteId = env.HQ_SITE_ID || 'ratelimit';

  fetch(`${url}/api/notifications`, {
    method:  'POST',
    headers: {
      'Content-Type': 'application/json',
      // HQ_AUTH_TOKEN is a secret – set via: npx wrangler secret put HQ_AUTH_TOKEN
      'X-Auth-Token': (env as any).HQ_AUTH_TOKEN || '',
    },
    body: JSON.stringify({ site_id: siteId, type, title, message }),
  }).catch(() => {});
}
