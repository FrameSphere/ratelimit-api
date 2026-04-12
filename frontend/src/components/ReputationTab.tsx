import { useState, useEffect, useCallback } from 'react';
import { api, type IPReputation } from '../lib/api';

interface ReputationTabProps {
  apiKeyId: number | null;
  isPro: boolean;
  onUpgrade: () => void;
}

const RISK_COLOR: Record<string, string> = {
  high: '#f87171',
  medium: '#fbbf24',
  low: '#34d399',
};

const RISK_BG: Record<string, string> = {
  high: 'rgba(239,68,68,0.12)',
  medium: 'rgba(251,191,36,0.1)',
  low: 'rgba(16,185,129,0.1)',
};

const RISK_BORDER: Record<string, string> = {
  high: 'rgba(239,68,68,0.25)',
  medium: 'rgba(251,191,36,0.2)',
  low: 'rgba(16,185,129,0.2)',
};

function ScoreRing({ score, risk }: { score: number; risk: string }) {
  const R = 20;
  const circ = 2 * Math.PI * R;
  const offset = circ * (1 - score / 100);
  const color = RISK_COLOR[risk] ?? '#60a5fa';
  return (
    <svg width="52" height="52" viewBox="0 0 52 52">
      <circle cx="26" cy="26" r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="5" />
      <circle cx="26" cy="26" r={R} fill="none" stroke={color} strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        style={{ transform: 'rotate(-90deg)', transformOrigin: '26px 26px', transition: 'stroke-dashoffset 0.8s cubic-bezier(0.34,1.56,0.64,1)' }}
        filter={`drop-shadow(0 0 4px ${color}90)`}
      />
      <text x="26" y="30" textAnchor="middle" fill="white" fontSize="10" fontWeight="800">{score}</text>
    </svg>
  );
}

