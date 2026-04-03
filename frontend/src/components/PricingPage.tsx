import { useState } from 'react';
import { PLANS, formatRequests, type PlanId } from '../lib/plans';
import { api } from '../lib/api';

export function PricingPage() {
  const isLoggedIn = !!localStorage.getItem('token');
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!isLoggedIn) {
      window.location.href = '/register?redirect=pricing';
      return;
    }
    setLoading(true);
    const { data, error } = await api.createCheckoutSession();
    if (data?.url) {
      window.location.href = data.url;
    } else {
      alert(error || 'Fehler beim Erstellen der Checkout-Session');
      setLoading(false);
    }
  };

  const handleEnterprise = () => {
    window.location.href = 'mailto:enterprise@ratelimit-api.com?subject=Enterprise%20Plan%20Anfrage';
  };

  const planList: PlanId[] = ['free', 'pro', 'enterprise'];

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20%', left: '20%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* Nav */}
        <nav style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'white' }}>RateLimit API</span>
          </a>
          {isLoggedIn ? (
            <a href="/dashboard" style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: 'white', textDecoration: 'none', padding: '7px 18px', borderRadius: 8, fontSize: '0.9rem', fontWeight: 600 }}>Dashboard →</a>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <a href="/login" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', padding: '7px 14px', fontSize: '0.9rem' }}>Anmelden</a>
              <a href="/register" style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: 'white', textDecoration: 'none', padding: '7px 18px', borderRadius: 8, fontSize: '0.9rem', fontWeight: 600 }}>Kostenlos starten</a>
            </div>
          )}
        </nav>

        {/* Header */}
        <div style={{ textAlign: 'center', padding: '4rem 2rem 3rem', maxWidth: 700, margin: '0 auto' }}>
          <div style={{ display: 'inline-block', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 50, padding: '4px 16px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginBottom: '1.25rem' }}>
            💜 Transparent & erschwinglich
          </div>
          <h1 style={{ fontSize: 'clamp(2rem,5vw,3.25rem)', fontWeight: 800, color: 'white', marginBottom: '1rem', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Einfache, faire{' '}
            <span style={{ background: 'linear-gradient(135deg,#8b5cf6,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Preise
            </span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.05rem', lineHeight: 1.65 }}>
            Starte kostenlos. Upgrade nur wenn du mehr brauchst.
            Keine versteckten Kosten, kein Vendor Lock-in.
          </p>
        </div>

        {/* Plan Cards */}
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem 6rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
          {planList.map((planId) => {
            const plan = PLANS[planId];
            const isPro = planId === 'pro';
            const isEnterprise = planId === 'enterprise';

            return (
              <div
                key={planId}
                style={{
                  background: isPro
                    ? 'linear-gradient(135deg, rgba(109,40,217,0.15), rgba(139,92,246,0.08))'
                    : 'rgba(14,22,36,0.85)',
                  border: isPro
                    ? '2px solid rgba(139,92,246,0.5)'
                    : '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 20,
                  padding: '2rem',
                  position: 'relative',
                  boxShadow: isPro ? '0 20px 60px -20px rgba(139,92,246,0.35)' : 'none',
                }}
              >
                {/* Popular badge */}
                {plan.badge && (
                  <div style={{
                    position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)',
                    background: plan.gradient, color: 'white',
                    padding: '3px 16px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700,
                    letterSpacing: '0.03em', whiteSpace: 'nowrap',
                  }}>
                    ⭐ {plan.badge}
                  </div>
                )}

                {/* Plan name & icon */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: plan.gradient,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {planId === 'free' && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
                      </svg>
                    )}
                    {planId === 'pro' && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                      </svg>
                    )}
                    {planId === 'enterprise' && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        <polyline points="9 22 9 12 15 12 15 22"/>
                      </svg>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>{plan.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>
                      {planId === 'free' ? 'Für Einsteiger' : planId === 'pro' ? 'Für Entwickler' : 'Für Unternehmen'}
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                    <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', letterSpacing: '-0.04em' }}>
                      {plan.priceLabel}
                    </span>
                    {plan.price !== null && plan.price > 0 && (
                      <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.35)', marginLeft: 2 }}>/Monat</span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
                    {plan.billingNote}
                  </div>
                </div>

                {/* Key stats */}
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 10, padding: '0.875rem', marginBottom: '1.5rem',
                  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem',
                }}>
                  {[
                    ['API Keys', plan.limits.apiKeys === null ? '∞' : String(plan.limits.apiKeys)],
                    ['Requests/Mo', formatRequests(plan.limits.requestsPerMonth)],
                    ['Analytics', plan.limits.analyticsHistory],
                    ['Filter-Regeln', plan.limits.filtersPerConfig === null ? '∞' : String(plan.limits.filtersPerConfig)],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>{label}</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: isPro ? '#c4b5fd' : 'white' }}>{val}</div>
                    </div>
                  ))}
                </div>

                {/* Features list */}
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.75rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {plan.features.map((f) => (
                    <li key={f.label} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', opacity: f.included ? 1 : 0.35 }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                        background: f.included ? (isPro ? 'rgba(139,92,246,0.2)' : 'rgba(34,197,94,0.15)') : 'rgba(255,255,255,0.04)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {f.included ? (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={isPro ? '#c4b5fd' : '#4ade80'} strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        ) : (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="3">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        )}
                      </div>
                      <span style={{
                        fontSize: '0.85rem',
                        color: f.included ? (f.highlight && isPro ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.7)') : 'rgba(255,255,255,0.3)',
                        fontWeight: f.highlight && f.included ? 600 : 400,
                      }}>
                        {f.label}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {planId === 'free' && (
                  <a
                    href={isLoggedIn ? '/dashboard' : '/register'}
                    style={{
                      display: 'block', width: '100%', textAlign: 'center',
                      padding: '0.75rem', borderRadius: 10, fontSize: '0.95rem', fontWeight: 600,
                      background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)',
                      border: '1px solid rgba(255,255,255,0.1)', textDecoration: 'none',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'}
                  >
                    {isLoggedIn ? 'Dashboard öffnen' : 'Kostenlos starten'}
                  </a>
                )}

                {planId === 'pro' && (
                  <button
                    onClick={handleUpgrade}
                    disabled={loading}
                    style={{
                      display: 'block', width: '100%', padding: '0.875rem', borderRadius: 10,
                      fontSize: '1rem', fontWeight: 700, cursor: loading ? 'wait' : 'pointer',
                      background: 'linear-gradient(135deg,#7c3aed,#8b5cf6)',
                      color: 'white', border: 'none',
                      boxShadow: '0 8px 32px -8px rgba(139,92,246,0.6)',
                      transition: 'transform 0.15s, box-shadow 0.15s',
                      opacity: loading ? 0.7 : 1,
                    }}
                    onMouseEnter={e => { if (!loading) { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px -8px rgba(139,92,246,0.7)'; } }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px -8px rgba(139,92,246,0.6)'; }}
                  >
                    {loading ? 'Weiterleitung…' : 'Jetzt upgraden – €4,99/Mo'}
                  </button>
                )}

                {planId === 'enterprise' && (
                  <button
                    onClick={handleEnterprise}
                    style={{
                      display: 'block', width: '100%', padding: '0.875rem', borderRadius: 10,
                      fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer',
                      background: 'linear-gradient(135deg,#b45309,#f59e0b)',
                      color: 'white', border: 'none',
                      boxShadow: '0 8px 32px -8px rgba(245,158,11,0.4)',
                      transition: 'transform 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'none'}
                  >
                    Kontakt aufnehmen →
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* FAQ teaser */}
        <div style={{ textAlign: 'center', paddingBottom: '4rem', color: 'rgba(255,255,255,0.35)', fontSize: '0.9rem' }}>
          Fragen? →{' '}
          <a href="/faq" style={{ color: '#8b5cf6', textDecoration: 'none', fontWeight: 600 }}>FAQ lesen</a>
          {' '}oder{' '}
          <a href="mailto:support@ratelimit-api.com" style={{ color: '#8b5cf6', textDecoration: 'none', fontWeight: 600 }}>Support kontaktieren</a>
        </div>

        {/* Footer */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '0.85rem' }}>
          © 2026 RateLimit API ·{' '}
          <a href="/impressum" style={{ color: 'inherit', textDecoration: 'none' }}>Impressum</a> ·{' '}
          <a href="/datenschutz" style={{ color: 'inherit', textDecoration: 'none' }}>Datenschutz</a>
        </footer>
      </div>
    </div>
  );
}
