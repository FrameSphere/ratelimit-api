import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../lib/api';
import { PRO_FEATURES } from '../lib/plans';
import { ProGate } from './AlertsTab';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface AnalyticsProps {
  apiKeyId: number;
  apiKeyName?: string;
  isPro?: boolean;
  onUpgrade?: () => void;
}

// ── Tooltip ───────────────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0c1525', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '0.7rem 0.9rem', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', minWidth: 140 }}>
      <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.35rem', fontWeight: 600 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
          <span style={{ fontSize: '0.77rem', color: 'rgba(255,255,255,0.6)' }}>{p.name}:</span>
          <span style={{ fontSize: '0.77rem', color: 'white', fontWeight: 700 }}>{p.value.toLocaleString('de-DE')}</span>
        </div>
      ))}
    </div>
  );
};

// ── Severity badge ─────────────────────────────────────────────────────────────

const SeverityBadge = ({ severity }: { severity: string }) => {
  const colors: Record<string, any> = {
    critical: { bg: 'rgba(239,68,68,0.14)', color: '#f87171', border: 'rgba(239,68,68,0.3)', label: 'Kritisch' },
    warning:  { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: 'rgba(245,158,11,0.28)', label: 'Warnung' },
    info:     { bg: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: 'rgba(59,130,246,0.28)', label: 'Info' },
  };
  const c = colors[severity] || colors.info;
  return (
    <span style={{ padding: '2px 8px', borderRadius: 5, fontSize: '0.65rem', fontWeight: 700, background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
      {c.label}
    </span>
  );
};

// ── Main component ─────────────────────────────────────────────────────────────

export function Analytics({ apiKeyId, apiKeyName, isPro = false, onUpgrade }: AnalyticsProps) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState('24h');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeChart, setActiveChart] = useState<'traffic' | 'blocked'>('traffic');
  const [activeSection, setActiveSection] = useState<'overview' | 'logs' | 'anomaly' | 'retry'>('overview');
  const [exportLoading, setExportLoading] = useState(false);
  const [exportRange, setExportRange] = useState('7d');

  // Log filters
  const [logSearch, setLogSearch] = useState('');
  const [logIpFilter, setLogIpFilter] = useState('');
  const [logStatusFilter, setLogStatusFilter] = useState('');
  const [logMethodFilter, setLogMethodFilter] = useState('');
  const logSearchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    const [analyticsRes, logsRes] = await Promise.all([
      api.getAnalytics(apiKeyId, timeRange),
      api.getRecentLogs(apiKeyId, 200),
    ]);

    if (analyticsRes.data) setAnalytics(analyticsRes.data);
    if (logsRes.data?.logs) setLogs(logsRes.data.logs);
    if (!silent) setLoading(false);
    else setRefreshing(false);
  }, [apiKeyId, timeRange]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    const i = setInterval(() => loadData(true), 30000);
    return () => clearInterval(i);
  }, [loadData]);

  // Filtered logs search with debounce
  const loadFilteredLogs = useCallback(async () => {
    const { data } = await api.getRecentLogs(apiKeyId, 200, {
      ip: logIpFilter || undefined,
      endpoint: logSearch || undefined,
      status: logStatusFilter || undefined,
      method: logMethodFilter || undefined,
    });
    if (data?.logs) setLogs(data.logs);
  }, [apiKeyId, logSearch, logIpFilter, logStatusFilter, logMethodFilter]);

  useEffect(() => {
    if (logSearchTimeout.current) clearTimeout(logSearchTimeout.current);
    logSearchTimeout.current = setTimeout(loadFilteredLogs, 350);
    return () => { if (logSearchTimeout.current) clearTimeout(logSearchTimeout.current); };
  }, [logSearch, logIpFilter, logStatusFilter, logMethodFilter, loadFilteredLogs]);

  const handleExport = async () => {
    if (!isPro) return;
    setExportLoading(true);
    try {
      const blob = await api.exportLogs(apiKeyId, exportRange);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ratelimit-logs-${apiKeyName || apiKeyId}-${exportRange}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Export fehlgeschlagen.');
    }
    setExportLoading(false);
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 980, margin: '0 auto' }}>
      {[100, 280, 200].map((h, i) => (
        <div key={i} style={{ height: h, borderRadius: 14, background: 'rgba(255,255,255,0.03)', animation: 'shimmer 1.5s ease-in-out infinite' }} />
      ))}
      <style>{`@keyframes shimmer{0%,100%{opacity:.5}50%{opacity:.25}}`}</style>
    </div>
  );

  const summary = analytics?.summary || {};
  const total = Number(summary.total_requests) || 0;
  const blocked = Number(summary.blocked_requests) || 0;
  const uniqueIps = Number(summary.unique_ips) || 0;
  const allowed = total - blocked;
  const blockRate = total > 0 ? Math.round((blocked / total) * 100) : 0;
  const allowRate = 100 - blockRate;
  const realtime = analytics?.realtime || {};
  const anomalySignals: any[] = analytics?.anomalySignals || [];
  const retryPatterns: any[] = analytics?.retryPatterns || [];

  const hourlyData = (analytics?.hourly || []).map((item: any) => ({
    hour: new Date(item.hour).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
    Requests: Number(item.requests) || 0,
    Blockiert: Number(item.blocked) || 0,
    Erlaubt: (Number(item.requests) || 0) - (Number(item.blocked) || 0),
  }));

  const TABS = [
    { id: 'overview', label: 'Übersicht' },
    { id: 'logs', label: `Logs (${logs.length})` },
    ...(isPro ? [
      { id: 'anomaly', label: `Anomalien${anomalySignals.length > 0 ? ` (${anomalySignals.length})` : ''}` },
      { id: 'retry', label: 'Retry Insights' },
    ] : []),
  ] as { id: typeof activeSection; label: string }[];

  const inStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, color: 'white', padding: '0.42rem 0.7rem', fontSize: '0.78rem', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s' };

  return (
    <div style={{ maxWidth: 980, margin: '0 auto' }}>

      {/* ── Top bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ color: 'white', fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 2 }}>Traffic Analytics</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.73rem', color: 'rgba(255,255,255,0.3)' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: refreshing ? '#fbbf24' : '#34d399', animation: refreshing ? 'none' : 'liveBlip 2s ease-in-out infinite' }} />
            {refreshing ? 'Aktualisiere…' : 'Live — alle 30s'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {(['24h', '7d', '30d'] as const).map(r => {
            const disabled = !isPro && r !== '24h';
            return (
              <button key={r} onClick={() => !disabled && setTimeRange(r)} disabled={disabled}
                style={{ padding: '0.38rem 0.8rem', borderRadius: 7, border: '1px solid', fontSize: '0.77rem', fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all 0.15s', background: timeRange === r ? 'rgba(59,130,246,0.18)' : 'rgba(255,255,255,0.04)', borderColor: timeRange === r ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.09)', color: timeRange === r ? '#60a5fa' : disabled ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.45)', position: 'relative' }}
              >
                {r === '24h' ? '24h' : r === '7d' ? '7 Tage' : '30 Tage'}
                {disabled && <span style={{ marginLeft: '0.3rem', fontSize: '0.58rem', color: '#a78bfa' }}>PRO</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Realtime counters ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '0.625rem', marginBottom: '1.125rem' }}>
        {[
          { label: 'Letzte Minute', val: realtime.last1min ?? 0, color: '#34d399', sub: 'Req/min (live)', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
          { label: 'Letzte 5 Min', val: realtime.last5min ?? 0, color: '#60a5fa', sub: 'Ø pro Min: ' + (realtime.last5min ? Math.round(realtime.last5min / 5) : 0), icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
          { label: 'Gesamt', val: total.toLocaleString('de-DE'), color: '#60a5fa', sub: timeRange === '24h' ? 'letzte 24h' : timeRange === '7d' ? 'letzte 7 Tage' : 'letzter Monat', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
          { label: 'Blockiert', val: blocked.toLocaleString('de-DE'), color: blockRate > 10 ? '#f87171' : '#fbbf24', sub: `${blockRate}% der Requests`, alert: blockRate > 20, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg> },
          { label: 'Unique IPs', val: uniqueIps.toLocaleString('de-DE'), color: '#a78bfa', sub: 'verschiedene Quellen', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> },
        ].map((s, idx) => (
          <div key={s.label} style={{ borderRadius: 12, padding: '0.875rem 1rem', background: s.alert ? 'linear-gradient(135deg,rgba(239,68,68,0.08),rgba(220,38,38,0.04))' : 'rgba(14,22,36,0.85)', border: `1px solid ${s.alert ? 'rgba(239,68,68,0.22)' : 'rgba(255,255,255,0.07)'}`, animation: `fadeUp 0.3s ${idx * 0.06}s both ease`, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '0.75rem', right: '0.875rem', color: s.color, opacity: 0.35 }}>{s.icon}</div>
            <div style={{ fontSize: '0.62rem', fontWeight: 700, color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.4rem' }}>{s.label}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color, letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '0.25rem' }}>{s.val}</div>
            <div style={{ fontSize: '0.67rem', color: 'rgba(255,255,255,0.25)' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Block rate bar ── */}
      <div style={{ marginBottom: '1.125rem', padding: '0.875rem 1.125rem', borderRadius: 12, background: 'rgba(14,22,36,0.85)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.32)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Traffic-Aufteilung</div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {[{ c: '#34d399', l: `Erlaubt ${allowRate}%` }, { c: '#f87171', l: `Blockiert ${blockRate}%` }].map(x => (
              <div key={x.l} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.38)' }}>
                <div style={{ width: 7, height: 7, borderRadius: 2, background: x.c }} />{x.l}
              </div>
            ))}
          </div>
        </div>
        <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${allowRate}%`, background: 'linear-gradient(90deg,#10b981,#34d399)', borderRadius: 4, transition: 'width 0.8s cubic-bezier(0.16,1,0.3,1)' }} />
        </div>
        {blockRate > 5 && (
          <div style={{ marginTop: '0.4rem', fontSize: '0.7rem', color: blockRate > 20 ? '#f87171' : '#fbbf24', fontWeight: 600 }}>
            {blockRate > 20 ? '🚨 Kritisch: >20% blockiert — mögliche Attacke oder zu restriktive Limits' : '⚠️ Hinweis: >5% Blockierrate — Limits oder Filter prüfen'}
          </div>
        )}
      </div>

      {/* ── Anomaly alert strip (Pro) ── */}
      {isPro && anomalySignals.length > 0 && (
        <div style={{ marginBottom: '1.125rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {anomalySignals.map((sig, i) => (
            <div key={i} style={{ padding: '0.7rem 1rem', borderRadius: 10, background: sig.severity === 'critical' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.08)', border: `1px solid ${sig.severity === 'critical' ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.2)'}`, display: 'flex', alignItems: 'center', gap: '0.75rem', animation: 'fadeUp 0.3s ease' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: sig.severity === 'critical' ? '#ef4444' : '#f59e0b', flexShrink: 0, animation: sig.severity === 'critical' ? 'critPulse 1.5s ease-in-out infinite' : 'none' }} />
              <div style={{ flex: 1, fontSize: '0.8rem', color: sig.severity === 'critical' ? '#fca5a5' : '#fde68a', fontWeight: 600 }}>{sig.message}</div>
              <SeverityBadge severity={sig.severity} />
            </div>
          ))}
        </div>
      )}

      {/* ── Section tabs ── */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.125rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0' }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveSection(tab.id as any)}
            style={{ padding: '0.55rem 1rem', borderRadius: '7px 7px 0 0', border: 'none', background: activeSection === tab.id ? 'rgba(59,130,246,0.12)' : 'transparent', color: activeSection === tab.id ? '#60a5fa' : 'rgba(255,255,255,0.38)', fontSize: '0.82rem', fontWeight: activeSection === tab.id ? 700 : 400, cursor: 'pointer', transition: 'all 0.15s', borderBottom: `2px solid ${activeSection === tab.id ? '#3b82f6' : 'transparent'}`, marginBottom: -1 }}
          >
            {tab.label}
          </button>
        ))}
        {!isPro && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.35rem 0.75rem', borderRadius: 7, background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.18)', fontSize: '0.7rem', color: '#a78bfa', fontWeight: 700, cursor: 'pointer' }}
            onClick={onUpgrade}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            Anomalien & Retry Insights — Pro
          </div>
        )}
      </div>

      {/* ── Overview tab ── */}
      {activeSection === 'overview' && (
        <>
          {/* Chart */}
          <div style={{ marginBottom: '1.125rem', borderRadius: 14, background: 'rgba(14,22,36,0.85)', border: '1px solid rgba(255,255,255,0.07)', padding: '1.125rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'white' }}>Requests über Zeit</div>
              <div style={{ display: 'flex', gap: '0.3rem' }}>
                {(['traffic', 'blocked'] as const).map(c => (
                  <button key={c} onClick={() => setActiveChart(c)} style={{ padding: '0.28rem 0.7rem', borderRadius: 6, border: '1px solid', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', background: activeChart === c ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)', borderColor: activeChart === c ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.08)', color: activeChart === c ? '#60a5fa' : 'rgba(255,255,255,0.4)' }}>
                    {c === 'traffic' ? 'Gesamt Traffic' : 'Blockierungen'}
                  </button>
                ))}
              </div>
            </div>
            {hourlyData.length === 0 ? (
              <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.18)', fontSize: '0.84rem' }}>Noch keine Daten</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                {activeChart === 'traffic' ? (
                  <AreaChart data={hourlyData} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
                    <defs>
                      <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.22}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                      <linearGradient id="gB" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.22}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="hour" stroke="rgba(255,255,255,0.1)" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.28)' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                    <YAxis stroke="rgba(255,255,255,0.08)" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.22)' }} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="Requests" stroke="#3b82f6" strokeWidth={2} fill="url(#gR)" dot={false} activeDot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} />
                    <Area type="monotone" dataKey="Blockiert" stroke="#ef4444" strokeWidth={2} fill="url(#gB)" dot={false} activeDot={{ r: 4, fill: '#ef4444', strokeWidth: 0 }} />
                  </AreaChart>
                ) : (
                  <BarChart data={hourlyData} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="hour" stroke="rgba(255,255,255,0.1)" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.28)' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                    <YAxis stroke="rgba(255,255,255,0.08)" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.22)' }} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="Blockiert" fill="#ef4444" fillOpacity={0.7} radius={[3,3,0,0]} />
                    <Bar dataKey="Erlaubt" fill="#10b981" fillOpacity={0.5} radius={[3,3,0,0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            )}
          </div>

          {/* Top tables */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            {/* Top Endpoints */}
            <div style={{ borderRadius: 14, background: 'rgba(14,22,36,0.85)', border: '1px solid rgba(255,255,255,0.07)', padding: '1rem 1.125rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'white', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>
                Top Endpoints
              </div>
              {(analytics?.topEndpoints || []).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'rgba(255,255,255,0.18)', fontSize: '0.8rem' }}>Keine Daten</div>
              ) : (analytics?.topEndpoints || []).slice(0, 6).map((ep: any, i: number) => {
                const max = analytics.topEndpoints[0].count;
                const pct = Math.round((ep.count / max) * 100);
                const blockedPct = ep.count > 0 ? Math.round((ep.blocked_count / ep.count) * 100) : 0;
                return (
                  <div key={i} style={{ marginBottom: '0.6rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <code style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.58)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '65%' }}>{ep.endpoint || '/'}</code>
                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        {blockedPct > 0 && <span style={{ fontSize: '0.6rem', color: '#f87171', fontWeight: 700 }}>{blockedPct}% blocked</span>}
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#60a5fa' }}>{ep.count}</span>
                      </div>
                    </div>
                    <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#3b82f6,#6366f1)', borderRadius: 2, transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Top IPs */}
            <div style={{ borderRadius: 14, background: 'rgba(14,22,36,0.85)', border: '1px solid rgba(255,255,255,0.07)', padding: '1rem 1.125rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'white', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                Top IPs
              </div>
              {(analytics?.topIps || []).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'rgba(255,255,255,0.18)', fontSize: '0.8rem' }}>Keine Daten</div>
              ) : (analytics?.topIps || []).slice(0, 6).map((ip: any, i: number) => {
                const max = analytics.topIps[0].count;
                const pct = Math.round((ip.count / max) * 100);
                const isTop = i === 0;
                const blockedPct = ip.count > 0 ? Math.round((ip.blocked_count / ip.count) * 100) : 0;
                return (
                  <div key={i} style={{ marginBottom: '0.6rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <code style={{ fontSize: '0.7rem', color: isTop ? '#fbbf24' : 'rgba(255,255,255,0.58)', fontFamily: 'monospace' }}>{ip.ip_address}</code>
                        {isTop && <span style={{ fontSize: '0.58rem', fontWeight: 700, color: '#fbbf24', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 4, padding: '1px 5px' }}>TOP</span>}
                      </div>
                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        {blockedPct > 0 && <span style={{ fontSize: '0.6rem', color: '#f87171', fontWeight: 700 }}>{blockedPct}% blocked</span>}
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#a78bfa' }}>{ip.count}</span>
                      </div>
                    </div>
                    <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: isTop ? 'linear-gradient(90deg,#f59e0b,#fbbf24)' : 'linear-gradient(90deg,#8b5cf6,#a78bfa)', borderRadius: 2, transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ── Logs tab ── */}
      {activeSection === 'logs' && (
        <div style={{ borderRadius: 14, background: 'rgba(14,22,36,0.85)', border: '1px solid rgba(255,255,255,0.07)', padding: '1.125rem' }}>
          {/* Search + filter bar */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              value={logSearch}
              onChange={e => setLogSearch(e.target.value)}
              placeholder="Endpoint suchen…"
              style={{ ...inStyle, flex: '1 1 140px', minWidth: 120 }}
              onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
            <input
              value={logIpFilter}
              onChange={e => setLogIpFilter(e.target.value)}
              placeholder="IP filtern…"
              style={{ ...inStyle, flex: '1 1 120px', minWidth: 110 }}
              onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
            <select value={logStatusFilter} onChange={e => setLogStatusFilter(e.target.value)} style={{ ...inStyle, minWidth: 110, cursor: 'pointer' }}>
              <option value="">Alle Status</option>
              <option value="allowed">Erlaubt</option>
              <option value="blocked">Blockiert</option>
            </select>
            <select value={logMethodFilter} onChange={e => setLogMethodFilter(e.target.value)} style={{ ...inStyle, minWidth: 90, cursor: 'pointer' }}>
              <option value="">Methode</option>
              {['GET','POST','PUT','DELETE','PATCH'].map(m => <option key={m} value={m}>{m}</option>)}
            </select>

            {/* CSV Export — Pro */}
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              {isPro ? (
                <>
                  <select value={exportRange} onChange={e => setExportRange(e.target.value)} style={{ ...inStyle, minWidth: 80, cursor: 'pointer', fontSize: '0.72rem' }}>
                    <option value="24h">24h</option>
                    <option value="7d">7 Tage</option>
                    <option value="30d">30 Tage</option>
                  </select>
                  <button onClick={handleExport} disabled={exportLoading} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.42rem 0.875rem', borderRadius: 7, border: '1px solid rgba(16,185,129,0.25)', background: 'rgba(16,185,129,0.09)', color: '#34d399', fontSize: '0.75rem', fontWeight: 700, cursor: exportLoading ? 'wait' : 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s' }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(16,185,129,0.16)'} onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(16,185,129,0.09)'}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    {exportLoading ? 'Exportiere…' : 'CSV Export'}
                  </button>
                </>
              ) : (
                <button onClick={onUpgrade} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.42rem 0.875rem', borderRadius: 7, border: '1px solid rgba(139,92,246,0.25)', background: 'rgba(139,92,246,0.08)', color: '#a78bfa', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  CSV Export — Pro
                </button>
              )}
            </div>
          </div>

          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', marginBottom: '0.625rem' }}>
            {logs.length} Einträge {(logSearch || logIpFilter || logStatusFilter || logMethodFilter) && '(gefiltert)'}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr>
                  {['Zeit', 'IP', 'Endpoint', 'Method', 'Status', 'Entscheidung'].map(h => (
                    <th key={h} style={{ padding: '0.45rem 0.7rem', textAlign: 'left', fontSize: '0.62rem', fontWeight: 700, color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase', letterSpacing: '0.07em', borderBottom: '1px solid rgba(255,255,255,0.05)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.slice(0, 100).map((log, idx) => (
                  <tr key={idx} onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.016)'} onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'} style={{ transition: 'background 0.1s' }}>
                    <td style={{ padding: '0.5rem 0.7rem', color: 'rgba(255,255,255,0.37)', whiteSpace: 'nowrap', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.72rem' }}>
                      {new Date(log.timestamp).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td style={{ padding: '0.5rem 0.7rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <code style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.52)', fontFamily: 'monospace' }}>{log.ip_address}</code>
                    </td>
                    <td style={{ padding: '0.5rem 0.7rem', borderBottom: '1px solid rgba(255,255,255,0.04)', maxWidth: 180 }}>
                      <code style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.52)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', whiteSpace: 'nowrap' }}>{log.endpoint}</code>
                    </td>
                    <td style={{ padding: '0.5rem 0.7rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: '0.62rem', fontWeight: 700, background: 'rgba(59,130,246,0.1)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.15)' }}>{log.method}</span>
                    </td>
                    <td style={{ padding: '0.5rem 0.7rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: '0.62rem', fontWeight: 700, background: log.status_code === 200 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: log.status_code === 200 ? '#34d399' : '#f87171', border: `1px solid ${log.status_code === 200 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                        {log.status_code}
                      </span>
                    </td>
                    <td style={{ padding: '0.5rem 0.7rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '2px 7px', borderRadius: 5, fontSize: '0.65rem', fontWeight: 700, background: log.blocked ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', color: log.blocked ? '#f87171' : '#34d399', border: `1px solid ${log.blocked ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}` }}>
                        <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'currentColor' }} />
                        {log.blocked ? 'Blockiert' : 'Erlaubt'}
                      </span>
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: '2.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.18)', fontSize: '0.84rem' }}>Keine Logs für diesen Filter</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Anomaly Detection tab (Pro) ── */}
      {activeSection === 'anomaly' && (
        isPro ? (
          <div>
            {anomalySignals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 14, color: 'rgba(255,255,255,0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.875rem', opacity: 0.4 }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div style={{ fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: '0.35rem' }}>Keine Anomalien erkannt</div>
                <div style={{ fontSize: '0.84rem' }}>Dein Traffic sieht normal aus — keine ungewöhnlichen Muster.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {anomalySignals.map((sig, i) => (
                  <div key={i} style={{ borderRadius: 14, background: 'rgba(14,22,36,0.85)', border: `1px solid ${sig.severity === 'critical' ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.2)'}`, padding: '1.125rem 1.25rem', animation: `fadeUp 0.3s ${i * 0.07}s both ease` }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: sig.severity === 'critical' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.1)', border: `1px solid ${sig.severity === 'critical' ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: sig.severity === 'critical' ? '#f87171' : '#fbbf24' }}>
                        {sig.type === 'traffic_spike' ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                          : sig.type === 'high_block_rate' ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                          : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.375rem' }}>
                          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'white' }}>
                            {sig.type === 'traffic_spike' ? 'Traffic-Spike erkannt' : sig.type === 'high_block_rate' ? 'Hohe Blockierrate' : 'IP-Dominanz erkannt'}
                          </div>
                          <SeverityBadge severity={sig.severity} />
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{sig.message}</div>
                        {sig.type === 'traffic_spike' && (
                          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem' }}>
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f87171' }}>{sig.value}x</div>
                              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', fontWeight: 700 }}>Spike-Faktor</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#60a5fa' }}>{sig.baseline}/h</div>
                              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', fontWeight: 700 }}>Ø Baseline</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <ProGate feature={PRO_FEATURES.find(f => f.id === 'anomaly_detection')!} onUpgrade={onUpgrade!} />
        )
      )}

      {/* ── Retry Insights tab (Pro) ── */}
      {activeSection === 'retry' && (
        isPro ? (
          <div style={{ borderRadius: 14, background: 'rgba(14,22,36,0.85)', border: '1px solid rgba(255,255,255,0.07)', padding: '1.125rem' }}>
            <div style={{ marginBottom: '0.875rem' }}>
              <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'white', marginBottom: '0.25rem' }}>Retry & Burst-Muster (letzte 2h)</div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)' }}>IPs mit mehr als 10 Requests in 2 Stunden — Clients die ggf. aggressiv retryen oder Burst-Traffic erzeugen.</div>
            </div>
            {retryPatterns.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 2rem', color: 'rgba(255,255,255,0.2)', fontSize: '0.84rem' }}>
                Keine auffälligen Retry-Muster erkannt
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['IP Adresse', 'Requests (2h)', 'Blockiert', 'Block-Rate', 'Req/s (avg)', 'Bewertung'].map(h => (
                      <th key={h} style={{ padding: '0.45rem 0.75rem', textAlign: 'left', fontSize: '0.62rem', fontWeight: 700, color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase', letterSpacing: '0.07em', borderBottom: '1px solid rgba(255,255,255,0.06)', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {retryPatterns.map((p: any, idx: number) => (
                    <tr key={idx} style={{ transition: 'background 0.1s' }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.016)'} onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}>
                      <td style={{ padding: '0.6rem 0.75rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <code style={{ fontSize: '0.78rem', color: p.isAggressive ? '#f87171' : 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>{p.ip}</code>
                      </td>
                      <td style={{ padding: '0.6rem 0.75rem', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.82rem', fontWeight: 700, color: '#60a5fa' }}>{p.count}</td>
                      <td style={{ padding: '0.6rem 0.75rem', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.82rem', color: p.blockedCount > 0 ? '#f87171' : 'rgba(255,255,255,0.3)' }}>{p.blockedCount}</td>
                      <td style={{ padding: '0.6rem 0.75rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', maxWidth: 60 }}>
                            <div style={{ height: '100%', width: `${Math.min(p.blockRate, 100)}%`, background: p.blockRate > 50 ? '#ef4444' : p.blockRate > 20 ? '#f59e0b' : '#34d399', borderRadius: 2 }} />
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: p.blockRate > 50 ? '#f87171' : p.blockRate > 20 ? '#fbbf24' : '#34d399' }}>{p.blockRate}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.6rem 0.75rem', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', fontFamily: 'monospace' }}>{p.reqPerSecond}</td>
                      <td style={{ padding: '0.6rem 0.75rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        {p.isAggressive ? (
                          <span style={{ padding: '2px 8px', borderRadius: 5, fontSize: '0.65rem', fontWeight: 700, background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>Aggressiv</span>
                        ) : (
                          <span style={{ padding: '2px 8px', borderRadius: 5, fontSize: '0.65rem', fontWeight: 700, background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}>Normal</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <ProGate feature={PRO_FEATURES.find(f => f.id === 'retry_insights')!} onUpgrade={onUpgrade!} />
        )
      )}

      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes liveBlip { 0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(52,211,153,0.4)} 50%{opacity:.6;box-shadow:0 0 0 5px rgba(52,211,153,0)} }
        @keyframes critPulse { 0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.5)} 50%{box-shadow:0 0 0 5px rgba(239,68,68,0)} }
        select option { background: #0c1525; }
      `}</style>
    </div>
  );
}
