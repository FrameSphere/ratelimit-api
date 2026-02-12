const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

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
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
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
  async register(email: string, password: string, name: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  // API Keys
  async createApiKey(keyName: string) {
    return this.request('/api/keys', {
      method: 'POST',
      body: JSON.stringify({ keyName }),
    });
  }

  async getApiKeys() {
    return this.request('/api/keys');
  }

  async deleteApiKey(id: number) {
    return this.request(`/api/keys/${id}`, {
      method: 'DELETE',
    });
  }

  // Configs
  async createConfig(apiKeyId: number, name: string, maxRequests: number, windowSeconds: number) {
    return this.request('/api/configs', {
      method: 'POST',
      body: JSON.stringify({ apiKeyId, name, maxRequests, windowSeconds }),
    });
  }

  async getConfigs(apiKeyId: number) {
    return this.request(`/api/configs/${apiKeyId}`);
  }

  async updateConfig(id: number, data: any) {
    return this.request(`/api/configs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteConfig(id: number) {
    return this.request(`/api/configs/${id}`, {
      method: 'DELETE',
    });
  }

  // Filters
  async createFilter(configId: number, ruleType: string, ruleValue: string, action: string) {
    return this.request('/api/filters', {
      method: 'POST',
      body: JSON.stringify({ configId, ruleType, ruleValue, action }),
    });
  }

  async getFilters(configId: number) {
    return this.request(`/api/filters/${configId}`);
  }

  async deleteFilter(id: number) {
    return this.request(`/api/filters/${id}`, {
      method: 'DELETE',
    });
  }

  // Analytics
  async getAnalytics(apiKeyId: number, range: string = '24h') {
    return this.request(`/api/analytics/${apiKeyId}?range=${range}`);
  }

  async getRecentLogs(apiKeyId: number, limit: number = 50) {
    return this.request(`/api/logs/${apiKeyId}?limit=${limit}`);
  }
}

export const api = new ApiClient();
