import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { ProGate } from './AlertsTab';
import { PRO_FEATURES } from '../lib/plans';

interface NearLimitPanelProps {
  isPro: boolean;
  onUpgrade: () => void;
  onSelectKey: (id: number, tab: 'configs' | 'analytics') => void;
}

function GaugeArc({ pct, color, size = 80 }: { pct: number; color: string; size?: number }) {
  const r = (size / 2) - 8;
  const circumference = Math.PI * r; // half circle
  const strokeDash = (pct / 100) * circumference;

  return (
    <svg width={size} height={size / 2 + 10} viewBox={`0 0 ${size} ${size / 2 + 10}`}>
      {/* Track */}
      <path
        d={`M 8 ${size / 2} A ${r} ${r} 0 0 1 ${size - 8} ${size / 2}`}
        fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={7} strokeLinecap="round"
      />
      {/* Fill */}
      <path
        d={`M 8 ${size / 2} A ${r} ${r} 0 0 1 ${size - 8} ${size / 2}`}
        fill="none" stroke={color} strokeWidth={7} strokeLinecap="round"
        strokeDasharray={`${strokeDash} ${circumference}`}
        style={{ transition: 'stroke-dasharray 1s cubic-bezier(0.16,1,0.3,1)' }}
      />
      {/* Pct text */}
      <text x={size / 2} y={size / 2 + 2} textAnchor="middle" fill="white" fontSize="13" fontWeight="700" fontFamily="Inter,system-ui,sans-serif">
        {pct}%
      </text>
    </svg>
  );
}

