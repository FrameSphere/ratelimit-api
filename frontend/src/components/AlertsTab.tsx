import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { PRO_FEATURES, ProFeatureFlag } from '../lib/plans';

interface AlertsTabProps {
  apiKeyId: number | null;
  apiKeyName?: string;
  isPro: boolean;
  onUpgrade: () => void;
}

const WEBHOOK_TYPES = [
  {
    id: 'slack',
    label: 'Slack',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z"/><path d="M20.5 10H19V8.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/><path d="M9.5 14c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5S8 21.33 8 20.5v-5c0-.83.67-1.5 1.5-1.5z"/><path d="M3.5 14H5v1.5c0 .83-.67 1.5-1.5 1.5S2 16.33 2 15.5 2.67 14 3.5 14z"/><path d="M14 14.5c0-.83.67-1.5 1.5-1.5h5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-5c-.83 0-1.5-.67-1.5-1.5z"/><path d="M15.5 19H14v1.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/><path d="M10 9.5C10 8.67 9.33 8 8.5 8h-5C2.67 8 2 8.67 2 9.5S2.67 11 3.5 11h5c.83 0 1.5-.67 1.5-1.5z"/><path d="M8.5 5H10V3.5C10 2.67 9.33 2 8.5 2S7 2.67 7 3.5 7.67 5 8.5 5z"/></svg>,
    placeholder: 'https://hooks.slack.com/services/...',
  },
  {
    id: 'discord',
    label: 'Discord',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><circle cx="9" cy="10" r="1"/><circle cx="15" cy="10" r="1"/></svg>,
    placeholder: 'https://discord.com/api/webhooks/...',
  },
  {
    id: 'custom',
    label: 'Custom HTTP',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
    placeholder: 'https://your-server.com/webhook',
  },
  {
    id: 'email',
    label: 'Email',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    placeholder: 'alerts@deinefirma.com',
    isEmail: true,
  },
];

const AlertIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

const TestIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
);

