import { useState } from 'react';
import { PRO_FEATURES } from '../lib/plans';
import { ProGate } from './AlertsTab';

interface SandboxTabProps {
  apiKeyId: number | null;
  apiKeyName?: string;
  isPro: boolean;
  onUpgrade: () => void;
}

interface SimResult {
  allowed: boolean;
  reason: string;
  requestsUsed: number;
  requestsMax: number;
  usagePct: number;
  responseTime: number;
  headers: Record<string, string>;
}

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
const ENDPOINT_SUGGESTIONS = ['/api/users', '/api/products', '/api/orders', '/api/auth/login', '/api/data', '/webhook'];

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

export function SandboxTab({ apiKeyId, apiKeyName, isPro, onUpgrade }: SandboxTabProps) {
  const [endpoint, setEndpoint] = useState('/api/test');
  const [method, setMethod] = useState('GET');
  const [customIp, setCustomIp] = useState('');
  const [customUserAgent, setCustomUserAgent] = useState('');
  const [burstCount, setBurstCount] = useState(1);
  const [results, setResults] = useState<(SimResult & { index: number })[]>([]);
  const [running, setRunning] = useState(false);
  const [apiKey, setApiKey] = useState('');

  if (!isPro) {
    return (
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <ProGate feature={PRO_FEATURES.find(f => f.id === 'sandbox')!} onUpgrade={onUpgrade} />
      </div>
    );
  }

  if (!apiKeyId) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, textAlign: 'center', gap: '1rem' }}>
        <div style={{ color: 'white', fontWeight: 700 }}>Kein API Key ausgewählt</div>
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>Wähle einen Key um die Sandbox zu nutzen.</div>
      </div>
    );
  }

  const runSimulation = async () => {
    if (!apiKey.trim()) {
      alert('Bitte gib deinen API Key ein um Requests zu simulieren.');
      return;
    }
    setRunning(true);
    setResults([]);
    const newResults: (SimResult & { index: number })[] = [];

    for (let i = 0; i < Math.min(burstCount, 50); i++) {
      const start = Date.now();
      try {
        // Build query params — User-Agent CANNOT be set via browser fetch (forbidden header)
        // Pass via ?ua= and ?ip= query params instead
        const params = new URLSearchParams({
          endpoint,
          method,
        });
        if (customUserAgent) params.set('ua', customUserAgent);
        if (customIp) params.set('ip', customIp);

        const checkUrl = `${API_BASE_URL}/check?${params}`;
        const res = await fetch(checkUrl, {
          method: 'GET',
          headers: { 'X-API-Key': apiKey },
        });
        const elapsed = Date.now() - start;

        let data: any = {};
        try { data = await res.json(); } catch {}

        const limit = parseInt(res.headers.get('X-RateLimit-Limit') || '0') || data?.limit || 100;
        const remaining = parseInt(res.headers.get('X-RateLimit-Remaining') || '-1');
        const used = remaining >= 0 ? limit - remaining : (data?.limit ? data.limit - (data.remaining ?? 0) : i + 1);
        const usagePct = limit > 0 ? Math.round((used / limit) * 100) : 0;

        newResults.push({
          index: i + 1,
          allowed: res.status !== 429 && res.status !== 403,
          reason: res.status === 429
            ? (data?.reason || 'Rate limit erreicht (429)')
            : res.status === 403
            ? (data?.reason || 'Blockiert durch Filter (403)')
            : res.status === 401
            ? 'Ungültiger API Key'
            : (data?.message || data?.reason || 'Request erlaubt'),
          requestsUsed: used,
          requestsMax: limit,
          usagePct,
          responseTime: elapsed,
          headers: {
            'Status': String(res.status),
            'X-RateLimit-Limit': res.headers.get('X-RateLimit-Limit') || String(limit),
            'X-RateLimit-Remaining': res.headers.get('X-RateLimit-Remaining') || String(remaining >= 0 ? remaining : limit - used),
            'X-RateLimit-Reset': res.headers.get('X-RateLimit-Reset') || '—',
            'X-RateLimit-Algorithm': res.headers.get('X-RateLimit-Algorithm') || data?.algorithm || '—',
            'Retry-After': res.headers.get('Retry-After') || (data?.retryAfter ? String(data.retryAfter) : '—'),
          },
        });

        setResults([...newResults]);

        // Small delay between burst requests
        if (i < burstCount - 1) await new Promise(r => setTimeout(r, 80));
      } catch {
        newResults.push({
          index: i + 1,
          allowed: false,
          reason: 'Netzwerkfehler',
          requestsUsed: i + 1,
          requestsMax: 100,
          usagePct: 0,
          responseTime: Date.now() - start,
          headers: {},
        });
        setResults([...newResults]);
      }
    }
    setRunning(false);
  };

  const blockedCount = results.filter(r => !r.allowed).length;
  const avgTime = results.length > 0 ? Math.round(results.reduce((s, r) => s + r.responseTime, 0) / results.length) : 0;

  const inputStyle: React.CSSProperties = { width: '100%', padding: '0.575rem 0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'white', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s' };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.35rem' };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.375rem' }}>
        <h2 style={{ color: 'white', fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 2 }}>
          Test-Modus / Sandbox
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.32)', fontSize: '0.77rem' }}>
          Simuliere Requests gegen deine Rate Limit Konfiguration{apiKeyName ? ` für „${apiKeyName}"` : ''} — ohne echten Traffic
        </p>
      </div>

      {/* Info banner */}
      <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', borderRadius: 10, background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        <span>Die Sandbox ruft den echten <code style={{ color: '#93c5fd', background: 'rgba(59,130,246,0.1)', padding: '1px 5px', borderRadius: 3 }}>/check</code> Endpoint auf. Requests zählen zu deinen Logs, aber du kontrollierst die Parameter vollständig.</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.25rem' }}>
        {/* Left: Config panel */}
        <div style={{ borderRadius: 14, background: 'rgba(14,22,36,0.85)', border: '1px solid rgba(255,255,255,0.07)', padding: '1.375rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Request-Konfiguration</div>

          {/* API Key input */}
          <div>
            <label style={labelStyle}>Dein API Key</label>
            <input value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="rlapi_..." type="password" style={{ ...inputStyle, fontFamily: 'monospace' }} onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', marginTop: '0.25rem' }}>Trage deinen API Key ein — er wird nur für den Test genutzt</div>
          </div>

          {/* Method + Endpoint */}
          <div>
            <label style={labelStyle}>Endpoint</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select value={method} onChange={e => setMethod(e.target.value)} style={{ ...inputStyle, width: 100, cursor: 'pointer', flexShrink: 0 }}>
                {HTTP_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <input value={endpoint} onChange={e => setEndpoint(e.target.value)} placeholder="/api/..." style={inputStyle} onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
            </div>
            <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
              {ENDPOINT_SUGGESTIONS.map(s => (
                <button key={s} type="button" onClick={() => setEndpoint(s)} style={{ padding: '2px 8px', borderRadius: 5, border: '1px solid rgba(255,255,255,0.1)', background: endpoint === s ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.04)', color: endpoint === s ? '#60a5fa' : 'rgba(255,255,255,0.35)', fontSize: '0.65rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'monospace', transition: 'all 0.15s' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Optional overrides */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
            <div>
              <label style={labelStyle}>IP simulieren (optional)</label>
              <input value={customIp} onChange={e => setCustomIp(e.target.value)} placeholder="1.2.3.4" style={inputStyle} onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
            </div>
            <div>
              <label style={labelStyle}>User-Agent simulieren</label>
              <input value={customUserAgent} onChange={e => setCustomUserAgent(e.target.value)} placeholder="curl/7.0, bot, ..." style={inputStyle} onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
            </div>
          </div>

          {/* Burst count */}
          <div>
            <label style={labelStyle}>Anzahl Requests (Burst-Test)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <input type="range" min={1} max={50} value={burstCount} onChange={e => setBurstCount(parseInt(e.target.value))} style={{ flex: 1, accentColor: '#3b82f6' }} />
              <div style={{ minWidth: 40, textAlign: 'center', fontSize: '1.1rem', fontWeight: 800, color: '#60a5fa' }}>{burstCount}</div>
            </div>
            <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.4rem' }}>
              {[1, 5, 10, 25, 50].map(n => (
                <button key={n} type="button" onClick={() => setBurstCount(n)} style={{ padding: '2px 8px', borderRadius: 5, border: '1px solid rgba(255,255,255,0.1)', background: burstCount === n ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.04)', color: burstCount === n ? '#60a5fa' : 'rgba(255,255,255,0.35)', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}>
                  {n}×
                </button>
              ))}
            </div>
          </div>

          {/* Run button */}
          <button
            onClick={runSimulation}
            disabled={running}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.7rem', borderRadius: 9, background: running ? 'rgba(59,130,246,0.3)' : 'linear-gradient(135deg,#3b82f6,#6366f1)', border: 'none', color: 'white', fontWeight: 700, fontSize: '0.95rem', cursor: running ? 'wait' : 'pointer', transition: 'all 0.2s', boxShadow: running ? 'none' : '0 4px 16px -4px rgba(59,130,246,0.5)', marginTop: '0.25rem' }}
          >
            {running ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                Sende {burstCount} Request{burstCount > 1 ? 's' : ''}…
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                {burstCount} Request{burstCount > 1 ? 's' : ''} senden
              </>
            )}
          </button>
        </div>

        {/* Right: Live results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {/* Summary stats */}
          {results.length > 0 && (
            <div style={{ borderRadius: 12, background: 'rgba(14,22,36,0.85)', border: '1px solid rgba(255,255,255,0.07)', padding: '0.875rem 1rem', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.5rem', animation: 'fadeUp 0.25s ease' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#34d399', letterSpacing: '-0.03em' }}>{results.length - blockedCount}</div>
                <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', marginTop: 2 }}>Erlaubt</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: blockedCount > 0 ? '#f87171' : 'rgba(255,255,255,0.3)', letterSpacing: '-0.03em' }}>{blockedCount}</div>
                <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', marginTop: 2 }}>Blockiert</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#60a5fa', letterSpacing: '-0.03em' }}>{avgTime}ms</div>
                <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', marginTop: 2 }}>Ø Zeit</div>
              </div>
            </div>
          )}

          {/* Result stream */}
          <div style={{ flex: 1, borderRadius: 12, background: 'rgba(14,22,36,0.85)', border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
              Request-Log
              {running && <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#fbbf24', animation: 'liveBlip 1s ease-in-out infinite' }} />}
            </div>
            <div style={{ maxHeight: 380, overflowY: 'auto', padding: '0.375rem' }}>
              {results.length === 0 ? (
                <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '0.82rem' }}>
                  Starte einen Test — Ergebnisse erscheinen hier live
                </div>
              ) : (
                [...results].reverse().map(r => (
                  <div
                    key={r.index}
                    style={{ padding: '0.575rem 0.625rem', borderRadius: 8, marginBottom: 3, background: r.allowed ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.06)', border: `1px solid ${r.allowed ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.14)'}`, animation: 'fadeUp 0.15s ease' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: r.headers['X-RateLimit-Limit'] !== '0' ? '0.35rem' : 0 }}>
                      <span style={{ padding: '1px 7px', borderRadius: 4, fontSize: '0.62rem', fontWeight: 700, background: r.allowed ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', color: r.allowed ? '#34d399' : '#f87171', flexShrink: 0 }}>
                        #{r.index}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: r.allowed ? '#34d399' : '#f87171', fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.allowed ? '✓' : '✕'} {r.reason}
                      </span>
                      <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.28)', flexShrink: 0 }}>{r.responseTime}ms</span>
                    </div>
                    {/* Usage bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ flex: 1, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
                        <div style={{ height: '100%', width: `${Math.min(r.usagePct, 100)}%`, background: r.usagePct > 80 ? '#f87171' : r.usagePct > 50 ? '#fbbf24' : '#34d399', borderRadius: 2, transition: 'width 0.4s ease' }} />
                      </div>
                      <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)', flexShrink: 0, fontWeight: 700 }}>{r.usagePct}%</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Last result headers */}
          {results.length > 0 && results[results.length - 1].headers['Status'] && (
            <div style={{ borderRadius: 12, background: 'rgba(14,22,36,0.85)', border: '1px solid rgba(255,255,255,0.07)', padding: '0.875rem 1rem' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>Response Headers (letzter Request)</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                {Object.entries(results[results.length - 1].headers).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.72rem' }}>
                    <code style={{ color: '#93c5fd', fontFamily: 'monospace', flexShrink: 0 }}>{k}:</code>
                    <code style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'monospace' }}>{v}</code>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)} }
        @keyframes spin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
        @keyframes liveBlip { 0%,100%{opacity:1}50%{opacity:0.3} }
        select option { background: #0c1525; }
      `}</style>
    </div>
  );
}