export function NearLimitPanel({ isPro, onUpgrade, onSelectKey }: NearLimitPanelProps) {
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    const { data } = await api.getAllKeysUsage();
    if (data?.keys) setKeys(data.keys);
    setLastRefresh(new Date());
    if (silent) setRefreshing(false);
    else setLoading(false);
  }, []);

  useEffect(() => {
    if (isPro) {
      load();
      const interval = setInterval(() => load(true), 30000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [isPro, load]);

  if (!isPro) {
    return (
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <ProGate
          feature={PRO_FEATURES.find(f => f.id === 'near_limit')!}
          onUpgrade={onUpgrade}
        />
      </div>
    );
  }

  const criticalKeys = keys.filter(k => k.usage?.critical);
  const nearKeys = keys.filter(k => k.usage?.nearLimit && !k.usage?.critical);
  const healthyKeys = keys.filter(k => k.usage && !k.usage?.nearLimit);
  const noConfigKeys = keys.filter(k => !k.usage);

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.375rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ color: 'white', fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 2 }}>
            Near-Limit Übersicht
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: refreshing ? '#fbbf24' : '#34d399', animation: refreshing ? 'none' : 'liveBlip 2s ease-in-out infinite' }} />
            {refreshing ? 'Aktualisiere…' : `Zuletzt: ${lastRefresh.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`}
          </div>
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing || loading}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.875rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.55)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.09)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }}>
            <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          Aktualisieren
        </button>
      </div>

      {/* Alert banner for critical keys */}
      {!loading && criticalKeys.length > 0 && (
        <div style={{ marginBottom: '1.25rem', padding: '0.875rem 1.125rem', borderRadius: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', gap: '0.75rem', animation: 'fadeUp 0.3s ease' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', flexShrink: 0, animation: 'criticalPulse 1.5s ease-in-out infinite' }} />
          <div style={{ flex: 1, fontSize: '0.82rem', color: '#fca5a5', fontWeight: 600 }}>
            {criticalKeys.length} Key{criticalKeys.length > 1 ? 's' : ''} über 95% Limit: {criticalKeys.map(k => k.keyName).join(', ')}
          </div>
          <button onClick={() => onSelectKey(criticalKeys[0].keyId, 'configs')} style={{ padding: '0.35rem 0.75rem', borderRadius: 6, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.15)', color: '#f87171', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            Konfigurieren
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '0.75rem' }}>
          {[1,2,3,4].map(i => <div key={i} style={{ height: 180, borderRadius: 14, background: 'rgba(255,255,255,0.03)', animation: 'pulse 1.5s ease-in-out infinite' }} />)}
        </div>
      ) : keys.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 14, color: 'rgba(255,255,255,0.25)' }}>
          <div style={{ marginBottom: '0.75rem', opacity: 0.4 }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ display: 'block', margin: '0 auto' }}>
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
            </svg>
          </div>
          <div style={{ fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: '0.35rem' }}>Keine API Keys vorhanden</div>
          <div style={{ fontSize: '0.84rem' }}>Erstelle zuerst API Keys im Keys-Tab.</div>
        </div>
      ) : (
        <>
          {/* Summary row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '0.625rem', marginBottom: '1.375rem' }}>
            {[
              { label: 'Gesamt Keys', val: keys.length, color: '#60a5fa', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5"/></svg> },
              { label: 'Kritisch (>95%)', val: criticalKeys.length, color: '#f87171', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
              { label: 'Near Limit (>80%)', val: nearKeys.length, color: '#fbbf24', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
              { label: 'Normal (<80%)', val: healthyKeys.length, color: '#34d399', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg> },
            ].map(s => (
              <div key={s.label} style={{ borderRadius: 12, background: 'rgba(14,22,36,0.85)', border: `1px solid ${s.val > 0 && (s.label.includes('Krit') || s.label.includes('Near')) ? s.color + '33' : 'rgba(255,255,255,0.07)'}`, padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', gap: '0.625rem', animation: 'fadeUp 0.3s ease' }}>
                <div style={{ color: s.color, opacity: 0.75 }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: s.color, letterSpacing: '-0.03em', lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.28)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Key cards grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '0.75rem' }}>
            {keys.map((key, idx) => {
              const u = key.usage;
              const pct = u?.pct ?? 0;
              const isCritical = u?.critical;
              const isNear = u?.nearLimit && !isCritical;
              const gaugeColor = isCritical ? '#ef4444' : isNear ? '#f59e0b' : '#34d399';
              const borderColor = isCritical ? 'rgba(239,68,68,0.3)' : isNear ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.07)';

              return (
                <div
                  key={key.keyId}
                  style={{
                    borderRadius: 14, background: 'rgba(14,22,36,0.85)',
                    border: `1px solid ${borderColor}`,
                    padding: '1.25rem 1.125rem',
                    animation: `fadeUp 0.35s ${idx * 0.04}s both cubic-bezier(0.16,1,0.3,1)`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
                    position: 'relative',
                  }}
                >
                  {/* Status badge top right */}
                  {(isCritical || isNear) && (
                    <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', padding: '2px 7px', borderRadius: 5, fontSize: '0.62rem', fontWeight: 700, background: isCritical ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)', color: isCritical ? '#f87171' : '#fbbf24', border: `1px solid ${isCritical ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.25)'}` }}>
                      {isCritical ? 'KRITISCH' : 'NEAR LIMIT'}
                    </div>
                  )}

                  {/* Key name */}
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'white', textAlign: 'center', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {key.keyName}
                  </div>

                  {/* Gauge */}
                  {u ? (
                    <>
                      <GaugeArc pct={pct} color={gaugeColor} size={100} />
                      <div style={{ width: '100%' }}>
                        {/* Progress bar */}
                        <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.07)', overflow: 'hidden', marginBottom: '0.4rem' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: isCritical ? 'linear-gradient(90deg,#ef4444,#dc2626)' : isNear ? 'linear-gradient(90deg,#f59e0b,#fbbf24)' : 'linear-gradient(90deg,#10b981,#34d399)', borderRadius: 3, transition: 'width 1s cubic-bezier(0.16,1,0.3,1)' }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.67rem', color: 'rgba(255,255,255,0.3)' }}>
                          <span>{u.used.toLocaleString('de-DE')} genutzt</span>
                          <span>{u.max.toLocaleString('de-DE')} max</span>
                        </div>
                        <div style={{ textAlign: 'center', marginTop: '0.25rem', fontSize: '0.65rem', color: 'rgba(255,255,255,0.22)' }}>
                          Fenster: {u.windowSeconds < 3600 ? `${u.windowSeconds / 60}min` : u.windowSeconds < 86400 ? `${u.windowSeconds / 3600}h` : `${u.windowSeconds / 86400}d`}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '1rem 0', color: 'rgba(255,255,255,0.2)', fontSize: '0.78rem' }}>
                      Kein aktives Limit
                    </div>
                  )}

                  {/* Active status */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)' }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: key.isActive ? '#34d399' : '#fbbf24' }} />
                    {key.isActive ? 'Aktiv' : 'Pausiert'}
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: '0.375rem', width: '100%' }}>
                    <button onClick={() => onSelectKey(key.keyId, 'configs')} style={{ flex: 1, padding: '0.38rem 0.5rem', borderRadius: 7, border: '1px solid rgba(59,130,246,0.25)', background: 'rgba(59,130,246,0.08)', color: '#60a5fa', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(59,130,246,0.16)'} onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(59,130,246,0.08)'}>
                      Config
                    </button>
                    <button onClick={() => onSelectKey(key.keyId, 'analytics')} style={{ flex: 1, padding: '0.38rem 0.5rem', borderRadius: 7, border: '1px solid rgba(139,92,246,0.25)', background: 'rgba(139,92,246,0.08)', color: '#a78bfa', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.16)'} onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.08)'}>
                      Analytics
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:.25} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes liveBlip { 0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(52,211,153,0.4)} 50%{opacity:.6;box-shadow:0 0 0 5px rgba(52,211,153,0)} }
        @keyframes criticalPulse { 0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(239,68,68,0.5)} 50%{opacity:.6;box-shadow:0 0 0 6px rgba(239,68,68,0)} }
      `}</style>
    </div>
  );
}