export function AlertsTab({ apiKeyId, apiKeyName, isPro, onUpgrade }: AlertsTabProps) {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [testingId, setTestingId] = useState<number | null>(null);
  const [testResult, setTestResult] = useState<{ id: number | 'new'; ok: boolean; msg: string } | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: '',
    webhookUrl: '',
    webhookType: 'slack' as 'slack' | 'discord' | 'custom' | 'email',
    email: '',
    emailEnabled: false,
    threshold429Pct: 10,
    thresholdSpikePct: 200,
    thresholdNearLimitPct: 80,
    enabled: true,
  });

  useEffect(() => {
    if (apiKeyId && isPro) loadAlerts();
    else setLoading(false);
  }, [apiKeyId, isPro]);

  const loadAlerts = async () => {
    if (!apiKeyId) return;
    setLoading(true);
    const { data } = await api.getAlerts(apiKeyId);
    if (data?.alerts) setAlerts(data.alerts);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyId) return;
    if (form.webhookType !== 'email' && !form.webhookUrl) { alert('Webhook URL erforderlich'); return; }
    if (form.webhookType === 'email' && !form.email) { alert('Email-Adresse erforderlich'); return; }
    setSaving(true);
    const payload = {
      ...form,
      apiKeyId,
      emailEnabled: form.webhookType === 'email',
      webhookUrl: form.webhookType === 'email' ? null : form.webhookUrl,
    };
    const { error } = await api.createAlert(payload as any);
    if (error) { alert(error); setSaving(false); return; }
    setForm({ name: '', webhookUrl: '', webhookType: 'slack', email: '', emailEnabled: false, threshold429Pct: 10, thresholdSpikePct: 200, thresholdNearLimitPct: 80, enabled: true });
    setShowCreate(false);
    await loadAlerts();
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    await api.deleteAlert(id);
    setConfirmDelete(null);
    await loadAlerts();
    setDeletingId(null);
  };

  const handleToggleAlert = async (alert: any) => {
    await api.updateAlert(alert.id, { enabled: !alert.enabled });
    await loadAlerts();
  };

  const handleTest = async (webhookUrl: string, webhookType: string, id: number | 'new') => {
    setTestingId(typeof id === 'number' ? id : -1);
    setTestResult(null);
    const { data } = await api.testWebhook(webhookUrl, webhookType);
    setTestResult({ id, ok: data?.success ?? false, msg: data?.message || 'Unbekannter Fehler' });
    setTestingId(null);
    setTimeout(() => setTestResult(null), 4000);
  };

  // ── Pro gate ──────────────────────────────────────────────────────────────
  if (!isPro) {
    return (
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <ProGate
          feature={PRO_FEATURES.find(f => f.id === 'alerts')!}
          onUpgrade={onUpgrade}
        />
      </div>
    );
  }

  if (!apiKeyId) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, textAlign: 'center', gap: '1rem' }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24' }}><AlertIcon /></div>
        <div>
          <div style={{ color: 'white', fontWeight: 700, marginBottom: 4 }}>Kein API Key ausgewählt</div>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>Wähle zuerst einen Key um Alerts zu konfigurieren.</div>
        </div>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '0.575rem 0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'white', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s' };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.35rem' };

  return (
    <div style={{ maxWidth: 820, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.375rem' }}>
        <div>
          <h2 style={{ color: 'white', fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 2 }}>
            Alert-Konfigurationen
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.32)', fontSize: '0.77rem' }}>
            {alerts.length} Alert{alerts.length !== 1 ? 's' : ''}{apiKeyName ? ` für „${apiKeyName}"` : ''} — Slack, Discord, Custom Webhook
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: showCreate ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg,#f59e0b,#fbbf24)', border: showCreate ? '1px solid rgba(255,255,255,0.1)' : 'none', borderRadius: 8, padding: '0.55rem 1.1rem', color: showCreate ? 'rgba(255,255,255,0.6)' : '#0f172a', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: showCreate ? 'none' : '0 4px 16px -4px rgba(245,158,11,0.5)' }}
        >
          {showCreate ? '✕ Abbrechen' : '+ Neuer Alert'}
        </button>
      </div>

      {/* How alerts work */}
      <div style={{ marginBottom: '1.25rem', padding: '0.875rem 1.125rem', borderRadius: 12, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.14)', display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
        {[
          { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>, label: 'Traffic Spike', desc: 'Wenn Traffic plötzlich explodiert' },
          { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>, label: '429-Rate Alert', desc: 'Bei hoher Blockierungsrate' },
          { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>, label: 'Near Limit', desc: 'Wenn Key fast am Limit ist' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' }}>
            {item.icon}
            <strong style={{ color: 'rgba(255,255,255,0.65)' }}>{item.label}</strong>: {item.desc}
          </div>
        ))}
      </div>

      {/* Create form */}
      {showCreate && (
        <div style={{ marginBottom: '1.25rem', borderRadius: 14, background: 'rgba(14,22,36,0.9)', border: '1px solid rgba(255,255,255,0.09)', padding: '1.375rem', animation: 'slideDown 0.25s cubic-bezier(0.16,1,0.3,1)' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', marginBottom: '1.125rem', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Neuen Alert einrichten</div>
          <form onSubmit={handleCreate}>
            {/* Webhook Type selector */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Kanal</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {WEBHOOK_TYPES.map(wt => (
                  <button
                    key={wt.id}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, webhookType: wt.id as any }))}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.55rem 0.625rem', borderRadius: 8, border: '1px solid', cursor: 'pointer', transition: 'all 0.15s', background: form.webhookType === wt.id ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.04)', borderColor: form.webhookType === wt.id ? 'rgba(245,158,11,0.35)' : 'rgba(255,255,255,0.1)', color: form.webhookType === wt.id ? '#fbbf24' : 'rgba(255,255,255,0.45)', fontSize: '0.78rem', fontWeight: 700 }}
                  >
                    {wt.icon}{wt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Email input (shown only for email type) */}
            {form.webhookType === 'email' && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Email-Adresse</label>
                <input
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="alerts@deinefirma.com"
                  type="email"
                  required
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
                <div style={{ marginTop: '0.35rem', fontSize: '0.68rem', color: 'rgba(255,255,255,0.28)' }}>
                  Benötigt RESEND_API_KEY im Worker-Environment. Email kommt von alerts@ratelimit-api.com.
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.875rem', marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="z.B. Production Alert" style={inputStyle} onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
              </div>
              {form.webhookType !== 'email' && (
                <div>
                  <label style={labelStyle}>Webhook URL</label>
                  <input value={form.webhookUrl} onChange={e => setForm(f => ({ ...f, webhookUrl: e.target.value }))} required placeholder={WEBHOOK_TYPES.find(w => w.id === form.webhookType)?.placeholder} style={inputStyle} onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                </div>
              )}
            </div>

            {/* Thresholds */}
            <div style={{ marginBottom: '1.125rem' }}>
              <label style={{ ...labelStyle, marginBottom: '0.625rem' }}>Schwellenwerte</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.625rem' }}>
                {[
                  { label: '429-Rate ab', key: 'threshold429Pct', suffix: '%', min: 1, max: 100, desc: 'Alert wenn X% der Requests blockiert werden' },
                  { label: 'Traffic-Spike ab', key: 'thresholdSpikePct', suffix: '%', min: 50, max: 1000, desc: 'Alert wenn Traffic um X% steigt' },
                  { label: 'Near-Limit ab', key: 'thresholdNearLimitPct', suffix: '%', min: 50, max: 99, desc: 'Alert wenn Limit-Nutzung X% erreicht' },
                ].map(t => (
                  <div key={t.key} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>{t.label}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <input
                        type="number"
                        value={(form as any)[t.key]}
                        onChange={e => setForm(f => ({ ...f, [t.key]: parseInt(e.target.value) || 0 }))}
                        min={t.min} max={t.max}
                        style={{ ...inputStyle, width: 70, fontSize: '1rem', fontWeight: 700, textAlign: 'center', padding: '0.35rem 0.5rem' }}
                        onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.5)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                      />
                      <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem', fontWeight: 700 }}>{t.suffix}</span>
                    </div>
                    <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.22)', marginTop: '0.3rem', lineHeight: 1.4 }}>{t.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
              <button type="submit" disabled={saving || !form.webhookUrl} style={{ padding: '0.55rem 1.25rem', borderRadius: 8, background: 'linear-gradient(135deg,#f59e0b,#fbbf24)', border: 'none', color: '#0f172a', fontWeight: 700, fontSize: '0.85rem', cursor: saving ? 'wait' : 'pointer', opacity: !form.webhookUrl ? 0.4 : 1, transition: 'opacity 0.2s' }}>
                {saving ? 'Speichere…' : 'Alert erstellen'}
              </button>
              {form.webhookUrl && (
                <button
                  type="button"
                  onClick={() => handleTest(form.webhookUrl, form.webhookType, 'new')}
                  disabled={testingId === -1}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.55rem 1rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  <TestIcon /> {testingId === -1 ? 'Sende…' : 'Webhook testen'}
                </button>
              )}
              {testResult?.id === 'new' && (
                <span style={{ fontSize: '0.78rem', color: testResult.ok ? '#34d399' : '#f87171', fontWeight: 600 }}>
                  {testResult.ok ? '✓' : '✕'} {testResult.msg}
                </span>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Alert list */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1, 2].map(i => <div key={i} style={{ height: 90, borderRadius: 14, background: 'rgba(255,255,255,0.03)', animation: 'pulse 1.5s ease-in-out infinite' }} />)}
        </div>
      ) : alerts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3.5rem 2rem', color: 'rgba(255,255,255,0.25)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 14 }}>
          <div style={{ marginBottom: '0.75rem', opacity: 0.4, display: 'flex', justifyContent: 'center', color: 'rgba(255,255,255,0.3)' }}><AlertIcon /></div>
          <div style={{ fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: '0.375rem' }}>Keine Alerts konfiguriert</div>
          <div style={{ fontSize: '0.85rem' }}>Richte Webhooks ein um sofort über Probleme informiert zu werden.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {alerts.map((alert, idx) => {
            const wt = WEBHOOK_TYPES.find(w => w.id === alert.webhook_type) || WEBHOOK_TYPES[2];
            const isEnabled = alert.enabled === 1 || alert.enabled === true;
            return (
              <div key={alert.id} style={{ borderRadius: 14, background: 'rgba(14,22,36,0.85)', border: `1px solid ${isEnabled ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.07)'}`, padding: '1rem 1.25rem', animation: `fadeUp 0.3s ${idx * 0.06}s both cubic-bezier(0.16,1,0.3,1)` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flexWrap: 'wrap' }}>
                  {/* Toggle */}
                  <button
                    onClick={() => handleToggleAlert(alert)}
                    style={{ flexShrink: 0, width: 36, height: 20, borderRadius: 10, border: 'none', cursor: 'pointer', background: isEnabled ? 'rgba(245,158,11,0.8)' : 'rgba(255,255,255,0.12)', position: 'relative', transition: 'background 0.25s' }}
                  >
                    <div style={{ position: 'absolute', top: 2, left: isEnabled ? 16 : 2, width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'left 0.25s cubic-bezier(0.16,1,0.3,1)', boxShadow: '0 1px 4px rgba(0,0,0,0.35)' }} />
                  </button>

                  {/* Webhook type icon + name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 140 }}>
                    <span style={{ color: '#fbbf24', opacity: 0.8 }}>{wt.icon}</span>
                    <div>
                      <div style={{ color: 'white', fontWeight: 700, fontSize: '0.88rem' }}>{alert.name || 'Alert'}</div>
                      <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>{wt.label}</div>
                    </div>
                  </div>

                  {/* Thresholds */}
                  <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
                    {[
                      { label: '429-Rate', val: `>${alert.threshold_429_pct}%`, color: '#f87171' },
                      { label: 'Spike', val: `>${alert.threshold_spike_pct}%`, color: '#fbbf24' },
                      { label: 'Near Limit', val: `>${alert.threshold_near_limit_pct}%`, color: '#a78bfa' },
                    ].map(t => (
                      <div key={t.label} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: t.color }}>{t.val}</div>
                        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>{t.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0, alignItems: 'center' }}>
                    <button
                      onClick={() => handleTest(alert.webhook_url, alert.webhook_type, alert.id)}
                      disabled={testingId === alert.id}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.75rem', borderRadius: 7, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.55)', fontSize: '0.73rem', fontWeight: 700, cursor: testingId === alert.id ? 'wait' : 'pointer', transition: 'all 0.15s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'}
                    >
                      <TestIcon /> {testingId === alert.id ? '…' : 'Test'}
                    </button>

                    {confirmDelete === alert.id ? (
                      <>
                        <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>Löschen?</span>
                        <button onClick={() => handleDelete(alert.id)} disabled={deletingId === alert.id} style={{ padding: '0.38rem 0.6rem', borderRadius: 6, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: '#f87171', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>
                          {deletingId === alert.id ? '…' : 'Ja'}
                        </button>
                        <button onClick={() => setConfirmDelete(null)} style={{ padding: '0.38rem 0.6rem', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>Nein</button>
                      </>
                    ) : (
                      <button onClick={() => setConfirmDelete(alert.id)} style={{ padding: '0.4rem 0.5rem', borderRadius: 7, border: '1px solid rgba(239,68,68,0.14)', background: 'rgba(239,68,68,0.06)', color: '#f87171', fontSize: '0.78rem', cursor: 'pointer', opacity: 0.7, transition: 'all 0.15s' }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.14)'; }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0.7'; (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.06)'; }}>
                        <TrashIcon />
                      </button>
                    )}
                  </div>
                </div>

                {/* Test result */}
                {testResult?.id === alert.id && (
                  <div style={{ marginTop: '0.625rem', padding: '0.5rem 0.75rem', borderRadius: 7, background: testResult.ok ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${testResult.ok ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`, fontSize: '0.75rem', color: testResult.ok ? '#34d399' : '#f87171', fontWeight: 600 }}>
                    {testResult.ok ? '✓' : '✕'} {testResult.msg}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes slideDown { from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:.5}50%{opacity:.25} }
      `}</style>
    </div>
  );
}

// ── Pro Gate component (reusable) ─────────────────────────────────────────────

export function ProGate({ feature, onUpgrade, compact }: { feature: ProFeatureFlag; onUpgrade: () => void; compact?: boolean }) {
  return (
    <div style={{
      borderRadius: compact ? 10 : 16, padding: compact ? '1.125rem' : '2rem',
      background: 'linear-gradient(135deg,rgba(109,40,217,0.1),rgba(139,92,246,0.06))',
      border: '1px solid rgba(139,92,246,0.2)', textAlign: 'center',
    }}>
      <div style={{ width: compact ? 36 : 52, height: compact ? 36 : 52, borderRadius: compact ? 10 : 14, background: 'rgba(139,92,246,0.14)', border: '1px solid rgba(139,92,246,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', marginBottom: compact ? '0.625rem' : '1rem' }}>
        <svg width={compact ? 16 : 20} height={compact ? 16 : 20} viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      </div>
      <div style={{ fontSize: compact ? '0.875rem' : '1rem', fontWeight: 700, color: 'white', marginBottom: '0.375rem' }}>
        {feature.label} — Pro Feature
      </div>
      <div style={{ fontSize: compact ? '0.78rem' : '0.85rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, maxWidth: 380, margin: '0 auto', marginBottom: compact ? '0.875rem' : '1.25rem' }}>
        {feature.description}
      </div>
      <button
        onClick={onUpgrade}
        style={{ background: 'linear-gradient(135deg,#7c3aed,#8b5cf6)', color: 'white', border: 'none', borderRadius: 9, padding: compact ? '0.5rem 1.25rem' : '0.65rem 1.75rem', fontSize: compact ? '0.82rem' : '0.9rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 24px -6px rgba(139,92,246,0.5)' }}
      >
        Auf Pro upgraden – €4,99/Mo →
      </button>
    </div>
  );
}
