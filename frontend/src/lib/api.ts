const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

export interface User {
  id: number;
  email: string;
  name: string;
  plan?: string;
}

export interface ApiKey {
  id: number;
  user_id: number;
  key_name: string;
  api_key: string;
  created_at: string;
  is_active: number;
}

export interface RateLimitConfig {
  id: number;
  api_key_id: number;
  name: string;
  max_requests: number;
  window_seconds: number;
  enabled: number;
  created_at: string;
  updated_at: string;
}

export interface FilterRule {
  id: number;
  config_id: number;
  rule_type: string;
  rule_value: string;
  action: string;
  created_at: string;
}

export interface RequestLog {
  id: number;
  api_key_id: number;
  ip_address: string;
  user_agent: string;
  endpoint: string;
  method: string;
  status_code: number;
  blocked: number;
  block_reason?: string | null;
  timestamp: string;
}

export interface AnalyticsData {
  total: number;
  blocked: number;
  uniqueIps: number;
  chart: Array<{ hour: string; requests: number; blocked: number }>;
}

export interface SimulationResult {
  hasData: boolean;
  message?: string;
  config?: { currentLimit: number; hypotheticalLimit: number; windowSeconds: number };
  current?: { allowed: number; blocked: number; blockPct: number };
  simulated?: { allowed: number; blocked: number; blockPct: number };
  delta?: { blockedDiff: number; blockedDiffPct: number; direction: string; summary: string };
  totalRequests?: number;
  hourlyChart?: Array<{ hour: string; curAllowed: number; curBlocked: number; simAllowed: number; simBlocked: number }>;
}

