import { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface ConfigManagerProps {
  apiKeyId: number;
  apiKeyName?: string;
  allApiKeys?: any[];
  onKeyChange?: (id: number) => void;
}

const WINDOW_PRESETS = [
  { label: '1 Min', value: 60 },
  { label: '5 Min', value: 300 },
  { label: '1 Stunde', value: 3600 },
  { label: '1 Tag', value: 86400 },
];

const GEO_PRESETS: { code: string; label: string }[] = [
  { code: 'CN', label: '🇨🇳 China' },
  { code: 'RU', label: '🇷🇺 Russland' },
  { code: 'KP', label: '🇰🇵 N-Korea' },
  { code: 'IR', label: '🇮🇷 Iran' },
  { code: 'US', label: '🇺🇸 USA' },
  { code: 'DE', label: '🇩🇪 Deutschland' },
  { code: 'GB', label: '🇬🇧 UK' },
  { code: 'FR', label: '🇫🇷 Frankreich' },
  { code: 'IN', label: '🇮🇳 Indien' },
  { code: 'BR', label: '🇧🇷 Brasilien' },
];

const RULE_TYPE_META: Record<string, { label: string; icon: string; placeholder: string; hint: string }> = {
  ip_blacklist: { label: 'IP Blacklist',  icon: '🚫', placeholder: '192.168.1.1',         hint: 'Exakte IP-Adresse blockieren' },
  ip_whitelist: { label: 'IP Whitelist',  icon: '✅', placeholder: '192.168.1.1',         hint: 'IP immer erlauben — ignoriert Rate Limits' },
  user_agent:   { label: 'User Agent',    icon: '🤖', placeholder: 'bot, curl/7, scrapy', hint: 'Teilstring-Match auf User-Agent (case-insensitive)' },
  geo_country:  { label: 'Geo: Land',     icon: '🌍', placeholder: 'CN, RU, KP',          hint: 'ISO-Ländercodes kommagetrennt — z.B. CN,RU,KP' },
};

function AlgoBadge({ algo }: { algo: string }) {
  const isToken = algo === 'token_bucket';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 5, fontSize: '0.65rem', fontWeight: 700, background: isToken ? 'rgba(245,158,11,0.1)' : 'rgba(59,130,246,0.1)', color: isToken ? '#fbbf24' : '#60a5fa', border: `1px solid ${isToken ? 'rgba(245,158,11,0.22)' : 'rgba(59,130,246,0.22)'}`, whiteSpace: 'nowrap' }}>
      {isToken ? '🪣 Token Bucket' : '🪟 Sliding Window'}
    </span>
  );
}

function FilterTypeBadge({ type }: { type: string }) {
  const colors: Record<string, { bg: string; color: string; border: string }> = {
    ip_whitelist: { bg: 'rgba(16,185,129,0.1)',  color: '#34d399', border: 'rgba(16,185,129,0.22)' },
    ip_blacklist: { bg: 'rgba(239,68,68,0.1)',   color: '#f87171', border: 'rgba(239,68,68,0.22)' },
    user_agent:   { bg: 'rgba(245,158,11,0.1)',  color: '#fbbf24', border: 'rgba(245,158,11,0.22)' },
    geo_country:  { bg: 'rgba(139,92,246,0.1)',  color: '#c4b5fd', border: 'rgba(139,92,246,0.22)' },
  };
  const c = colors[type] || { bg: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: 'rgba(255,255,255,0.1)' };
  const meta = RULE_TYPE_META[type];
  return (
    <span style={{ padding: '2px 8px', borderRadius: 5, fontSize: '0.68rem', fontWeight: 700, background: c.bg, color: c.color, border: `1px solid ${c.border}`, whiteSpace: 'nowrap' }}>
      {meta?.icon} {meta?.label ?? type}
    </span>
  );
}

// ── Algorithm selector sub-component ─────────────────────────────────────────

