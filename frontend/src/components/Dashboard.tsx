import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { PLANS, type PlanId } from '../lib/plans';
import { ApiKeyManager } from './ApiKeyManager';
import { ConfigManager } from './ConfigManager';
import { Analytics } from './Analytics';
import { SupportTab } from './SupportTab';

interface DashboardProps {
  onLogout: () => void;
}

type TabId = 'keys' | 'configs' | 'analytics' | 'billing' | 'support';

const NAV_ITEMS: { id: TabId; label: string; requiresKey?: boolean; proOnly?: boolean; icon: React.ReactNode }[] = [
  {
    id: 'keys',
    label: 'API Keys',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
      </svg>
    ),
  },
  {
    id: 'configs',
    label: 'Konfiguration',
    requiresKey: true,
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.07 4.93A10 10 0 0 0 5.46 5.46M4.93 19.07A10 10 0 0 0 18.54 18.54M15.5 2.1A10 10 0 0 0 2.1 15.5M8.5 21.9A10 10 0 0 0 21.9 8.5"/>
      </svg>
    ),
  },
  {
    id: 'analytics',
    label: 'Analytics',
    requiresKey: true,
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
  {
    id: 'billing',
    label: 'Billing',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="4" width="22" height="16" rx="2"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
  },
  {
    id: 'support',
    label: 'Support',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
];

const PAGE_META: Record<TabId, { title: string; desc: string }> = {
  keys: { title: 'API Keys', desc: 'Verwalte deine Keys und erstelle neue für deine Projekte.' },
  configs: { title: 'Konfiguration', desc: 'Rate Limits, Filter und Regeln für den aktiven API Key.' },
  analytics: { title: 'Analytics', desc: 'Traffic, Anfragen und Blockierungen in Echtzeit analysieren.' },
  billing: { title: 'Billing', desc: 'Dein Abo, Plan-Details und Rechnungen verwalten.' },
  support: { title: 'Support', desc: 'Tickets erstellen und mit dem Team kommunizieren.' },
};

export function Dashboard({ onLogout }: DashboardProps) {
  const [user, setUser] = useState<any>(null);
  const [userPlan, setUserPlan] = useState<PlanId>('free');
  const [selectedApiKey, setSelectedApiKey] = useState<number | null>(() => {
    const saved = localStorage.getItem('selectedApiKey');
    return saved ? parseInt(saved) : null;
  });
  const [selectedApiKeyName, setSelectedApiKeyName] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabId>('keys');
  const [profileOpen, setProfileOpen] = useState(false);

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
    if (data?.user) {
      setUser(data.user);
      setUserPlan((data.user.plan as PlanId) || 'free');
    }
  };

  const handleNavClick = (id: TabId) => {
    const item = NAV_ITEMS.find(n => n.id === id);
    if (item?.requiresKey && !selectedApiKey) {
      setActiveTab('keys');
    } else {
      setActiveTab(id);
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const plan = PLANS[userPlan] || PLANS['free'];
  const isPro = userPlan === 'pro' || userPlan === 'enterprise';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#080d1a', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Background glow */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-15%', left: '-5%', width: '35%', height: '35%', background: 'radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '-15%', right: '-5%', width: '30%', height: '30%', background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 244, flexShrink: 0,
        background: 'rgba(10,15,30,0.97)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh', zIndex: 20,
      }}>
        {/* Logo */}
        <div style={{ padding: '1.375rem 1.125rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            <div>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: 'white', letterSpacing: '-0.02em', display: 'block', lineHeight: 1.15 }}>
                RateLimit API
              </span>
            </div>
          </a>
        </div>

        {/* Plan badge */}
        <div style={{ padding: '0.625rem 1.125rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: isPro ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${isPro ? 'rgba(139,92,246,0.35)' : 'rgba(255,255,255,0.07)'}`,
            borderRadius: 6, padding: '3px 10px',
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: isPro ? '#a78bfa' : 'rgba(255,255,255,0.3)',
            }} />
            <span style={{
              fontSize: '0.7rem', fontWeight: 700,
              color: isPro ? '#c4b5fd' : 'rgba(255,255,255,0.4)',
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
              {plan.name} Plan
            </span>
          </div>
          {!isPro && (
            <a href="/pricing" style={{
              display: 'block', marginTop: '0.4rem',
              fontSize: '0.68rem', color: '#8b5cf6', textDecoration: 'none', fontWeight: 600,
            }}>
              ↑ Auf Pro upgraden
            </a>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <NavSection label="Verwaltung">
            {NAV_ITEMS.map(item => {
              const isActive = activeTab === item.id;
              const isDisabled = !!(item.requiresKey && !selectedApiKey);
              return (
                <NavItem
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  isActive={isActive}
                  isDisabled={isDisabled}
                  onClick={() => handleNavClick(item.id)}
                />
              );
            })}
          </NavSection>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.04)', margin: '0.625rem 0' }} />

          <NavSection label="Ressourcen">
            <a href="/docs" style={{ textDecoration: 'none', display: 'block' }}>
              <NavItem icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>} label="Dokumentation" isActive={false} isDisabled={false} onClick={() => {}} />
            </a>
            <a href="/pricing" style={{ textDecoration: 'none', display: 'block' }}>
              <NavItem icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>} label="Preise" isActive={false} isDisabled={false} onClick={() => {}} />
            </a>
            <a href="/changelog" style={{ textDecoration: 'none', display: 'block' }}>
              <NavItem icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>} label="Changelog" isActive={false} isDisabled={false} onClick={() => {}} />
            </a>
          </NavSection>
        </nav>

        {/* Active key indicator */}
        {selectedApiKey && (
          <div style={{ margin: '0 0.75rem 0.75rem', padding: '0.625rem 0.75rem', background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 8 }}>
            <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.28)', marginBottom: 3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Aktiver Key</div>
            <div style={{ fontSize: '0.8rem', color: '#60a5fa', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {selectedApiKeyName || `Key #${selectedApiKey}`}
            </div>
            <button onClick={() => { setSelectedApiKey(null); setActiveTab('keys'); }} style={{ marginTop: 4, fontSize: '0.68rem', color: 'rgba(255,255,255,0.25)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
              Key wechseln
            </button>
          </div>
        )}

        {/* User */}
        <button
          onClick={() => setProfileOpen(true)}
          style={{ padding: '0.875rem 1.125rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '0.625rem', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'background .15s' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}
        >
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || '…'}</div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.28)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email || ''}</div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93A10 10 0 0 0 5.46 5.46M4.93 19.07A10 10 0 0 0 18.54 18.54M15.5 2.1A10 10 0 0 0 2.1 15.5M8.5 21.9A10 10 0 0 0 21.9 8.5"/>
          </svg>
        </button>
      </aside>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative', zIndex: 1 }}>

        {/* Upgrade banner for free users */}
        {!isPro && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(109,40,217,0.18), rgba(139,92,246,0.1))',
            borderBottom: '1px solid rgba(139,92,246,0.2)',
            padding: '0.6rem 1.75rem',
            display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
          }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)' }}>
                ⚡ <strong style={{ color: 'white' }}>Free Plan</strong> – Upgrade auf Pro für 25 Keys, 500K Requests/Mo und mehr
              </span>
            </div>
            <a href="/pricing" style={{
              background: 'linear-gradient(135deg,#7c3aed,#8b5cf6)',
              color: 'white', textDecoration: 'none',
              padding: '0.35rem 1rem', borderRadius: 7,
              fontSize: '0.8rem', fontWeight: 700, flexShrink: 0,
              boxShadow: '0 4px 16px -4px rgba(139,92,246,0.5)',
            }}>
              Pro – €4,99/Mo →
            </a>
          </div>
        )}

        {/* Top bar */}
        <header style={{ height: 60, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', padding: '0 1.75rem', gap: '1rem', background: 'rgba(8,13,26,0.9)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 10, flexShrink: 0 }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'white', letterSpacing: '-0.02em', lineHeight: 1 }}>
              {PAGE_META[activeTab].title}
            </h1>
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>
              {PAGE_META[activeTab].desc}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            {(activeTab === 'configs' || activeTab === 'analytics') && selectedApiKey && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.18)', borderRadius: 6, padding: '0.275rem 0.625rem' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.5"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
                <span style={{ fontSize: '0.72rem', color: '#60a5fa', fontWeight: 600 }}>{selectedApiKeyName || `Key #${selectedApiKey}`}</span>
              </div>
            )}
            {activeTab === 'keys' && !selectedApiKey && (
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6, padding: '0.275rem 0.625rem' }}>
                💡 Key auswählen → Konfiguration & Analytics
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '1.75rem' }}>
          {activeTab === 'keys' && (
            <ApiKeyManager onSelectApiKey={(id) => { setSelectedApiKey(id); setActiveTab('configs'); }} />
          )}
          {activeTab === 'configs' && selectedApiKey && (
            <ConfigManager apiKeyId={selectedApiKey} />
          )}
          {activeTab === 'analytics' && selectedApiKey && (
            <Analytics apiKeyId={selectedApiKey} />
          )}
          {activeTab === 'billing' && (
            <BillingTab user={user} userPlan={userPlan} onPlanRefresh={loadProfile} />
          )}
          {activeTab === 'support' && (
            <SupportTab user={user} />
          )}

          {(activeTab === 'configs' || activeTab === 'analytics') && !selectedApiKey && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, textAlign: 'center', gap: '1.25rem' }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem' }}>🔑</div>
              <div>
                <h3 style={{ color: 'white', fontWeight: 700, fontSize: '1rem', marginBottom: '0.4rem' }}>Kein API Key ausgewählt</h3>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem', maxWidth: 300, margin: '0 auto' }}>
                  Wähle einen API Key aus, um {activeTab === 'configs' ? 'Konfigurationen' : 'Analytics'} anzuzeigen.
                </p>
              </div>
              <button onClick={() => setActiveTab('keys')} style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: 'white', border: 'none', borderRadius: 8, padding: '0.6rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                API Keys öffnen →
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Profile Modal */}
      {profileOpen && (
        <ProfileModal
          user={user}
          onClose={() => setProfileOpen(false)}
          onLogout={onLogout}
          onUserUpdate={(updated) => setUser(updated)}
        />
      )}

      <style>{`
        :root {
          --bg-color: #080d1a; --bg-secondary: #0e1624; --bg-tertiary: #172033;
          --border-color: rgba(255,255,255,0.08); --text-primary: #f1f5f9; --text-secondary: #94a3b8;
          --primary-color: #3b82f6; --primary-dark: #2563eb;
          --danger-color: #ef4444; --success-color: #10b981; --warning-color: #f59e0b;
          --shadow: 0 4px 6px -1px rgba(0,0,0,0.4);
        }
        .card { background: rgba(14,22,36,0.85) !important; border: 1px solid rgba(255,255,255,0.07) !important; border-radius: 12px !important; box-shadow: 0 2px 20px rgba(0,0,0,0.3) !important; backdrop-filter: blur(8px) !important; }
        .card-header { border-bottom: 1px solid rgba(255,255,255,0.06) !important; }
        .card-title { font-size: 1rem !important; color: white !important; }
        .btn-primary { background: linear-gradient(135deg,#3b82f6,#6366f1) !important; border: none !important; font-weight: 600 !important; border-radius: 7px !important; color: white !important; transition: all .15s !important; }
        .btn-primary:hover { opacity: 0.88 !important; transform: translateY(-1px) !important; box-shadow: 0 6px 20px -4px rgba(59,130,246,0.45) !important; }
        .btn-secondary { background: rgba(255,255,255,0.05) !important; border: 1px solid rgba(255,255,255,0.09) !important; color: rgba(255,255,255,0.65) !important; border-radius: 7px !important; }
        .btn-secondary:hover { background: rgba(255,255,255,0.09) !important; color: white !important; }
        .btn-danger { background: rgba(239,68,68,0.1) !important; border: 1px solid rgba(239,68,68,0.25) !important; color: #f87171 !important; border-radius: 7px !important; }
        .btn-danger:hover { background: rgba(239,68,68,0.2) !important; }
        .table th { background: rgba(255,255,255,0.025) !important; color: rgba(255,255,255,0.3) !important; font-size: 0.7rem !important; text-transform: uppercase !important; letter-spacing: 0.07em !important; font-weight: 700 !important; }
        .table td, .table th { border-bottom: 1px solid rgba(255,255,255,0.05) !important; }
        .table tr:hover td { background: rgba(255,255,255,0.015) !important; }
        .form-input, .form-select { background: rgba(255,255,255,0.04) !important; border: 1px solid rgba(255,255,255,0.1) !important; color: white !important; border-radius: 8px !important; }
        .form-input:focus, .form-select:focus { border-color: rgba(59,130,246,0.4) !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.08) !important; }
        .form-input::placeholder { color: rgba(255,255,255,0.2) !important; }
        .form-label { color: rgba(255,255,255,0.45) !important; font-size: 0.78rem !important; font-weight: 600 !important; }
        .alert-success { background: rgba(16,185,129,0.07) !important; border: 1px solid rgba(16,185,129,0.18) !important; color: #6ee7b7 !important; border-radius: 10px !important; }
        .alert-error { background: rgba(239,68,68,0.07) !important; border: 1px solid rgba(239,68,68,0.18) !important; border-radius: 10px !important; }
        .badge { border-radius: 5px !important; font-size: 0.75rem !important; }
        .badge-success { background: rgba(16,185,129,0.12) !important; color: #34d399 !important; border: 1px solid rgba(16,185,129,0.18) !important; }
        .badge-danger { background: rgba(239,68,68,0.1) !important; color: #f87171 !important; border: 1px solid rgba(239,68,68,0.18) !important; }
        .badge-warning { background: rgba(245,158,11,0.1) !important; color: #fbbf24 !important; border: 1px solid rgba(245,158,11,0.18) !important; }
        .stat-card { background: rgba(14,22,36,0.85) !important; border: 1px solid rgba(255,255,255,0.07) !important; border-radius: 12px !important; }
        .stat-value { color: #60a5fa !important; }
        .stat-label { color: rgba(255,255,255,0.35) !important; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.09); border-radius: 3px; }
      `}</style>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function NavSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '0.25rem' }}>
      <div style={{ fontSize: '0.67rem', fontWeight: 700, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 0.5rem', marginBottom: '0.375rem' }}>{label}</div>
      {children}
    </div>
  );
}

