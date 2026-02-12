import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { ApiKeyManager } from './ApiKeyManager';
import { ConfigManager } from './ConfigManager';
import { Analytics } from './Analytics';
import { Docs } from './Docs';

interface DashboardProps {
  onLogout: () => void;
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [user, setUser] = useState<any>(null);
  const [selectedApiKey, setSelectedApiKey] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'keys' | 'configs' | 'analytics' | 'docs'>('keys');

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
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 18 0 9 9 0 1 0 -18 0"/>
              <path d="M12 7v5l3 3"/>
            </svg>
            RateLimit API Control Center
          </h1>
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
            <button
              onClick={() => setActiveTab('docs')}
              style={{
                background: 'none',
                border: 'none',
                padding: '1rem',
                cursor: 'pointer',
                color: activeTab === 'docs' ? 'var(--primary-color)' : 'var(--text-secondary)',
                borderBottom: activeTab === 'docs' ? '2px solid var(--primary-color)' : 'none',
                fontWeight: activeTab === 'docs' ? '600' : '400',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
              Dokumentation
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

        {activeTab === 'docs' && (
          <Docs />
        )}
      </div>
    </>
  );
}