function IPCard({ rep, onLookup }: { rep: IPReputation; onLookup: (ip: string) => void }) {
  return (
    <div style={{
      padding: '0.875rem 1rem', borderRadius: 10,
      background: RISK_BG[rep.risk],
      border: `1px solid ${RISK_BORDER[rep.risk]}`,
      display: 'flex', alignItems: 'center', gap: '0.875rem',
      cursor: 'pointer', transition: 'transform 0.12s',
    }}
      onClick={() => onLookup(rep.ip)}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'translateX(2px)'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = ''}
    >
      <ScoreRing score={rep.reputationScore} risk={rep.risk} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
          <code style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white', fontFamily: 'monospace' }}>{rep.ip}</code>
          {rep.stats.isBotUA && (
            <span style={{ fontSize: '0.62rem', padding: '1px 7px', borderRadius: 100, background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24', fontWeight: 700 }}>BOT UA</span>
          )}
          {rep.stats.isAutoBlocked && (
            <span style={{ fontSize: '0.62rem', padding: '1px 7px', borderRadius: 100, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontWeight: 700 }}>GEBLOCKT</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.875rem', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>
          <span>{rep.stats.totalRequests.toLocaleString()} Req</span>
          <span style={{ color: rep.stats.blockRatePct > 50 ? '#f87171' : 'rgba(255,255,255,0.4)' }}>{rep.stats.blockRatePct}% geblockt</span>
          <span>{rep.stats.distinctEndpoints} Endpoints</span>
        </div>
      </div>
      <div style={{
        fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
        color: RISK_COLOR[rep.risk], letterSpacing: '0.05em',
      }}>
        {rep.risk === 'high' ? '🔴 Hoch' : rep.risk === 'medium' ? '🟡 Mittel' : '🟢 Niedrig'}
      </div>
    </div>
  );
}

export function ReputationTab({ apiKeyId, isPro, onUpgrade }: ReputationTabProps) {
  const [topIPs, setTopIPs] = useState<IPReputation[]>([]);
  const [loading, setLoading] = useState(false);
  const [lookupIP, setLookupIP] = useState('');
  const [detail, setDetail] = useState<IPReputation | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTop = useCallback(async () => {
    if (!apiKeyId) return;
    setLoading(true);
    const { data, error: err } = await api.getTopSuspiciousIPs(apiKeyId);
    setLoading(false);
    if (err) { setError(err); return; }
    setTopIPs(data?.ips ?? []);
  }, [apiKeyId]);

  useEffect(() => {
    if (isPro && apiKeyId) loadTop();
  }, [isPro, apiKeyId, loadTop]);

  const lookupSingle = useCallback(async (ip?: string) => {
    const target = ip ?? lookupIP.trim();
    if (!target || !apiKeyId) return;
    setDetailLoading(true);
    setDetail(null);
    const { data, error: err } = await api.getIPReputation(apiKeyId, target);
    setDetailLoading(false);
    if (err) { setError(err); return; }
    setDetail(data ?? null);
    if (!ip) setLookupIP(target);
  }, [apiKeyId, lookupIP]);

  if (!isPro) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320, gap: '1rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem' }}>🛡️</div>
        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>Bot & Abuse Intelligence</div>
        <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)', maxWidth: 400, lineHeight: 1.7 }}>
          IP Reputation Scores, Bot-UA-Erkennung, Behavioral Fingerprinting — erkenne Angreifer bevor sie Schaden anrichten.
        </div>
        <button onClick={onUpgrade} style={{
          padding: '0.65rem 1.75rem', borderRadius: 9,
          background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
          color: 'white', border: 'none', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
        }}>Pro freischalten</button>
      </div>
    );
  }

  if (!apiKeyId) {
    return <div style={{ padding: '2rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>Wähle zuerst einen API Key aus.</div>;
  }

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>🛡️ IP Reputation</span>
            <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 100, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc', fontWeight: 600 }}>PRO</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.38)', margin: 0 }}>
            Reputation-Score pro IP (0–100) basierend auf Blockierrate, Volumen, Bot-UA und Auto-Block-Status.
          </p>
        </div>
        <button onClick={loadTop} disabled={loading} style={{
          padding: '0.5rem 1.125rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)',
          background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)',
          fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600,
        }}>
          {loading ? '⟳ Lädt…' : '↻ Aktualisieren'}
        </button>
      </div>

      {error && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: 9, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: '0.83rem' }}>
          ⚠ {error}
        </div>
      )}

      {/* IP Lookup */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          value={lookupIP}
          onChange={e => setLookupIP(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && lookupSingle()}
          placeholder="IP-Adresse eingeben, z.B. 1.2.3.4"
          style={{
            flex: 1, minWidth: 200, padding: '0.55rem 0.875rem', borderRadius: 8,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'white', fontSize: '0.875rem', fontFamily: 'monospace',
          }}
        />
        <button onClick={() => lookupSingle()} disabled={!lookupIP.trim() || detailLoading} style={{
          padding: '0.55rem 1.25rem', borderRadius: 8, border: 'none',
          background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
          color: 'white', fontWeight: 700, fontSize: '0.875rem',
          cursor: lookupIP.trim() ? 'pointer' : 'not-allowed', opacity: lookupIP.trim() ? 1 : 0.5,
        }}>
          {detailLoading ? '…' : 'Analyse'}
        </button>
      </div>

      {/* Detail card */}
      {detail && (
        <div style={{
          padding: '1.25rem', borderRadius: 12,
          background: RISK_BG[detail.risk], border: `1px solid ${RISK_BORDER[detail.risk]}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <ScoreRing score={detail.reputationScore} risk={detail.risk} />
            <div>
              <code style={{ fontSize: '1rem', fontWeight: 700, color: 'white', fontFamily: 'monospace' }}>{detail.ip}</code>
              <div style={{ fontSize: '0.78rem', color: RISK_COLOR[detail.risk], fontWeight: 700, marginTop: '0.15rem' }}>
                Risiko: {detail.risk === 'high' ? '🔴 Hoch' : detail.risk === 'medium' ? '🟡 Mittel' : '🟢 Niedrig'} ({detail.reputationScore}/100)
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(110px,1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
            {[
              { l: 'Requests', v: detail.stats.totalRequests.toLocaleString() },
              { l: 'Geblockt', v: `${detail.stats.blockRatePct}%` },
              { l: 'Endpoints', v: detail.stats.distinctEndpoints },
              { l: 'Bot UA', v: detail.stats.isBotUA ? '⚠ Ja' : '✓ Nein' },
              { l: 'Auto-Block', v: detail.stats.isAutoBlocked ? '⛔ Aktiv' : '✓ Nein' },
            ].map(s => (
              <div key={s.l} style={{ padding: '0.5rem 0.75rem', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'white' }}>{s.v}</div>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)' }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Factors */}
          {detail.factors.length > 0 && (
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.35)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Erkannte Risikofaktoren
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {detail.factors.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
                    <span style={{ color: RISK_COLOR[detail.risk], flexShrink: 0 }}>▸</span>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          )}

          {detail.factors.length === 0 && (
            <div style={{ fontSize: '0.82rem', color: 'rgba(16,185,129,0.8)' }}>✓ Keine Risikofaktoren erkannt in den letzten 24h</div>
          )}
        </div>
      )}

      {/* Top suspicious IPs */}
      <div>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.35)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Top auffällige IPs (letzte 24h)
        </div>
        {loading && (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>Lade…</div>
        )}
        {!loading && topIPs.length === 0 && (
          <div style={{ padding: '1.25rem', borderRadius: 10, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', color: 'rgba(16,185,129,0.7)', fontSize: '0.85rem', textAlign: 'center' }}>
            ✓ Keine auffälligen IPs in den letzten 24h — alles ruhig!
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {topIPs.map(rep => (
            <IPCard key={rep.ip} rep={rep} onLookup={lookupSingle} />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {[
          { risk: 'high', label: 'Hoch (70–100): Sofortige Aktion empfohlen' },
          { risk: 'medium', label: 'Mittel (40–69): Im Blick behalten' },
          { risk: 'low', label: 'Niedrig (0–39): Normaler Traffic' },
        ].map(({ risk, label }) => (
          <div key={risk} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: RISK_COLOR[risk] }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