function NavItem({ icon, label, isActive, isDisabled, onClick }: {
  icon: React.ReactNode; label: string; isActive: boolean; isDisabled: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick} disabled={isDisabled}
      title={isDisabled ? 'Bitte zuerst einen API Key auswählen' : undefined}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.625rem',
        padding: '0.55rem 0.625rem', borderRadius: 7, border: 'none',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        fontWeight: isActive ? 600 : 400, fontSize: '0.855rem',
        width: '100%', textAlign: 'left', transition: 'all .12s',
        color: isActive ? 'white' : isDisabled ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.55)',
        background: isActive ? 'linear-gradient(135deg,rgba(59,130,246,0.18),rgba(139,92,246,0.12))' : 'transparent',
        boxShadow: isActive ? 'inset 0 0 0 1px rgba(59,130,246,0.2)' : 'none',
      }}
      onMouseEnter={e => { if (!isActive && !isDisabled) { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.045)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.8)'; } }}
      onMouseLeave={e => { if (!isActive && !isDisabled) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)'; } }}
    >
      <span style={{ color: isActive ? '#60a5fa' : 'inherit', flexShrink: 0, display: 'flex' }}>{icon}</span>
      {label}
      {isDisabled && <span style={{ marginLeft: 'auto', fontSize: '0.65rem', opacity: 0.35 }}>🔒</span>}
    </button>
  );
}

