import { useState, useCallback } from 'react';
import { api, type SimulationResult } from '../lib/api';

interface SimulationTabProps {
  apiKeyId: number | null;
  isPro: boolean;
  onUpgrade: () => void;
}

function BarRow({ label, value, max, color, pct }: {
  label: string; value: number; max: number; color: string; pct: number;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
      <div style={{ width: 70, fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textAlign: 'right', flexShrink: 0 }}>{label}</div>
      <div style={{ flex: 1, height: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 6, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 6,
          width: `${Math.min(100, (value / Math.max(max, 1)) * 100)}%`,
          background: color,
          transition: 'width 0.6s cubic-bezier(0.34,1.56,0.64,1)',
        }} />
      </div>
      <div style={{ width: 52, fontSize: '0.72rem', color: 'rgba(255,255,255,0.55)', textAlign: 'right', flexShrink: 0 }}>
        {pct}%
      </div>
    </div>
  );
}

export function SimulationTab({ apiKeyId, isPro, onUpgrade }: SimulationTabProps) {
  const [limit, setLimit] = useState(100);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    if (!apiKeyId) return;
    setLoading(true);
    setError(null);
    setResult(null);
    const { data, error: err } = await api.simulateLimit(apiKeyId, limit);
    setLoading(false);
    if (err) { setError(err); return; }
    setResult(data ?? null);
  }, [apiKeyId, limit]);

  if (!isPro) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320, gap: '1rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem' }}>🧪</div>
        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>Simulation / What-if Analysis</div>
        <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)', maxWidth: 400, lineHeight: 1.7 }}>
          Simuliere historischen Traffic mit einem anderen Limit und sieh genau, wie viele Requests mehr oder weniger blockiert worden wären.
        </div>
        <button onClick={onUpgrade} style={{
          padding: '0.65rem 1.75rem', borderRadius: 9,
          background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
          color: 'white', border: 'none', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
        }}>
          Pro freischalten
        </button>
      </div>
    );
  }

  if (!apiKeyId) {
    return (
      <div style={{ padding: '2rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
        Wähle zuerst einen API Key aus.
      </div>
    );
  }

  const maxBlocked = result
    ? Math.max(result.current?.blocked ?? 0, result.simulated?.blocked ?? 0, 1)
    : 1;

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>🧪 Simulation</span>
          <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 100, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc', fontWeight: 600 }}>PRO</span>
        </div>
        <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, margin: 0 }}>
          Was wäre passiert, wenn dein Rate-Limit anders gewesen wäre? Replay der letzten 7 Tage Traffic gegen ein hypothetisches Limit.
        </p>
      </div>

      {/* Controls */}
      <div style={{
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12, padding: '1.25rem',
        display: 'flex', alignItems: 'flex-end', gap: '1.25rem', flexWrap: 'wrap',
      }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem', fontWeight: 600 }}>
            Hypothetisches Limit (Requests / Fenster)
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <input
              type="range" min={1} max={10000} step={1}
              value={limit}
              onChange={e => setLimit(Number(e.target.value))}
              style={{ flex: 1, accentColor: '#6366f1' }}
            />
            <input
              type="number" min={1} max={999999}
              value={limit}
              onChange={e => setLimit(Math.max(1, Number(e.target.value)))}
              style={{
                width: 80, padding: '0.4rem 0.6rem', borderRadius: 8,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                color: 'white', fontSize: '0.9rem', fontWeight: 700, textAlign: 'center',
              }}
            />
          </div>
          {/* Quick presets */}
          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
            {[10, 50, 100, 200, 500, 1000].map(v => (
              <button key={v} onClick={() => setLimit(v)} style={{
                padding: '2px 10px', borderRadius: 6,
                background: limit === v ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${limit === v ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`,
                color: limit === v ? '#a5b4fc' : 'rgba(255,255,255,0.4)',
                fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600,
              }}>{v}</button>
            ))}
          </div>
        </div>
        <button
          onClick={run}
          disabled={loading}
          style={{
            padding: '0.65rem 1.75rem', borderRadius: 9, border: 'none',
            background: loading ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            color: 'white', fontWeight: 700, fontSize: '0.9rem',
            cursor: loading ? 'wait' : 'pointer',
            boxShadow: loading ? 'none' : '0 6px 20px -6px rgba(99,102,241,0.5)',
            transition: 'all 0.15s', whiteSpace: 'nowrap',
          }}
        >
          {loading ? '⏳ Simuliere…' : '▶ Simulation starten'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: '0.875rem 1rem', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: '0.85rem' }}>
          ⚠ {error}
        </div>
      )}

      {/* No data */}
      {result && !result.hasData && (
        <div style={{ padding: '1.25rem', borderRadius: 12, background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)', color: '#fbbf24', fontSize: '0.875rem' }}>
          📊 {result.message}
        </div>
      )}

      {/* Results */}
      {result?.hasData && result.current && result.simulated && result.delta && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Summary banner */}
          <div style={{
            padding: '1rem 1.25rem', borderRadius: 12,
            background: result.delta.direction === 'fewer_blocks'
              ? 'rgba(16,185,129,0.08)' : result.delta.direction === 'more_blocks'
              ? 'rgba(239,68,68,0.08)' : 'rgba(99,102,241,0.08)',
            border: `1px solid ${result.delta.direction === 'fewer_blocks'
              ? 'rgba(16,185,129,0.25)' : result.delta.direction === 'more_blocks'
              ? 'rgba(239,68,68,0.25)' : 'rgba(99,102,241,0.25)'}`,
          }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'white', marginBottom: '0.25rem' }}>
              {result.delta.direction === 'fewer_blocks' ? '✅' : result.delta.direction === 'more_blocks' ? '⚠️' : 'ℹ️'}{' '}
              {result.delta.summary}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>
              Basierend auf {(result.totalRequests ?? 0).toLocaleString()} Requests der letzten 7 Tage
            </div>
          </div>

          {/* Comparison grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            {/* Current */}
            <div style={{ padding: '1rem', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.875rem' }}>
                🔵 Aktuell — Limit {result.config?.currentLimit}
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#60a5fa' }}>{result.current.allowed.toLocaleString()}</div>
                  <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)' }}>Erlaubt</div>
                </div>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f87171' }}>{result.current.blocked.toLocaleString()}</div>
                  <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)' }}>Blockiert</div>
                </div>
              </div>
              <BarRow label="Erlaubt" value={result.current.allowed} max={result.totalRequests ?? 1} color="#3b82f6" pct={100 - result.current.blockPct} />
              <BarRow label="Blockiert" value={result.current.blocked} max={result.totalRequests ?? 1} color="#ef4444" pct={result.current.blockPct} />
            </div>

            {/* Simulated */}
            <div style={{ padding: '1rem', borderRadius: 12, background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(165,180,252,0.7)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.875rem' }}>
                🟣 Simuliert — Limit {result.config?.hypotheticalLimit}
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#a5b4fc' }}>{result.simulated.allowed.toLocaleString()}</div>
                  <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)' }}>Erlaubt</div>
                </div>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: result.delta.direction === 'fewer_blocks' ? '#34d399' : '#f87171' }}>
                    {result.simulated.blocked.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)' }}>Blockiert</div>
                </div>
              </div>
              <BarRow label="Erlaubt" value={result.simulated.allowed} max={result.totalRequests ?? 1} color="#8b5cf6" pct={100 - result.simulated.blockPct} />
              <BarRow label="Blockiert" value={result.simulated.blocked} max={result.totalRequests ?? 1} color={result.delta.direction === 'fewer_blocks' ? '#10b981' : '#ef4444'} pct={result.simulated.blockPct} />
            </div>
          </div>

          {/* Delta badge */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ padding: '0.5rem 1rem', borderRadius: 9, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>
              <span style={{ fontWeight: 700, color: 'white' }}>Δ Blockiert: </span>
              <span style={{ fontWeight: 700, color: result.delta.direction === 'fewer_blocks' ? '#34d399' : '#f87171' }}>
                {result.delta.direction === 'fewer_blocks' ? '−' : '+'}{Math.abs(result.delta.blockedDiff).toLocaleString()}
              </span>
              {' '}({Math.abs(result.delta.blockedDiffPct)}%)
            </div>
            <div style={{ padding: '0.5rem 1rem', borderRadius: 9, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>
              <span style={{ fontWeight: 700, color: 'white' }}>Blockierrate: </span>
              {result.current.blockPct}% → {result.simulated.blockPct}%
            </div>
          </div>

          {/* Hourly chart preview */}
          {result.hourlyChart && result.hourlyChart.length > 0 && (
            <div style={{ padding: '1rem', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.35)', marginBottom: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Blockierungen pro Stunde — Aktuell vs. Simuliert
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 64, overflow: 'hidden' }}>
                {result.hourlyChart.slice(-32).map((h, i) => {
                  const maxVal = Math.max(...result.hourlyChart!.map(x => Math.max(x.curBlocked, x.simBlocked)), 1);
                  const curH = Math.max(2, (h.curBlocked / maxVal) * 60);
                  const simH = Math.max(2, (h.simBlocked / maxVal) * 60);
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                      <div style={{ flex: 1, height: curH, background: 'rgba(239,68,68,0.5)', borderRadius: '2px 2px 0 0', minWidth: 2 }} title={`Aktuell: ${h.curBlocked}`} />
                      <div style={{ flex: 1, height: simH, background: 'rgba(99,102,241,0.6)', borderRadius: '2px 2px 0 0', minWidth: 2 }} title={`Simuliert: ${h.simBlocked}`} />
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)' }}>
                  <div style={{ width: 10, height: 10, background: 'rgba(239,68,68,0.5)', borderRadius: 2 }} /> Aktuell
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)' }}>
                  <div style={{ width: 10, height: 10, background: 'rgba(99,102,241,0.6)', borderRadius: 2 }} /> Simuliert
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
