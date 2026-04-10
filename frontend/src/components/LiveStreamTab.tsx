import { useState, useEffect, useRef, useCallback } from 'react';

interface LiveStreamTabProps {
  apiKeyId: number | null;
  apiKeyName: string;
  isPro: boolean;
  onUpgrade: () => void;
}

interface LogEntry {
  ip: string;
  ua: string;
  endpoint: string;
  method: string;
  status: number;
  blocked: boolean;
  reason: string | null;
  ts: string;
  id: number; // client-side ID for React key
}

const REASON_LABELS: Record<string, string> = {
  rate_limit_exceeded:    'Rate Limit',
  token_bucket_exhausted: 'Token leer',
  ip_blacklisted:         'IP Blacklist',
  user_agent_blocked:     'UA geblockt',
  auto_blocked:           'Auto Block',
  filter:                 'Filter',
};

function formatReason(reason: string | null): string {
  if (!reason) return '';
  if (reason.startsWith('geo_blocked:')) return `🌍 ${reason.split(':')[1]}`;
  if (reason.startsWith('geo_not_in_allowlist:')) return `🌍 !${reason.split(':')[1]}`;
  return REASON_LABELS[reason] ?? reason;
}

function timeLabel(isoTs: string): string {
  return new Date(isoTs).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// ── Attack mode detection ─────────────────────────────────────────────────────

function useAttackMode(logs: LogEntry[]) {
  // Attack mode = >30% block rate in last 20 events
  const recent = logs.slice(0, 20);
  if (recent.length < 5) return false;
  const blocked = recent.filter(l => l.blocked).length;
  return (blocked / recent.length) > 0.3;
}

// ── Main component ────────────────────────────────────────────────────────────

export function LiveStreamTab({ apiKeyId, apiKeyName, isPro, onUpgrade }: LiveStreamTabProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [connected, setConnected] = useState(false);
  const [paused, setPaused] = useState(false);
  const [filter, setFilter] = useState<'all' | 'blocked' | 'allowed'>('all');
  const [stats, setStats] = useState({ total: 0, blocked: 0, rps: 0 });
  const [autoScroll, setAutoScroll] = useState(true);

  const esRef = useRef<EventSource | null>(null);
  const logIdRef = useRef(0);
  const logBufferRef = useRef<LogEntry[]>([]);
  const pauseRef = useRef(false);
  const listRef = useRef<HTMLDivElement>(null);

  // Track RPS: count events in last second
  const rpsWindowRef = useRef<number[]>([]);

  const attackMode = useAttackMode(logs);

  const getApiBase = () => {
    const stored = localStorage.getItem('API_BASE') || '';
    const envBase = (window as any).__VITE_API_URL__ || '';
    return stored || envBase || 'http://localhost:8787';
  };

  const getToken = () => localStorage.getItem('token') || '';

  const connect = useCallback(() => {
    if (!apiKeyId || !isPro) return;
    if (esRef.current) { esRef.current.close(); esRef.current = null; }

    // SSE requires auth — we pass token as query param since EventSource can't set headers
    const url = `${getApiBase()}/api/stream/${apiKeyId}?token=${encodeURIComponent(getToken())}`;
    const es = new EventSource(url);
    esRef.current = es;

    es.addEventListener('log', (e: MessageEvent) => {
      const entry: LogEntry = { ...JSON.parse(e.data), id: ++logIdRef.current };

      // Update RPS
      const now = Date.now();
      rpsWindowRef.current = [...rpsWindowRef.current.filter(t => now - t < 1000), now];

      // Update stats
      setStats(prev => ({
        total: prev.total + 1,
        blocked: prev.blocked + (entry.blocked ? 1 : 0),
        rps: rpsWindowRef.current.length,
      }));

      if (pauseRef.current) {
        logBufferRef.current = [entry, ...logBufferRef.current].slice(0, 50);
        return;
      }

      setLogs(prev => [entry, ...prev].slice(0, 200));
    });

    es.onopen = () => setConnected(true);
    es.onerror = () => {
      setConnected(false);
      // Auto-reconnect after 3s
      setTimeout(() => {
        if (esRef.current) connect();
      }, 3000);
    };
  }, [apiKeyId, isPro]);

  // Flush buffer when unpausing
  useEffect(() => {
    pauseRef.current = paused;
    if (!paused && logBufferRef.current.length > 0) {
      setLogs(prev => [...logBufferRef.current, ...prev].slice(0, 200));
      logBufferRef.current = [];
    }
  }, [paused]);

  useEffect(() => {
    if (apiKeyId && isPro) connect();
    return () => { esRef.current?.close(); esRef.current = null; };
  }, [apiKeyId, isPro, connect]);

  // Auto-scroll
  useEffect(() => {
    if (autoScroll && listRef.current && !paused) {
      listRef.current.scrollTop = 0;
    }
  }, [logs, autoScroll, paused]);

  // ── Pro gate ──────────────────────────────────────────────────────────────

  if (!isPro) {
    return (
      <div style={{ maxWidth: 640, margin: '2rem auto', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', fontSize: '1.6rem' }}>⚡</div>
        <h2 style={{ color: 'white', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Echtzeit Live Stream</h2>
        <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: '1.5rem', maxWidth: 440, margin: '0 auto 1.5rem' }}>
          Sieh jeden einzelnen Request live — ohne Polling, ohne Verzögerung. Mit Attack-Mode-Erkennung wenn dein API gerade unter Beschuss steht.
        </p>
        <button onClick={onUpgrade} style={{ background: 'linear-gradient(135deg,#7c3aed,#8b5cf6)', color: 'white', border: 'none', borderRadius: 10, padding: '0.65rem 2rem', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 24px -6px rgba(139,92,246,0.5)' }}>
          Pro freischalten – €4,99/Mo
        </button>
      </div>
    );
  }

  if (!apiKeyId) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320, gap: '0.875rem', color: 'rgba(255,255,255,0.25)', fontSize: '0.875rem' }}>
        <span style={{ fontSize: '2rem' }}>⚡</span>
        <span>Wähle einen API Key für den Live Stream.</span>
      </div>
    );
  }

  const visibleLogs = logs.filter(l =>
    filter === 'all' ? true : filter === 'blocked' ? l.blocked : !l.blocked
  );

  const blockRatePct = stats.total > 0 ? Math.round((stats.blocked / stats.total) * 100) : 0;

  return (
    <div style={{ maxWidth: 1000 }}>

      {/* ── Attack Mode Banner ── */}
      {attackMode && (
        <div style={{ marginBottom: '1rem', padding: '0.875rem 1.25rem', borderRadius: 12, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', display: 'flex', alignItems: 'center', gap: '0.75rem', animation: 'attackPulse 1.5s ease-in-out infinite' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', flexShrink: 0, boxShadow: '0 0 12px rgba(239,68,68,0.8)', animation: 'blink 0.8s ease-in-out infinite' }} />
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f87171', letterSpacing: '-0.01em' }}>🚨 ATTACK MODE — Hohe Blockierrate erkannt</div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(248,113,113,0.7)', marginTop: 2 }}>
              {blockRatePct}% der letzten Requests blockiert · Prüfe Auto Block + Filter Regeln
            </div>
          </div>
          <div style={{ marginLeft: 'auto', fontSize: '2rem', fontWeight: 800, color: '#f87171', fontFamily: 'monospace', animation: 'countUp 0.3s ease' }}>
            {stats.blocked.toLocaleString('de-DE')}
          </div>
        </div>
      )}

      {/* ── Stats bar ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.625rem', marginBottom: '1rem' }}>
        {[
          { label: 'Requests', value: stats.total.toLocaleString('de-DE'), color: '#60a5fa', icon: '📊' },
          { label: 'Blockiert', value: stats.blocked.toLocaleString('de-DE'), color: '#f87171', icon: '🚫' },
          { label: 'Block-Rate', value: `${blockRatePct}%`, color: blockRatePct > 20 ? '#f87171' : blockRatePct > 5 ? '#fbbf24' : '#34d399', icon: '📉' },
          { label: 'Req/s', value: String(stats.rps), color: '#a78bfa', icon: '⚡' },
        ].map(s => (
          <div key={s.label} style={{ padding: '0.75rem 1rem', borderRadius: 10, background: 'rgba(14,22,36,0.85)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3 }}>{s.icon} {s.label}</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: s.color, letterSpacing: '-0.03em', fontFamily: 'monospace' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* ── Controls ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.875rem', flexWrap: 'wrap' }}>

        {/* Connection indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.35rem 0.75rem', borderRadius: 7, background: connected ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${connected ? 'rgba(16,185,129,0.22)' : 'rgba(239,68,68,0.22)'}` }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: connected ? '#34d399' : '#f87171', boxShadow: connected ? '0 0 6px rgba(52,211,153,0.6)' : 'none', animation: connected ? 'livePulse 2s infinite' : 'none' }} />
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: connected ? '#34d399' : '#f87171' }}>{connected ? 'Live' : 'Getrennt'}</span>
        </div>

        {/* Filter buttons */}
        <div style={{ display: 'flex', gap: '0.3rem' }}>
          {(['all', 'blocked', 'allowed'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '0.33rem 0.75rem', borderRadius: 6, border: '1px solid', fontSize: '0.72rem', fontWeight: filter === f ? 700 : 400, cursor: 'pointer', transition: 'all 0.12s', background: filter === f ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.03)', borderColor: filter === f ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.1)', color: filter === f ? '#93c5fd' : 'rgba(255,255,255,0.45)' }}>
              {f === 'all' ? 'Alle' : f === 'blocked' ? '🚫 Blockiert' : '✅ Erlaubt'}
            </button>
          ))}
        </div>

        {/* Pause/Resume */}
        <button onClick={() => setPaused(!paused)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.33rem 0.875rem', borderRadius: 6, border: `1px solid ${paused ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.1)'}`, background: paused ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.03)', color: paused ? '#fbbf24' : 'rgba(255,255,255,0.45)', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>
          {paused
            ? <><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg> Fortsetzen {logBufferRef.current.length > 0 && `(+${logBufferRef.current.length})`}</>
            : <><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> Pausieren</>
          }
        </button>

        {/* Clear */}
        <button onClick={() => { setLogs([]); setStats({ total: 0, blocked: 0, rps: 0 }); }}
          style={{ padding: '0.33rem 0.875rem', borderRadius: 6, border: '1px solid rgba(255,255,255,0.09)', background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}>
          Leeren
        </button>

        {/* Reconnect */}
        {!connected && (
          <button onClick={connect}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.33rem 0.875rem', borderRadius: 6, border: '1px solid rgba(59,130,246,0.3)', background: 'rgba(59,130,246,0.08)', color: '#60a5fa', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
            Verbinden
          </button>
        )}

        {/* Auto-scroll toggle */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.28)' }}>Auto-Scroll</span>
          <button onClick={() => setAutoScroll(!autoScroll)}
            style={{ width: 32, height: 18, borderRadius: 9, background: autoScroll ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.08)', border: `1px solid ${autoScroll ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.12)'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0 2px', transition: 'all 0.2s' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: autoScroll ? '#60a5fa' : 'rgba(255,255,255,0.3)', transform: autoScroll ? 'translateX(14px)' : 'translateX(0)', transition: 'all 0.2s' }} />
          </button>
        </div>
      </div>

      {/* ── Log table ── */}
      <div
        ref={listRef}
        style={{ height: 480, overflowY: 'auto', borderRadius: 12, background: 'rgba(8,13,26,0.95)', border: `1px solid ${attackMode ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.07)'}`, fontFamily: 'monospace', transition: 'border-color 0.3s' }}
      >
        {/* Table header */}
        <div style={{ position: 'sticky', top: 0, display: 'grid', gridTemplateColumns: '80px 110px 60px 1fr 90px 100px', gap: '0 0.5rem', padding: '0.5rem 0.875rem', background: 'rgba(8,13,26,0.98)', borderBottom: '1px solid rgba(255,255,255,0.06)', zIndex: 1 }}>
          {['Zeit', 'IP', 'Method', 'Endpoint', 'Status', 'Entscheidung'].map(h => (
            <div key={h} style={{ fontSize: '0.58rem', fontWeight: 700, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</div>
          ))}
        </div>

        {/* Empty state */}
        {visibleLogs.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 400, gap: '0.75rem', color: 'rgba(255,255,255,0.2)' }}>
            <div style={{ fontSize: '2rem', animation: connected ? 'blink 2s infinite' : 'none' }}>{connected ? '📡' : '🔌'}</div>
            <div style={{ fontSize: '0.82rem' }}>{connected ? 'Warte auf Requests…' : 'Nicht verbunden'}</div>
            {!connected && <button onClick={connect} style={{ padding: '0.4rem 1rem', borderRadius: 7, border: '1px solid rgba(59,130,246,0.3)', background: 'rgba(59,130,246,0.08)', color: '#60a5fa', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>Verbinden</button>}
          </div>
        )}

        {/* Log rows */}
        {visibleLogs.map((log, i) => (
          <div
            key={log.id}
            style={{
              display: 'grid', gridTemplateColumns: '80px 110px 60px 1fr 90px 100px',
              gap: '0 0.5rem', padding: '0.35rem 0.875rem',
              borderBottom: '1px solid rgba(255,255,255,0.025)',
              background: i === 0 && !paused ? 'rgba(59,130,246,0.04)' : 'none',
              transition: 'background 0.3s',
              animation: i === 0 && !paused ? 'fadeInRow 0.25s ease' : 'none',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = i === 0 && !paused ? 'rgba(59,130,246,0.04)' : 'none'}
          >
            <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', alignSelf: 'center' }}>{timeLabel(log.ts)}</div>
            <div style={{ fontSize: '0.7rem', color: log.blocked ? '#fca5a5' : 'rgba(255,255,255,0.6)', alignSelf: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.ip}</div>
            <div style={{ alignSelf: 'center' }}>
              <span style={{ padding: '1px 5px', borderRadius: 3, fontSize: '0.6rem', fontWeight: 700, background: 'rgba(59,130,246,0.1)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.18)' }}>{log.method}</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)', alignSelf: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.endpoint}</div>
            <div style={{ alignSelf: 'center' }}>
              <span style={{ padding: '1px 5px', borderRadius: 3, fontSize: '0.62rem', fontWeight: 700, background: log.status === 200 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: log.status === 200 ? '#34d399' : '#f87171', border: `1px solid ${log.status === 200 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>{log.status}</span>
            </div>
            <div style={{ alignSelf: 'center', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: log.blocked ? '#f87171' : '#34d399', flexShrink: 0 }} />
              <span style={{ fontSize: '0.62rem', color: log.blocked ? '#f87171' : '#34d399', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {log.blocked ? (log.reason ? formatReason(log.reason) : 'Blockiert') : 'OK'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {paused && (
        <div style={{ marginTop: '0.5rem', textAlign: 'center', fontSize: '0.72rem', color: '#fbbf24' }}>
          ⏸ Pausiert — {logBufferRef.current.length} neue Events warten
        </div>
      )}

      <style>{`
        @keyframes fadeInRow { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
        @keyframes attackPulse { 0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.3)} 50%{box-shadow:0 0 16px 4px rgba(239,68,68,0.15)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes livePulse { 0%{box-shadow:0 0 0 0 rgba(52,211,153,0.5)} 70%{box-shadow:0 0 0 6px rgba(52,211,153,0)} 100%{box-shadow:0 0 0 0 rgba(52,211,153,0)} }
        @keyframes countUp { from{transform:scale(1.2);color:#ef4444} to{transform:scale(1)} }
      `}</style>
    </div>
  );
}
