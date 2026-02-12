import { Hono } from 'hono';
import { corsMiddleware } from './middleware/cors';
import { authMiddleware } from './middleware/auth';

// Auth handlers
import { register, login, getProfile } from './auth/handlers';

// Rate limit handlers
import { createApiKey, getApiKeys, deleteApiKey } from './ratelimit/api-keys';
import { createConfig, getConfigs, updateConfig, deleteConfig } from './ratelimit/configs';
import { createFilter, getFilters, deleteFilter } from './ratelimit/filters';
import { checkRateLimit } from './ratelimit/checker';

// Analytics handlers
import { getAnalytics, getRecentLogs } from './analytics/handlers';

const app = new Hono();

// Apply CORS middleware
app.use('/*', corsMiddleware);

// Health check
app.get('/', (c) => {
  return c.json({
    message: 'Rate Limit API is running',
    version: '1.0.0',
    endpoints: {
      auth: '/auth/*',
      apiKeys: '/api/keys/*',
      configs: '/api/configs/*',
      filters: '/api/filters/*',
      check: '/check',
      analytics: '/api/analytics/*'
    }
  });
});

// ===== Public Routes =====
app.post('/auth/register', register);
app.post('/auth/login', login);

// Rate limit check endpoint (public, uses API key)
app.get('/check', checkRateLimit);
app.post('/check', checkRateLimit);

// ===== Protected Routes =====
app.use('/api/*', authMiddleware);
app.use('/auth/profile', authMiddleware);

// Auth
app.get('/auth/profile', getProfile);

// API Keys
app.post('/api/keys', createApiKey);
app.get('/api/keys', getApiKeys);
app.delete('/api/keys/:id', deleteApiKey);

// Configs
app.post('/api/configs', createConfig);
app.get('/api/configs/:apiKeyId', getConfigs);
app.put('/api/configs/:id', updateConfig);
app.delete('/api/configs/:id', deleteConfig);

// Filters
app.post('/api/filters', createFilter);
app.get('/api/filters/:configId', getFilters);
app.delete('/api/filters/:id', deleteFilter);

// Analytics
app.get('/api/analytics/:apiKeyId', getAnalytics);
app.get('/api/logs/:apiKeyId', getRecentLogs);

export default app;
