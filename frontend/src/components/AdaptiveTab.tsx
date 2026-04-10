import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

interface AdaptiveTabProps {
  apiKeyId: number | null;
  apiKeyName: string;
  isPro: boolean;
  onUpgrade: () => void;
}

interface Suggestion {
  configId: number;
  configName: string;
  endpointPattern: string;
  algorithm: string;
  currentLimit: number;
  suggestedMax: number | null;
  type: 'increase' | 'decrease' | 'ok';
  reason: string;
  canApply: boolean;
  stats: {
    avgRph: number;
    peakRph: number;
    blockRatePct: number;
    hoursAnalyzed: number;
    totalRequests: number;
  };
}

// ── Gauge mini component ──────────────────────────────────────────────────────

function MiniGauge({ pct, color }: { pct: number; color: string }) {
  const r = 22;
  const circumference = Math.PI * r;
  const dashOffset = circumference * (1 - Math.min(pct, 100) / 100);
  return (
    <svg width="56" height="32" viewBox="0 0 56 32">
      <path d={`M 4 28 A ${r} ${r} 0 0 1 52 28`} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" strokeLinecap="round" />
      <path
        d={`M 4 28 A ${r} ${r} 0 0 1 52 28`}
        fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.34,1.56,0.64,1)' }}
      />
      <text x="28" y="26" textAnchor="middle" fill="white" fontSize="9" fontWeight="700">{pct}%</text>
    </svg>
  );
}

// ── Change delta badge ────────────────────────────────────────────────────────

