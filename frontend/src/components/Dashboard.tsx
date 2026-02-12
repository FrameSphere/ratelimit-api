import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { ApiKeyManager } from './ApiKeyManager';
import { ConfigManager } from './ConfigManager';
import { Analytics } from './Analytics';

interface DashboardProps {
  onLogout: () => void;
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [user, setUser] = useState<any>(null);
  const [selectedApiKey, setSelectedApiKey] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'keys' | 'configs' | 'analytics'>('keys');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data } = await api.getProfile();
    if (data?.user) {
      setUser(data.user);
    }
  };

  return (
    <>
      <div className="header">
        <div className="header-content">
          <h1>🚀 RateLimit API Control Center</h1>
          <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {user && (
              <span style={{ color: 'var(--text-secondary)' }}>
                {user.name}
              </span>
            )}
            <button onClick={onLogout} className="btn btn-secondary btn-sm">
              Abmelden
            </button>
          </nav>
        </div>
      </div>

      <div className="container">
        {/* Tabs */}
        <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <button
              onClick={() => setActiveTab('keys')}
              style={{
                background: 'none',
                border: 'none',
                padding: '1rem',
                cursor: 'pointer',
                color: activeTab === 'keys' ? 'var(--primary-color)' : 'var(--text-secondary)',
                borderBottom: activeTab === 'keys' ? '2px solid var(--primary-color)' : 'none',
                fontWeight: activeTab === 'keys' ? '600' : '400',
              }}
            >
              API Keys
            </button>
            <button
              onClick={() => setActiveTab('configs')}
              style={{
                background: 'none',
                border: 'none',
                padding: '1rem',
                cursor: 'pointer',
                color: activeTab === 'configs' ? 'var(--primary-color)' : 'var(--text-secondary)',
                borderBottom: activeTab === 'configs' ? '2px solid var(--primary-color)' : 'none',
                fontWeight: activeTab === 'configs' ? '600' : '400',
              }}
              disabled={!selectedApiKey}
            >
              Konfigurationen
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              style={{
                background: 'none',
                border: 'none',
                padding: '1rem',
                cursor: 'pointer',
                color: activeTab === 'analytics' ? 'var(--primary-color)' : 'var(--text-secondary)',
                borderBottom: activeTab === 'analytics' ? '2px solid var(--primary-color)' : 'none',
                fontWeight: activeTab === 'analytics' ? '600' : '400',
              }}
              disabled={!selectedApiKey}
            >
              Analytics
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'keys' && (
          <ApiKeyManager 
            onSelectApiKey={(id) => {
              setSelectedApiKey(id);
              setActiveTab('configs');
            }}
          />
        )}

        {activeTab === 'configs' && selectedApiKey && (
          <ConfigManager apiKeyId={selectedApiKey} />
        )}

        {activeTab === 'analytics' && selectedApiKey && (
          <Analytics apiKeyId={selectedApiKey} />
        )}
      </div>
    </>
  );
}
