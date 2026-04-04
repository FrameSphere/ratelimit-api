import { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import { PLANS, type PlanId, canUseProFeature } from '../lib/plans';
import { ApiKeyManager } from './ApiKeyManager';
import { ConfigManager } from './ConfigManager';
import { Analytics } from './Analytics';
import { AlertsTab } from './AlertsTab';
import { SandboxTab } from './SandboxTab';
import { SupportTab } from './SupportTab';

interface DashboardProps {
  onLogout: () => void;
}

type TabId = 'keys' | 'configs' | 'analytics' | 'alerts' | 'sandbox' | 'billing' | 'support';

const NAV_ITEMS: { id: TabId; label: string; icon: React.ReactNode; proTag?: boolean }[] = [
  {
    id: 'keys',
    label: 'API Keys',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
      </svg>
    ),
  },
  {
    id: 'configs',
    label: 'Konfiguration',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.07 4.93A10 10 0 0 0 5.46 5.46M4.93 19.07A10 10 0 0 0 18.54 18.54M15.5 2.1A10 10 0 0 0 2.1 15.5M8.5 21.9A10 10 0 0 0 21.9 8.5"/>
      </svg>
    ),
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
  {
    id: 'alerts',
    label: 'Alerts',
    proTag: true,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    ),
  },
  {
    id: 'sandbox',
    label: 'Sandbox',
    proTag: true,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="5 3 19 12 5 21 5 3"/>
      </svg>
    ),
  },
  {
    id: 'billing',
    label: 'Billing',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
  },
  {
    id: 'support',
    label: 'Support',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
];

// ── Dashboard component ────────────────────────────────────────────────────────