function DeltaBadge({ current, suggested }: { current: number; suggested: number }) {
  const diff = suggested - current;
  const pct = Math.round(Math.abs(diff / current) * 100);
  const up = diff > 0;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      padding: '2px 7px', borderRadius: 5, fontSize: '0.72rem', fontWeight: 700,
      background: up ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
      border: `1px solid ${up ? 'rgba(16,185,129,0.22)' : 'rgba(245,158,11,0.22)'}`,
      color: up ? '#34d399' : '#fbbf24',
    }}>
      {up ? '↑' : '↓'} {pct}%
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function AdaptiveTab({ apiKeyId, apiKeyName, isPro, onUpgrade }: AdaptiveTabProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState<number | null>(null);
  const [applyMsg, setApplyMsg] = useState<{ configId: number; ok: boolean; text: string } | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [autoApply, setAutoApply] = useState(() => localStorage.getItem(`adaptive_auto_${apiKeyId}`) === '1');
  const [autoApplyLog, setAutoApplyLog] = useState<string[]>([]);

  const load = useCallback(async () => {
    if (!apiKeyId || !isPro) return;
    setLoading(true); setError('');
    const { data, error: err } = await api.getAdaptiveSuggestions(apiKeyId);
    if (data?.suggestions) setSuggestions(data.suggestions);
    else setError(err || 'Fehler beim Laden');
    setLoading(false);
  }, [apiKeyId, isPro]);

  useEffect(() => { load(); }, [load]);

  // ── Auto-Apply: alle 30 Min neu analysieren und anwenden ──────────────────
  useEffect(() => {
    if (!autoApply || !apiKeyId || !isPro) return;
    localStorage.setItem(`adaptive_auto_${apiKeyId}`, '1');
    const interval = setInterval(async () => {
      const { data } = await api.getAdaptiveSuggestions(apiKeyId);
      if (!data?.suggestions) return;
      for (const s of data.suggestions) {
        if (s.canApply && s.suggestedMax !== null) {
          const { data: applyData } = await api.applyAdaptiveSuggestion(s.configId);
          if (applyData?.newLimit) {
            const msg = `[${new Date().toLocaleTimeString('de-DE')}] „${s.configName}“: ${s.currentLimit} → ${applyData.newLimit} Req`;
            setAutoApplyLog(prev => [msg, ...prev].slice(0, 10));
          }
        }
      }
      load();
    }, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [autoApply, apiKeyId, isPro, load]);

  const toggleAutoApply = (val: boolean) => {
    setAutoApply(val);
    if (!val) localStorage.removeItem(`adaptive_auto_${apiKeyId}`);
    else localStorage.setItem(`adaptive_auto_${apiKeyId}`, '1');
  };

  const apply = async (configId: number) => {
    setApplying(configId); setApplyMsg(null);
    const { data, error: err } = await api.applyAdaptiveSuggestion(configId);
    if (data?.newLimit) {
      setApplyMsg({ configId, ok: true, text: `✓ Limit angepasst auf ${data.newLimit.toLocaleString('de-DE')} Req` });
      await load();
    } else {
      setApplyMsg({ configId, ok: false, text: err || 'Fehler beim Anwenden' });
    }
    setApplying(null);
  };

  // ── Pro gate ──────────────────────────────────────────────────────────────

  if (!isPro) {
    return (
      <div style={{ maxWidth: 640, margin: '2rem auto', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', fontSize: '1.6rem' }}>🧠</div>
        <h2 style={{ color: 'white', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Self-Optimizing Rate Limits</h2>
        <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: '1.5rem', maxWidth: 440, margin: '0 auto 1.5rem' }}>
          Analysiert 7 Tage Traffic-Daten und schlägt automatisch bessere Limits vor.
          Erkennt zu enge Limits, Underuse und potenzielle Angriffe — und setzt die Korrektur auf Knopfdruck an.
        </p>
        <button onClick={onUpgrade} style={{ background: 'linear-gradient(135deg,#7c3aed,#8b5cf6)', color: 'white', border: 'none', borderRadius: 10, padding: '0.65rem 2rem', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 24px -6px rgba(139,92,246,0.5)' }}>
          Pro freischalten – €4,99/Mo
        </button>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.75rem', marginTop: '2rem' }}>
          {[
            { icon: '📊', t: 'Traffic Analyse', d: '7-Tage Auswertung von Peaks & Durchschnitt' },
            { icon: '🎯', t: 'Präzise Vorschläge', d: 'Empfehlungen mit Begründung & Stats' },
            { icon: '⚡', t: '1-Klick Apply', d: 'Suggestion sofort anwenden ohne Konfiguration' },
          ].map(f => (
            <div key={f.t} style={{ padding: '0.875rem', background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.12)', borderRadius: 10, textAlign: 'left' }}>
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
        <span style={{ fontSize: '2rem' }}>🎯</span>
        <span>Wähle einen API Key um Adaptive Suggestions zu sehen.</span>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 860 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
            <h2 style={{ color: 'white', fontSize: '1.025rem', fontWeight: 700, margin: 0 }}>Adaptive Rate Limits</h2>
            <span style={{ fontSize: '0.58rem', fontWeight: 800, color: '#a78bfa', background: 'rgba(139,92,246,0.14)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 4, padding: '1px 5px', letterSpacing: '0.04em' }}>PRO</span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.32)', fontSize: '0.8rem', margin: 0 }}>
            7-Tage Analyse für <strong style={{ color: 'rgba(255,255,255,0.6)' }}>„{apiKeyName}"</strong> — AI schlägt optimale Limits vor.
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 1rem', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.5)', cursor: loading ? 'wait' : 'pointer', fontSize: '0.78rem', fontWeight: 600, transition: 'all 0.15s', opacity: loading ? 0.5 : 1 }}
          onMouseEnter={e => { if (!loading) { (e.currentTarget as HTMLElement).style.color = 'white'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.18)'; } }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.09)'; }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}>
            <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          {loading ? 'Analysiere…' : 'Neu analysieren'}
        </button>

        {/* Auto-Apply Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.45rem 0.875rem', borderRadius: 8, background: autoApply ? 'rgba(16,185,129,0.07)' : 'rgba(255,255,255,0.03)', border: `1px solid ${autoApply ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.09)'}`, transition: 'all 0.2s' }}>
          <button
            onClick={() => toggleAutoApply(!autoApply)}
            style={{ width: 36, height: 20, borderRadius: 10, background: autoApply ? 'rgba(16,185,129,0.35)' : 'rgba(255,255,255,0.1)', border: `1px solid ${autoApply ? 'rgba(16,185,129,0.55)' : 'rgba(255,255,255,0.15)'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0 3px', transition: 'all 0.2s', flexShrink: 0 }}
          >
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: autoApply ? '#34d399' : 'rgba(255,255,255,0.35)', transform: autoApply ? 'translateX(16px)' : 'translateX(0)', transition: 'all 0.2s' }} />
          </button>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: autoApply ? '#34d399' : 'rgba(255,255,255,0.45)' }}>Auto-Optimize</div>
            <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.25)' }}>{autoApply ? 'Aktiv — alle 30 Min' : 'Manuell'}</div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: '0.875rem 1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, color: '#f87171', fontSize: '0.83rem', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && suggestions.length === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1, 2].map(i => (
            <div key={i} style={{ height: 110, borderRadius: 14, background: 'rgba(255,255,255,0.025)', animation: 'pulse 1.8s ease-in-out infinite' }} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && suggestions.length === 0 && !error && (
        <div style={{ textAlign: 'center', padding: '3rem 2rem', background: 'rgba(14,22,36,0.7)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14 }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.875rem' }}>📭</div>
          <h3 style={{ color: 'white', fontWeight: 700, fontSize: '0.975rem', marginBottom: '0.4rem' }}>Keine Konfigurationen gefunden</h3>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.82rem', lineHeight: 1.6 }}>
            Dieser API Key hat noch keine aktiven Rate Limit Konfigurationen.<br />
            Erstelle zuerst eine Konfiguration im „Konfiguration" Tab.
          </p>
        </div>
      )}

      {/* Suggestion cards */}
      {suggestions.map(s => {
        const isExpanded = expanded === s.configId;
        const hasChange = s.suggestedMax !== null && s.suggestedMax !== s.currentLimit;
        const msg = applyMsg?.configId === s.configId ? applyMsg : null;

        const typeColor = s.type === 'increase' ? '#34d399' : s.type === 'decrease' ? '#fbbf24' : '#60a5fa';
        const typeBg = s.type === 'increase' ? 'rgba(16,185,129,0.07)' : s.type === 'decrease' ? 'rgba(245,158,11,0.07)' : 'rgba(59,130,246,0.07)';
        const typeBorder = s.type === 'increase' ? 'rgba(16,185,129,0.18)' : s.type === 'decrease' ? 'rgba(245,158,11,0.18)' : 'rgba(59,130,246,0.18)';
        const typeLabel = s.type === 'increase' ? '↑ Limit erhöhen' : s.type === 'decrease' ? '↓ Limit senken' : '✓ Optimal';

        const blockColor = s.stats.blockRatePct > 30 ? '#f87171' : s.stats.blockRatePct > 10 ? '#fbbf24' : '#34d399';

        return (
          <div key={s.configId} style={{ marginBottom: '0.875rem', background: 'rgba(14,22,36,0.85)', border: `1px solid ${hasChange ? typeBorder : 'rgba(255,255,255,0.07)'}`, borderRadius: 14, overflow: 'hidden', transition: 'border-color 0.2s' }}>

            {/* Card header */}
            <div style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>

              {/* Status badge */}
              <div style={{ padding: '3px 10px', borderRadius: 6, background: typeBg, border: `1px solid ${typeBorder}`, color: typeColor, fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 }}>
                {typeLabel}
              </div>

              {/* Config name + endpoint */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'white', marginBottom: 2 }}>{s.configName}</div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.28)', fontFamily: 'monospace' }}>
                  {s.endpointPattern === 'global' ? '🌐 Global' : `📍 ${s.endpointPattern}`}
                  &nbsp;·&nbsp;
                  {s.algorithm === 'token_bucket' ? '🪣 Token Bucket' : '🪟 Sliding Window'}
                </div>
              </div>

              {/* Limit comparison */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.25)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Aktuell</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'rgba(255,255,255,0.6)' }}>{s.currentLimit.toLocaleString('de-DE')}</div>
                </div>
                {hasChange && s.suggestedMax !== null && (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={typeColor} strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.25)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Empfohlen</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: typeColor }}>
                        {s.suggestedMax.toLocaleString('de-DE')}
                        &nbsp;<DeltaBadge current={s.currentLimit} suggested={s.suggestedMax} />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Block rate gauge */}
              <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <MiniGauge pct={s.stats.blockRatePct} color={blockColor} />
                <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.22)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Blockiert</div>
              </div>
            </div>

            {/* Reason banner */}
            <div style={{ margin: '0 1.25rem', padding: '0.65rem 0.875rem', borderRadius: 8, background: hasChange ? typeBg : 'rgba(255,255,255,0.02)', border: `1px solid ${hasChange ? typeBorder : 'rgba(255,255,255,0.04)'}`, fontSize: '0.8rem', color: hasChange ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.3)', lineHeight: 1.6 }}>
              {s.reason}
            </div>

            {/* Feedback message */}
            {msg && (
              <div style={{ margin: '0.5rem 1.25rem 0', padding: '0.55rem 0.875rem', borderRadius: 8, background: msg.ok ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${msg.ok ? 'rgba(16,185,129,0.22)' : 'rgba(239,68,68,0.22)'}`, fontSize: '0.79rem', fontWeight: 600, color: msg.ok ? '#34d399' : '#f87171' }}>
                {msg.text}
              </div>
            )}

            {/* Expanded stats */}
            {isExpanded && (
              <div style={{ margin: '0.75rem 1.25rem 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(110px,1fr))', gap: '0.5rem' }}>
                {[
                  { label: 'Ø Req/h', value: s.stats.avgRph.toLocaleString('de-DE'), icon: '📈' },
                  { label: 'Peak Req/h', value: s.stats.peakRph.toLocaleString('de-DE'), icon: '⚡' },
                  { label: 'Blockiert', value: `${s.stats.blockRatePct}%`, icon: '🚫', color: blockColor },
                  { label: 'Stunden analysiert', value: String(s.stats.hoursAnalyzed), icon: '🕐' },
                  { label: 'Gesamt Requests', value: s.stats.totalRequests.toLocaleString('de-DE'), icon: '🔢' },
                ].map(stat => (
                  <div key={stat.label} style={{ padding: '0.625rem 0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.22)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>{stat.icon} {stat.label}</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: stat.color || 'white' }}>{stat.value}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem 1rem', marginTop: '0.5rem' }}>
              <button
                onClick={() => setExpanded(isExpanded ? null : s.configId)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.38rem 0.875rem', borderRadius: 7, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, transition: 'all 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'white'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.16)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
                {isExpanded ? 'Stats einklappen' : 'Stats anzeigen'}
              </button>

              {s.canApply && hasChange && s.suggestedMax !== null && !msg?.ok && (
                <button
                  onClick={() => apply(s.configId)}
                  disabled={applying === s.configId}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.42rem 1.1rem', borderRadius: 7, background: s.type === 'increase' ? 'linear-gradient(135deg,rgba(16,185,129,0.2),rgba(16,185,129,0.12))' : 'linear-gradient(135deg,rgba(245,158,11,0.2),rgba(245,158,11,0.12))', border: `1px solid ${s.type === 'increase' ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`, color: s.type === 'increase' ? '#34d399' : '#fbbf24', cursor: applying === s.configId ? 'wait' : 'pointer', fontSize: '0.78rem', fontWeight: 700, transition: 'all 0.15s', opacity: applying === s.configId ? 0.6 : 1 }}
                  onMouseEnter={e => { if (applying !== s.configId) (e.currentTarget as HTMLElement).style.opacity = '0.85'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                >
                  {applying === s.configId ? (
                    <>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite' }}>
                        <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                      </svg>
                      Anwenden…
                    </>
                  ) : (
                    <>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Jetzt anwenden — {s.suggestedMax.toLocaleString('de-DE')} Req
                    </>
                  )}
                </button>
              )}

              {msg?.ok && (
                <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>
                  ✓ Angewendet — Analyse wird aktualisiert beim nächsten Reload
                </span>
              )}
            </div>
          </div>
        );
      })}

      {/* Info box */}
      {suggestions.length > 0 && (
        <div style={{ marginTop: '1rem', padding: '0.875rem 1rem', background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.12)', borderRadius: 10, display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <div style={{ fontSize: '0.77rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.65 }}>
            Analysen basieren auf den letzten <strong style={{ color: 'rgba(255,255,255,0.5)' }}>7 Tagen</strong> Echtdaten.
            „Anwenden" überschreibt das aktuelle Limit sofort — du kannst es jederzeit im <strong style={{ color: 'rgba(255,255,255,0.5)' }}>Konfiguration</strong> Tab manuell anpassen.
            Die KI berücksichtigt Peak-Traffic, Durchschnitt und Blockierrate.
          </div>
        </div>
      )}

      {/* Auto-Apply Activity Log */}
      {autoApply && autoApplyLog.length > 0 && (
        <div style={{ marginTop: '0.875rem', padding: '0.875rem 1rem', borderRadius: 10, background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>⚡ Auto-Apply Protokoll</div>
          {autoApplyLog.map((entry, i) => (
            <div key={i} style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', fontFamily: 'monospace', padding: '2px 0' }}>{entry}</div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        @keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:0.7} }
      `}</style>
    </div>
  );
}
