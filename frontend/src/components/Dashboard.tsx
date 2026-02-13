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
  const [selectedApiKey, setSelectedApiKey] = useState<number | null>(() => {
    const saved = localStorage.getItem('selectedApiKey');
    return saved ? parseInt(saved) : null;
  });
  const [selectedApiKeyName, setSelectedApiKeyName] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'keys' | 'configs' | 'analytics' | 'docs'>('keys');

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (selectedApiKey) {
      localStorage.setItem('selectedApiKey', selectedApiKey.toString());
      loadApiKeyName();
    } else {
      localStorage.removeItem('selectedApiKey');
      setSelectedApiKeyName('');
    }
  }, [selectedApiKey]);

  const loadApiKeyName = async () => {
    if (!selectedApiKey) return;
    const { data } = await api.getApiKeys();
    if (data?.apiKeys) {
      const key = data.apiKeys.find((k: any) => k.id === selectedApiKey);
      if (key) {
        setSelectedApiKeyName(key.key_name);
      }
    }
  };

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
              <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            RateLimit API Control Center
          </h1>
          <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {user && (
              <span style={{ color: 'var(--text-secondary)' }}>
                {user.name}
              </span>
            )}
            <a href="/" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '0.35rem' }}>
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              Home
            </a>
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

        {(activeTab === 'configs' || activeTab === 'analytics') && selectedApiKey && (
          <div className="alert" style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid var(--primary-color)',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="2">
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
              </svg>
              <span>
                Ausgewählter API Key: <strong>{selectedApiKeyName || `Key #${selectedApiKey}`}</strong>
              </span>
            </div>
            <button
              onClick={() => {
                setSelectedApiKey(null);
                setActiveTab('keys');
              }}
              className="btn btn-sm btn-secondary"
            >
              Anderen Key wählen
            </button>
          </div>
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
