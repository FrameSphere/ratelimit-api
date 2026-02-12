import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnalyticsProps {
  apiKeyId: number;
}

export function Analytics({ apiKeyId }: AnalyticsProps) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState('24h');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [apiKeyId, timeRange]);

  const loadData = async () => {
    setLoading(true);
    
    const [analyticsRes, logsRes] = await Promise.all([
      api.getAnalytics(apiKeyId, timeRange),
      api.getRecentLogs(apiKeyId, 50)
    ]);

    if (analyticsRes.data) {
      setAnalytics(analyticsRes.data);
    }

    if (logsRes.data?.logs) {
      setLogs(logsRes.data.logs);
    }

    setLoading(false);
  };

  if (loading) {
    return <div className="loading">Lädt Analytics...</div>;
  }

  if (!analytics) {
    return null;
  }

  const summary = analytics.summary || {};
  const hourlyData = (analytics.hourly || []).map((item: any) => ({
    hour: new Date(item.hour).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
    requests: item.requests || 0,
    blocked: item.blocked || 0,
  }));

  return (
    <div>
      {/* Time Range Selector */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={() => setTimeRange('24h')}
          className={`btn btn-sm ${timeRange === '24h' ? 'btn-primary' : 'btn-secondary'}`}
        >
          24 Stunden
        </button>
        <button
          onClick={() => setTimeRange('7d')}
          className={`btn btn-sm ${timeRange === '7d' ? 'btn-primary' : 'btn-secondary'}`}
        >
          7 Tage
        </button>
        <button
          onClick={() => setTimeRange('30d')}
          className={`btn btn-sm ${timeRange === '30d' ? 'btn-primary' : 'btn-secondary'}`}
        >
          30 Tage
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-3" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-value">{summary.total_requests || 0}</div>
          <div className="stat-label">Gesamt Requests</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--danger-color)' }}>
            {summary.blocked_requests || 0}
          </div>
          <div className="stat-label">Blockiert</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{summary.unique_ips || 0}</div>
          <div className="stat-label">Unique IPs</div>
        </div>
      </div>

      {/* Chart */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Requests über Zeit</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={hourlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis dataKey="hour" stroke="#cbd5e1" />
            <YAxis stroke="#cbd5e1" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid #475569',
                borderRadius: '6px'
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="requests" stroke="#3b82f6" strokeWidth={2} name="Requests" />
            <Line type="monotone" dataKey="blocked" stroke="#ef4444" strokeWidth={2} name="Blockiert" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Endpoints */}
      {analytics.topEndpoints && analytics.topEndpoints.length > 0 && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Top Endpoints</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Endpoint</th>
                <th>Anzahl</th>
              </tr>
            </thead>
            <tbody>
              {analytics.topEndpoints.map((item: any, idx: number) => (
                <tr key={idx}>
                  <td><code>{item.endpoint}</code></td>
                  <td>{item.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Top IPs */}
      {analytics.topIps && analytics.topIps.length > 0 && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Top IP Adressen</h3>
          <table className="table">
            <thead>
              <tr>
                <th>IP Adresse</th>
                <th>Anzahl</th>
              </tr>
            </thead>
            <tbody>
              {analytics.topIps.map((item: any, idx: number) => (
                <tr key={idx}>
                  <td><code>{item.ip_address}</code></td>
                  <td>{item.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Recent Logs */}
      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>Letzte Requests</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Zeit</th>
                <th>IP</th>
                <th>Endpoint</th>
                <th>Method</th>
                <th>Status</th>
                <th>Blockiert</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, idx) => (
                <tr key={idx}>
                  <td>{new Date(log.timestamp).toLocaleString('de-DE')}</td>
                  <td><code>{log.ip_address}</code></td>
                  <td><code>{log.endpoint}</code></td>
                  <td>{log.method}</td>
                  <td>
                    <span className={`badge ${log.status_code === 200 ? 'badge-success' : 'badge-danger'}`}>
                      {log.status_code}
                    </span>
                  </td>
                  <td>
                    {log.blocked ? (
                      <span className="badge badge-danger">Ja</span>
                    ) : (
                      <span className="badge badge-success">Nein</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
