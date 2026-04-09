import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

interface AutoBlockTabProps {
  apiKeyId: number | null;
  apiKeyName: string;
  isPro: boolean;
  onUpgrade: () => void;
}

// ── Time helpers ──────────────────────────────────────────────────────────────

function timeUntil(isoDate: string): string {
  const diff = new Date(isoDate).getTime() - Date.now();
  if (diff <= 0) return 'Abgelaufen';
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  if (h > 0) return `noch ${h}h ${m % 60}m`;
  return `noch ${m}m`;
}

function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'gerade eben';
  if (m < 60) return `vor ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `vor ${h}h`;
  return `vor ${Math.floor(h / 24)}d`;
}

// ── Preset configs ────────────────────────────────────────────────────────────

const PRESETS = [
  { label: 'Entspannt', icon: '🌿', threshold: 20, window: 10, duration: 15,  desc: '20 Verstöße in 10 Min → 15 Min gesperrt' },
  { label: 'Standard',  icon: '🛡',  threshold: 10, window: 5,  duration: 30,  desc: '10 Verstöße in 5 Min → 30 Min gesperrt' },
  { label: 'Streng',    icon: '🔒', threshold: 5,  window: 2,  duration: 60,  desc: '5 Verstöße in 2 Min → 1h gesperrt' },
  { label: 'Null-Toleranz', icon: '🚨', threshold: 3, window: 1, duration: 1440, desc: '3 Verstöße in 1 Min → 24h gesperrt' },
];

const DURATION_PRESETS = [
  { label: '15 Min',  value: 15 },
  { label: '30 Min',  value: 30 },
  { label: '1 Std',   value: 60 },
  { label: '6 Std',   value: 360 },
  { label: '24 Std',  value: 1440 },
];

// ── Main component ────────────────────────────────────────────────────────────

export function AutoBlockTab({ apiKeyId, apiKeyName, isPro, onUpgrade }: AutoBlockTabProps) {
  const [settings, setSettings] = useState<any>(null);
  const [blocked, setBlocked] = useState<any[]>([]);
  const [violations, setViolations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [migrationRequired, setMigrationRequired] = useState(false);

  // Form state
  const [enabled, setEnabled] = useState(false);
  const [threshold, setThreshold] = useState('10');
  const [windowMin, setWindowMin] = useState('5');
  const [blockDuration, setBlockDuration] = useState('30');

  // Manual block
  const [manualIp, setManualIp] = useState('');
  const [manualDuration, setManualDuration] = useState('60');
  const [manualBlocking, setManualBlocking] = useState(false);

  const iS: React.CSSProperties = { width: '100%', padding: '0.55rem 0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'white', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s' };

  const load = useCallback(async () => {
    if (!apiKeyId || !isPro) return;
    setLoading(true);
    const [settingsRes, blockedRes] = await Promise.all([
      api.getAutoBlockSettings(apiKeyId),
      api.getBlockedIPs(apiKeyId),
    ]);
    if (settingsRes.data?.migrationRequired) {
      setMigrationRequired(true);
    } else if (settingsRes.data?.settings) {
      const s = settingsRes.data.settings;
      setSettings(s);
      setEnabled(!!s.enabled);
      setThreshold(String(s.violations_threshold ?? 10));
      setWindowMin(String(s.violations_window_minutes ?? 5));
      setBlockDuration(String(s.block_duration_minutes ?? 30));
    }
    if (blockedRes.data) {
      setBlocked(blockedRes.data.blocked || []);
      setViolations(blockedRes.data.violations || []);
    }
    setLoading(false);
  }, [apiKeyId, isPro]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!apiKeyId) return;
    setSaving(true); setSaveMsg(null);
    const { error } = await api.saveAutoBlockSettings(apiKeyId, {
      enabled,
      violations_threshold: parseInt(threshold),
      violations_window_minutes: parseInt(windowMin),
      block_duration_minutes: parseInt(blockDuration),
    });
    if (error) setSaveMsg({ ok: false, text: error });
    else { setSaveMsg({ ok: true, text: 'Einstellungen gespeichert ✓' }); setTimeout(() => setSaveMsg(null), 3000); }
    setSaving(false);
  };

  const unblock = async (ip: string) => {
    if (!apiKeyId) return;
    await api.unblockIP(apiKeyId, ip);
    await load();
  };

  const handleManualBlock = async () => {
    if (!apiKeyId || !manualIp.trim()) return;
    setManualBlocking(true);
    const { error } = await api.manualBlockIP(apiKeyId, manualIp.trim(), parseInt(manualDuration));
    if (!error) { setManualIp(''); await load(); }
    setManualBlocking(false);
  };

  const clearExpired = async () => {
    if (!apiKeyId) return;
    await api.clearExpiredBlocks(apiKeyId);
    await load();
  };

  const applyPreset = (p: typeof PRESETS[0]) => {
    setThreshold(String(p.threshold));
    setWindowMin(String(p.window));
    setBlockDuration(String(p.duration));
  };

  // ── Pro gate ──────────────────────────────────────────────────────────────

  if (!isPro) {
    return (
      <div style={{ maxWidth: 640, margin: '2rem auto', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', fontSize: '1.6rem' }}>🛡</div>
        <h2 style={{ color: 'white', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Auto IP Blocking</h2>
        <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: '1.5rem', maxWidth: 440, margin: '0 auto 1.5rem' }}>
          Blockiert automatisch IPs die wiederholt dein Rate Limit verletzen. Kein manuelles Eingreifen — die Engine erledigt das selbst.
        </p>
        <button onClick={onUpgrade} style={{ background: 'linear-gradient(135deg,#7c3aed,#8b5cf6)', color: 'white', border: 'none', borderRadius: 10, padding: '0.65rem 2rem', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 24px -6px rgba(139,92,246,0.5)' }}>
          Pro freischalten – €4,99/Mo
        </button>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.75rem', marginTop: '2rem' }}>
          {[
            { icon: '⚡', t: 'Automatisch', d: 'Keine manuelle Aktion nötig' },
            { icon: '⚙️', t: 'Konfigurierbar', d: 'Threshold, Fenster & Dauer' },
            { icon: '🔓', t: '1-Klick Unblock', d: 'IPs sofort entsperren' },
          ].map(f => (
            <div key={f.t} style={{ padding: '0.875rem', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.12)', borderRadius: 10, textAlign: 'left' }}>
              <div style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>{f.icon}</div>
              <div style={{ fontSize: '0.77rem', fontWeight: 700, color: 'rgba(255,255,255,0.75)', marginBottom: 3 }}>{f.t}</div>
              <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', lineHeight: 1.5 }}>{f.d}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── No key selected ───────────────────────────────────────────────────────

  if (!apiKeyId) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320, gap: '0.875rem', color: 'rgba(255,255,255,0.25)', fontSize: '0.875rem' }}>
        <span style={{ fontSize: '2rem' }}>🛡</span>
        <span>Wähle einen API Key um Auto-Block zu konfigurieren.</span>
      </div>
    );
  }

  // ── Migration required ────────────────────────────────────────────────────

  if (migrationRequired) {
    return (
      <div style={{ maxWidth: 600 }}>
        <div style={{ padding: '1.25rem 1.375rem', borderRadius: 14, background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fbbf24', marginBottom: '0.5rem' }}>⚠️ DB-Migration erforderlich</div>
          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, marginBottom: '0.875rem' }}>
            Die Auto-Block Tabellen fehlen in der Produktionsdatenbank. Führe diese Befehle im Terminal aus:
          </p>
          <pre style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '0.875rem', fontSize: '0.72rem', color: '#93c5fd', fontFamily: 'monospace', overflowX: 'auto', lineHeight: 1.7 }}>{`npx wrangler d1 execute ratelimit-db --remote --command "CREATE TABLE IF NOT EXISTS ip_violations (id INTEGER PRIMARY KEY AUTOINCREMENT, api_key_id INTEGER NOT NULL, ip_address TEXT NOT NULL, violation_count INTEGER DEFAULT 1, last_violation DATETIME DEFAULT CURRENT_TIMESTAMP, auto_blocked_until DATETIME DEFAULT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, UNIQUE(api_key_id, ip_address), FOREIGN KEY (api_key_id) REFERENCES api_keys(id) ON DELETE CASCADE)"

