import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

interface ApiKeyManagerProps {
  onSelectApiKey: (id: number, tab?: 'configs' | 'analytics') => void;
  selectedApiKeyId?: number | null;
}

interface KeyStats {
  total: number;
  blocked: number;
}

// ── Icon helpers ──────────────────────────────────────────────────────────────

const CopyIcon = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);

const CheckIcon = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const PauseIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
  </svg>
);

const PlayIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
);

const SettingsIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.07 4.93A10 10 0 0 0 5.46 5.46M4.93 19.07A10 10 0 0 0 18.54 18.54M15.5 2.1A10 10 0 0 0 2.1 15.5M8.5 21.9A10 10 0 0 0 21.9 8.5"/>
  </svg>
);

const BarChartIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

const KeyIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
  </svg>
);

const InfoIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
);

// ── Component ─────────────────────────────────────────────────────────────────

export function ApiKeyManager({ onSelectApiKey, selectedApiKeyId }: ApiKeyManagerProps) {
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState<{ name: string; key: string } | null>(null);
  const [copiedId, setCopiedId] = useState<number | 'new' | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [stats, setStats] = useState<Record<number, KeyStats>>({});

  const loadApiKeys = useCallback(async () => {
    const { data } = await api.getApiKeys();
    if (data?.apiKeys) {
      setApiKeys(data.apiKeys);
      data.apiKeys.forEach(async (k: any) => {
        const { data: aData } = await api.getAnalytics(k.id, '24h');
        const summary = (aData as any)?.summary;
        if (summary) {
          setStats(prev => ({
            ...prev,
            [k.id]: {
              total: summary.total_requests || 0,
              blocked: summary.blocked_requests || 0,
            },
          }));
        }
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadApiKeys(); }, [loadApiKeys]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) return;
    setCreating(true);
    const { data, error } = await api.createApiKey(keyName.trim());
    if (error) { alert(error); setCreating(false); return; }
    if (data?.apiKey) {
      const rawKey = data.apiKey.api_key || (data.apiKey as any).apiKey;
      setNewKey({ name: keyName.trim(), key: rawKey });
      setKeyName('');
      setShowCreate(false);
      await loadApiKeys();
    }
    setCreating(false);
  };

  const handleToggle = async (key: any) => {
    setTogglingId(key.id);
    const { error } = await api.toggleApiKey(key.id, !(key.is_active === 1 || key.is_active === true));
    if (error) alert(`Fehler: ${error}`);
    await loadApiKeys();
    setTogglingId(null);
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    await api.deleteApiKey(id);
    setConfirmDelete(null);
    await loadApiKeys();
    setDeletingId(null);
  };

  const handleCopy = async (text: string, id: number | 'new') => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>

      {/* ── New key reveal ── */}
      {newKey && (
        <div style={{ marginBottom: '1.5rem', borderRadius: 14, background: 'linear-gradient(135deg,rgba(16,185,129,0.1),rgba(5,150,105,0.06))', border: '1px solid rgba(16,185,129,0.25)', padding: '1.125rem 1.375rem', animation: 'slideDown 0.3s cubic-bezier(0.16,1,0.3,1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
                <CheckIcon size={11} />
              </div>
              <span style={{ color: '#34d399', fontWeight: 700, fontSize: '0.875rem' }}>Key erstellt: {newKey.name}</span>
            </div>
            <button onClick={() => setNewKey(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1 }}>×</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: '0.575rem 0.875rem', border: '1px solid rgba(255,255,255,0.08)' }}>
            <code style={{ flex: 1, fontSize: '0.8rem', color: '#6ee7b7', fontFamily: 'monospace', wordBreak: 'break-all' }}>{newKey.key}</code>
            <button
              onClick={() => handleCopy(newKey.key, 'new')}
              style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.33rem 0.7rem', borderRadius: 6, background: copiedId === 'new' ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: copiedId === 'new' ? '#34d399' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '0.73rem', fontWeight: 600, transition: 'all 0.2s', whiteSpace: 'nowrap' }}
            >
              {copiedId === 'new' ? <><CheckIcon size={12} /> Kopiert</> : <><CopyIcon size={12} /> Kopieren</>}
            </button>
          </div>
          <div style={{ marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.32)' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            Dieser Key wird nur einmal angezeigt — bitte jetzt sichern!
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.375rem' }}>
        <div>
          <h2 style={{ color: 'white', fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 2 }}>Deine API Keys</h2>
          <p style={{ color: 'rgba(255,255,255,0.32)', fontSize: '0.77rem' }}>
            {apiKeys.length} Key{apiKeys.length !== 1 ? 's' : ''} — konfigurieren, pausieren & verwalten
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: showCreate ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg,#3b82f6,#6366f1)', border: showCreate ? '1px solid rgba(255,255,255,0.1)' : 'none', borderRadius: 8, padding: '0.525rem 1.05rem', color: showCreate ? 'rgba(255,255,255,0.6)' : 'white', fontWeight: 700, fontSize: '0.84rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: showCreate ? 'none' : '0 4px 16px -4px rgba(59,130,246,0.5)' }}
        >
          {showCreate
            ? <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Abbrechen</>
            : <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Neuer Key</>
          }
        </button>
      </div>

      {/* ── Create form ── */}
      {showCreate && (
        <div style={{ marginBottom: '1.125rem', borderRadius: 14, background: 'rgba(14,22,36,0.9)', border: '1px solid rgba(255,255,255,0.09)', padding: '1.125rem 1.375rem', animation: 'slideDown 0.25s cubic-bezier(0.16,1,0.3,1)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Neuen API Key erstellen</div>
          <form onSubmit={handleCreate} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.69rem', fontWeight: 700, color: 'rgba(255,255,255,0.32)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>Name</label>
              <input
                value={keyName}
                onChange={e => setKeyName(e.target.value)}
                placeholder="z.B. Production API, Dev Key…"
                required
                style={{ width: '100%', padding: '0.575rem 0.875rem', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s' }}
                onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
              />
            </div>
            <button
              type="submit"
              disabled={creating || !keyName.trim()}
              style={{ padding: '0.575rem 1.375rem', borderRadius: 8, background: 'linear-gradient(135deg,#3b82f6,#6366f1)', border: 'none', color: 'white', fontWeight: 700, fontSize: '0.875rem', cursor: creating ? 'wait' : 'pointer', opacity: !keyName.trim() ? 0.5 : 1, whiteSpace: 'nowrap' }}
            >
              {creating ? 'Erstelle…' : 'Erstellen'}
            </button>
          </form>
        </div>
      )}

      {/* ── Key list ── */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: 86, borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      ) : apiKeys.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'rgba(255,255,255,0.25)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.875rem', color: 'rgba(255,255,255,0.2)' }}><KeyIcon /></div>
          <div style={{ fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: '0.35rem' }}>Noch keine API Keys</div>
          <div style={{ fontSize: '0.85rem' }}>Erstelle deinen ersten Key mit dem Button oben rechts.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {apiKeys.map((key, idx) => {
            const isSelected = selectedApiKeyId === key.id;
            const keyStats = stats[key.id];
            const blockRate = keyStats && keyStats.total > 0 ? Math.round((keyStats.blocked / keyStats.total) * 100) : 0;
            const isToggling = togglingId === key.id;
            const isDeleting = deletingId === key.id;
            const isActive = key.is_active === 1 || key.is_active === true;

            return (
              <div
                key={key.id}
                style={{
                  borderRadius: 14,
                  background: isSelected
                    ? 'linear-gradient(135deg,rgba(59,130,246,0.1),rgba(99,102,241,0.07))'
                    : 'rgba(14,22,36,0.85)',
                  border: `1px solid ${isSelected ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.07)'}`,
                  padding: '0.9rem 1.125rem',
                  transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
                  animation: `fadeUp 0.35s ${idx * 0.05}s both cubic-bezier(0.16,1,0.3,1)`,
                  position: 'relative', overflow: 'hidden',
                }}
                onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.13)'; }}
                onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'; }}
              >
                {/* Selected indicator stripe */}
                {isSelected && (
                  <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 3, background: 'linear-gradient(180deg,#3b82f6,#6366f1)', borderRadius: '14px 0 0 14px' }} />
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flexWrap: 'wrap' }}>

                  {/* Key info */}
                  <div style={{ flex: 1, minWidth: 180, paddingLeft: isSelected ? '0.25rem' : 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                      <span style={{ color: 'white', fontWeight: 700, fontSize: '0.92rem' }}>{key.key_name}</span>
                      <span style={{ padding: '2px 7px', borderRadius: 5, fontSize: '0.67rem', fontWeight: 700, background: isActive ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)', color: isActive ? '#34d399' : '#fbbf24', border: `1px solid ${isActive ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`, letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />
                        {isActive ? 'Aktiv' : 'Pausiert'}
                      </span>
                      {isSelected && (
                        <span style={{ padding: '2px 7px', borderRadius: 5, fontSize: '0.67rem', fontWeight: 700, background: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.25)' }}>
                          Ausgewählt
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <code style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.28)', fontFamily: 'monospace', background: 'rgba(255,255,255,0.04)', padding: '2px 6px', borderRadius: 4 }}>
                        {key.api_key.substring(0, 22)}…
                      </code>
                      <button
                        onClick={() => handleCopy(key.api_key, key.id)}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px 7px', borderRadius: 5, background: copiedId === key.id ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: copiedId === key.id ? '#34d399' : 'rgba(255,255,255,0.32)', cursor: 'pointer', transition: 'all 0.2s' }}
                        title="API Key kopieren"
                      >
                        {copiedId === key.id ? <CheckIcon /> : <CopyIcon />}
                      </button>
                    </div>
                  </div>

                  {/* Mini stats */}
                  <div style={{ display: 'flex', gap: '1.125rem', flexShrink: 0 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.975rem', fontWeight: 700, color: '#60a5fa', letterSpacing: '-0.02em', lineHeight: 1 }}>
                        {keyStats ? keyStats.total.toLocaleString('de-DE') : '—'}
                      </div>
                      <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 3 }}>Req/24h</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.975rem', fontWeight: 700, color: blockRate > 10 ? '#f87171' : '#34d399', letterSpacing: '-0.02em', lineHeight: 1 }}>
                        {keyStats ? `${blockRate}%` : '—'}
                      </div>
                      <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 3 }}>Geblockt</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.38)', lineHeight: 1 }}>
                        {new Date(key.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })}
                      </div>
                      <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 3 }}>Erstellt</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0, alignItems: 'center' }}>

                    {/* Pause / Resume */}
                    <button
                      onClick={() => handleToggle(key)}
                      disabled={isToggling}
                      title={isActive ? 'Key pausieren' : 'Key aktivieren'}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.42rem 0.7rem', borderRadius: 7, border: '1px solid', fontSize: '0.73rem', fontWeight: 700, cursor: isToggling ? 'wait' : 'pointer', transition: 'all 0.2s', background: isActive ? 'rgba(245,158,11,0.09)' : 'rgba(16,185,129,0.09)', borderColor: isActive ? 'rgba(245,158,11,0.22)' : 'rgba(16,185,129,0.22)', color: isActive ? '#fbbf24' : '#34d399', opacity: isToggling ? 0.5 : 1 }}
                    >
                      {isToggling ? '…' : isActive ? <><PauseIcon /> Pause</> : <><PlayIcon /> Aktiv</>}
                    </button>

                    {/* Config */}
                    <button
                      onClick={() => onSelectApiKey(key.id, 'configs')}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.42rem 0.7rem', borderRadius: 7, border: '1px solid rgba(59,130,246,0.25)', background: 'rgba(59,130,246,0.08)', color: '#60a5fa', fontSize: '0.73rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(59,130,246,0.16)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(59,130,246,0.08)'}
                    >
                      <SettingsIcon /> Config
                    </button>

                    {/* Analytics */}
                    <button
                      onClick={() => onSelectApiKey(key.id, 'analytics')}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.42rem 0.7rem', borderRadius: 7, border: '1px solid rgba(139,92,246,0.25)', background: 'rgba(139,92,246,0.08)', color: '#a78bfa', fontSize: '0.73rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.16)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.08)'}
                    >
                      <BarChartIcon /> Analytics
                    </button>

                    {/* Delete */}
                    {confirmDelete === key.id ? (
                      <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap' }}>Löschen?</span>
                        <button onClick={() => handleDelete(key.id)} disabled={isDeleting} style={{ padding: '0.38rem 0.6rem', borderRadius: 6, border: '1px solid rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.12)', color: '#f87171', fontSize: '0.7rem', fontWeight: 700, cursor: isDeleting ? 'wait' : 'pointer' }}>
                          {isDeleting ? '…' : 'Ja'}
                        </button>
                        <button onClick={() => setConfirmDelete(null)} style={{ padding: '0.38rem 0.6rem', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>Nein</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(key.id)}
                        title="Key löschen"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.42rem 0.5rem', borderRadius: 7, border: '1px solid rgba(239,68,68,0.14)', background: 'rgba(239,68,68,0.06)', color: '#f87171', cursor: 'pointer', transition: 'all 0.2s', opacity: 0.65 }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.14)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0.65'; (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.06)'; }}
                      >
                        <TrashIcon />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Hint ── */}
      {apiKeys.length > 0 && (
        <div style={{ marginTop: '1.125rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.7rem 0.875rem', borderRadius: 8, background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)', fontSize: '0.73rem', color: 'rgba(255,255,255,0.28)' }}>
          <span style={{ color: '#60a5fa', flexShrink: 0, marginTop: 1 }}><InfoIcon /></span>
          Klicke <strong style={{ color: 'rgba(255,255,255,0.48)' }}>Config</strong> oder <strong style={{ color: 'rgba(255,255,255,0.48)' }}>Analytics</strong> um direkt in den Tab zu springen. Den Key kannst du im jeweiligen Tab oben rechts jederzeit wechseln.
        </div>
      )}

      <style>{`
        @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeUp    { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse     { 0%,100%{opacity:.5} 50%{opacity:.25} }
      `}</style>
    </div>
  );
}
