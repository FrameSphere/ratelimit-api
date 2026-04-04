import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';

interface AnalyticsProps {
  apiKeyId: number;
  apiKeyName?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0c1525', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '0.75rem 1rem', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
      <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', marginBottom: '0.375rem', fontWeight: 600 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
          <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.65)' }}>{p.name}:</span>
          <span style={{ fontSize: '0.8rem', color: 'white', fontWeight: 700 }}>{p.value.toLocaleString('de-DE')}</span>
        </div>
      ))}
    </div>
  );
};

export function Analytics({ apiKeyId, apiKeyName }: AnalyticsProps) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState('24h');
  const [loading, setLoading] = useState(true);
  const [logFilter, setLogFilter] = useState<'all' | 'blocked' | 'allowed'>('all');
  const [activeChart, setActiveChart] = useState<'traffic' | 'blocked'>('traffic');
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    const [analyticsRes, logsRes] = await Promise.all([
      api.getAnalytics(apiKeyId, timeRange),
      api.getRecentLogs(apiKeyId, 100),
    ]);
    if (analyticsRes.data) setAnalytics(analyticsRes.data);
    if (logsRes.data?.logs) setLogs(logsRes.data.logs);
    if (!silent) setLoading(false);
    else setRefreshing(false);
  }, [apiKeyId, timeRange]);

  useEffect(() => { loadData(); }, [loadData]);

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(() => loadData(true), 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 960, margin: '0 auto' }}>
      <div style={{ height: 100, borderRadius: 14, background: 'rgba(255,255,255,0.03)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ height: 280, borderRadius: 14, background: 'rgba(255,255,255,0.03)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <style>{`@keyframes pulse{0%,100%{opacity:.5}50%{opacity:.25}}`}</style>
    </div>
  );

  const summary = analytics?.summary || {};
  const total = summary.total_requests || 0;
  const blocked = summary.blocked_requests || 0;
  const uniqueIps = summary.unique_ips || 0;
  const allowed = total - blocked;
  const blockRate = total > 0 ? Math.round((blocked / total) * 100) : 0;
  const allowRate = 100 - blockRate;

  const hourlyData = (analytics?.hourly || []).map((item: any) => ({
    hour: new Date(item.hour).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
    requests: item.requests || 0,
    blocked: item.blocked || 0,
    allowed: (item.requests || 0) - (item.blocked || 0),
  }));

  const filteredLogs = logFilter === 'all' ? logs
    : logFilter === 'blocked' ? logs.filter(l => l.blocked)
    : logs.filter(l => !l.blocked);

  const statCards = [
    { label: 'Gesamt Requests', value: total.toLocaleString('de-DE'), color: '#60a5fa', icon: '📊', sub: `im ${timeRange === '24h' ? 'letzten Tag' : timeRange === '7d' ? 'letzten 7 Tagen' : 'letzten Monat'}` },
    { label: 'Durchgelassen', value: allowed.toLocaleString('de-DE'), color: '#34d399', icon: '✅', sub: `${allowRate}% aller Requests` },
    { label: 'Blockiert', value: blocked.toLocaleString('de-DE'), color: blockRate > 10 ? '#f87171' : '#fbbf24', icon: '🚫', sub: `${blockRate}% aller Requests`, alert: blockRate > 20 },
    { label: 'Unique IPs', value: uniqueIps.toLocaleString('de-DE'), color: '#a78bfa', icon: '🌐', sub: 'verschiedene Quellen' },
  ];

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.375rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ color: 'white', fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 2 }}>Traffic Analytics</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: refreshing ? '#fbbf24' : '#34d399', animation: refreshing ? 'none' : 'liveBlip 2s ease-in-out infinite' }} />
            {refreshing ? 'Aktualisiere…' : 'Live — aktualisiert alle 30s'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          {(['24h', '7d', '30d'] as const).map(r => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              style={{ padding: '0.4rem 0.875rem', borderRadius: 8, border: '1px solid', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', background: timeRange === r ? 'rgba(59,130,246,0.18)' : 'rgba(255,255,255,0.04)', borderColor: timeRange === r ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.09)', color: timeRange === r ? '#60a5fa' : 'rgba(255,255,255,0.45)' }}
            >
              {r === '24h' ? '24 Stunden' : r === '7d' ? '7 Tage' : '30 Tage'}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '0.75rem', marginBottom: '1.375rem' }}>
        {statCards.map((card, idx) => (
          <div
            key={card.label}
            style={{
              borderRadius: 14, padding: '1.125rem 1.25rem',
              background: card.alert ? 'linear-gradient(135deg,rgba(239,68,68,0.08),rgba(220,38,38,0.04))' : 'rgba(14,22,36,0.85)',
              border: `1px solid ${card.alert ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.07)'}`,
              animation: `fadeUp 0.35s ${idx * 0.07}s both cubic-bezier(0.16,1,0.3,1)`,
              position: 'relative', overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', top: '0.875rem', right: '0.875rem', fontSize: '1.25rem', opacity: 0.4 }}>{card.icon}</div>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>{card.label}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: card.color, letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '0.3rem' }}>{card.value}</div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.28)' }}>{card.sub}</div>
            {card.alert && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.68rem', color: '#f87171', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                ⚠️ Erhöhte Blockierrate
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Block rate bar */}
      <div style={{ marginBottom: '1.375rem', padding: '1rem 1.25rem', borderRadius: 14, background: 'rgba(14,22,36,0.85)', border: '1px solid rgba(255,255,255,0.07)', animation: 'fadeUp 0.35s 0.28s both cubic-bezier(0.16,1,0.3,1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Traffic-Aufteilung</div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: '#34d399' }} />
              Erlaubt ({allowRate}%)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: '#f87171' }} />
              Blockiert ({blockRate}%)
            </div>
          </div>
        </div>
        <div style={{ height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${allowRate}%`, background: 'linear-gradient(90deg,#10b981,#34d399)', borderRadius: 5, transition: 'width 0.8s cubic-bezier(0.16,1,0.3,1)', position: 'relative' }}>
            {blockRate > 0 && (
              <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: `${blockRate / allowRate * 100}%`, background: 'linear-gradient(90deg,transparent,#f87171)', maxWidth: '100%' }} />
            )}
          </div>
        </div>
        {blockRate > 5 && (
          <div style={{ marginTop: '0.5rem', fontSize: '0.72rem', color: blockRate > 20 ? '#f87171' : '#fbbf24' }}>
            {blockRate > 20 ? '🚨 Kritisch: Mehr als 20% aller Requests werden blockiert — Limits ggf. zu restriktiv oder Angriff?' : '⚠️ Hinweis: >5% Blockierrate — prüfe deine Filter und Limits.'}
          </div>
        )}
      </div>

      {/* Traffic Chart */}
      <div style={{ marginBottom: '1.375rem', borderRadius: 14, background: 'rgba(14,22,36,0.85)', border: '1px solid rgba(255,255,255,0.07)', padding: '1.25rem', animation: 'fadeUp 0.35s 0.35s both cubic-bezier(0.16,1,0.3,1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'white' }}>Requests über Zeit</div>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {(['traffic', 'blocked'] as const).map(c => (
              <button key={c} onClick={() => setActiveChart(c)} style={{ padding: '0.3rem 0.75rem', borderRadius: 6, border: '1px solid', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', background: activeChart === c ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)', borderColor: activeChart === c ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.08)', color: activeChart === c ? '#60a5fa' : 'rgba(255,255,255,0.4)' }}>
                {c === 'traffic' ? 'Gesamt Traffic' : 'Blockierungen'}
              </button>
            ))}
          </div>
        </div>

        {hourlyData.length === 0 ? (
          <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '0.85rem' }}>
            Noch keine Daten für diesen Zeitraum
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            {activeChart === 'traffic' ? (
              <AreaChart data={hourlyData} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                <defs>
                  <linearGradient id="gradReq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradBlk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="hour" stroke="rgba(255,255,255,0.15)" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis stroke="rgba(255,255,255,0.1)" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.25)' }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="requests" stroke="#3b82f6" strokeWidth={2} fill="url(#gradReq)" name="Requests" dot={false} activeDot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} />
                <Area type="monotone" dataKey="blocked" stroke="#ef4444" strokeWidth={2} fill="url(#gradBlk)" name="Blockiert" dot={false} activeDot={{ r: 4, fill: '#ef4444', strokeWidth: 0 }} />
              </AreaChart>
            ) : (
              <BarChart data={hourlyData} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="hour" stroke="rgba(255,255,255,0.15)" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis stroke="rgba(255,255,255,0.1)" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.25)' }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="blocked" name="Blockiert" fill="#ef4444" fillOpacity={0.7} radius={[3, 3, 0, 0]} />
                <Bar dataKey="allowed" name="Erlaubt" fill="#10b981" fillOpacity={0.55} radius={[3, 3, 0, 0]} />
                {blockRate > 10 && <ReferenceLine y={Math.max(...hourlyData.map((d: any) => d.requests)) * 0.1} stroke="#fbbf24" strokeDasharray="4 4" strokeOpacity={0.5} />}
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      {/* Top tables */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem', marginBottom: '1.375rem', animation: 'fadeUp 0.35s 0.42s both cubic-bezier(0.16,1,0.3,1)' }}>
        {/* Top Endpoints */}
        <div style={{ borderRadius: 14, background: 'rgba(14,22,36,0.85)', border: '1px solid rgba(255,255,255,0.07)', padding: '1.125rem' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'white', marginBottom: '0.875rem' }}>🎯 Top Endpoints</div>
          {analytics?.topEndpoints?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {analytics.topEndpoints.slice(0, 5).map((ep: any, i: number) => {
                const maxCount = analytics.topEndpoints[0].count;
                const pct = Math.round((ep.count / maxCount) * 100);
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <code style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>{ep.endpoint}</code>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#60a5fa' }}>{ep.count.toLocaleString('de-DE')}</span>
                    </div>
                    <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#3b82f6,#6366f1)', borderRadius: 2, transition: 'width 0.6s cubic-bezier(0.16,1,0.3,1)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem' }}>Keine Daten</div>
          )}
        </div>

        {/* Top IPs */}
        <div style={{ borderRadius: 14, background: 'rgba(14,22,36,0.85)', border: '1px solid rgba(255,255,255,0.07)', padding: '1.125rem' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'white', marginBottom: '0.875rem' }}>🌐 Top IP Adressen</div>
          {analytics?.topIps?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {analytics.topIps.slice(0, 5).map((ip: any, i: number) => {
                const maxCount = analytics.topIps[0].count;
                const pct = Math.round((ip.count / maxCount) * 100);
                const isHeavy = pct === 100;
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <code style={{ fontSize: '0.72rem', color: isHeavy ? '#fbbf24' : 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>{ip.ip_address}</code>
                        {isHeavy && <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#fbbf24', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 4, padding: '1px 5px' }}>TOP</span>}
                      </div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#a78bfa' }}>{ip.count.toLocaleString('de-DE')}</span>
                    </div>
                    <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: isHeavy ? 'linear-gradient(90deg,#f59e0b,#fbbf24)' : 'linear-gradient(90deg,#8b5cf6,#a78bfa)', borderRadius: 2, transition: 'width 0.6s cubic-bezier(0.16,1,0.3,1)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem' }}>Keine Daten</div>
          )}
        </div>
      </div>

      {/* Request Logs */}
      <div style={{ borderRadius: 14, background: 'rgba(14,22,36,0.85)', border: '1px solid rgba(255,255,255,0.07)', padding: '1.125rem', animation: 'fadeUp 0.35s 0.5s both cubic-bezier(0.16,1,0.3,1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'white' }}>📜 Request Logs <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>({filteredLogs.length} Einträge)</span></div>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {(['all', 'allowed', 'blocked'] as const).map(f => (
              <button key={f} onClick={() => setLogFilter(f)} style={{ padding: '0.3rem 0.75rem', borderRadius: 6, border: '1px solid', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', background: logFilter === f ? (f === 'blocked' ? 'rgba(239,68,68,0.15)' : f === 'allowed' ? 'rgba(16,185,129,0.15)' : 'rgba(59,130,246,0.15)') : 'rgba(255,255,255,0.04)', borderColor: logFilter === f ? (f === 'blocked' ? 'rgba(239,68,68,0.3)' : f === 'allowed' ? 'rgba(16,185,129,0.3)' : 'rgba(59,130,246,0.3)') : 'rgba(255,255,255,0.08)', color: logFilter === f ? (f === 'blocked' ? '#f87171' : f === 'allowed' ? '#34d399' : '#60a5fa') : 'rgba(255,255,255,0.4)' }}>
                {f === 'all' ? 'Alle' : f === 'allowed' ? '✅ Erlaubt' : '🚫 Blockiert'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Zeit', 'IP', 'Endpoint', 'Method', 'Status', 'Entscheidung'].map(h => (
                  <th key={h} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.07em', borderBottom: '1px solid rgba(255,255,255,0.05)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredLogs.slice(0, 50).map((log, idx) => (
                <tr key={idx} style={{ transition: 'background 0.1s' }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.018)'} onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}>
                  <td style={{ padding: '0.55rem 0.75rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    {new Date(log.timestamp).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td style={{ padding: '0.55rem 0.75rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <code style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.55)', fontFamily: 'monospace' }}>{log.ip_address}</code>
                  </td>
                  <td style={{ padding: '0.55rem 0.75rem', borderBottom: '1px solid rgba(255,255,255,0.04)', maxWidth: 200 }}>
                    <code style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.55)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', whiteSpace: 'nowrap' }}>{log.endpoint}</code>
                  </td>
                  <td style={{ padding: '0.55rem 0.75rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ padding: '2px 7px', borderRadius: 4, fontSize: '0.65rem', fontWeight: 700, background: 'rgba(59,130,246,0.1)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.15)' }}>{log.method}</span>
                  </td>
                  <td style={{ padding: '0.55rem 0.75rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ padding: '2px 7px', borderRadius: 4, fontSize: '0.65rem', fontWeight: 700, background: log.status_code === 200 ? 'rgba(16,185,129,0.1)' : log.status_code === 429 ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)', color: log.status_code === 200 ? '#34d399' : log.status_code === 429 ? '#f87171' : '#fbbf24', border: `1px solid ${log.status_code === 200 ? 'rgba(16,185,129,0.2)' : log.status_code === 429 ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}` }}>
                      {log.status_code}
                    </span>
                  </td>
                  <td style={{ padding: '0.55rem 0.75rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '2px 8px', borderRadius: 5, fontSize: '0.68rem', fontWeight: 700, background: log.blocked ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', color: log.blocked ? '#f87171' : '#34d399', border: `1px solid ${log.blocked ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}` }}>
                      {log.blocked ? '🚫 Blockiert' : '✅ Erlaubt'}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '2.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '0.85rem' }}>
                    Keine Logs für diesen Filter
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)} }
        @keyframes liveBlip { 0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(52,211,153,0.4)} 50%{opacity:0.6;box-shadow:0 0 0 5px rgba(52,211,153,0)} }
      `}</style>
    </div>
  );
}
