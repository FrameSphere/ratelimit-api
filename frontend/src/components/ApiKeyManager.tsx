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
      // Load mini-stats for each key
      data.apiKeys.forEach(async (k: any) => {
        const { data: aData } = await api.getAnalytics(k.id, '24h');
        const summary = (aData as any)?.summary;
        if (summary) {
          setStats(prev => ({
            ...prev,
            [k.id]: { total: summary.total_requests || 0, blocked: summary.blocked_requests || 0 },
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
      setNewKey({ name: keyName.trim(), key: data.apiKey.api_key || (data.apiKey as any).apiKey });
      setKeyName('');
      setShowCreate(false);
      await loadApiKeys();
    }
    setCreating(false);
  };

  const handleToggle = async (key: any) => {
    setTogglingId(key.id);
    await api.toggleApiKey(key.id, !key.is_active);
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
    try { await navigator.clipboard.writeText(text); } catch {
      const el = document.createElement('textarea');
      el.value = text; document.body.appendChild(el); el.select();
      document.execCommand('copy'); document.body.removeChild(el);
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>

      {/* New key reveal */}
      {newKey && (
        <div style={{
          marginBottom: '1.5rem', borderRadius: 14,
          background: 'linear-gradient(135deg,rgba(16,185,129,0.1),rgba(5,150,105,0.06))',
          border: '1px solid rgba(16,185,129,0.25)', padding: '1.25rem 1.375rem',
          animation: 'slideDown 0.3s cubic-bezier(0.16,1,0.3,1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <span style={{ color: '#34d399', fontWeight: 700, fontSize: '0.88rem' }}>API Key erstellt: {newKey.name}</span>
            </div>
            <button onClick={() => setNewKey(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '1.1rem' }}>×</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: '0.625rem 0.875rem', border: '1px solid rgba(255,255,255,0.08)' }}>
            <code style={{ flex: 1, fontSize: '0.82rem', color: '#6ee7b7', fontFamily: 'monospace', wordBreak: 'break-all' }}>{newKey.key}</code>
            <button onClick={() => handleCopy(newKey.key, 'new')} style={{ flexShrink: 0, padding: '0.35rem 0.75rem', borderRadius: 6, background: copiedId === 'new' ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: copiedId === 'new' ? '#34d399' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
              {copiedId === 'new' ? '✓ Kopiert' : '📋 Kopieren'}
            </button>
          </div>
          <p style={{ marginTop: '0.5rem', fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>⚠️ Dieser Key wird nur einmal angezeigt – bitte jetzt sichern!</p>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.375rem' }}>
        <div>
          <h2 style={{ color: 'white', fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 2 }}>Deine API Keys</h2>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem' }}>{apiKeys.length} Key{apiKeys.length !== 1 ? 's' : ''} — Konfigurieren, pausieren & verwalten</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            background: showCreate ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg,#3b82f6,#6366f1)',
            border: showCreate ? '1px solid rgba(255,255,255,0.1)' : 'none',
            borderRadius: 8, padding: '0.55rem 1.1rem',
            color: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
            transition: 'all 0.2s', boxShadow: showCreate ? 'none' : '0 4px 16px -4px rgba(59,130,246,0.5)',
          }}
        >
          {showCreate ? '✕ Abbrechen' : '+ Neuer Key'}
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div style={{
          marginBottom: '1.25rem', borderRadius: 14,
          background: 'rgba(14,22,36,0.9)', border: '1px solid rgba(255,255,255,0.09)',
          padding: '1.25rem 1.375rem',
          animation: 'slideDown 0.25s cubic-bezier(0.16,1,0.3,1)',
        }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Neuen API Key erstellen</div>
          <form onSubmit={handleCreate} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Name</label>
              <input
                value={keyName}
                onChange={e => setKeyName(e.target.value)}
                placeholder="z.B. Production API, Dev Key…"
                required
                style={{ width: '100%', padding: '0.6rem 0.875rem', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s' }}
                onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
              />
            </div>
            <button
              type="submit"
              disabled={creating || !keyName.trim()}
              style={{ padding: '0.6rem 1.375rem', borderRadius: 8, background: 'linear-gradient(135deg,#3b82f6,#6366f1)', border: 'none', color: 'white', fontWeight: 700, fontSize: '0.875rem', cursor: creating ? 'wait' : 'pointer', opacity: !keyName.trim() ? 0.5 : 1, whiteSpace: 'nowrap', transition: 'opacity 0.2s' }}
            >
              {creating ? 'Erstelle…' : 'Erstellen'}
            </button>
          </form>
        </div>
      )}

      {/* Key list */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: 90, borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      ) : apiKeys.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'rgba(255,255,255,0.25)', fontSize: '0.875rem', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 14 }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', opacity: 0.4 }}>🔑</div>
          <div style={{ fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: '0.375rem' }}>Noch keine API Keys</div>
          <div>Erstelle deinen ersten Key mit dem Button oben rechts.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
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
                  padding: '1rem 1.25rem',
                  transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
                  animation: `fadeUp 0.35s ${idx * 0.05}s both cubic-bezier(0.16,1,0.3,1)`,
                  position: 'relative', overflow: 'hidden',
                }}
                onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.14)'; }}
                onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'; }}
              >
                {/* Active key indicator line */}
                {isSelected && (
                  <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 3, background: 'linear-gradient(180deg,#3b82f6,#6366f1)', borderRadius: '14px 0 0 14px' }} />
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  {/* Left: Key info */}
                  <div style={{ flex: 1, minWidth: 200, paddingLeft: isSelected ? '0.375rem' : 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                      <span style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>{key.key_name}</span>
                      {/* Status badge */}
                      <span style={{
                        padding: '2px 8px', borderRadius: 5, fontSize: '0.68rem', fontWeight: 700,
                        background: isActive ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
                        color: isActive ? '#34d399' : '#fbbf24',
                        border: `1px solid ${isActive ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`,
                        letterSpacing: '0.04em',
                      }}>
                        {isActive ? '● Aktiv' : '⏸ Pausiert'}
                      </span>
                      {isSelected && (
                        <span style={{ padding: '2px 8px', borderRadius: 5, fontSize: '0.68rem', fontWeight: 700, background: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.25)', letterSpacing: '0.04em' }}>
                          Ausgewählt
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <code style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', background: 'rgba(255,255,255,0.04)', padding: '2px 7px', borderRadius: 4 }}>
                        {key.api_key.substring(0, 24)}…
                      </code>
                      <button
                        onClick={() => handleCopy(key.api_key, key.id)}
                        style={{ padding: '2px 8px', borderRadius: 5, background: copiedId === key.id ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: copiedId === key.id ? '#34d399' : 'rgba(255,255,255,0.35)', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600, transition: 'all 0.2s' }}
                      >
                        {copiedId === key.id ? '✓' : '📋'}
                      </button>
                    </div>
                  </div>

                  {/* Middle: Mini stats */}
                  <div style={{ display: 'flex', gap: '1.25rem', flexShrink: 0 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: '#60a5fa', letterSpacing: '-0.02em' }}>
                        {keyStats ? keyStats.total.toLocaleString('de-DE') : '—'}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.28)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 1 }}>Req/24h</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: blockRate > 10 ? '#f87171' : '#34d399', letterSpacing: '-0.02em' }}>
                        {keyStats ? `${blockRate}%` : '—'}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.28)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 1 }}>Geblockt</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.45)', letterSpacing: '-0.01em' }}>
                        {new Date(key.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.28)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 1 }}>Erstellt</div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div style={{ display: 'flex', gap: '0.45rem', flexShrink: 0, alignItems: 'center' }}>
                    {/* Pause/Resume toggle */}
                    <button
                      onClick={() => handleToggle(key)}
                      disabled={isToggling}
                      title={isActive ? 'Key pausieren' : 'Key aktivieren'}
                      style={{
                        padding: '0.45rem 0.7rem', borderRadius: 7, border: '1px solid',
                        fontSize: '0.75rem', fontWeight: 700, cursor: isToggling ? 'wait' : 'pointer',
                        transition: 'all 0.2s',
                        background: isActive ? 'rgba(245,158,11,0.09)' : 'rgba(16,185,129,0.09)',
                        borderColor: isActive ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)',
                        color: isActive ? '#fbbf24' : '#34d399',
                        opacity: isToggling ? 0.5 : 1,
                      }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = isToggling ? '0.5' : '0.8'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
                    >
                      {isToggling ? '…' : isActive ? '⏸ Pause' : '▶ Resume'}
                    </button>

                    {/* Config */}
                    <button
                      onClick={() => onSelectApiKey(key.id, 'configs')}
                      style={{ padding: '0.45rem 0.75rem', borderRadius: 7, border: '1px solid rgba(59,130,246,0.25)', background: 'rgba(59,130,246,0.08)', color: '#60a5fa', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(59,130,246,0.16)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(59,130,246,0.08)'; }}
                    >
                      ⚙ Config
                    </button>

                    {/* Analytics */}
                    <button
                      onClick={() => onSelectApiKey(key.id, 'analytics')}
                      style={{ padding: '0.45rem 0.75rem', borderRadius: 7, border: '1px solid rgba(139,92,246,0.25)', background: 'rgba(139,92,246,0.08)', color: '#a78bfa', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.16)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.08)'; }}
                    >
                      📊 Analytics
                    </button>

                    {/* Delete */}
                    {confirmDelete === key.id ? (
                      <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>Löschen?</span>
                        <button
                          onClick={() => handleDelete(key.id)}
                          disabled={isDeleting}
                          style={{ padding: '0.4rem 0.625rem', borderRadius: 6, border: '1px solid rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.12)', color: '#f87171', fontSize: '0.72rem', fontWeight: 700, cursor: isDeleting ? 'wait' : 'pointer' }}
                        >
                          {isDeleting ? '…' : 'Ja'}
                        </button>
                        <button onClick={() => setConfirmDelete(null)} style={{ padding: '0.4rem 0.625rem', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>
                          Nein
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(key.id)}
                        title="Key löschen"
                        style={{ padding: '0.45rem 0.55rem', borderRadius: 7, border: '1px solid rgba(239,68,68,0.15)', background: 'rgba(239,68,68,0.06)', color: '#f87171', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s', opacity: 0.7 }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.14)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0.7'; (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.06)'; }}
                      >
                        🗑
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tip */}
      {apiKeys.length > 0 && (
        <div style={{ marginTop: '1.25rem', padding: '0.75rem 1rem', borderRadius: 8, background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>
          💡 Klicke <strong style={{ color: 'rgba(255,255,255,0.5)' }}>⚙ Config</strong> oder <strong style={{ color: 'rgba(255,255,255,0.5)' }}>📊 Analytics</strong> auf einem Key um direkt in den jeweiligen Tab zu springen. Im Config & Analytics Tab kannst du jederzeit den Key wechseln.
        </div>
      )}

      <style>{`
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity: 0.5; } 50% { opacity: 0.25; } }
      `}</style>
    </div>
  );
}