npx wrangler d1 execute ratelimit-db --remote --command "CREATE TABLE IF NOT EXISTS auto_block_settings (id INTEGER PRIMARY KEY AUTOINCREMENT, api_key_id INTEGER NOT NULL UNIQUE, enabled INTEGER DEFAULT 0, violations_threshold INTEGER DEFAULT 10, violations_window_minutes INTEGER DEFAULT 5, block_duration_minutes INTEGER DEFAULT 30, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (api_key_id) REFERENCES api_keys(id) ON DELETE CASCADE)"

npx wrangler d1 execute ratelimit-db --remote --command "CREATE INDEX IF NOT EXISTS idx_ip_violations_key_ip ON ip_violations(api_key_id, ip_address)"`}</pre>
          <button onClick={load} style={{ marginTop: '0.75rem', padding: '0.45rem 1rem', borderRadius: 7, border: '1px solid rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.1)', color: '#fbbf24', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
            Erneut prüfen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 860 }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
            <h2 style={{ color: 'white', fontSize: '1.025rem', fontWeight: 700, margin: 0 }}>Auto IP Blocking</h2>
            <span style={{ fontSize: '0.58rem', fontWeight: 800, color: '#a78bfa', background: 'rgba(139,92,246,0.14)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 4, padding: '1px 5px', letterSpacing: '0.04em' }}>PRO</span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.32)', fontSize: '0.8rem', margin: 0 }}>
            Automatische Sperrung für <strong style={{ color: 'rgba(255,255,255,0.6)' }}>„{apiKeyName}"</strong> — IPs die wiederholt dein Limit verletzen werden temporär gesperrt.
          </p>
        </div>
        <button onClick={load} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 1rem', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, opacity: loading ? 0.5 : 1 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}>
            <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          Aktualisieren
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

        {/* ── Left: Config ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Enable toggle card */}
          <div style={{ padding: '1.125rem 1.25rem', borderRadius: 14, background: enabled ? 'rgba(239,68,68,0.07)' : 'rgba(14,22,36,0.85)', border: `1px solid ${enabled ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.07)'}`, transition: 'all 0.25s' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'white', marginBottom: 2 }}>Auto-Block</div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>
                  {enabled ? '🔴 Aktiv — IPs werden automatisch gesperrt' : '⚫ Deaktiviert'}
                </div>
              </div>
              <button
                onClick={() => setEnabled(!enabled)}
                style={{ width: 44, height: 24, borderRadius: 12, background: enabled ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)', border: `1px solid ${enabled ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.15)'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0 4px', transition: 'all 0.2s', flexShrink: 0 }}
              >
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: enabled ? '#f87171' : 'rgba(255,255,255,0.35)', transform: enabled ? 'translateX(20px)' : 'translateX(0)', transition: 'all 0.2s' }} />
              </button>
            </div>
          </div>

          {/* Presets */}
          <div style={{ padding: '1rem 1.25rem', borderRadius: 14, background: 'rgba(14,22,36,0.85)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.75rem' }}>Schnell-Presets</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
              {PRESETS.map(p => (
                <button key={p.label} onClick={() => applyPreset(p)}
                  style={{ padding: '0.55rem 0.75rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.09)', background: 'rgba(255,255,255,0.03)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.15)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.09)'; }}
                >
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.8)', marginBottom: 2 }}>{p.icon} {p.label}</div>
                  <div style={{ fontSize: '0.63rem', color: 'rgba(255,255,255,0.28)', lineHeight: 1.4 }}>{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Config fields */}
          <div style={{ padding: '1rem 1.25rem', borderRadius: 14, background: 'rgba(14,22,36,0.85)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.875rem' }}>Konfiguration</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>
                  Verstöße bis Block <span style={{ padding: '1px 6px', borderRadius: 4, background: 'rgba(239,68,68,0.12)', color: '#f87171', marginLeft: 4 }}>{threshold}×</span>
                </label>
                <input type="number" min="1" max="100" value={threshold} onChange={e => setThreshold(e.target.value)} style={iS} onFocus={e => e.target.style.borderColor = 'rgba(239,68,68,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>
                  Beobachtungsfenster <span style={{ padding: '1px 6px', borderRadius: 4, background: 'rgba(245,158,11,0.12)', color: '#fbbf24', marginLeft: 4 }}>{windowMin} Min</span>
                </label>
                <input type="number" min="1" max="60" value={windowMin} onChange={e => setWindowMin(e.target.value)} style={iS} onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>
                  Block-Dauer
                </label>
                <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                  {DURATION_PRESETS.map(p => (
                    <button key={p.value} type="button" onClick={() => setBlockDuration(String(p.value))}
                      style={{ padding: '3px 8px', borderRadius: 5, border: '1px solid', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.12s', background: blockDuration === String(p.value) ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.04)', borderColor: blockDuration === String(p.value) ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.1)', color: blockDuration === String(p.value) ? '#60a5fa' : 'rgba(255,255,255,0.45)' }}>
                      {p.label}
                    </button>
                  ))}
                </div>
                <input type="number" min="1" value={blockDuration} onChange={e => setBlockDuration(e.target.value)} style={{ ...iS, fontSize: '0.82rem' }} placeholder="Minuten" onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
              </div>

              {/* Summary banner */}
              <div style={{ padding: '0.625rem 0.875rem', borderRadius: 8, background: enabled ? 'rgba(239,68,68,0.07)' : 'rgba(255,255,255,0.03)', border: `1px solid ${enabled ? 'rgba(239,68,68,0.18)' : 'rgba(255,255,255,0.06)'}`, fontSize: '0.77rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                {enabled
                  ? <>Nach <strong style={{ color: '#f87171' }}>{threshold} Verstößen</strong> in <strong style={{ color: '#fbbf24' }}>{windowMin} Min</strong> wird die IP für <strong style={{ color: '#60a5fa' }}>{parseInt(blockDuration) >= 60 ? `${Math.round(parseInt(blockDuration) / 60)}h` : `${blockDuration} Min`}</strong> gesperrt.</>
                  : 'Auto-Block ist deaktiviert. Aktiviere es oben um die Regel anzuwenden.'}
              </div>

              {saveMsg && (
                <div style={{ padding: '0.5rem 0.75rem', borderRadius: 7, background: saveMsg.ok ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${saveMsg.ok ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`, color: saveMsg.ok ? '#34d399' : '#f87171', fontSize: '0.78rem', fontWeight: 600 }}>
                  {saveMsg.text}
                </div>
              )}

              <button onClick={save} disabled={saving} style={{ padding: '0.55rem', borderRadius: 8, background: 'linear-gradient(135deg,#3b82f6,#6366f1)', border: 'none', color: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.7 : 1, boxShadow: '0 4px 16px -4px rgba(59,130,246,0.4)' }}>
                {saving ? 'Speichern…' : '✓ Einstellungen speichern'}
              </button>
            </div>
          </div>
        </div>

        {/* ── Right: Blocked IPs + Violations ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Manual block */}
          <div style={{ padding: '1rem 1.25rem', borderRadius: 14, background: 'rgba(14,22,36,0.85)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.75rem' }}>🚫 IP manuell sperren</div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input
                value={manualIp}
                onChange={e => setManualIp(e.target.value)}
                placeholder="192.168.1.1"
                style={{ ...iS, flex: 1, fontSize: '0.82rem' }}
                onFocus={e => e.target.style.borderColor = 'rgba(239,68,68,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                onKeyDown={e => { if (e.key === 'Enter') handleManualBlock(); }}
              />
              <select value={manualDuration} onChange={e => setManualDuration(e.target.value)} style={{ ...iS, width: 'auto', fontSize: '0.78rem', cursor: 'pointer', flexShrink: 0 }}>
                {DURATION_PRESETS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <button onClick={handleManualBlock} disabled={manualBlocking || !manualIp.trim()}
              style={{ width: '100%', padding: '0.45rem', borderRadius: 7, border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.1)', color: '#f87171', fontSize: '0.78rem', fontWeight: 700, cursor: !manualIp.trim() ? 'not-allowed' : 'pointer', opacity: !manualIp.trim() ? 0.45 : 1, transition: 'all 0.15s' }}
              onMouseEnter={e => { if (manualIp.trim()) (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.18)'; }}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'}
            >
              {manualBlocking ? 'Sperren…' : '🚫 IP jetzt sperren'}
            </button>
          </div>

          {/* Currently blocked */}
          <div style={{ padding: '1rem 1.25rem', borderRadius: 14, background: 'rgba(14,22,36,0.85)', border: `1px solid ${blocked.length > 0 ? 'rgba(239,68,68,0.18)' : 'rgba(255,255,255,0.07)'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>🔴 Aktuell gesperrt</div>
                {blocked.length > 0 && (
                  <span style={{ padding: '1px 6px', borderRadius: 4, background: 'rgba(239,68,68,0.15)', color: '#f87171', fontSize: '0.65rem', fontWeight: 700 }}>{blocked.length}</span>
                )}
              </div>
              {blocked.length > 0 && (
                <button onClick={clearExpired} style={{ padding: '2px 8px', borderRadius: 5, border: '1px solid rgba(255,255,255,0.09)', background: 'none', color: 'rgba(255,255,255,0.28)', fontSize: '0.65rem', cursor: 'pointer' }}>
                  Abgelaufene entfernen
                </button>
              )}
            </div>

            {blocked.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.25rem', color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem', border: '1px dashed rgba(255,255,255,0.07)', borderRadius: 8 }}>
                Keine IPs aktuell gesperrt
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: 220, overflowY: 'auto' }}>
                {blocked.map((b: any, i: number) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 0.75rem', borderRadius: 8, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f87171', flexShrink: 0, boxShadow: '0 0 6px rgba(248,113,113,0.5)', animation: 'pulse 2s ease-in-out infinite' }} />
                    <code style={{ flex: 1, fontSize: '0.8rem', color: '#fca5a5', fontFamily: 'monospace' }}>{b.ip_address}</code>
                    <span style={{ fontSize: '0.63rem', color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap' }}>{timeUntil(b.auto_blocked_until)}</span>
                    <button onClick={() => unblock(b.ip_address)} style={{ padding: '2px 8px', borderRadius: 5, border: '1px solid rgba(16,185,129,0.2)', background: 'rgba(16,185,129,0.07)', color: '#34d399', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
                      Freigeben
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Violation watch list */}
          {violations.length > 0 && (
            <div style={{ padding: '1rem 1.25rem', borderRadius: 14, background: 'rgba(14,22,36,0.85)', border: '1px solid rgba(245,158,11,0.15)' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.625rem' }}>
                ⚠️ Watchlist — letzte Stunde
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', maxHeight: 180, overflowY: 'auto' }}>
                {violations.map((v: any, i: number) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.7rem', borderRadius: 7, background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.1)' }}>
                    <code style={{ flex: 1, fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>{v.ip_address}</code>
                    <span style={{ padding: '1px 6px', borderRadius: 4, background: 'rgba(245,158,11,0.12)', color: '#fbbf24', fontSize: '0.65rem', fontWeight: 700, flexShrink: 0 }}>{v.violation_count}× Verstoß</span>
                    <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.28)', flexShrink: 0 }}>{timeAgo(v.last_violation)}</span>
                    <button onClick={() => { setManualIp(v.ip_address); }} style={{ padding: '2px 6px', borderRadius: 4, border: '1px solid rgba(239,68,68,0.18)', background: 'rgba(239,68,68,0.06)', color: '#f87171', fontSize: '0.62rem', cursor: 'pointer', flexShrink: 0 }}>
                      Block
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        select option { background: #0c1525; color: white; }
      `}</style>
    </div>
  );
}