export interface IPReputation {
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
}

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (this.token) (headers as any)['Authorization'] = `Bearer ${this.token}`;

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: { ...headers, ...(options.headers || {}) },
      });
      let data: any = {};
      try {
        data = await response.json();
      } catch {
        if (!response.ok) return { error: `HTTP ${response.status}: Route not found or server error` };
      }
      if (!response.ok) return { error: data?.error || `HTTP ${response.status}` };
      return { data };
    } catch (error) {
      console.error('API request error:', error);
      return { error: 'Network error' };
    }
  }

  // ── Auth ──────────────────────────────────────────────────────────────────

  async register(email: string, password: string, name: string) {
    return this.request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(email: string, password: string) {
    return this.request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getProfile() {
    return this.request<{ user: User }>('/auth/profile');
  }

  async updateProfile(name: string) {
    return this.request<{ user: User }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request<{ message: string }>('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async deleteAccount() {
    return this.request<{ message: string }>('/auth/account', { method: 'DELETE' });
  }

  // ── API Keys ──────────────────────────────────────────────────────────────

  async createApiKey(keyName: string) {
    return this.request<{ apiKey: ApiKey }>('/api/keys', {
      method: 'POST',
      body: JSON.stringify({ keyName }),
    });
  }

  async getApiKeys() {
    return this.request<{ apiKeys: ApiKey[] }>('/api/keys');
  }

  async toggleApiKey(id: number, isActive: boolean) {
    return this.request<{ message: string }>(`/api/keys/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ isActive }),
    });
  }

  async deleteApiKey(id: number) {
    return this.request<{ message: string }>(`/api/keys/${id}`, { method: 'DELETE' });
  }

  // ── Configs ───────────────────────────────────────────────────────────────

  async createConfig(apiKeyId: number, name: string, maxRequests: number, windowSeconds: number, opts?: {
    endpointPattern?: string | null;
    algorithm?: 'sliding_window' | 'token_bucket';
    burstSize?: number | null;
    refillRate?: number | null;
  }) {
    return this.request<{ config: RateLimitConfig }>('/api/configs', {
      method: 'POST',
      body: JSON.stringify({ apiKeyId, name, maxRequests, windowSeconds, ...opts }),
    });
  }

  async getConfigs(apiKeyId: number) {
    return this.request<{ configs: RateLimitConfig[] }>(`/api/configs/${apiKeyId}`);
  }

  async updateConfig(id: number, data: Partial<RateLimitConfig> & {
    endpointPattern?: string | null;
    algorithm?: string;
    burstSize?: number | null;
    refillRate?: number | null;
  }) {
    return this.request<{ config: RateLimitConfig }>(`/api/configs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteConfig(id: number) {
    return this.request<{ message: string }>(`/api/configs/${id}`, { method: 'DELETE' });
  }

  // ── Filters ───────────────────────────────────────────────────────────────

  async createFilter(configId: number, ruleType: string, ruleValue: string, action: string) {
    return this.request<{ filter: FilterRule }>('/api/filters', {
      method: 'POST',
      body: JSON.stringify({ configId, ruleType, ruleValue, action }),
    });
  }

  async getFilters(configId: number) {
    return this.request<{ filters: FilterRule[] }>(`/api/filters/${configId}`);
  }

  async deleteFilter(id: number) {
    return this.request<{ message: string }>(`/api/filters/${id}`, { method: 'DELETE' });
  }

  // ── Rate Limit Status ─────────────────────────────────────────────────────

  async getRateLimitStatus(apiKey: string, endpoint?: string) {
    const params = new URLSearchParams({ apiKey });
    if (endpoint) params.set('endpoint', endpoint);
    return this.request<any>(`/check/status?${params}`);
  }

  // ── Analytics ─────────────────────────────────────────────────────────────

  async getAnalytics(apiKeyId: number, range: string = '24h') {
    return this.request<any>(`/api/analytics/${apiKeyId}?range=${range}`);
  }

  async getRecentLogs(apiKeyId: number, limit: number = 100, filters?: {
    ip?: string; endpoint?: string; status?: string; method?: string;
  }) {
    const params = new URLSearchParams({ limit: String(limit) });
    if (filters?.ip) params.set('ip', filters.ip);
    if (filters?.endpoint) params.set('endpoint', filters.endpoint);
    if (filters?.status) params.set('status', filters.status);
    if (filters?.method) params.set('method', filters.method);
    return this.request<{ logs: RequestLog[] }>(`/api/logs/${apiKeyId}?${params}`);
  }

  async exportLogs(apiKeyId: number, range: string = '7d') {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (this.token) (headers as any)['Authorization'] = `Bearer ${this.token}`;
    const response = await fetch(`${API_BASE_URL}/api/logs/${apiKeyId}/export?range=${range}`, { headers });
    if (!response.ok) throw new Error('Export failed');
    return response.blob();
  }

  async getKeyUsage(apiKeyId: number) {
    return this.request<{ usage: any }>(`/api/analytics/${apiKeyId}/usage`);
  }

  async getAllKeysUsage() {
    return this.request<{ keys: any[] }>('/api/analytics/all/usage');
  }

  // ── Adaptive Rate Limiting (Pro) ──────────────────────────────────────────

  async getAdaptiveSuggestions(apiKeyId: number) {
    return this.request<{ suggestions: any[] }>(`/api/adaptive/${apiKeyId}`);
  }

  async applyAdaptiveSuggestion(configId: number) {
    return this.request<{ message: string; newLimit: number }>('/api/adaptive/apply', {
      method: 'POST',
      body: JSON.stringify({ configId }),
    });
  }

  // ── Simulation / What-if (Pro) ────────────────────────────────────────────

  async simulateLimit(apiKeyId: number, hypotheticalLimit: number, opts?: {
    windowSeconds?: number;
    configId?: number;
  }) {
    return this.request<SimulationResult>(`/api/simulate/${apiKeyId}`, {
      method: 'POST',
      body: JSON.stringify({ hypotheticalLimit, ...opts }),
    });
  }

  // ── IP Reputation (Pro) ───────────────────────────────────────────────────

  async getIPReputation(apiKeyId: number, ip: string) {
    return this.request<IPReputation>(`/api/reputation/${apiKeyId}/ip?ip=${encodeURIComponent(ip)}`);
  }

  async getTopSuspiciousIPs(apiKeyId: number) {
    return this.request<{ ips: IPReputation[] }>(`/api/reputation/${apiKeyId}/top`);
  }

  // ── Stripe ────────────────────────────────────────────────────────────────

  async createCheckoutSession(successUrl?: string, cancelUrl?: string) {
    return this.request<{ url: string; sessionId: string }>('/api/stripe/checkout', {
      method: 'POST',
      body: JSON.stringify({ successUrl, cancelUrl }),
    });
  }

  async createPortalSession() {
    return this.request<{ url: string }>('/api/stripe/portal', { method: 'POST', body: '{}' });
  }

  async getSubscriptionStatus() {
    return this.request<{ plan: string; customerId: string | null; subscriptionId: string | null }>(
      '/api/stripe/status'
    );
  }

  // ── Alerts (Pro) ──────────────────────────────────────────────────────────

  async getAlerts(apiKeyId: number) {
    return this.request<{ alerts: any[] }>(`/api/alerts/${apiKeyId}`);
  }

  async createAlert(data: {
    apiKeyId: number; name: string; webhookUrl: string;
    webhookType: 'slack' | 'discord' | 'custom';
    threshold429Pct: number; thresholdSpikePct: number;
    thresholdNearLimitPct: number; enabled: boolean;
  }) {
    return this.request<{ alert: any }>('/api/alerts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAlert(id: number, data: Partial<any>) {
    return this.request<{ alert: any }>(`/api/alerts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAlert(id: number) {
    return this.request<{ message: string }>(`/api/alerts/${id}`, { method: 'DELETE' });
  }

  async testWebhook(webhookUrl: string, webhookType: string) {
    return this.request<{ success: boolean; message: string }>('/api/alerts/test', {
      method: 'POST',
      body: JSON.stringify({ webhookUrl, webhookType }),
    });
  }

  // ── Auto IP Blocking (Pro) ─────────────────────────────────────────────────

  async getAutoBlockSettings(apiKeyId: number) {
    return this.request<{ settings: any; migrationRequired?: boolean }>(`/api/autoblock/${apiKeyId}/settings`);
  }

  async saveAutoBlockSettings(apiKeyId: number, settings: {
    enabled: boolean; violations_threshold: number;
    violations_window_minutes: number; block_duration_minutes: number;
  }) {
    return this.request<{ message: string }>(`/api/autoblock/${apiKeyId}/settings`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async getBlockedIPs(apiKeyId: number) {
    return this.request<{ blocked: any[]; violations: any[] }>(`/api/autoblock/${apiKeyId}/blocked`);
  }

  async unblockIP(apiKeyId: number, ip: string) {
    return this.request<{ message: string }>(`/api/autoblock/${apiKeyId}/blocked/${encodeURIComponent(ip)}`, { method: 'DELETE' });
  }

  async clearExpiredBlocks(apiKeyId: number) {
    return this.request<{ message: string; cleared: number }>(`/api/autoblock/${apiKeyId}/expired`, { method: 'DELETE' });
  }

  async manualBlockIP(apiKeyId: number, ip: string, durationMinutes: number) {
    return this.request<{ message: string }>(`/api/autoblock/${apiKeyId}/block`, {
      method: 'POST',
      body: JSON.stringify({ ip, durationMinutes }),
    });
  }

  // ── Scheduled Reports (Pro) ────────────────────────────────────────────────

  async getReportSchedule(apiKeyId: number) {
    return this.request<{ schedule: any; migrationRequired?: boolean }>(`/api/reports/${apiKeyId}/schedule`);
  }

  async saveReportSchedule(apiKeyId: number, data: {
    reportEmail: string; frequency: 'daily' | 'weekly' | 'monthly'; enabled: boolean;
  }) {
    return this.request<{ message: string }>(`/api/reports/${apiKeyId}/schedule`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async sendTestReport(apiKeyId: number, reportEmail: string) {
    return this.request<{ message: string }>(`/api/reports/${apiKeyId}/test`, {
      method: 'POST',
      body: JSON.stringify({ reportEmail }),
    });
  }
}

export const api = new ApiClient();