export function Dashboard({ onLogout }: DashboardProps) {
  const [user, setUser] = useState<any>(null);
  const [userPlan, setUserPlan] = useState<PlanId>('free');
  const [allApiKeys, setAllApiKeys] = useState<any[]>([]);
  const [selectedApiKey, setSelectedApiKey] = useState<number | null>(() => {
    const s = localStorage.getItem('selectedApiKey');
    return s ? parseInt(s) : null;
  });
  const [selectedApiKeyName, setSelectedApiKeyName] = useState('');
  const [activeTab, setActiveTab] = useState<TabId>('keys');
  const [profileOpen, setProfileOpen] = useState(false);
  const [keySwitcherOpen, setKeySwitcherOpen] = useState(false);
  const keySwitcherRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadProfile();
    loadAllKeys();
  }, []);

  useEffect(() => {
    if (selectedApiKey) {
      localStorage.setItem('selectedApiKey', selectedApiKey.toString());
      const k = allApiKeys.find((k: any) => k.id === selectedApiKey);
      if (k) setSelectedApiKeyName(k.key_name);
    } else {
      localStorage.removeItem('selectedApiKey');
      setSelectedApiKeyName('');
    }
  }, [selectedApiKey, allApiKeys]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (keySwitcherRef.current && !keySwitcherRef.current.contains(e.target as Node)) {
        setKeySwitcherOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const loadAllKeys = async () => {
    const { data } = await api.getApiKeys();
    if (data?.apiKeys) setAllApiKeys(data.apiKeys);
  };

  const loadProfile = async () => {
    const { data } = await api.getProfile();
    if (data?.user) {
      setUser(data.user);
      setUserPlan((data.user.plan as PlanId) || 'free');
    }
  };

  const handleSelectApiKey = (id: number, tab?: 'configs' | 'analytics') => {
    setSelectedApiKey(id);
    setActiveTab(tab ?? 'configs');
  };

  const isPro = userPlan === 'pro' || userPlan === 'enterprise';
  const plan = PLANS[userPlan] || PLANS['free'];
  const selectedKey = allApiKeys.find(k => k.id === selectedApiKey);
  const isKeyActive = selectedKey?.is_active === 1 || selectedKey?.is_active === true;
  const initials = user?.name
    ? user.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const PAGE_META: Record<TabId, { title: string; desc: string }> = {
    keys:      { title: 'API Keys',            desc: 'Verwalte, konfiguriere und pausiere deine Keys.' },
    configs:   { title: 'Konfiguration',       desc: selectedApiKeyName ? `Rate Limits & Filter für „${selectedApiKeyName}"` : 'Wähle einen API Key um loszulegen.' },
    analytics: { title: 'Analytics',           desc: selectedApiKeyName ? `Traffic & Blockierungen für „${selectedApiKeyName}"` : 'Wähle einen API Key um Daten zu sehen.' },
    alerts:    { title: 'Alerts & Webhooks',   desc: selectedApiKeyName ? `Benachrichtigungen für „${selectedApiKeyName}"` : 'Wähle einen Key und richte Webhook-Alerts ein.' },
    sandbox:   { title: 'Test-Modus / Sandbox', desc: 'Simuliere Requests gegen deine Rate Limit Konfiguration.' },
    billing:   { title: 'Billing',             desc: 'Dein Abo, Plan-Details und Rechnungen.' },
    support:   { title: 'Support',             desc: 'Tickets und Team-Kommunikation.' },
  };

  const showKeySwitcher = activeTab === 'configs' || activeTab === 'analytics' || activeTab === 'alerts';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#080d1a', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Animated background ── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 65%)', filter: 'blur(80px)', animation: 'bgPulse1 12s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '45%', height: '45%', background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 65%)', filter: 'blur(80px)', animation: 'bgPulse2 15s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', top: '40%', right: '20%', width: '20%', height: '20%', background: 'radial-gradient(circle, rgba(16,185,129,0.04) 0%, transparent 70%)', filter: 'blur(60px)', animation: 'bgPulse3 18s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '48px 48px', maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)' }} />
      </div>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 244, flexShrink: 0,
        background: 'rgba(8,13,26,0.98)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh', zIndex: 20,
      }}>
        {/* Logo */}
        <div style={{ padding: '1.25rem 1.125rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 16px -4px rgba(59,130,246,0.5)' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'white', letterSpacing: '-0.02em' }}>RateLimit API</span>
          </a>
        </div>

        {/* Plan badge */}
        <div style={{ padding: '0.6rem 1.125rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: isPro ? 'rgba(139,92,246,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${isPro ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 6, padding: '3px 9px' }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: isPro ? '#a78bfa' : 'rgba(255,255,255,0.25)' }} />
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: isPro ? '#c4b5fd' : 'rgba(255,255,255,0.35)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
              {plan.name} Plan
            </span>
          </div>
          {!isPro && (
            <a href="/pricing" style={{ display: 'block', marginTop: '0.35rem', fontSize: '0.68rem', color: '#8b5cf6', textDecoration: 'none', fontWeight: 600 }}>
              Auf Pro upgraden
            </a>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0.875rem 0.75rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
          <SideNavSection label="Verwaltung">
            {NAV_ITEMS.slice(0, 3).map(item => (
              <SideNavItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                isActive={activeTab === item.id}
                indicator={!!(item.id === 'configs' || item.id === 'analytics') && !!selectedApiKey}
                onClick={() => setActiveTab(item.id)}
              />
            ))}
          </SideNavSection>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.04)', margin: '0.4rem 0.5rem' }} />

          <SideNavSection label="Pro Features">
            {NAV_ITEMS.slice(3, 5).map(item => (
              <SideNavItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                isActive={activeTab === item.id}
                proTag={!isPro}
                onClick={() => setActiveTab(item.id)}
              />
            ))}
          </SideNavSection>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.04)', margin: '0.4rem 0.5rem' }} />

          <SideNavSection label="Konto">
            {NAV_ITEMS.slice(5).map(item => (
              <SideNavItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                isActive={activeTab === item.id}
                onClick={() => setActiveTab(item.id)}
              />
            ))}
          </SideNavSection>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.04)', margin: '0.4rem 0.5rem' }} />

          <SideNavSection label="Ressourcen">
            {[
              { href: '/docs', label: 'Dokumentation', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> },
              { href: '/changelog', label: 'Changelog', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
            ].map(({ href, label, icon }) => (
              <a key={href} href={href} style={{ textDecoration: 'none', display: 'block' }}>
                <SideNavItem icon={icon} label={label} isActive={false} onClick={() => {}} />
              </a>
            ))}
          </SideNavSection>
        </nav>

        {/* Active key pill */}
        {selectedApiKey && (
          <div style={{ margin: '0 0.75rem 0.5rem', padding: '0.575rem 0.75rem', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.14)', borderRadius: 8 }}>
            <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.22)', marginBottom: 3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Aktiver Key</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: isKeyActive ? '#34d399' : '#fbbf24', flexShrink: 0 }} />
              <div style={{ fontSize: '0.77rem', color: '#60a5fa', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
                {selectedApiKeyName || `Key #${selectedApiKey}`}
              </div>
            </div>
            <button
              onClick={() => { setSelectedApiKey(null); setActiveTab('keys'); }}
              style={{ marginTop: 3, fontSize: '0.63rem', color: 'rgba(255,255,255,0.2)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
            >
              Key wechseln
            </button>
          </div>
        )}

        {/* User row */}
        <button
          onClick={() => setProfileOpen(true)}
          style={{ padding: '0.75rem 1.125rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '0.625rem', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'background .15s' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.025)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}
        >
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || '…'}</div>
            <div style={{ fontSize: '0.67rem', color: 'rgba(255,255,255,0.25)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email || ''}</div>
          </div>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93A10 10 0 0 0 5.46 5.46"/>
          </svg>
        </button>
      </aside>

      {/* ── Main content ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative', zIndex: 1 }}>

        {/* Pro upgrade banner */}
        {!isPro && (
          <div style={{ background: 'linear-gradient(135deg,rgba(109,40,217,0.16),rgba(139,92,246,0.09))', borderBottom: '1px solid rgba(139,92,246,0.18)', padding: '0.5rem 1.75rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <span style={{ flex: 1, fontSize: '0.79rem', color: 'rgba(255,255,255,0.58)', minWidth: 200 }}>
              <strong style={{ color: 'white' }}>Free Plan</strong> — Upgrade auf Pro für 25 Keys, 500K Req/Mo, Webhook-Alerts, Sandbox & mehr
            </span>
            <a href="/pricing" style={{ background: 'linear-gradient(135deg,#7c3aed,#8b5cf6)', color: 'white', textDecoration: 'none', padding: '0.3rem 0.875rem', borderRadius: 6, fontSize: '0.78rem', fontWeight: 700, flexShrink: 0, boxShadow: '0 4px 14px -4px rgba(139,92,246,0.5)', whiteSpace: 'nowrap' }}>
              Pro – €4,99/Mo
            </a>
          </div>
        )}

        {/* Topbar */}
        <header style={{ height: 56, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', padding: '0 1.75rem', gap: '1rem', background: 'rgba(8,13,26,0.92)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 10, flexShrink: 0 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: '0.975rem', fontWeight: 700, color: 'white', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 2 }}>
              {PAGE_META[activeTab].title}
            </h1>
            <p style={{ fontSize: '0.69rem', color: 'rgba(255,255,255,0.27)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {PAGE_META[activeTab].desc}
            </p>
          </div>

          {/* Key switcher dropdown */}
          {showKeySwitcher && (
            <div ref={keySwitcherRef} style={{ position: 'relative', flexShrink: 0 }}>
              <button
                onClick={() => setKeySwitcherOpen(!keySwitcherOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.38rem 0.875rem', borderRadius: 8, background: selectedApiKey ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.05)', border: `1px solid ${selectedApiKey ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.1)'}`, color: selectedApiKey ? '#60a5fa' : 'rgba(255,255,255,0.45)', cursor: 'pointer', fontSize: '0.77rem', fontWeight: 600, transition: 'all 0.2s' }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
                <span style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {selectedApiKeyName || 'Key wählen…'}
                </span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: keySwitcherOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}><polyline points="6 9 12 15 18 9"/></svg>
              </button>

              {keySwitcherOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 7px)', right: 0, background: '#0c1525', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, minWidth: 210, padding: '0.35rem', boxShadow: '0 16px 48px rgba(0,0,0,0.55)', zIndex: 50, animation: 'dropDown 0.18s cubic-bezier(0.16,1,0.3,1)' }}>
                  {allApiKeys.length === 0 ? (
                    <div style={{ padding: '0.75rem', fontSize: '0.77rem', color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>Keine Keys vorhanden</div>
                  ) : allApiKeys.map(k => {
                    const active = k.is_active === 1 || k.is_active === true;
                    return (
                      <button key={k.id} onClick={() => { setSelectedApiKey(k.id); setKeySwitcherOpen(false); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.5rem 0.7rem', borderRadius: 7, background: selectedApiKey === k.id ? 'rgba(59,130,246,0.12)' : 'none', border: 'none', cursor: 'pointer', transition: 'background 0.15s' }}
                        onMouseEnter={e => { if (selectedApiKey !== k.id) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                        onMouseLeave={e => { if (selectedApiKey !== k.id) (e.currentTarget as HTMLElement).style.background = 'none'; }}
                      >
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: active ? '#34d399' : '#fbbf24', flexShrink: 0 }} />
                        <span style={{ flex: 1, fontSize: '0.79rem', color: selectedApiKey === k.id ? '#60a5fa' : 'rgba(255,255,255,0.75)', fontWeight: selectedApiKey === k.id ? 700 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' }}>
                          {k.key_name}
                        </span>
                        {selectedApiKey === k.id && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                      </button>
                    );
                  })}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '0.25rem', paddingTop: '0.25rem' }}>
                    <button onClick={() => { setActiveTab('keys'); setKeySwitcherOpen(false); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', width: '100%', padding: '0.45rem 0.7rem', borderRadius: 7, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.73rem', color: 'rgba(255,255,255,0.28)', fontWeight: 600 }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      Keys verwalten
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </header>

        {/* ── Page content ── */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '1.625rem 1.75rem' }}>

          {activeTab === 'keys' && (
            <ApiKeyManager
              onSelectApiKey={handleSelectApiKey}
              selectedApiKeyId={selectedApiKey}
            />
          )}

          {activeTab === 'configs' && (
            selectedApiKey
              ? <ConfigManager apiKeyId={selectedApiKey} apiKeyName={selectedApiKeyName} allApiKeys={allApiKeys} onKeyChange={id => setSelectedApiKey(id)} />
              : <NoKeyPlaceholder onGoToKeys={() => setActiveTab('keys')} label="Konfiguration" />
          )}

          {activeTab === 'analytics' && (
            selectedApiKey
              ? <Analytics apiKeyId={selectedApiKey} apiKeyName={selectedApiKeyName} />
              : <NoKeyPlaceholder onGoToKeys={() => setActiveTab('keys')} label="Analytics" />
          )}

          {activeTab === 'alerts' && (
            <AlertsTab
              apiKeyId={selectedApiKey}
              apiKeyName={selectedApiKeyName}
              isPro={isPro}
              onUpgrade={() => window.location.href = '/pricing'}
            />
          )}

          {activeTab === 'sandbox' && (
            <SandboxTab
              apiKeyId={selectedApiKey}
              apiKeyName={selectedApiKeyName}
              isPro={isPro}
              onUpgrade={() => window.location.href = '/pricing'}
            />
          )}

          {activeTab === 'billing' && (
            <BillingTab user={user} userPlan={userPlan} onPlanRefresh={loadProfile} />
          )}

          {activeTab === 'support' && (
            <SupportTab user={user} />
          )}
        </main>
      </div>

      {/* Profile modal */}
      {profileOpen && (
        <ProfileModal
          user={user}
          onClose={() => setProfileOpen(false)}
          onLogout={onLogout}
          onUserUpdate={updated => setUser(updated)}
        />
      )}

      <style>{`
        @keyframes bgPulse1 { 0%,100%{transform:scale(1) translate(0,0)} 50%{transform:scale(1.08) translate(2%,1%)} }
        @keyframes bgPulse2 { 0%,100%{transform:scale(1) translate(0,0)} 50%{transform:scale(1.06) translate(-1%,2%)} }
        @keyframes bgPulse3 { 0%,100%{transform:scale(1) translate(0,0)} 50%{transform:scale(1.12) translate(3%,-2%)} }
        @keyframes dropDown  { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
        @keyframes slideUp   { from{opacity:0;transform:translate(-50%,-48%)} to{opacity:1;transform:translate(-50%,-50%)} }
        :root {
          --bg: #080d1a; --bg2: #0e1624; --bg3: #172033;
          --border: rgba(255,255,255,0.08);
          --text: #f1f5f9; --text2: #94a3b8;
          --blue: #3b82f6; --purple: #8b5cf6;
          --green: #10b981; --red: #ef4444; --yellow: #f59e0b;
        }
        /* Legacy class selectors used by SupportTab etc. */
        .card { background: rgba(14,22,36,0.85) !important; border: 1px solid rgba(255,255,255,0.07) !important; border-radius: 12px !important; box-shadow: 0 2px 20px rgba(0,0,0,0.25) !important; }
        .card-header { border-bottom: 1px solid rgba(255,255,255,0.06) !important; padding: 1.125rem 1.375rem !important; display: flex !important; justify-content: space-between !important; align-items: center !important; }
        .card-title  { font-size: 0.975rem !important; color: white !important; font-weight: 700 !important; }
        .btn         { padding: 0.45rem 0.875rem; border-radius: 7px; font-size: 0.82rem; font-weight: 600; cursor: pointer; border: none; transition: all .15s; }
        .btn-sm      { padding: 0.33rem 0.65rem !important; font-size: 0.77rem !important; }
        .btn-primary { background: linear-gradient(135deg,#3b82f6,#6366f1) !important; color: white !important; border: none !important; }
        .btn-primary:hover { opacity:.87 !important; }
        .btn-secondary { background: rgba(255,255,255,0.05) !important; border: 1px solid rgba(255,255,255,0.09) !important; color: rgba(255,255,255,0.6) !important; }
        .btn-secondary:hover { background: rgba(255,255,255,0.09) !important; color: white !important; }
        .btn-danger  { background: rgba(239,68,68,0.09) !important; border: 1px solid rgba(239,68,68,0.22) !important; color: #f87171 !important; }
        .btn-danger:hover { background: rgba(239,68,68,0.18) !important; }
        .btn-success { background: rgba(16,185,129,0.1) !important; border: 1px solid rgba(16,185,129,0.22) !important; color: #34d399 !important; }
        .table th { background: rgba(255,255,255,0.02) !important; color: rgba(255,255,255,0.28) !important; font-size: 0.68rem !important; text-transform: uppercase !important; letter-spacing: .07em !important; font-weight: 700 !important; padding: 0.6rem 1rem !important; }
        .table td { padding: 0.72rem 1rem !important; border-bottom: 1px solid rgba(255,255,255,0.04) !important; color: rgba(255,255,255,0.7) !important; font-size: 0.84rem !important; }
        .table tr:hover td { background: rgba(255,255,255,0.012) !important; }
        .form-input, .form-select { background: rgba(255,255,255,0.04) !important; border: 1px solid rgba(255,255,255,0.1) !important; color: white !important; border-radius: 8px !important; padding: 0.55rem 0.75rem; font-size: 0.875rem; }
        .form-input:focus, .form-select:focus { border-color: rgba(59,130,246,0.4) !important; outline: none !important; }
        .form-label  { color: rgba(255,255,255,0.4) !important; font-size: 0.72rem !important; font-weight: 700 !important; text-transform: uppercase; letter-spacing: .05em; display: block; margin-bottom: .375rem; }
        .form-group  { margin-bottom: 1rem; }
        .alert-success { background: rgba(16,185,129,0.07) !important; border: 1px solid rgba(16,185,129,0.18) !important; color: #6ee7b7 !important; border-radius: 10px !important; padding: 1rem !important; }
        .alert-error   { background: rgba(239,68,68,0.07) !important; border: 1px solid rgba(239,68,68,0.18) !important; border-radius: 10px !important; padding: 1rem !important; }
        .badge { border-radius: 5px !important; font-size: .72rem !important; padding: 2px 8px !important; font-weight: 700 !important; }
        .badge-success { background: rgba(16,185,129,0.12) !important; color: #34d399 !important; border: 1px solid rgba(16,185,129,0.18) !important; }
        .badge-danger  { background: rgba(239,68,68,0.1)  !important; color: #f87171 !important; border: 1px solid rgba(239,68,68,0.18) !important; }
        .badge-warning { background: rgba(245,158,11,0.1) !important; color: #fbbf24 !important; border: 1px solid rgba(245,158,11,0.18) !important; }
        .loading { color: rgba(255,255,255,0.3); font-size: .85rem; padding: 2rem; text-align: center; }
        .grid-3  { display: grid; grid-template-columns: repeat(3,1fr); gap: 1rem; }
        .stat-card   { background: rgba(14,22,36,0.85) !important; border: 1px solid rgba(255,255,255,0.07) !important; border-radius: 12px !important; padding: 1.125rem 1.25rem !important; }
        .stat-value  { font-size: 1.6rem !important; font-weight: 800 !important; color: #60a5fa !important; letter-spacing: -.03em !important; line-height: 1 !important; margin-bottom: .3rem !important; }
        .stat-label  { font-size: .72rem !important; color: rgba(255,255,255,0.3) !important; font-weight: 700 !important; text-transform: uppercase !important; letter-spacing: .07em !important; }
        ::-webkit-scrollbar { width:5px; height:5px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.08); border-radius:3px; }
        select option { background:#0c1525; color:white; }
      `}</style>
    </div>
  );
}

// ── Sidebar helpers ───────────────────────────────────────────────────────────

function SideNavSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '0.15rem' }}>
      <div style={{ fontSize: '0.62rem', fontWeight: 700, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 0.5rem', marginBottom: '0.275rem' }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function SideNavItem({ icon, label, isActive, indicator, proTag, onClick }: {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  indicator?: boolean;
  proTag?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.55rem',
        padding: '0.485rem 0.625rem', borderRadius: 7, border: 'none',
        cursor: 'pointer', fontWeight: isActive ? 600 : 400, fontSize: '0.835rem',
        width: '100%', textAlign: 'left', transition: 'all .12s',
        color: isActive ? 'white' : 'rgba(255,255,255,0.5)',
        background: isActive ? 'linear-gradient(135deg,rgba(59,130,246,0.16),rgba(139,92,246,0.1))' : 'transparent',
        boxShadow: isActive ? 'inset 0 0 0 1px rgba(59,130,246,0.18)' : 'none',
      }}
      onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.75)'; } }}
      onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)'; } }}
    >
      <span style={{ color: isActive ? '#60a5fa' : 'inherit', flexShrink: 0, display: 'flex' }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {proTag && (
        <span style={{ fontSize: '0.58rem', fontWeight: 800, color: '#a78bfa', background: 'rgba(139,92,246,0.14)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 4, padding: '1px 5px', letterSpacing: '0.04em', flexShrink: 0 }}>
          PRO
        </span>
      )}
      {indicator && !proTag && (
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#3b82f6', flexShrink: 0 }} />
      )}
    </button>
  );
}

function NoKeyPlaceholder({ onGoToKeys, label }: { onGoToKeys: () => void; label: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, textAlign: 'center', gap: '1.125rem' }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
        </svg>
      </div>
      <div>
        <h3 style={{ color: 'white', fontWeight: 700, fontSize: '0.975rem', marginBottom: '0.375rem' }}>Kein API Key ausgewählt</h3>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.83rem', maxWidth: 280, margin: '0 auto', lineHeight: 1.6 }}>
          Wähle einen API Key um {label} zu sehen. Nutze den Key-Switcher oben rechts oder gehe zu API Keys.
        </p>
      </div>
      <button onClick={onGoToKeys} style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: 'white', border: 'none', borderRadius: 8, padding: '0.575rem 1.5rem', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px -4px rgba(59,130,246,0.4)' }}>
        API Keys öffnen
      </button>
    </div>
  );
}

// ── Billing Tab ───────────────────────────────────────────────────────────────

function BillingTab({ user, userPlan, onPlanRefresh }: { user: any; userPlan: PlanId; onPlanRefresh: () => void }) {
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const plan = PLANS[userPlan] || PLANS['free'];
  const isPro = userPlan === 'pro' || userPlan === 'enterprise';

  const handleUpgrade = async () => {
    setCheckoutLoading(true);
    const { data, error } = await api.createCheckoutSession();
    if (data?.url) window.location.href = data.url;
    else { alert(error || 'Fehler beim Checkout'); setCheckoutLoading(false); }
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    const { data, error } = await api.createPortalSession();
    if (data?.url) window.location.href = data.url;
    else { alert(error || 'Portal konnte nicht geöffnet werden'); setPortalLoading(false); }
  };

  const limitRows = [
    ['API Keys',    plan.limits.apiKeys === null ? '∞' : String(plan.limits.apiKeys)],
    ['Req/Monat',   plan.limits.requestsPerMonth === null ? '∞' : `${(plan.limits.requestsPerMonth / 1000).toFixed(0)}K`],
    ['Analytics',  plan.limits.analyticsHistory],
    ['Alerts/Key',  plan.limits.alertsPerKey === null ? '∞' : plan.limits.alertsPerKey === 0 ? '—' : String(plan.limits.alertsPerKey)],
  ] as [string, string][];

  return (
    <div style={{ maxWidth: 720 }}>
      {/* Current plan card */}
      <div style={{ background: isPro ? 'linear-gradient(135deg,rgba(109,40,217,0.14),rgba(139,92,246,0.07))' : 'rgba(14,22,36,0.85)', border: isPro ? '2px solid rgba(139,92,246,0.35)' : '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '1.5rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.45rem' }}>Dein aktueller Plan</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '1.45rem', fontWeight: 800, color: 'white' }}>{plan.name}</span>
              <span style={{ padding: '2px 9px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700, background: isPro ? 'rgba(139,92,246,0.18)' : 'rgba(255,255,255,0.05)', color: isPro ? '#c4b5fd' : 'rgba(255,255,255,0.32)', border: `1px solid ${isPro ? 'rgba(139,92,246,0.28)' : 'rgba(255,255,255,0.07)'}` }}>
                {isPro ? '✓ Aktiv' : 'Kostenlos'}
              </span>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.38)' }}>{plan.billingNote}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white', letterSpacing: '-0.04em' }}>{plan.priceLabel}</div>
            {(plan.price ?? 0) > 0 && <div style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.27)' }}>/Monat</div>}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(110px,1fr))', gap: '0.575rem', marginTop: '1rem' }}>
          {limitRows.map(([lbl, val]) => (
            <div key={lbl} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '0.55rem 0.7rem' }}>
              <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.23)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>{lbl}</div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: isPro ? '#c4b5fd' : 'white', marginTop: 2 }}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pro features preview for free users */}
      {!isPro && (
        <div style={{ background: 'rgba(14,22,36,0.85)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '1.5rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.125rem', flexWrap: 'wrap' }}>
            <div>
              <h3 style={{ color: 'white', fontSize: '0.975rem', fontWeight: 700, marginBottom: '0.3rem' }}>Auf Pro upgraden</h3>
              <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.83rem', lineHeight: 1.6 }}>
                Alles was du für professionelles API-Rate-Limiting brauchst — für nur <strong style={{ color: 'white' }}>€4,99/Monat</strong>.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
              <button onClick={handleUpgrade} disabled={checkoutLoading} style={{ background: 'linear-gradient(135deg,#7c3aed,#8b5cf6)', color: 'white', border: 'none', borderRadius: 9, padding: '0.6rem 1.5rem', fontSize: '0.875rem', fontWeight: 700, cursor: checkoutLoading ? 'wait' : 'pointer', boxShadow: '0 6px 24px -6px rgba(139,92,246,0.5)', opacity: checkoutLoading ? 0.7 : 1, transition: 'transform 0.15s', whiteSpace: 'nowrap' }}
                onMouseEnter={e => { if (!checkoutLoading) (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'none'}
              >
                {checkoutLoading ? 'Weiterleitung…' : 'Jetzt upgraden – €4,99/Mo'}
              </button>
              <a href="/pricing" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.55)', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9, padding: '0.6rem 1.125rem', fontSize: '0.84rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                Pläne vergleichen
              </a>
            </div>
          </div>
          {/* Pro feature grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: '0.5rem' }}>
            {[
              { icon: '⚡', label: '25 API Keys', desc: 'statt 3 im Free Plan' },
              { icon: '📊', label: '30 Tage Analytics', desc: 'statt nur 24 Stunden' },
              { icon: '🔔', label: 'Webhook-Alerts', desc: 'Slack, Discord, Custom' },
              { icon: '🧪', label: 'Test-Sandbox', desc: 'Limits ohne Risiko testen' },
              { icon: '📄', label: 'CSV Log-Export', desc: 'Für Compliance & Analyse' },
              { icon: '♾️', label: 'Unbegrenzte Filter', desc: 'IP, User-Agent & mehr' },
            ].map(f => (
              <div key={f.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.625rem 0.75rem', background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.1)', borderRadius: 8 }}>
                <span style={{ fontSize: '0.95rem', flexShrink: 0 }}>{f.icon}</span>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.75)', marginBottom: 1 }}>{f.label}</div>
                  <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)' }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Portal for pro users */}
      {isPro && (
        <div style={{ background: 'rgba(14,22,36,0.85)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '1.5rem', marginBottom: '1.25rem' }}>
          <h3 style={{ color: 'white', fontSize: '0.975rem', fontWeight: 700, marginBottom: '0.35rem' }}>Abo verwalten</h3>
          <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.83rem', lineHeight: 1.6, marginBottom: '1rem' }}>Rechnungen, Zahlungsmethode und Kündigung im Stripe Billing-Portal.</p>
          <button onClick={handlePortal} disabled={portalLoading} style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.72)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9, padding: '0.6rem 1.375rem', fontSize: '0.875rem', fontWeight: 600, cursor: portalLoading ? 'wait' : 'pointer', opacity: portalLoading ? 0.6 : 1 }}>
            {portalLoading ? 'Öffne Portal…' : 'Billing-Portal öffnen'}
          </button>
        </div>
      )}

      {/* Enterprise teaser */}
      <div style={{ background: 'linear-gradient(135deg,rgba(180,83,9,0.09),rgba(245,158,11,0.05))', border: '1px solid rgba(245,158,11,0.18)', borderRadius: 16, padding: '1.25rem 1.375rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'white', marginBottom: '0.2rem' }}>Enterprise Plan</div>
            <div style={{ fontSize: '0.79rem', color: 'rgba(255,255,255,0.38)', lineHeight: 1.55 }}>Unbegrenzte Keys & Requests, 90 Tage Analytics, dedizierter Support, SLA, White-Label.</div>
          </div>
          <a href="mailto:enterprise@ratelimit-api.com?subject=Enterprise%20Plan" style={{ background: 'linear-gradient(135deg,#b45309,#f59e0b)', color: 'white', textDecoration: 'none', borderRadius: 8, padding: '0.55rem 1.125rem', fontSize: '0.82rem', fontWeight: 700, flexShrink: 0, boxShadow: '0 4px 14px -4px rgba(245,158,11,0.4)', whiteSpace: 'nowrap' }}>
            Kontakt aufnehmen
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Profile Modal ─────────────────────────────────────────────────────────────

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

  const initials = user?.name ? user.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2) : '?';
  const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' }) : '—';
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8787';
  const token = localStorage.getItem('token');

  const iStyle: React.CSSProperties = { width: '100%', padding: '0.575rem 0.72rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'white', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s' };
  const lStyle: React.CSSProperties = { display: 'block', fontSize: '0.69rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.35rem' };

  const saveName = async () => {
    if (!name.trim() || name === user?.name) return;
    setSaving(true); setSaveMsg(null);
    try {
      const res = await fetch(`${API_BASE}/auth/profile`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ name: name.trim() }) });
      if (res.ok) { const d = await res.json(); onUserUpdate({ ...user, name: name.trim(), ...d.user }); setSaveMsg({ ok: true, text: 'Name gespeichert.' }); }
      else setSaveMsg({ ok: false, text: 'Fehler beim Speichern.' });
    } catch { setSaveMsg({ ok: false, text: 'Netzwerkfehler.' }); }
    setSaving(false);
  };

  const changePw = async () => {
    if (!currentPw || !newPw || newPw !== confirmPw) { setPwMsg({ ok: false, text: newPw !== confirmPw ? 'Passwörter stimmen nicht überein.' : 'Alle Felder ausfüllen.' }); return; }
    if (newPw.length < 8) { setPwMsg({ ok: false, text: 'Min. 8 Zeichen erforderlich.' }); return; }
    setPwSaving(true); setPwMsg(null);
    try {
      const res = await fetch(`${API_BASE}/auth/password`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }) });
      if (res.ok) { setPwMsg({ ok: true, text: 'Passwort geändert.' }); setCurrentPw(''); setNewPw(''); setConfirmPw(''); }
      else { const d = await res.json(); setPwMsg({ ok: false, text: d.error || 'Fehler.' }); }
    } catch { setPwMsg({ ok: false, text: 'Netzwerkfehler.' }); }
    setPwSaving(false);
  };

  const deleteAccount = async () => {
    if (deleteConfirm !== 'LÖSCHEN') return;
    setDeleting(true);
    try { await fetch(`${API_BASE}/auth/account`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); onLogout(); }
    catch { setDeleting(false); }
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', animation: 'fadeIn .15s ease' }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 101, width: 476, maxWidth: 'calc(100vw - 2rem)', maxHeight: 'calc(100vh - 4rem)', background: '#0c1525', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 80px rgba(0,0,0,0.65)', animation: 'slideUp .2s cubic-bezier(0.16,1,0.3,1)' }}>
        {/* Header */}
        <div style={{ padding: '1.125rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <h2 style={{ fontSize: '0.975rem', fontWeight: 700, color: 'white', margin: 0 }}>Konto-Einstellungen</h2>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 6, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: '1rem' }}>×</button>
        </div>
        {/* User info */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '0.875rem', flexShrink: 0 }}>
          <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.925rem', fontWeight: 700, color: 'white', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
            <div style={{ fontSize: '0.77rem', color: 'rgba(255,255,255,0.32)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
            <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.18)', marginTop: 2 }}>Mitglied seit {memberSince}</div>
          </div>
          <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.35rem 0.75rem', borderRadius: 7, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.18)', color: '#f87171', cursor: 'pointer', fontSize: '0.74rem', fontWeight: 600, flexShrink: 0 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Abmelden
          </button>
        </div>
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          {(['profile', 'security', 'danger'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '0.65rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.79rem', fontWeight: tab === t ? 600 : 400, color: tab === t ? '#60a5fa' : 'rgba(255,255,255,0.32)', borderBottom: `2px solid ${tab === t ? '#3b82f6' : 'transparent'}`, marginBottom: -1, transition: 'all .15s' }}>
              {t === 'profile' ? 'Profil' : t === 'security' ? 'Sicherheit' : 'Account'}
            </button>
          ))}
        </div>
        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.375rem 1.5rem' }}>
          {tab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div><label style={lStyle}>Anzeigename</label><input value={name} onChange={e => setName(e.target.value)} style={iStyle} onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} /></div>
              <div><label style={lStyle}>E-Mail</label><input value={user?.email || ''} disabled style={{ ...iStyle, opacity: 0.35, cursor: 'not-allowed' }} /></div>
              <div><label style={lStyle}>Account-ID</label><input value={`#${user?.id || '—'}`} disabled style={{ ...iStyle, opacity: 0.35, cursor: 'not-allowed', fontFamily: 'monospace' }} /></div>
              {saveMsg && <div style={{ padding: '0.55rem 0.72rem', borderRadius: 7, background: saveMsg.ok ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${saveMsg.ok ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`, color: saveMsg.ok ? '#34d399' : '#f87171', fontSize: '0.79rem' }}>{saveMsg.text}</div>}
              <button onClick={saveName} disabled={saving || !name.trim() || name === user?.name} style={{ alignSelf: 'flex-start', padding: '0.55rem 1.25rem', borderRadius: 8, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: 'white', border: 'none', fontWeight: 600, fontSize: '0.875rem', cursor: saving ? 'wait' : 'pointer', opacity: (!name.trim() || name === user?.name) ? 0.4 : 1 }}>
                {saving ? 'Speichere…' : 'Änderungen speichern'}
              </button>
            </div>
          )}
          {tab === 'security' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {[['Aktuelles Passwort', currentPw, setCurrentPw], ['Neues Passwort', newPw, setNewPw], ['Passwort wiederholen', confirmPw, setConfirmPw]].map(([lbl, val, setter]: any) => (
                <div key={lbl}><label style={lStyle}>{lbl}</label><input type="password" value={val} onChange={e => setter(e.target.value)} style={iStyle} placeholder="••••••••" onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} /></div>
              ))}
              {pwMsg && <div style={{ padding: '0.55rem 0.72rem', borderRadius: 7, background: pwMsg.ok ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${pwMsg.ok ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`, color: pwMsg.ok ? '#34d399' : '#f87171', fontSize: '0.79rem' }}>{pwMsg.text}</div>}
              <button onClick={changePw} disabled={pwSaving} style={{ alignSelf: 'flex-start', padding: '0.55rem 1.25rem', borderRadius: 8, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: 'white', border: 'none', fontWeight: 600, fontSize: '0.875rem', cursor: pwSaving ? 'wait' : 'pointer' }}>
                {pwSaving ? 'Ändere…' : 'Passwort ändern'}
              </button>
            </div>
          )}
          {tab === 'danger' && (
            <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 10, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f87171' }}>Account löschen</div>
              <div style={{ fontSize: '0.79rem', color: 'rgba(255,255,255,0.38)', lineHeight: 1.65 }}>Dieser Vorgang ist <strong style={{ color: '#fbbf24' }}>unumkehrbar</strong>. Alle Daten werden dauerhaft gelöscht.</div>
              <div><label style={{ ...lStyle, color: '#f87171' }}>Zur Bestätigung „LÖSCHEN" eingeben</label><input value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} placeholder="LÖSCHEN" style={{ ...iStyle, borderColor: deleteConfirm === 'LÖSCHEN' ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)' }} /></div>
              <button onClick={deleteAccount} disabled={deleteConfirm !== 'LÖSCHEN' || deleting} style={{ alignSelf: 'flex-start', padding: '0.5rem 1.125rem', borderRadius: 8, background: deleteConfirm === 'LÖSCHEN' ? '#dc2626' : 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: deleteConfirm === 'LÖSCHEN' ? 'white' : '#f87171', fontWeight: 700, fontSize: '0.84rem', cursor: deleteConfirm === 'LÖSCHEN' && !deleting ? 'pointer' : 'not-allowed', opacity: deleteConfirm === 'LÖSCHEN' ? 1 : 0.45 }}>
                {deleting ? 'Wird gelöscht…' : 'Account permanent löschen'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
