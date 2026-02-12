const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

// Type Definitions
export interface User {
  id: number;
  email: string;
  name: string;
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
  timestamp: string;
}

export interface AnalyticsData {
  total: number;
  blocked: number;
  uniqueIps: number;
  chart: Array<{ hour: string; requests: number; blocked: number }>;
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

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      (headers as any)['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...(options.headers || {}),
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Request failed' };
      }

      return { data };
    } catch (error) {
      console.error('API request error:', error);
      return { error: 'Network error' };
    }
  }

  // Auth
  async register(email: string, password: string, name: string): Promise<ApiResponse<{ token: string; user: User }>> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(email: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    return this.request('/auth/profile');
  }

  // API Keys
  async createApiKey(keyName: string): Promise<ApiResponse<{ apiKey: ApiKey }>> {
    return this.request('/api/keys', {
      method: 'POST',
      body: JSON.stringify({ keyName }),
    });
  }

  async getApiKeys(): Promise<ApiResponse<{ apiKeys: ApiKey[] }>> {
    return this.request('/api/keys');
  }

  async deleteApiKey(id: number): Promise<ApiResponse<{ message: string }>> {
    return this.request(`/api/keys/${id}`, {
      method: 'DELETE',
    });
  }

  // Configs
  async createConfig(
    apiKeyId: number, 
    name: string, 
    maxRequests: number, 
    windowSeconds: number
  ): Promise<ApiResponse<{ config: RateLimitConfig }>> {
    return this.request('/api/configs', {
      method: 'POST',
      body: JSON.stringify({ apiKeyId, name, maxRequests, windowSeconds }),
    });
  }

  async getConfigs(apiKeyId: number): Promise<ApiResponse<{ configs: RateLimitConfig[] }>> {
    return this.request(`/api/configs/${apiKeyId}`);
  }

  async updateConfig(id: number, data: Partial<RateLimitConfig>): Promise<ApiResponse<{ config: RateLimitConfig }>> {
    return this.request(`/api/configs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteConfig(id: number): Promise<ApiResponse<{ message: string }>> {
    return this.request(`/api/configs/${id}`, {
      method: 'DELETE',
    });
  }

  // Filters
  async createFilter(
    configId: number, 
    ruleType: string, 
    ruleValue: string, 
    action: string
  ): Promise<ApiResponse<{ filter: FilterRule }>> {
    return this.request('/api/filters', {
      method: 'POST',
      body: JSON.stringify({ configId, ruleType, ruleValue, action }),
    });
  }

  async getFilters(configId: number): Promise<ApiResponse<{ filters: FilterRule[] }>> {
    return this.request(`/api/filters/${configId}`);
  }

  async deleteFilter(id: number): Promise<ApiResponse<{ message: string }>> {
    return this.request(`/api/filters/${id}`, {
      method: 'DELETE',
    });
  }

  // Analytics
  async getAnalytics(apiKeyId: number, range: string = '24h'): Promise<ApiResponse<AnalyticsData>> {
    return this.request(`/api/analytics/${apiKeyId}?range=${range}`);
  }

  async getRecentLogs(apiKeyId: number, limit: number = 50): Promise<ApiResponse<{ logs: RequestLog[] }>> {
    return this.request(`/api/logs/${apiKeyId}?limit=${limit}`);
  }
}

export const api = new ApiClient();