// ── Billing Tab ───────────────────────────────────────────────────────────────

function BillingTab({ user, userPlan, onPlanRefresh }: {
  user: any; userPlan: PlanId; onPlanRefresh: () => void;
}) {
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const plan = PLANS[userPlan];
  const isPro = userPlan === 'pro' || userPlan === 'enterprise';

  const handleUpgrade = async () => {
    setCheckoutLoading(true);
    const { data, error } = await api.createCheckoutSession();
    if (data?.url) {
      window.location.href = data.url;
    } else {
      alert(error || 'Fehler beim Checkout');
      setCheckoutLoading(false);
    }
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    const { data, error } = await api.createPortalSession();
    if (data?.url) {
      window.location.href = data.url;
    } else {
      alert(error || 'Billing-Portal konnte nicht geöffnet werden');
      setPortalLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 720 }}>
      {/* Current plan card */}
      <div style={{
        background: isPro
          ? 'linear-gradient(135deg, rgba(109,40,217,0.15), rgba(139,92,246,0.08))'
          : 'rgba(14,22,36,0.85)',
        border: isPro ? '2px solid rgba(139,92,246,0.4)' : '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16, padding: '1.75rem', marginBottom: '1.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>Dein aktueller Plan</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'white' }}>{plan.name}</span>
              <span style={{
                padding: '2px 10px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700,
                background: isPro ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.06)',
                color: isPro ? '#c4b5fd' : 'rgba(255,255,255,0.4)',
                border: `1px solid ${isPro ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.08)'}`,
              }}>
                {isPro ? '✓ Aktiv' : 'Kostenlos'}
              </span>
            </div>
            <div style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.45)' }}>{plan.billingNote}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'white', letterSpacing: '-0.04em' }}>
              {plan.priceLabel}
            </div>
            {plan.price !== null && plan.price > 0 && (
              <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)' }}>/Monat</div>
            )}
          </div>
        </div>

        {/* Plan limits summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginTop: '1.25rem' }}>
          {[
            ['API Keys', plan.limits.apiKeys === null ? '∞' : String(plan.limits.apiKeys)],
            ['Req/Monat', plan.limits.requestsPerMonth === null ? '∞' : `${(plan.limits.requestsPerMonth / 1000).toFixed(0)}K`],
            ['Analytics', plan.limits.analyticsHistory],
            ['Filter', plan.limits.filtersPerConfig === null ? '∞' : String(plan.limits.filtersPerConfig)],
          ].map(([label, val]) => (
            <div key={label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '0.625rem 0.75rem' }}>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>{label}</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: isPro ? '#c4b5fd' : 'white', marginTop: 2 }}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      {!isPro ? (
        <div style={{ background: 'rgba(14,22,36,0.85)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '1.75rem', marginBottom: '1.5rem' }}>
          <h3 style={{ color: 'white', fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            🚀 Auf Pro upgraden
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            Hol dir 25 API Keys, 500.000 Requests/Monat, 30 Tage Analytics-Verlauf, CSV-Export und Webhook-Alerts – alles für nur <strong style={{ color: 'white' }}>€4,99/Monat</strong>. Jederzeit kündbar.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleUpgrade}
              disabled={checkoutLoading}
              style={{
                background: 'linear-gradient(135deg,#7c3aed,#8b5cf6)', color: 'white',
                border: 'none', borderRadius: 10, padding: '0.75rem 2rem',
                fontSize: '0.95rem', fontWeight: 700, cursor: checkoutLoading ? 'wait' : 'pointer',
                boxShadow: '0 8px 32px -8px rgba(139,92,246,0.5)',
                opacity: checkoutLoading ? 0.7 : 1,
                transition: 'transform 0.15s',
              }}
              onMouseEnter={e => { if (!checkoutLoading) (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'none'}
            >
              {checkoutLoading ? 'Weiterleitung zu Stripe…' : 'Jetzt upgraden – €4,99/Mo →'}
            </button>
            <a href="/pricing" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.65)', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '0.75rem 1.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
              Alle Pläne vergleichen
            </a>
          </div>
        </div>
      ) : (
        <div style={{ background: 'rgba(14,22,36,0.85)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '1.75rem', marginBottom: '1.5rem' }}>
          <h3 style={{ color: 'white', fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            ⚙️ Abo verwalten
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            Rechnungen herunterladen, Zahlungsmethode ändern oder Abo kündigen – alles im Stripe Billing-Portal.
          </p>
          <button
            onClick={handlePortal}
            disabled={portalLoading}
            style={{
              background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.8)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
              padding: '0.7rem 1.5rem', fontSize: '0.9rem', fontWeight: 600,
              cursor: portalLoading ? 'wait' : 'pointer',
              opacity: portalLoading ? 0.6 : 1,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { if (!portalLoading) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)'; }}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)'}
          >
            {portalLoading ? 'Öffne Portal…' : '↗ Billing-Portal öffnen'}
          </button>
        </div>
      )}

      {/* Enterprise teaser */}
      <div style={{ background: 'linear-gradient(135deg, rgba(180,83,9,0.1), rgba(245,158,11,0.06))', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 16, padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'white', marginBottom: '0.25rem' }}>🏢 Enterprise Plan</div>
            <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.55 }}>
              Unbegrenzte Keys & Requests, 90 Tage Analytics, dedizierter Support, SLA und White-Label-Option.
            </div>
          </div>
          <a
            href="mailto:enterprise@ratelimit-api.com?subject=Enterprise%20Plan%20Anfrage"
            style={{
              background: 'linear-gradient(135deg,#b45309,#f59e0b)', color: 'white',
              textDecoration: 'none', borderRadius: 9, padding: '0.625rem 1.25rem',
              fontSize: '0.85rem', fontWeight: 700, flexShrink: 0,
              boxShadow: '0 4px 16px -4px rgba(245,158,11,0.4)',
            }}
          >
            Kontakt aufnehmen →
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Profile Modal (unchanged from before, kept intact) ────────────────────────

