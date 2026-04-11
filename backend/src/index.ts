import { Hono } from 'hono';
import { corsMiddleware } from './middleware/cors';
import { authMiddleware } from './middleware/auth';
import { reportErrorToHQ } from './hq-reporter';

import { register, login, getProfile, updateProfile, changePassword, deleteAccount } from './auth/handlers';
import {
  googleOAuthInit, googleOAuthCallback,
  githubOAuthInit, githubOAuthCallback,
  framesphereOAuthInit, framesphereOAuthCallback
} from './auth/oauth';

import { createApiKey, getApiKeys, updateApiKey, deleteApiKey } from './ratelimit/api-keys';
import { createConfig, getConfigs, updateConfig, deleteConfig } from './ratelimit/configs';
import { createFilter, getFilters, deleteFilter } from './ratelimit/filters';
import { checkRateLimit, getRateLimitStatus } from './ratelimit/checker';
import { getAdaptiveSuggestions, applyAdaptiveSuggestion } from './ratelimit/adaptive';
import {
  getAutoBlockSettings, upsertAutoBlockSettings,
  getBlockedIPs, unblockIP, clearExpiredBlocks, manualBlockIP,
} from './ratelimit/autoblock';
import { getAnalytics, getRecentLogs, exportLogsCsv, getCurrentUsage, getAllKeysUsage } from './analytics/handlers';
import { streamLogs } from './analytics/stream';
import { getReportSchedule, upsertReportSchedule, sendTestReport, runScheduledReports } from './analytics/reports';
import { getAlerts, createAlert, updateAlert, deleteAlert, testWebhook } from './alerts/handlers';
import {
  createCheckoutSession,
  createPortalSession,
  handleStripeWebhook,
  getSubscriptionStatus,
} from './stripe/handlers';

const app = new Hono();

app.use('/*', corsMiddleware);

app.get('/', (c) => c.json({
  message: 'Rate Limit API is running',
  version: '3.0.0',
  features: ['sliding_window', 'token_bucket', 'per_endpoint_limits', 'adaptive_rl', 'email_alerts'],
}));

// ── Public routes ──────────────────────────────────────────────────────────
app.post('/auth/register', register);
app.post('/auth/login', login);

app.get('/auth/oauth/google', googleOAuthInit);
app.get('/auth/oauth/google/callback', googleOAuthCallback);
app.get('/auth/oauth/github', githubOAuthInit);
app.get('/auth/oauth/github/callback', githubOAuthCallback);
app.get('/auth/oauth/framesphere', framesphereOAuthInit);
app.get('/auth/oauth/framesphere/callback', framesphereOAuthCallback);

app.get('/check', checkRateLimit);
app.post('/check', checkRateLimit);

// Live header debug (requires X-API-Key header or ?apiKey query param)
app.get('/check/status', getRateLimitStatus);

// Stripe webhook — raw body required, BEFORE auth middleware
app.post('/stripe/webhook', handleStripeWebhook);

// ── Protected routes ───────────────────────────────────────────────────────
app.use('/api/*', authMiddleware);
app.use('/auth/profile', authMiddleware);
app.use('/auth/password', authMiddleware);
app.use('/auth/account', authMiddleware);

// Profile
app.get('/auth/profile', getProfile);
app.put('/auth/profile', updateProfile);
app.put('/auth/password', changePassword);
app.delete('/auth/account', deleteAccount);

// API Keys
app.post('/api/keys', createApiKey);
app.get('/api/keys', getApiKeys);
app.put('/api/keys/:id', updateApiKey);
app.delete('/api/keys/:id', deleteApiKey);

// Configs (with per-endpoint + algorithm support)
app.post('/api/configs', createConfig);
app.get('/api/configs/:apiKeyId', getConfigs);
app.put('/api/configs/:id', updateConfig);
app.delete('/api/configs/:id', deleteConfig);

// Filters
app.post('/api/filters', createFilter);
app.get('/api/filters/:configId', getFilters);
app.delete('/api/filters/:id', deleteFilter);

// Analytics
app.get('/api/analytics/all/usage', getAllKeysUsage);
app.get('/api/analytics/:apiKeyId/usage', getCurrentUsage);
app.get('/api/analytics/:apiKeyId', getAnalytics);

// SSE Live Stream (Pro)
app.get('/api/stream/:apiKeyId', streamLogs);

// Scheduled Reports (Pro)
app.get('/api/reports/:apiKeyId/schedule', getReportSchedule);
app.put('/api/reports/:apiKeyId/schedule', upsertReportSchedule);
app.post('/api/reports/:apiKeyId/test', sendTestReport);

// Logs
app.get('/api/logs/:apiKeyId/export', exportLogsCsv);
app.get('/api/logs/:apiKeyId', getRecentLogs);

// Adaptive Rate Limiting (Pro)
app.get('/api/adaptive/:apiKeyId', getAdaptiveSuggestions);
app.post('/api/adaptive/apply', applyAdaptiveSuggestion);

// Auto IP Blocking (Pro)
app.get('/api/autoblock/:apiKeyId/settings', getAutoBlockSettings);
app.put('/api/autoblock/:apiKeyId/settings', upsertAutoBlockSettings);
app.get('/api/autoblock/:apiKeyId/blocked', getBlockedIPs);
app.delete('/api/autoblock/:apiKeyId/blocked/:ip', unblockIP);
app.delete('/api/autoblock/:apiKeyId/expired', clearExpiredBlocks);
app.post('/api/autoblock/:apiKeyId/block', manualBlockIP);

// Alerts (Pro)
app.get('/api/alerts/:apiKeyId', getAlerts);
app.post('/api/alerts', createAlert);
app.put('/api/alerts/:id', updateAlert);
app.delete('/api/alerts/:id', deleteAlert);
app.post('/api/alerts/test', testWebhook);

// Stripe
app.post('/api/stripe/checkout', createCheckoutSession);
app.post('/api/stripe/portal', createPortalSession);
app.get('/api/stripe/status', getSubscriptionStatus);

export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    try {
      return await app.fetch(request, env, ctx);
    } catch (err: any) {
      reportErrorToHQ(env, 'UnhandledError', err?.message || String(err), {
        stack: err?.stack,
        path: new URL(request.url).pathname,
      });
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },

  // ── Cron Trigger ────────────────────────────────────────────────────────────────────
  async scheduled(event: ScheduledEvent, env: any, ctx: ExecutionContext) {
    ctx.waitUntil(runScheduledReports(env, event.cron));
  },
};