function AlgoSelector({
  value, onChange, burstSize, refillRate, onBurstChange, onRefillChange, maxRequests, windowSeconds
}: {
  value: string; onChange: (v: string) => void;
  burstSize: string; refillRate: string;
  onBurstChange: (v: string) => void; onRefillChange: (v: string) => void;
  maxRequests: string; windowSeconds: string;
}) {
  const isToken = value === 'token_bucket';
  const inS: React.CSSProperties = { width: '100%', padding: '0.5rem 0.72rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'white', fontSize: '0.82rem', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s' };

  // Auto-suggest burst from maxRequests
  const suggestedBurst = maxRequests ? String(Math.round(parseInt(maxRequests) * 1.5)) : '';
  const suggestedRefill = (maxRequests && windowSeconds)
    ? String(Math.max(1, Math.round(parseInt(maxRequests) / Math.max(1, parseInt(windowSeconds)))))
    : '';

  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Algorithmus</label>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: isToken ? '0.75rem' : 0 }}>
        {[
          { id: 'sliding_window', label: '🪟 Sliding Window', desc: 'Klassisch — X Req pro Fenster' },
          { id: 'token_bucket',   label: '🪣 Token Bucket',   desc: 'Erlaubt Bursts, refill über Zeit' },
        ].map(opt => (
          <button
            key={opt.id} type="button"
            onClick={() => onChange(opt.id)}
            style={{ flex: 1, padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid', cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left', background: value === opt.id ? 'rgba(59,130,246,0.14)' : 'rgba(255,255,255,0.03)', borderColor: value === opt.id ? 'rgba(59,130,246,0.45)' : 'rgba(255,255,255,0.1)' }}
          >
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: value === opt.id ? '#93c5fd' : 'rgba(255,255,255,0.65)', marginBottom: 2 }}>{opt.label}</div>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>{opt.desc}</div>
          </button>
        ))}
      </div>

      {isToken && (
        <div style={{ padding: '0.875rem', borderRadius: 10, background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)', animation: 'slideDown 0.2s ease' }}>
          <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', marginBottom: '0.75rem', lineHeight: 1.6 }}>
            <strong style={{ color: '#fbbf24' }}>Token Bucket:</strong> Jeder Request verbraucht ein Token. Tokens werden mit <em>refill_rate</em> pro Sekunde aufgefüllt bis maximal <em>burst_size</em>.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>
                Burst Size <span style={{ color: 'rgba(255,255,255,0.2)', fontWeight: 400 }}>(max Tokens)</span>
              </label>
              <input
                type="number" min="1"
                value={burstSize || suggestedBurst}
                onChange={e => onBurstChange(e.target.value)}
                placeholder={suggestedBurst || 'z.B. 150'}
                style={inS}
                onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
              {suggestedBurst && !burstSize && (
                <div style={{ fontSize: '0.62rem', color: 'rgba(245,158,11,0.6)', marginTop: 3 }}>Vorschlag: {suggestedBurst} (1.5× max)</div>
              )}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>
                Refill Rate <span style={{ color: 'rgba(255,255,255,0.2)', fontWeight: 400 }}>(Tokens/Sek)</span>
              </label>
              <input
                type="number" min="1"
                value={refillRate || suggestedRefill}
                onChange={e => onRefillChange(e.target.value)}
                placeholder={suggestedRefill || 'z.B. 2'}
                style={inS}
                onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
              {suggestedRefill && !refillRate && (
                <div style={{ fontSize: '0.62rem', color: 'rgba(245,158,11,0.6)', marginTop: 3 }}>Vorschlag: {suggestedRefill} Tok/s</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ConfigManager({ apiKeyId, apiKeyName }: ConfigManagerProps) {
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

  // ── Create form state ──
  const [configName, setConfigName] = useState('');
  const [maxRequests, setMaxRequests] = useState('100');
  const [windowSeconds, setWindowSeconds] = useState('3600');
  const [algorithm, setAlgorithm] = useState('sliding_window');
  const [endpointPattern, setEndpointPattern] = useState('');
  const [burstSize, setBurstSize] = useState('');
  const [refillRate, setRefillRate] = useState('');

  // ── Edit form state ──
  const [editName, setEditName] = useState('');
  const [editMax, setEditMax] = useState('');
  const [editWindow, setEditWindow] = useState('');
  const [editAlgorithm, setEditAlgorithm] = useState('sliding_window');
  const [editEndpoint, setEditEndpoint] = useState('');
  const [editBurst, setEditBurst] = useState('');
  const [editRefill, setEditRefill] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [showEditAdvanced, setShowEditAdvanced] = useState(false);

  // ── Filter form state ──
  const [ruleType, setRuleType] = useState('ip_blacklist');
  const [ruleValue, setRuleValue] = useState('');
  const [action, setAction] = useState('block');
  const [selectedGeoCodes, setSelectedGeoCodes] = useState<string[]>([]);

  useEffect(() => {
    loadConfigs();
    setShowCreate(false);
    setExpandedConfig(null);
    setEditingConfig(null);
  }, [apiKeyId]);

  useEffect(() => {
    if (ruleType === 'geo_country') setRuleValue(selectedGeoCodes.join(', '));
  }, [selectedGeoCodes, ruleType]);

  useEffect(() => {
    if (ruleType === 'ip_whitelist') setAction('allow');
    else if (ruleType === 'geo_country') setAction('block');
    else setAction('block');
  }, [ruleType]);

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

  const resetCreateForm = () => {
    setConfigName(''); setMaxRequests('100'); setWindowSeconds('3600');
    setAlgorithm('sliding_window'); setEndpointPattern('');
    setBurstSize(''); setRefillRate('');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await api.createConfig(
      apiKeyId, configName, parseInt(maxRequests), parseInt(windowSeconds),
      {
        algorithm: algorithm as 'sliding_window' | 'token_bucket',
        endpointPattern: endpointPattern.trim() || null,
        burstSize: algorithm === 'token_bucket' && burstSize ? parseInt(burstSize) : null,
        refillRate: algorithm === 'token_bucket' && refillRate ? parseInt(refillRate) : null,
      }
    );
    if (error) { alert(error); return; }
    resetCreateForm();
    setShowCreate(false);
    await loadConfigs();
  };

  const handleToggle = async (config: any) => {
    setTogglingId(config.id);
    await api.updateConfig(config.id, {
      name: config.name, max_requests: config.max_requests,
      window_seconds: config.window_seconds, enabled: config.enabled ? 0 : 1,
    });
    await loadConfigs();
    setTogglingId(null);
  };

  const startEdit = (config: any) => {
    setEditName(config.name);
    setEditMax(String(config.max_requests));
    setEditWindow(String(config.window_seconds));
    setEditAlgorithm(config.algorithm || 'sliding_window');
    setEditEndpoint(config.endpoint_pattern || '');
    setEditBurst(config.burst_size ? String(config.burst_size) : '');
    setEditRefill(config.refill_rate ? String(config.refill_rate) : '');
    setShowEditAdvanced(false);
    setEditingConfig(config.id);
  };

  const handleSaveEdit = async (configId: number) => {
    setEditSaving(true);
    await api.updateConfig(configId, {
      name: editName,
      max_requests: parseInt(editMax),
      window_seconds: parseInt(editWindow),
      enabled: configs.find(c => c.id === configId)?.enabled,
      algorithm: editAlgorithm,
      endpointPattern: editEndpoint.trim() || null,
      burstSize: editAlgorithm === 'token_bucket' && editBurst ? parseInt(editBurst) : null,
      refillRate: editAlgorithm === 'token_bucket' && editRefill ? parseInt(editRefill) : null,
    });
    setEditingConfig(null);
    await loadConfigs();
    setEditSaving(false);
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
    const val = ruleType === 'geo_country' ? selectedGeoCodes.join(',') : ruleValue.trim();
    if (!val) return;
    const effectiveAction = ruleType === 'ip_whitelist' ? 'allow' : action;
    const { error } = await api.createFilter(configId, ruleType, val, effectiveAction);
    if (error) { alert(error); return; }
    setRuleValue(''); setSelectedGeoCodes([]); setShowFilterForm(null);
    await loadFilters(configId);
  };

  const handleDeleteFilter = async (filterId: number, configId: number) => {
    await api.deleteFilter(filterId);
    await loadFilters(configId);
  };

  const toggleGeoCode = (code: string) =>
    setSelectedGeoCodes(prev => prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]);

  const formatWindow = (secs: number) => {
    if (secs < 60) return `${secs}s`;
    if (secs < 3600) return `${secs / 60}min`;
    if (secs < 86400) return `${secs / 3600}h`;
    return `${secs / 86400}d`;
  };

  const iS: React.CSSProperties = { width: '100%', padding: '0.575rem 0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'white', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s' };
  const focusBlue = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => e.target.style.borderColor = 'rgba(59,130,246,0.5)';
  const blurReset = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => e.target.style.borderColor = 'rgba(255,255,255,0.1)';

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.375rem' }}>
        <div>
          <h2 style={{ color: 'white', fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 2 }}>Rate Limit Konfigurationen</h2>
          <p style={{ color: 'rgba(255,255,255,0.32)', fontSize: '0.77rem' }}>
            {configs.length} Konfiguration{configs.length !== 1 ? 'en' : ''}{apiKeyName ? ` für „${apiKeyName}"` : ''}
          </p>
        </div>
        <button
          onClick={() => { setShowCreate(!showCreate); if (!showCreate) resetCreateForm(); }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: showCreate ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg,#3b82f6,#6366f1)', border: showCreate ? '1px solid rgba(255,255,255,0.1)' : 'none', borderRadius: 8, padding: '0.55rem 1.1rem', color: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: showCreate ? 'none' : '0 4px 16px -4px rgba(59,130,246,0.5)' }}
        >
          {showCreate ? '✕ Abbrechen' : '+ Neue Konfiguration'}
        </button>
      </div>

      {/* ── Create form ── */}
      {showCreate && (
        <div style={{ marginBottom: '1.25rem', borderRadius: 14, background: 'rgba(14,22,36,0.9)', border: '1px solid rgba(255,255,255,0.09)', padding: '1.375rem', animation: 'slideDown 0.25s cubic-bezier(0.16,1,0.3,1)' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: '1.125rem', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Neue Rate Limit Konfiguration</div>
          <form onSubmit={handleCreate}>

            {/* Row 1: Name + Endpoint */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr', gap: '0.875rem', marginBottom: '0.875rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>Name</label>
                <input value={configName} onChange={e => setConfigName(e.target.value)} placeholder="z.B. Global Limit" required style={iS} onFocus={focusBlue} onBlur={blurReset} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
                  Endpoint Pattern <span style={{ color: 'rgba(255,255,255,0.2)', fontWeight: 400, textTransform: 'none' }}>(optional — leer = global)</span>
                </label>
                <input value={endpointPattern} onChange={e => setEndpointPattern(e.target.value)} placeholder="z.B. /api/login oder /api/*" style={iS} onFocus={focusBlue} onBlur={blurReset} />
              </div>
            </div>

            {/* Row 2: Max + Window */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.875rem', marginBottom: '0.875rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>Max. Requests</label>
                <input type="number" value={maxRequests} onChange={e => setMaxRequests(e.target.value)} required style={iS} onFocus={focusBlue} onBlur={blurReset} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>Zeitfenster</label>
                <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                  {WINDOW_PRESETS.map(p => (
                    <button key={p.value} type="button" onClick={() => setWindowSeconds(String(p.value))} style={{ padding: '3px 8px', borderRadius: 5, border: '1px solid', fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', background: windowSeconds === String(p.value) ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.04)', borderColor: windowSeconds === String(p.value) ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.1)', color: windowSeconds === String(p.value) ? '#60a5fa' : 'rgba(255,255,255,0.45)' }}>
                      {p.label}
                    </button>
                  ))}
                </div>
                <input type="number" value={windowSeconds} onChange={e => setWindowSeconds(e.target.value)} placeholder="Sekunden" style={{ ...iS, fontSize: '0.82rem' }} onFocus={focusBlue} onBlur={blurReset} />
              </div>
            </div>

            {/* Row 3: Algorithm */}
            <div style={{ marginBottom: '1rem' }}>
              <AlgoSelector
                value={algorithm} onChange={setAlgorithm}
                burstSize={burstSize} refillRate={refillRate}
                onBurstChange={setBurstSize} onRefillChange={setRefillRate}
                maxRequests={maxRequests} windowSeconds={windowSeconds}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.625rem' }}>
              <button type="submit" style={{ padding: '0.55rem 1.25rem', borderRadius: 8, background: 'linear-gradient(135deg,#3b82f6,#6366f1)', border: 'none', color: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 4px 16px -4px rgba(59,130,246,0.4)' }}>Erstellen</button>
              <button type="button" onClick={() => setShowCreate(false)} style={{ padding: '0.55rem 0.875rem', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.5)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>Abbrechen</button>
            </div>
          </form>
        </div>
      )}

      {/* ── Config list ── */}
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
          {configs.map((config) => {
            const isExpanded = expandedConfig === config.id;
            const isEditing = editingConfig === config.id;
            const isEnabled = config.enabled === 1 || config.enabled === true;
            const cfgFilters = filters[config.id] || [];
            const whitelistEntries = cfgFilters.filter(f => f.rule_type === 'ip_whitelist');
            const blockEntries = cfgFilters.filter(f => f.rule_type !== 'ip_whitelist');
            const algo = config.algorithm || 'sliding_window';
            const hasEndpoint = !!config.endpoint_pattern;

            return (
              <div key={config.id} style={{ borderRadius: 14, background: 'rgba(14,22,36,0.85)', border: `1px solid ${isEnabled ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)'}`, overflow: 'hidden', opacity: isEnabled ? 1 : 0.65, transition: 'opacity 0.2s, border-color 0.2s' }}>

                {/* Config header row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '1rem 1.25rem', flexWrap: 'wrap' }}>

                  {/* Toggle switch */}
                  <button onClick={() => handleToggle(config)} disabled={togglingId === config.id} title={isEnabled ? 'Deaktivieren' : 'Aktivieren'}
                    style={{ width: 36, height: 20, borderRadius: 10, background: isEnabled ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)', border: `1px solid ${isEnabled ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.15)'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0 3px', transition: 'all 0.2s', flexShrink: 0 }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: isEnabled ? '#34d399' : 'rgba(255,255,255,0.35)', transform: isEnabled ? 'translateX(16px)' : 'translateX(0)', transition: 'all 0.2s' }} />
                  </button>

                  {/* Name */}
                  <div style={{ flex: 1, minWidth: 140 }}>
                    {isEditing ? (
                      <input value={editName} onChange={e => setEditName(e.target.value)} style={{ ...iS, fontSize: '0.9rem', fontWeight: 700, padding: '0.35rem 0.6rem' }} onFocus={focusBlue} onBlur={blurReset} autoFocus />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <span style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem' }}>{config.name}</span>
                        {!isEnabled && <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>Inaktiv</span>}
                        <AlgoBadge algo={algo} />
                        {hasEndpoint && (
                          <span style={{ padding: '2px 7px', borderRadius: 5, fontSize: '0.65rem', fontWeight: 700, background: 'rgba(16,185,129,0.08)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.18)', fontFamily: 'monospace' }}>
                            📍 {config.endpoint_pattern}
                          </span>
                        )}
                        {algo === 'token_bucket' && config.burst_size && (
                          <span style={{ padding: '2px 7px', borderRadius: 5, fontSize: '0.65rem', fontWeight: 600, background: 'rgba(245,158,11,0.07)', color: 'rgba(251,191,36,0.7)', border: '1px solid rgba(245,158,11,0.15)' }}>
                            burst: {config.burst_size} · {config.refill_rate}/s
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Rate display or edit fields */}
                  {isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: 320 }}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input type="number" value={editMax} onChange={e => setEditMax(e.target.value)} style={{ ...iS, width: 90, fontSize: '0.82rem' }} placeholder="Max Req" onFocus={focusBlue} onBlur={blurReset} />
                        <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
                        <input type="number" value={editWindow} onChange={e => setEditWindow(e.target.value)} style={{ ...iS, width: 100, fontSize: '0.82rem' }} placeholder="Sekunden" onFocus={focusBlue} onBlur={blurReset} />
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          {WINDOW_PRESETS.map(p => (
                            <button key={p.value} type="button" onClick={() => setEditWindow(String(p.value))} style={{ padding: '2px 6px', borderRadius: 5, border: '1px solid', fontSize: '0.62rem', fontWeight: 700, cursor: 'pointer', background: editWindow === String(p.value) ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.04)', borderColor: editWindow === String(p.value) ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.1)', color: editWindow === String(p.value) ? '#60a5fa' : 'rgba(255,255,255,0.4)' }}>{p.label}</button>
                          ))}
                        </div>
                      </div>

                      {/* Advanced edit toggle */}
                      <button type="button" onClick={() => setShowEditAdvanced(!showEditAdvanced)}
                        style={{ alignSelf: 'flex-start', padding: '2px 8px', borderRadius: 5, border: '1px solid rgba(255,255,255,0.1)', background: 'none', color: 'rgba(255,255,255,0.35)', fontSize: '0.68rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                        {showEditAdvanced ? '▲' : '▼'} Algorithmus & Endpoint
                      </button>

                      {showEditAdvanced && (
                        <div style={{ padding: '0.75rem', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                          <div style={{ marginBottom: '0.625rem' }}>
                            <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>Endpoint Pattern</label>
                            <input value={editEndpoint} onChange={e => setEditEndpoint(e.target.value)} placeholder="leer = global" style={{ ...iS, fontSize: '0.8rem' }} onFocus={focusBlue} onBlur={blurReset} />
                          </div>
                          <AlgoSelector
                            value={editAlgorithm} onChange={setEditAlgorithm}
                            burstSize={editBurst} refillRate={editRefill}
                            onBurstChange={setEditBurst} onRefillChange={setEditRefill}
                            maxRequests={editMax} windowSeconds={editWindow}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center', flexShrink: 0 }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#60a5fa', letterSpacing: '-0.02em' }}>{config.max_requests.toLocaleString('de-DE')}</div>
                        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', fontWeight: 700 }}>Req</div>
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.2)' }}>/</div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#a78bfa', letterSpacing: '-0.02em' }}>{formatWindow(config.window_seconds)}</div>
                        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', fontWeight: 700 }}>Fenster</div>
                      </div>
                      {whitelistEntries.length > 0 && (
                        <span style={{ padding: '2px 7px', borderRadius: 5, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.22)', color: '#34d399', fontSize: '0.65rem', fontWeight: 700 }}>✅ {whitelistEntries.length}</span>
                      )}
                      {blockEntries.length > 0 && (
                        <span style={{ padding: '2px 7px', borderRadius: 5, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#fbbf24', fontSize: '0.65rem', fontWeight: 700 }}>🛡 {blockEntries.length}</span>
                      )}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0, alignItems: 'center' }}>
                    {isEditing ? (
                      <>
                        <button onClick={() => handleSaveEdit(config.id)} disabled={editSaving} style={{ padding: '0.38rem 0.875rem', borderRadius: 7, border: 'none', background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: 'white', fontWeight: 700, fontSize: '0.78rem', cursor: editSaving ? 'wait' : 'pointer' }}>{editSaving ? 'Speichern…' : '✓ OK'}</button>
                        <button onClick={() => setEditingConfig(null)} style={{ padding: '0.38rem 0.7rem', borderRadius: 7, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}>✕</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(config)} title="Bearbeiten" style={{ padding: '0.38rem 0.55rem', borderRadius: 7, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.15s' }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.09)'; (e.currentTarget as HTMLElement).style.color = 'white'; }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)'; }}>✏️</button>
                        <button onClick={() => setExpandedConfig(isExpanded ? null : config.id)} style={{ padding: '0.38rem 0.7rem', borderRadius: 7, border: `1px solid ${isExpanded ? 'rgba(59,130,246,0.35)' : 'rgba(59,130,246,0.2)'}`, background: isExpanded ? 'rgba(59,130,246,0.14)' : 'rgba(59,130,246,0.07)', color: '#60a5fa', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}>
                          Filter {isExpanded ? '▲' : '▼'}
                        </button>
                        {confirmDelete === config.id ? (
                          <>
                            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>Löschen?</span>
                            <button onClick={() => handleDelete(config.id)} disabled={deletingId === config.id} style={{ padding: '0.38rem 0.55rem', borderRadius: 6, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.12)', color: '#f87171', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>{deletingId === config.id ? '…' : 'Ja'}</button>
                            <button onClick={() => setConfirmDelete(null)} style={{ padding: '0.38rem 0.55rem', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>Nein</button>
                          </>
                        ) : (
                          <button onClick={() => setConfirmDelete(config.id)} style={{ padding: '0.38rem 0.5rem', borderRadius: 7, border: '1px solid rgba(239,68,68,0.14)', background: 'rgba(239,68,68,0.06)', color: '#f87171', fontSize: '0.78rem', cursor: 'pointer', opacity: 0.7, transition: 'all 0.15s' }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.14)'; }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0.7'; (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.06)'; }}>🗑</button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* ── Filter panel ── */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', animation: 'slideDown 0.2s cubic-bezier(0.16,1,0.3,1)' }}>

                    {/* Whitelist */}
                    <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(16,185,129,0.03)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: whitelistEntries.length > 0 ? '0.625rem' : 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span>✅</span>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#34d399' }}>IP Whitelist</span>
                          <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.25)' }}>— Immer erlaubt, auch bei 429</span>
                        </div>
                        <button onClick={() => { setRuleType('ip_whitelist'); setAction('allow'); setShowFilterForm(showFilterForm === config.id ? null : config.id); }}
                          style={{ padding: '0.28rem 0.65rem', borderRadius: 6, border: '1px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.08)', color: '#34d399', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>
                          + IP hinzufügen
                        </button>
                      </div>
                      {whitelistEntries.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                          {whitelistEntries.map(f => (
                            <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.4rem 0.7rem', borderRadius: 7, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', flexShrink: 0 }} />
                              <code style={{ flex: 1, fontSize: '0.82rem', color: '#6ee7b7', fontFamily: 'monospace' }}>{f.rule_value}</code>
                              <button onClick={() => handleDeleteFilter(f.id, config.id)} style={{ padding: '2px 6px', borderRadius: 4, border: '1px solid rgba(239,68,68,0.15)', background: 'rgba(239,68,68,0.06)', color: '#f87171', fontSize: '0.65rem', cursor: 'pointer', opacity: 0.6 }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '1'} onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '0.6'}>✕</button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.18)', fontStyle: 'italic' }}>Keine whitelisteten IPs</div>
                      )}
                    </div>

                    {/* Block + Geo rules */}
                    <div style={{ padding: '0.875rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>🛡 Block- & Geo-Regeln</span>
                        <button onClick={() => { setRuleType('ip_blacklist'); setAction('block'); setShowFilterForm(showFilterForm === config.id ? null : config.id); }}
                          style={{ padding: '0.33rem 0.7rem', borderRadius: 7, border: '1px solid rgba(59,130,246,0.25)', background: 'rgba(59,130,246,0.07)', color: '#60a5fa', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>
                          + Regel hinzufügen
                        </button>
                      </div>

                      {/* Filter form */}
                      {showFilterForm === config.id && (
                        <form onSubmit={e => handleCreateFilter(e, config.id)} style={{ marginBottom: '0.875rem', padding: '1rem', background: 'rgba(59,130,246,0.05)', borderRadius: 10, border: '1px solid rgba(59,130,246,0.12)', animation: 'slideDown 0.2s ease' }}>
                          <div style={{ marginBottom: '0.875rem' }}>
                            <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Regeltyp</label>
                            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                              {Object.entries(RULE_TYPE_META).map(([key, meta]) => (
                                <button key={key} type="button" onClick={() => { setRuleType(key); setSelectedGeoCodes([]); setRuleValue(''); }}
                                  style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.33rem 0.7rem', borderRadius: 7, border: '1px solid', fontSize: '0.75rem', fontWeight: ruleType === key ? 700 : 400, cursor: 'pointer', transition: 'all 0.15s', background: ruleType === key ? 'rgba(59,130,246,0.18)' : 'rgba(255,255,255,0.04)', borderColor: ruleType === key ? 'rgba(59,130,246,0.45)' : 'rgba(255,255,255,0.1)', color: ruleType === key ? '#93c5fd' : 'rgba(255,255,255,0.5)' }}>
                                  {meta.icon} {meta.label}
                                </button>
                              ))}
                            </div>
                            <div style={{ marginTop: '0.35rem', fontSize: '0.67rem', color: 'rgba(255,255,255,0.28)' }}>{RULE_TYPE_META[ruleType]?.hint}</div>
                          </div>

                          {ruleType === 'geo_country' ? (
                            <div style={{ marginBottom: '0.875rem' }}>
                              <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
                                Länder {selectedGeoCodes.length > 0 && <span style={{ color: '#c4b5fd' }}>({selectedGeoCodes.length} ausgewählt)</span>}
                              </label>
                              <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                                {GEO_PRESETS.map(g => {
                                  const sel = selectedGeoCodes.includes(g.code);
                                  return <button key={g.code} type="button" onClick={() => toggleGeoCode(g.code)} style={{ padding: '3px 9px', borderRadius: 6, border: '1px solid', fontSize: '0.7rem', fontWeight: sel ? 700 : 400, cursor: 'pointer', transition: 'all 0.15s', background: sel ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.04)', borderColor: sel ? 'rgba(139,92,246,0.45)' : 'rgba(255,255,255,0.1)', color: sel ? '#c4b5fd' : 'rgba(255,255,255,0.5)' }}>{g.label}</button>;
                                })}
                              </div>
                              <input value={ruleValue} onChange={e => { setRuleValue(e.target.value); setSelectedGeoCodes(e.target.value.split(',').map(s => s.trim().toUpperCase()).filter(s => s.length === 2)); }} placeholder="Oder manuell: DE, AT, CH" style={{ ...iS, fontSize: '0.82rem' }} onFocus={e => e.target.style.borderColor = 'rgba(139,92,246,0.5)'} onBlur={blurReset} />
                              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                                {[{ val: 'block', label: '🚫 Diese Länder blockieren', col: '#f87171', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.35)' }, { val: 'allow', label: '✅ Nur diese erlauben', col: '#34d399', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.35)' }].map(opt => (
                                  <button key={opt.val} type="button" onClick={() => setAction(opt.val)} style={{ flex: 1, padding: '0.4rem 0.6rem', borderRadius: 7, border: '1px solid', fontSize: '0.72rem', fontWeight: action === opt.val ? 700 : 400, cursor: 'pointer', background: action === opt.val ? opt.bg : 'rgba(255,255,255,0.03)', borderColor: action === opt.val ? opt.border : 'rgba(255,255,255,0.1)', color: action === opt.val ? opt.col : 'rgba(255,255,255,0.4)', textAlign: 'left' }}>{opt.label}</button>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div style={{ marginBottom: '0.875rem' }}>
                              <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>Wert</label>
                              <input value={ruleValue} onChange={e => setRuleValue(e.target.value)} placeholder={RULE_TYPE_META[ruleType]?.placeholder ?? ''} required style={{ ...iS, fontSize: '0.82rem' }} onFocus={focusBlue} onBlur={blurReset} />
                            </div>
                          )}

                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button type="submit" disabled={ruleType === 'geo_country' ? selectedGeoCodes.length === 0 && !ruleValue.trim() : !ruleValue.trim()} style={{ padding: '0.425rem 1rem', borderRadius: 7, border: 'none', background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: 'white', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', opacity: (ruleType === 'geo_country' ? selectedGeoCodes.length === 0 && !ruleValue.trim() : !ruleValue.trim()) ? 0.45 : 1 }}>Hinzufügen</button>
                            <button type="button" onClick={() => { setShowFilterForm(null); setSelectedGeoCodes([]); setRuleValue(''); }} style={{ padding: '0.425rem 0.75rem', borderRadius: 7, border: '1px solid rgba(255,255,255,0.09)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}>Abbrechen</button>
                          </div>
                        </form>
                      )}

                      {/* Block filter list */}
                      {blockEntries.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          {blockEntries.map(f => (
                            <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.875rem', borderRadius: 8, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
                              <FilterTypeBadge type={f.rule_type} />
                              <code style={{ flex: 1, fontSize: '0.8rem', color: 'rgba(255,255,255,0.65)', fontFamily: 'monospace', background: 'rgba(0,0,0,0.2)', padding: '2px 7px', borderRadius: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {f.rule_type === 'geo_country' ? f.rule_value.split(',').map((c: string) => c.trim()).join(' · ') : f.rule_value}
                              </code>
                              <span style={{ padding: '2px 7px', borderRadius: 5, fontSize: '0.65rem', fontWeight: 700, background: f.action === 'block' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', color: f.action === 'block' ? '#f87171' : '#34d399', border: `1px solid ${f.action === 'block' ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`, flexShrink: 0 }}>
                                {f.action === 'block' ? '🚫 Block' : '✅ Allow'}
                              </span>
                              <button onClick={() => handleDeleteFilter(f.id, config.id)} style={{ padding: '3px 7px', borderRadius: 5, border: '1px solid rgba(239,68,68,0.15)', background: 'rgba(239,68,68,0.06)', color: '#f87171', fontSize: '0.7rem', cursor: 'pointer', opacity: 0.7 }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '1'} onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '0.7'}>🗑</button>
                            </div>
                          ))}
                        </div>
                      ) : showFilterForm !== config.id && (
                        <div style={{ textAlign: 'center', padding: '1rem', color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem', border: '1px dashed rgba(255,255,255,0.07)', borderRadius: 8 }}>Keine Block-Regeln</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Info box ── */}
      <div style={{ marginTop: '2rem', padding: '1.125rem 1.375rem', borderRadius: 12, background: 'rgba(14,22,36,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.625rem' }}>📬 Rate Limit Headers</div>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          {[['X-RateLimit-Limit','Max. Requests im Fenster'],['X-RateLimit-Remaining','Verbleibende Requests'],['X-RateLimit-Reset','Reset-Zeitpunkt (Unix)'],['Retry-After','Wartezeit bei 429'],['X-RateLimit-Algorithm','Aktiver Algorithmus']].map(([h, d]) => (
            <div key={h}>
              <code style={{ fontSize: '0.72rem', color: '#60a5fa', fontFamily: 'monospace', display: 'block', marginBottom: 2 }}>{h}</code>
              <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.28)' }}>{d}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes slideDown { from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:0.5}50%{opacity:0.25} }
        select option { background: #0c1525; color: white; }
      `}</style>
    </div>
  );
}