function ProfileModal({ user, onClose, onLogout, onUserUpdate }: {
  user: any; onClose: () => void; onLogout: () => void; onUserUpdate: (u: any) => void;
}) {
  const [tab, setTab] = useState<'profile' | 'security' | 'danger'>('profile');
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  const initials = user?.name
    ? user.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })
    : '—';

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8787';
  const token = localStorage.getItem('token');

  const saveName = async () => {
    if (!name.trim() || name === user?.name) return;
    setSaving(true); setSaveMsg(null);
    try {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (res.ok) {
        const d = await res.json();
        onUserUpdate({ ...user, name: name.trim(), ...d.user });
        setSaveMsg({ ok: true, text: 'Name erfolgreich gespeichert.' });
      } else {
        setSaveMsg({ ok: false, text: 'Fehler beim Speichern.' });
      }
    } catch { setSaveMsg({ ok: false, text: 'Netzwerkfehler.' }); }
    setSaving(false);
  };

  const changePassword = async () => {
    if (!currentPw || !newPw || newPw !== confirmPw) {
      setPwMsg({ ok: false, text: newPw !== confirmPw ? 'Passwörter stimmen nicht überein.' : 'Alle Felder ausfüllen.' });
      return;
    }
    if (newPw.length < 8) { setPwMsg({ ok: false, text: 'Passwort muss mindestens 8 Zeichen haben.' }); return; }
    setPwSaving(true); setPwMsg(null);
    try {
      const res = await fetch(`${API_BASE}/auth/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      if (res.ok) {
        setPwMsg({ ok: true, text: 'Passwort erfolgreich geändert.' });
        setCurrentPw(''); setNewPw(''); setConfirmPw('');
      } else {
        const d = await res.json();
        setPwMsg({ ok: false, text: d.error || 'Fehler beim Ändern des Passworts.' });
      }
    } catch { setPwMsg({ ok: false, text: 'Netzwerkfehler.' }); }
    setPwSaving(false);
  };

  const deleteAccount = async () => {
    if (deleteConfirm !== 'LÖSCHEN') return;
    setDeleting(true);
    try {
      await fetch(`${API_BASE}/auth/account`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      onLogout();
    } catch { setDeleting(false); }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.625rem 0.75rem',
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8, color: 'white', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.72rem', fontWeight: 700,
    color: 'rgba(255,255,255,0.35)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.4rem',
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', animation: 'fadeIn .15s ease' }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        zIndex: 101, width: 480, maxWidth: 'calc(100vw - 2rem)', maxHeight: 'calc(100vh - 4rem)',
        background: '#0c1525', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        animation: 'slideUp .2s cubic-bezier(0.16,1,0.3,1)',
      }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'white', margin: 0 }}>Konto-Einstellungen</h2>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 6, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: '1rem' }}>×</button>
        </div>

        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>{initials}</div>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'white', marginBottom: 2 }}>{user?.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)' }}>{user?.email}</div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)', marginTop: 3 }}>Mitglied seit {memberSince}</div>
          </div>
          <button onClick={onLogout} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.875rem', borderRadius: 7, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, flexShrink: 0 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Abmelden
          </button>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          {(['profile','security','danger'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: tab === t ? 600 : 400, color: tab === t ? '#60a5fa' : 'rgba(255,255,255,0.35)', borderBottom: `2px solid ${tab === t ? '#3b82f6' : 'transparent'}`, marginBottom: -1, transition: 'all .15s' }}>
              {t === 'profile' ? 'Profil' : t === 'security' ? 'Sicherheit' : 'Account'}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {tab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div><label style={labelStyle}>Anzeigename</label><input value={name} onChange={e => setName(e.target.value)} style={inputStyle} onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(59,130,246,0.5)'} onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.1)'} /></div>
              <div><label style={labelStyle}>E-Mail-Adresse</label><input value={user?.email || ''} disabled style={{ ...inputStyle, opacity: 0.4, cursor: 'not-allowed' }} /></div>
              <div><label style={labelStyle}>Account-ID</label><input value={`#${user?.id || '—'}`} disabled style={{ ...inputStyle, opacity: 0.4, cursor: 'not-allowed', fontFamily: 'monospace' }} /></div>
              {saveMsg && <div style={{ padding: '0.625rem 0.75rem', borderRadius: 7, background: saveMsg.ok ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${saveMsg.ok ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`, color: saveMsg.ok ? '#34d399' : '#f87171', fontSize: '0.82rem' }}>{saveMsg.text}</div>}
              <button onClick={saveName} disabled={saving || !name.trim() || name === user?.name} style={{ padding: '0.6rem 1.25rem', borderRadius: 8, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: 'white', border: 'none', fontWeight: 600, fontSize: '0.875rem', cursor: saving ? 'wait' : 'pointer', opacity: (!name.trim() || name === user?.name) ? 0.4 : 1, alignSelf: 'flex-start' }}>
                {saving ? 'Speichern…' : 'Änderungen speichern'}
              </button>
            </div>
          )}
          {tab === 'security' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div><label style={labelStyle}>Aktuelles Passwort</label><input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} style={inputStyle} placeholder="••••••••" onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(59,130,246,0.5)'} onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.1)'} /></div>
              <div><label style={labelStyle}>Neues Passwort</label><input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} style={inputStyle} placeholder="••••••••" onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(59,130,246,0.5)'} onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.1)'} /></div>
              <div><label style={labelStyle}>Neues Passwort wiederholen</label><input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} style={inputStyle} placeholder="••••••••" onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(59,130,246,0.5)'} onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.1)'} /></div>
              {pwMsg && <div style={{ padding: '0.625rem 0.75rem', borderRadius: 7, background: pwMsg.ok ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${pwMsg.ok ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`, color: pwMsg.ok ? '#34d399' : '#f87171', fontSize: '0.82rem' }}>{pwMsg.text}</div>}
              <button onClick={changePassword} disabled={pwSaving} style={{ padding: '0.6rem 1.25rem', borderRadius: 8, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: 'white', border: 'none', fontWeight: 600, fontSize: '0.875rem', cursor: pwSaving ? 'wait' : 'pointer', alignSelf: 'flex-start' }}>
                {pwSaving ? 'Ändern…' : 'Passwort ändern'}
              </button>
            </div>
          )}
          {tab === 'danger' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 10 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f87171', marginBottom: '0.5rem' }}>⚠️ Account löschen</div>
                <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.65, marginBottom: '1rem' }}>Dieser Vorgang ist <strong style={{ color: '#fbbf24' }}>unumkehrbar</strong>. Alle Daten werden dauerhaft gelöscht.</div>
                <div><label style={{ ...labelStyle, color: '#f87171' }}>Zur Bestätigung "LÖSCHEN" eingeben</label><input value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} placeholder="LÖSCHEN" style={{ ...inputStyle, borderColor: deleteConfirm === 'LÖSCHEN' ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)' }} /></div>
                <button onClick={deleteAccount} disabled={deleteConfirm !== 'LÖSCHEN' || deleting} style={{ marginTop: '0.875rem', padding: '0.55rem 1.25rem', borderRadius: 8, background: deleteConfirm === 'LÖSCHEN' ? '#dc2626' : 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: deleteConfirm === 'LÖSCHEN' ? 'white' : '#f87171', fontWeight: 700, fontSize: '0.85rem', cursor: deleteConfirm === 'LÖSCHEN' && !deleting ? 'pointer' : 'not-allowed', opacity: deleteConfirm === 'LÖSCHEN' ? 1 : 0.5 }}>
                  {deleting ? 'Wird gelöscht…' : 'Account permanent löschen'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translate(-50%,-48%) } to { opacity: 1; transform: translate(-50%,-50%) } }
      `}</style>
    </>
  );
}
