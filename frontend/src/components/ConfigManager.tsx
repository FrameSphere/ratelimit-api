import { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface ConfigManagerProps {
  apiKeyId: number;
  apiKeyName?: string;
  allApiKeys?: any[];
  onKeyChange?: (id: number) => void;
}

const WINDOW_PRESETS = [
  { label: '1 Minute', value: 60 },
  { label: '5 Min', value: 300 },
  { label: '1 Stunde', value: 3600 },
  { label: '1 Tag', value: 86400 },
];

export function ConfigManager({ apiKeyId, apiKeyName, allApiKeys, onKeyChange }: ConfigManagerProps) {
  const [configs, setConfigs] = useState<any[]>([]);
  const [filters, setFilters] = useState<{ [key: number]: any[] }>({});
  const [expandedConfig, setExpandedConfig] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showFilterForm, setShowFilterForm] = useState<number | null>(null);
  const [editingConfig, setEditingConfig] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  // Create form
  const [configName, setConfigName] = useState('');
  const [maxRequests, setMaxRequests] = useState('100');
  const [windowSeconds, setWindowSeconds] = useState('3600');

  // Edit form
  const [editName, setEditName] = useState('');
  const [editMax, setEditMax] = useState('');
  const [editWindow, setEditWindow] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  // Filter form
  const [ruleType, setRuleType] = useState('ip_blacklist');
  const [ruleValue, setRuleValue] = useState('');
  const [action, setAction] = useState('block');

  useEffect(() => {
    loadConfigs();
    setShowCreate(false);
    setExpandedConfig(null);
    setEditingConfig(null);
  }, [apiKeyId]);

  const loadConfigs = async () => {
    setLoading(true);
    const { data } = await api.getConfigs(apiKeyId);
    if (data?.configs) {
      setConfigs(data.configs);
      data.configs.forEach((c: any) => loadFilters(c.id));
    }
    setLoading(false);
  };

  const loadFilters = async (configId: number) => {
    const { data } = await api.getFilters(configId);
    if (data?.filters) setFilters(prev => ({ ...prev, [configId]: data.filters }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await api.createConfig(apiKeyId, configName, parseInt(maxRequests), parseInt(windowSeconds));
    if (error) { alert(error); return; }
    setConfigName(''); setMaxRequests('100'); setWindowSeconds('3600'); setShowCreate(false);
    await loadConfigs();
  };

  const handleToggle = async (config: any) => {
    setTogglingId(config.id);
    await api.updateConfig(config.id, { name: config.name, max_requests: config.max_requests, window_seconds: config.window_seconds, enabled: config.enabled ? 0 : 1 });
    await loadConfigs();
    setTogglingId(null);
  };

  const handleSaveEdit = async (configId: number) => {
    setEditSaving(true);
    await api.updateConfig(configId, { name: editName, max_requests: parseInt(editMax), window_seconds: parseInt(editWindow), enabled: configs.find(c => c.id === configId)?.enabled });
    setEditingConfig(null);
    await loadConfigs();
    setEditSaving(false);
  };

  const startEdit = (config: any) => {
    setEditName(config.name); setEditMax(String(config.max_requests)); setEditWindow(String(config.window_seconds));
    setEditingConfig(config.id);
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    await api.deleteConfig(id);
    setConfirmDelete(null); setExpandedConfig(null);
    await loadConfigs();
    setDeletingId(null);
  };

  const handleCreateFilter = async (e: React.FormEvent, configId: number) => {
    e.preventDefault();
    const { error } = await api.createFilter(configId, ruleType, ruleValue, action);
    if (error) { alert(error); return; }
    setRuleValue(''); setShowFilterForm(null);
    await loadFilters(configId);
  };

  const handleDeleteFilter = async (filterId: number, configId: number) => {
    await api.deleteFilter(filterId);
    await loadFilters(configId);
  };

  const formatWindow = (secs: number) => {
    if (secs < 60) return `${secs}s`;
    if (secs < 3600) return `${secs / 60}min`;
    if (secs < 86400) return `${secs / 3600}h`;
    return `${secs / 86400}d`;
  };

  const inputStyle: React.CSSProperties = { width: '100%', padding: '0.575rem 0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'white', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s' };

  return (
    <div style={{ maxWidth: 880, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.375rem' }}>
        <div>
          <h2 style={{ color: 'white', fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 2 }}>
            Rate Limit Konfigurationen
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.32)', fontSize: '0.77rem' }}>
            {configs.length} Konfiguration{configs.length !== 1 ? 'en' : ''}{apiKeyName ? ` für „${apiKeyName}"` : ''}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: showCreate ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg,#3b82f6,#6366f1)', border: showCreate ? '1px solid rgba(255,255,255,0.1)' : 'none', borderRadius: 8, padding: '0.55rem 1.1rem', color: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: showCreate ? 'none' : '0 4px 16px -4px rgba(59,130,246,0.5)' }}
        >
          {showCreate ? '✕ Abbrechen' : '+ Neue Konfiguration'}
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div style={{ marginBottom: '1.25rem', borderRadius: 14, background: 'rgba(14,22,36,0.9)', border: '1px solid rgba(255,255,255,0.09)', padding: '1.25rem 1.375rem', animation: 'slideDown 0.25s cubic-bezier(0.16,1,0.3,1)' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Neue Rate Limit Regel</div>
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.875rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>Name</label>
                <input value={configName} onChange={e => setConfigName(e.target.value)} placeholder="z.B. Global Limit" required style={inputStyle} onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>Max. Requests</label>
                <input type="number" value={maxRequests} onChange={e => setMaxRequests(e.target.value)} required style={inputStyle} onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>Zeitfenster</label>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.375rem' }}>
                  {WINDOW_PRESETS.map(p => (
                    <button key={p.value} type="button" onClick={() => setWindowSeconds(String(p.value))} style={{ padding: '3px 8px', borderRadius: 5, border: '1px solid', fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', background: windowSeconds === String(p.value) ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.04)', borderColor: windowSeconds === String(p.value) ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.1)', color: windowSeconds === String(p.value) ? '#60a5fa' : 'rgba(255,255,255,0.45)' }}>
                      {p.label}
                    </button>
                  ))}
                </div>
                <input type="number" value={windowSeconds} onChange={e => setWindowSeconds(e.target.value)} placeholder="Sekunden" style={{ ...inputStyle, fontSize: '0.8rem' }} onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.625rem' }}>
              <button type="submit" style={{ padding: '0.55rem 1.25rem', borderRadius: 8, background: 'linear-gradient(135deg,#3b82f6,#6366f1)', border: 'none', color: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                Erstellen
              </button>
              <button type="button" onClick={() => setShowCreate(false)} style={{ padding: '0.55rem 0.875rem', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.5)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Config list */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1, 2].map(i => <div key={i} style={{ height: 80, borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', animation: 'pulse 1.5s ease-in-out infinite' }} />)}
        </div>
      ) : configs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3.5rem 2rem', color: 'rgba(255,255,255,0.25)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 14 }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', opacity: 0.4 }}>⚙️</div>
          <div style={{ fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: '0.375rem' }}>Keine Konfigurationen</div>
          <div style={{ fontSize: '0.85rem' }}>Erstelle deine erste Rate Limit Regel oben.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {configs.map((config, idx) => {
            const isExpanded = expandedConfig === config.id;
            const isEditing = editingConfig === config.id;
            const isEnabled = config.enabled === 1 || config.enabled === true;
            const isToggling = togglingId === config.id;
            const filterCount = filters[config.id]?.length || 0;

            return (
              <div
                key={config.id}
                style={{
                  borderRadius: 14, overflow: 'hidden',
                  background: 'rgba(14,22,36,0.85)',
                  border: `1px solid ${isExpanded ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.07)'}`,
                  transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
                  animation: `fadeUp 0.3s ${idx * 0.06}s both cubic-bezier(0.16,1,0.3,1)`,
                }}
              >
                {/* Config header row */}
                <div style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  {/* Toggle enabled */}
                  <button
                    onClick={() => handleToggle(config)}
                    disabled={isToggling}
                    title={isEnabled ? 'Deaktivieren' : 'Aktivieren'}
                    style={{ flexShrink: 0, width: 38, height: 22, borderRadius: 11, border: 'none', cursor: isToggling ? 'wait' : 'pointer', background: isEnabled ? 'rgba(59,130,246,0.8)' : 'rgba(255,255,255,0.12)', position: 'relative', transition: 'background 0.25s', opacity: isToggling ? 0.6 : 1 }}
                  >
                    <div style={{ position: 'absolute', top: 2, left: isEnabled ? 18 : 2, width: 18, height: 18, borderRadius: '50%', background: 'white', transition: 'left 0.25s cubic-bezier(0.16,1,0.3,1)', boxShadow: '0 1px 4px rgba(0,0,0,0.35)' }} />
                  </button>

                  {/* Name & info */}
                  <div style={{ flex: 1, minWidth: 160 }}>
                    {isEditing ? (
                      <input
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        style={{ ...inputStyle, fontSize: '0.9rem', fontWeight: 700, padding: '0.35rem 0.6rem' }}
                        onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                        autoFocus
                      />
                    ) : (
                      <div>
                        <span style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem' }}>{config.name}</span>
                        {!isEnabled && <span style={{ marginLeft: '0.5rem', fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>Inaktiv</span>}
                      </div>
                    )}
                  </div>

                  {/* Rate limit display / edit */}
                  {isEditing ? (
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <input type="number" value={editMax} onChange={e => setEditMax(e.target.value)} style={{ ...inputStyle, width: 90, fontSize: '0.82rem' }} placeholder="Max Req" onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>/ </span>
                      <div>
                        <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                          {WINDOW_PRESETS.map(p => (
                            <button key={p.value} type="button" onClick={() => setEditWindow(String(p.value))} style={{ padding: '2px 7px', borderRadius: 5, border: '1px solid', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', background: editWindow === String(p.value) ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.04)', borderColor: editWindow === String(p.value) ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.1)', color: editWindow === String(p.value) ? '#60a5fa' : 'rgba(255,255,255,0.4)' }}>
                              {p.label}
                            </button>
                          ))}
                        </div>
                        <input type="number" value={editWindow} onChange={e => setEditWindow(e.target.value)} style={{ ...inputStyle, width: 100, fontSize: '0.82rem' }} placeholder="Sekunden" onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center', flexShrink: 0 }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#60a5fa', letterSpacing: '-0.02em' }}>{config.max_requests.toLocaleString('de-DE')}</div>
                        <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Requests</div>
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '1rem' }}>/</div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#a78bfa', letterSpacing: '-0.02em' }}>{formatWindow(config.window_seconds)}</div>
                        <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Fenster</div>
                      </div>
                      {filterCount > 0 && (
                        <div style={{ padding: '2px 8px', borderRadius: 5, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#fbbf24', fontSize: '0.7rem', fontWeight: 700 }}>
                          {filterCount} Filter
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0, alignItems: 'center' }}>
                    {isEditing ? (
                      <>
                        <button onClick={() => handleSaveEdit(config.id)} disabled={editSaving} style={{ padding: '0.4rem 0.875rem', borderRadius: 7, border: 'none', background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: 'white', fontWeight: 700, fontSize: '0.78rem', cursor: editSaving ? 'wait' : 'pointer' }}>
                          {editSaving ? 'Speichern…' : '✓ Speichern'}
                        </button>
                        <button onClick={() => setEditingConfig(null)} style={{ padding: '0.4rem 0.75rem', borderRadius: 7, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}>
                          Abbrechen
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(config)} title="Bearbeiten" style={{ padding: '0.4rem 0.6rem', borderRadius: 7, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.15s' }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.09)'; (e.currentTarget as HTMLElement).style.color = 'white'; }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)'; }}>
                          ✏️
                        </button>
                        <button
                          onClick={() => setExpandedConfig(isExpanded ? null : config.id)}
                          style={{ padding: '0.4rem 0.75rem', borderRadius: 7, border: '1px solid rgba(59,130,246,0.2)', background: 'rgba(59,130,246,0.07)', color: '#60a5fa', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(59,130,246,0.14)'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(59,130,246,0.07)'}
                        >
                          Filter {isExpanded ? '▲' : '▼'}
                        </button>
                        {confirmDelete === config.id ? (
                          <>
                            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>Löschen?</span>
                            <button onClick={() => handleDelete(config.id)} disabled={deletingId === config.id} style={{ padding: '0.4rem 0.6rem', borderRadius: 6, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.12)', color: '#f87171', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>
                              {deletingId === config.id ? '…' : 'Ja'}
                            </button>
                            <button onClick={() => setConfirmDelete(null)} style={{ padding: '0.4rem 0.6rem', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>Nein</button>
                          </>
                        ) : (
                          <button onClick={() => setConfirmDelete(config.id)} style={{ padding: '0.4rem 0.55rem', borderRadius: 7, border: '1px solid rgba(239,68,68,0.14)', background: 'rgba(239,68,68,0.06)', color: '#f87171', fontSize: '0.78rem', cursor: 'pointer', opacity: 0.7, transition: 'all 0.15s' }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.14)'; }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0.7'; (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.06)'; }}>
                            🗑
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Expanded: filters */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '1rem 1.25rem', animation: 'slideDown 0.2s cubic-bezier(0.16,1,0.3,1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Filter & Regeln</div>
                      <button
                        onClick={() => setShowFilterForm(showFilterForm === config.id ? null : config.id)}
                        style={{ padding: '0.35rem 0.75rem', borderRadius: 7, border: '1px solid rgba(59,130,246,0.25)', background: 'rgba(59,130,246,0.07)', color: '#60a5fa', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
                      >
                        + Filter hinzufügen
                      </button>
                    </div>

                    {/* Filter form */}
                    {showFilterForm === config.id && (
                      <form onSubmit={e => handleCreateFilter(e, config.id)} style={{ marginBottom: '0.875rem', padding: '0.875rem', background: 'rgba(59,130,246,0.05)', borderRadius: 10, border: '1px solid rgba(59,130,246,0.12)', animation: 'slideDown 0.2s cubic-bezier(0.16,1,0.3,1)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '0.625rem', marginBottom: '0.625rem' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>Typ</label>
                            <select value={ruleType} onChange={e => setRuleType(e.target.value)} style={{ ...inputStyle, fontSize: '0.82rem', cursor: 'pointer' }}>
                              <option value="ip_blacklist">IP Blacklist</option>
                              <option value="ip_whitelist">IP Whitelist</option>
                              <option value="user_agent">User Agent</option>
                            </select>
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>Wert</label>
                            <input value={ruleValue} onChange={e => setRuleValue(e.target.value)} placeholder={ruleType === 'user_agent' ? 'z.B. bot, curl/7' : 'z.B. 192.168.1.1'} required style={{ ...inputStyle, fontSize: '0.82rem' }} onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>Aktion</label>
                            <select value={action} onChange={e => setAction(e.target.value)} style={{ ...inputStyle, fontSize: '0.82rem', cursor: 'pointer' }}>
                              <option value="block">Blockieren</option>
                              <option value="allow">Erlauben</option>
                            </select>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button type="submit" style={{ padding: '0.425rem 1rem', borderRadius: 7, border: 'none', background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: 'white', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}>Hinzufügen</button>
                          <button type="button" onClick={() => setShowFilterForm(null)} style={{ padding: '0.425rem 0.75rem', borderRadius: 7, border: '1px solid rgba(255,255,255,0.09)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}>Abbrechen</button>
                        </div>
                      </form>
                    )}

                    {/* Filter list */}
                    {filters[config.id] && filters[config.id].length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {filters[config.id].map(f => (
                          <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.55rem 0.875rem', borderRadius: 8, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <span style={{ padding: '2px 8px', borderRadius: 5, fontSize: '0.68rem', fontWeight: 700, background: f.rule_type === 'ip_whitelist' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: f.rule_type === 'ip_whitelist' ? '#34d399' : '#fbbf24', border: `1px solid ${f.rule_type === 'ip_whitelist' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}` }}>
                              {f.rule_type === 'ip_blacklist' ? 'IP Block' : f.rule_type === 'ip_whitelist' ? 'IP Allow' : 'User Agent'}
                            </span>
                            <code style={{ flex: 1, fontSize: '0.8rem', color: 'rgba(255,255,255,0.65)', fontFamily: 'monospace', background: 'rgba(0,0,0,0.2)', padding: '2px 7px', borderRadius: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.rule_value}</code>
                            <span style={{ padding: '2px 8px', borderRadius: 5, fontSize: '0.68rem', fontWeight: 700, background: f.action === 'block' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', color: f.action === 'block' ? '#f87171' : '#34d399', border: `1px solid ${f.action === 'block' ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`, flexShrink: 0 }}>
                              {f.action === 'block' ? '🚫 Block' : '✅ Allow'}
                            </span>
                            <button onClick={() => handleDeleteFilter(f.id, config.id)} style={{ padding: '3px 8px', borderRadius: 5, border: '1px solid rgba(239,68,68,0.15)', background: 'rgba(239,68,68,0.06)', color: '#f87171', fontSize: '0.72rem', cursor: 'pointer', flexShrink: 0, opacity: 0.7, transition: 'opacity 0.15s' }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '1'} onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '0.7'}>
                              🗑
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '1.375rem', color: 'rgba(255,255,255,0.2)', fontSize: '0.82rem', border: '1px dashed rgba(255,255,255,0.07)', borderRadius: 8 }}>
                        Keine Filter — alle Requests werden nur per Rate Limit geprüft
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Rate Limit Headers Info box */}
      <div style={{ marginTop: '2rem', padding: '1.125rem 1.375rem', borderRadius: 12, background: 'rgba(14,22,36,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.625rem' }}>📬 Rate Limit Headers</div>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          {[
            ['X-RateLimit-Limit', 'Max. Requests im Fenster'],
            ['X-RateLimit-Remaining', 'Verbleibende Requests'],
            ['X-RateLimit-Reset', 'Reset-Zeitpunkt (Unix)'],
            ['Retry-After', 'Wartezeit bei 429'],
          ].map(([header, desc]) => (
            <div key={header}>
              <code style={{ fontSize: '0.75rem', color: '#60a5fa', fontFamily: 'monospace', display: 'block', marginBottom: 2 }}>{header}</code>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.28)' }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes slideDown { from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:0.5}50%{opacity:0.25} }
        select option { background: #0c1525; color: white; }
      `}</style>
    </div>
  );
}
