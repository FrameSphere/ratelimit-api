import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { ApiKeyManager } from './ApiKeyManager';
import { ConfigManager } from './ConfigManager';
import { Analytics } from './Analytics';
import { Docs } from './Docs';
import { SupportTab } from './SupportTab';

interface DashboardProps {
  onLogout: () => void;
}

type TabId = 'keys' | 'configs' | 'analytics' | 'docs' | 'support';

export function Dashboard({ onLogout }: DashboardProps) {
  const [user, setUser] = useState<any>(null);
  const [selectedApiKey, setSelectedApiKey] = useState<number | null>(() => {
    const saved = localStorage.getItem('selectedApiKey');
    return saved ? parseInt(saved) : null;
  });
  const [selectedApiKeyName, setSelectedApiKeyName] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabId>('keys');

  useEffect(() => { loadProfile(); }, []);

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
      if (key) setSelectedApiKeyName(key.key_name);
    }
  };

  const loadProfile = async () => {
    const { data } = await api.getProfile();
    if (data?.user) setUser(data.user);
  };

  // ── Tab button style helper ──────────────────────────────────
  const tabStyle = (id: TabId): React.CSSProperties => ({
    background: 'none',
    border: 'none',
    padding: '1rem 0.25rem',
    cursor: 'pointer',
    color: activeTab === id ? 'var(--primary-color)' : 'var(--text-secondary)',
    borderBottom: activeTab === id ? '2px solid var(--primary-color)' : '2px solid transparent',
    fontWeight: activeTab === id ? '600' : '400',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    transition: 'color .15s',
    whiteSpace: 'nowrap' as const,
  });

  return (
    <>
      {/* ── Header ── */}
      <div className="header">
        <div className="header-content">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            RateLimit API
          </h1>
          <nav style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {user && (
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{user.name}</span>
            )}
            <a href="/changelog" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
              📋 Changelog
            </a>
            <a href="/" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
              Home
            </a>
            <button onClick={onLogout} className="btn btn-secondary btn-sm">
              Abmelden
            </button>
          </nav>
        </div>
      </div>

      <div className="container">
        {/* ── Tabs ── */}
        <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto' }}>

            <button style={tabStyle('keys')} onClick={() => setActiveTab('keys')}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
              </svg>
              API Keys
            </button>

            <button style={tabStyle('configs')} onClick={() => setActiveTab('configs')} disabled={!selectedApiKey}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93A10 10 0 0 0 5.46 5.46"/>
                <path d="M4.93 19.07A10 10 0 0 0 18.54 18.54"/>
                <path d="M15.5 2.1A10 10 0 0 0 2.1 15.5"/>
                <path d="M8.5 21.9A10 10 0 0 0 21.9 8.5"/>
              </svg>
              Konfigurationen
            </button>

            <button style={tabStyle('analytics')} onClick={() => setActiveTab('analytics')} disabled={!selectedApiKey}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
              Analytics
            </button>

            <button style={tabStyle('support')} onClick={() => setActiveTab('support')}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Support
            </button>

            <button style={tabStyle('docs')} onClick={() => setActiveTab('docs')}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
              Dokumentation
            </button>

          </div>
        </div>

        {/* ── API Key context banner ── */}
        {(activeTab === 'configs' || activeTab === 'analytics') && selectedApiKey && (
          <div style={{
            background: 'rgba(59,130,246,0.08)',
            border: '1px solid rgba(59,130,246,0.3)',
            borderRadius: 8,
            padding: '0.875rem 1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="2">
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
              </svg>
              <span style={{ fontSize: '0.9rem' }}>
                API Key: <strong>{selectedApiKeyName || `#${selectedApiKey}`}</strong>
              </span>
            </div>
            <button
              onClick={() => { setSelectedApiKey(null); setActiveTab('keys'); }}
              className="btn btn-sm btn-secondary"
            >
              Anderen Key wählen
            </button>
          </div>
        )}

        {/* ── Tab content ── */}
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

        {activeTab === 'support' && (
          <SupportTab user={user} />
        )}

        {activeTab === 'docs' && (
          <Docs />
        )}

        {/* Hint when key-dependent tab is active but no key selected */}
        {(activeTab === 'configs' || activeTab === 'analytics') && !selectedApiKey && (
          <div style={{
            textAlign: 'center', padding: '3rem',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 12,
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔑</div>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Bitte zuerst einen API Key auswählen.
            </div>
            <button className="btn btn-primary" onClick={() => setActiveTab('keys')}>
              Zu API Keys →
            </button>
          </div>
        )}
      </div>
    </>
  );
}
