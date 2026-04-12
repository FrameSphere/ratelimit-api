import { useState, useEffect } from 'react';
import { getLatestChangelog } from '../lib/hq';
import { SeoSection } from './SeoSection';
import { PLANS, formatRequests } from '../lib/plans';

const TYPE_ICON:  Record<string, string> = { feature:'✨', fix:'🐛', improvement:'⚡', security:'🔒', breaking:'💥' };
const TYPE_COLOR: Record<string, string> = {
  feature:'#60a5fa', fix:'#f87171', improvement:'#34d399',
  security:'#fbbf24', breaking:'#f472b6',
};
const TYPE_BG: Record<string, string> = {
  feature:'rgba(96,165,250,0.1)', fix:'rgba(248,113,113,0.1)',
  improvement:'rgba(52,211,153,0.1)', security:'rgba(251,191,36,0.1)',
  breaking:'rgba(244,114,182,0.1)',
};

function fmtDate(iso: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' });
}

export function HomePage() {
  const isLoggedIn = !!localStorage.getItem('token');
  const [latestRelease, setLatestRelease] = useState<any>(null);
  const [releaseLoaded, setReleaseLoaded] = useState(false);

  useEffect(() => {
    getLatestChangelog().then(entry => {
      setLatestRelease(entry);
      setReleaseLoaded(true);
    });
  }, []);

  const handleFeaturesClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };
  const handlePricingClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a' }}>
      {/* Animated Background Gradients */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-50%', left: '-10%', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)', filter: 'blur(60px)', animation: 'float 20s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '-30%', right: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)', filter: 'blur(60px)', animation: 'float 15s ease-in-out infinite reverse' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)', filter: 'blur(60px)', animation: 'float 25s ease-in-out infinite' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Navigation ── */}
        <nav style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="url(#navGrad)" strokeWidth="2">
              <defs>
                <linearGradient id="navGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            <span style={{ fontSize: '1.4rem', fontWeight: '700', color: 'white' }}>RateLimit API</span>
          </div>

          {/* Nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {[
              { label: 'Features', href: '#features', onClick: handleFeaturesClick },
              { label: 'Preise', href: '#pricing', onClick: handlePricingClick },
            ].map(({ label, href, onClick }) => (
              <a key={label} href={href} onClick={onClick}
                style={{ color: 'rgba(255,255,255,0.65)', textDecoration: 'none', padding: '6px 14px', borderRadius: 7, fontSize: '0.9rem', transition: 'color .15s', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'white')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}>
                {label}
              </a>
            ))}
            <a href="/docs" style={{ color: 'rgba(255,255,255,0.65)', textDecoration: 'none', padding: '6px 14px', borderRadius: 7, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6, transition: 'color .15s' }}
               onMouseEnter={e => (e.currentTarget.style.color = 'white')}
               onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              Docs
            </a>
            <a href="/tutorial" style={{ color: 'rgba(255,255,255,0.65)', textDecoration: 'none', padding: '6px 14px', borderRadius: 7, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6, transition: 'color .15s' }}
               onMouseEnter={e => (e.currentTarget.style.color = 'white')}
               onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              Tutorial
            </a>
            <a href="/changelog" style={{ color: 'rgba(255,255,255,0.65)', textDecoration: 'none', padding: '6px 14px', borderRadius: 7, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6, transition: 'color .15s' }}
               onMouseEnter={e => (e.currentTarget.style.color = 'white')}
               onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>
              Changelog
              {releaseLoaded && latestRelease && (
                <span style={{ fontSize: '10px', background: 'rgba(96,165,250,0.2)', color: '#60a5fa', padding: '1px 6px', borderRadius: 4, fontWeight: 700, fontFamily: 'monospace' }}>
                  {latestRelease.version}
                </span>
              )}
            </a>
            <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.12)', margin: '0 6px' }} />
            {isLoggedIn ? (
              <a href="/dashboard" className="btn btn-primary" style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', textDecoration: 'none', padding: '7px 18px', borderRadius: 8, fontSize: '0.9rem', fontWeight: 600 }}>
                Dashboard →
              </a>
            ) : (
              <>
                <a href="/login" style={{ color: 'rgba(255,255,255,0.65)', textDecoration: 'none', padding: '7px 14px', borderRadius: 7, fontSize: '0.9rem' }}>Anmelden</a>
                <a href="/register" className="btn btn-primary" style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', textDecoration: 'none', padding: '7px 18px', borderRadius: 8, fontSize: '0.9rem', fontWeight: 600 }}>
                  Kostenlos starten
                </a>
              </>
            )}
          </div>
        </nav>

        {/* ── Hero ── */}
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '5rem 2rem 4rem', textAlign: 'center' }}>

          {releaseLoaded && latestRelease && (
            <a href="/changelog" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: '1.75rem',
              background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)',
              borderRadius: 50, padding: '5px 16px 5px 10px', transition: 'background .15s' }}
               onMouseEnter={e => (e.currentTarget.style.background = 'rgba(16,185,129,0.14)')}
               onMouseLeave={e => (e.currentTarget.style.background = 'rgba(16,185,129,0.08)')}>
              <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 7px', borderRadius: 4,
                background: 'rgba(52,211,153,0.2)', color: '#34d399', fontFamily: 'monospace', letterSpacing: '0.03em' }}>
                NEU
              </span>
              <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)' }}>
                {TYPE_ICON[latestRelease.type] || '📋'} <strong style={{ color: 'white' }}>{latestRelease.version}</strong>
                {' – '}{latestRelease.title}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>→</span>
            </a>
          )}

          <div style={{ display: 'inline-block', background: 'linear-gradient(135deg,rgba(59,130,246,0.1),rgba(139,92,246,0.1))', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 50, padding: '5px 18px', marginBottom: '1.5rem', fontSize: '0.88rem', color: 'rgba(255,255,255,0.6)' }}>
            ⚡ Smart API Protection Platform • Edge Computing • SDK • Bot Intelligence
          </div>

          <h1 style={{ fontSize: 'clamp(2.5rem,8vw,5rem)', fontWeight: '800', marginBottom: '1.5rem', lineHeight: '1.1', letterSpacing: '-0.02em' }}>
            <span style={{ background: 'linear-gradient(135deg,#3b82f6 0%,#8b5cf6 50%,#ec4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              API Protection
            </span>
            <br />
            <span style={{ color: 'white' }}>der nächsten Generation</span>
          </h1>

          <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.55)', marginBottom: '3rem', maxWidth: '700px', margin: '0 auto 3rem', lineHeight: '1.65' }}>
            Rate Limiting mit JS/Python/Go SDK, IP Reputation Score, Bot-Erkennung,
            What-if Simulation und Adaptive Limits — alles auf Cloudflare Edge.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '4rem' }}>
            <a href="/register" style={{ fontSize: '1.05rem', padding: '0.9rem 2.25rem', textDecoration: 'none', borderRadius: 10, fontWeight: 700, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: 'white', boxShadow: '0 10px 40px -10px rgba(59,130,246,0.5)' }}>
              Jetzt kostenlos starten →
            </a>
            <a href="#pricing" onClick={handlePricingClick} style={{ fontSize: '1.05rem', padding: '0.9rem 2.25rem', textDecoration: 'none', borderRadius: 10, fontWeight: 600, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
              Preise ansehen
            </a>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
            {[['99.9%','Uptime','#3b82f6'],['<10ms','Latenz','#8b5cf6'],['1M+','Requests/Tag','#ec4899']].map(([val, label, color]) => (
              <div key={label}>
                <div style={{ fontSize: '2.25rem', fontWeight: '700', color, marginBottom: '0.4rem' }}>{val}</div>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Latest Release Card ── */}
        {releaseLoaded && latestRelease && (
          <div style={{ maxWidth: '1100px', margin: '0 auto 6rem', padding: '0 2rem' }}>
            <a href="/changelog" style={{ textDecoration: 'none', display: 'block' }}>
              <div style={{
                background: `linear-gradient(135deg, ${TYPE_BG[latestRelease.type] || 'rgba(59,130,246,0.06)'} 0%, rgba(15,23,42,0.4) 100%)`,
                border: `1px solid ${TYPE_COLOR[latestRelease.type] || '#60a5fa'}30`,
                borderRadius: 16, padding: '1.5rem 2rem',
                display: 'flex', alignItems: 'flex-start', gap: '1.25rem',
                transition: 'border-color .2s, transform .15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = (TYPE_COLOR[latestRelease.type] || '#60a5fa') + '60'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = (TYPE_COLOR[latestRelease.type] || '#60a5fa') + '30'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}>
                <div style={{ width: 52, height: 52, flexShrink: 0, borderRadius: 12, background: TYPE_BG[latestRelease.type] || 'rgba(59,130,246,0.12)', border: `1px solid ${TYPE_COLOR[latestRelease.type] || '#60a5fa'}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                  {TYPE_ICON[latestRelease.type] || '📋'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Neueste Version</span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.88rem', color: TYPE_COLOR[latestRelease.type] || '#60a5fa', background: `${TYPE_BG[latestRelease.type]}`, padding: '2px 9px', borderRadius: 5 }}>{latestRelease.version}</span>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>{fmtDate(latestRelease.created_at)}</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'white', marginBottom: latestRelease.description ? 6 : 0 }}>{latestRelease.title}</div>
                  {latestRelease.description && (
                    <div style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.55 }}>
                      {latestRelease.description.slice(0, 160)}{latestRelease.description.length > 160 ? '…' : ''}
                    </div>
                  )}
                </div>
                <div style={{ alignSelf: 'center', fontSize: '1.25rem', color: 'rgba(255,255,255,0.25)', flexShrink: 0 }}>→</div>
              </div>
            </a>
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <a href="/changelog" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}
                 onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                 onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}>
                Alle Versionen im Changelog ansehen →
              </a>
            </div>
          </div>
        )}

        {/* ── Features ── */}
        <div id="features" style={{ maxWidth: '1400px', margin: '4rem auto 0', padding: '0 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: '700', marginBottom: '0.75rem', color: 'white' }}>Smart API Protection Platform</h2>
            <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.45)', maxWidth: '620px', margin: '0 auto' }}>
              Von einfachem Rate Limiting bis zu Enterprise-grade Bot Intelligence — alles in einem Service
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '1.25rem' }}>
            {[
              { gradient: ['#3b82f6','#2563eb'], border: 'rgba(59,130,246,0.2)', glow: 'rgba(59,130,246,0.25)', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>, title: 'Echtzeit-Kontrolle', desc: 'Rate Limits sofort ändern ohne Deploy. Änderungen greifen in unter 1 Sekunde weltweit.' },
              { gradient: ['#8b5cf6','#7c3aed'], border: 'rgba(139,92,246,0.2)', glow: 'rgba(139,92,246,0.25)', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, title: 'IP Reputation Score', desc: 'Automatischer 0–100 Score pro IP basierend auf Blockierrate, Volumen und Bot-User-Agents.' },
              { gradient: ['#ec4899','#db2777'], border: 'rgba(236,72,153,0.2)', glow: 'rgba(236,72,153,0.25)', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg>, title: 'What-if Simulation', desc: '7-Tage Traffic-Replay gegen hypothetisches Limit. Sieh genau wie viele Requests anders blockiert worden wären.' },
              { gradient: ['#10b981','#059669'], border: 'rgba(16,185,129,0.2)', glow: 'rgba(16,185,129,0.25)', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/></svg>, title: 'Adaptive Rate Limits', desc: 'KI analysiert 7-Tage-Traffic und empfiehlt optimale Limits. Ein-Klick-Apply oder vollautomatisch.' },
              { gradient: ['#f59e0b','#d97706'], border: 'rgba(245,158,11,0.2)', glow: 'rgba(245,158,11,0.25)', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>, title: 'Edge Performance', desc: 'Cloudflare Workers — unter 10ms Latenz weltweit, 300+ Points of Presence, kein Origin-Server-Hit.' },
              { gradient: ['#6366f1','#4f46e5'], border: 'rgba(99,102,241,0.2)', glow: 'rgba(99,102,241,0.25)', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>, title: 'Auto IP Blocking', desc: 'Automatische temporäre Sperrung nach N Violations. Konfigurierbar: Schwellwert, Zeitfenster, Sperrdauer.' },
              { gradient: ['#06b6d4','#0891b2'], border: 'rgba(6,182,212,0.2)', glow: 'rgba(6,182,212,0.25)', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>, title: 'Live Stream', desc: 'Echtzeit-Request-Feed mit Attack Mode. Jeder Request live mit IP, Endpoint, Status und Block-Grund.' },
              { gradient: ['#f43f5e','#e11d48'], border: 'rgba(244,63,94,0.2)', glow: 'rgba(244,63,94,0.25)', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>, title: 'Webhook-Alerts', desc: 'Slack, Discord, Custom HTTP mit HMAC-SHA256 Signierung. Plus Scheduled Email Reports.' },
              { gradient: ['#84cc16','#65a30d'], border: 'rgba(132,204,22,0.2)', glow: 'rgba(132,204,22,0.25)', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>, title: 'Sandbox & Explainability', desc: 'Test-Modus ohne echte Requests. Jeder Block erklärt warum und wie der Nutzer das beheben kann.' },
              { gradient: ['#a78bfa','#8b5cf6'], border: 'rgba(167,139,250,0.2)', glow: 'rgba(167,139,250,0.25)', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>, title: 'Anomaly Detection', desc: 'Automatische Erkennung von Traffic-Spikes, erhöhter Blockierrate und IP-Dominanz.' },
              { gradient: ['#fb923c','#ea580c'], border: 'rgba(251,146,60,0.2)', glow: 'rgba(251,146,60,0.25)', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>, title: 'Geo-Blocking', desc: 'Länder-spezifische Regeln mit CF-IPCountry. Blocklists und Allowlists für granulare Zugriffskontrolle.' },
              { gradient: ['#34d399','#10b981'], border: 'rgba(52,211,153,0.2)', glow: 'rgba(52,211,153,0.25)', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>, title: 'Analytics & Near-Limit', desc: '30-Tage Charts, Top-IPs, CSV-Export, Retry-Insights und Gauge-Panel für alle Keys auf einen Blick.' },
            ].map(f => (
              <div key={f.title} style={{ background: `linear-gradient(135deg,${f.border.replace('0.2','0.05')} 0%,transparent 100%)`, border: `1px solid ${f.border}`, borderRadius: 14, padding: '1.75rem', transition: 'transform .2s,box-shadow .2s', cursor: 'default' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform='translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow=`0 16px 50px -10px ${f.glow}`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform='none'; (e.currentTarget as HTMLElement).style.boxShadow='none'; }}>
                <div style={{ width:52,height:52,borderRadius:10,background:`linear-gradient(135deg,${f.gradient[0]},${f.gradient[1]})`,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'1.25rem' }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize:'1.1rem',fontWeight:700,color:'white',marginBottom:'0.6rem' }}>{f.title}</h3>
                <p style={{ color:'rgba(255,255,255,0.5)',lineHeight:1.6,fontSize:'0.88rem' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Integration Gallery ── */}
        <div style={{ maxWidth: '1400px', margin: '6rem auto 8rem', padding: '0 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 50, padding: '4px 14px', fontSize: '0.78rem', color: '#93c5fd', fontWeight: 600, marginBottom: '1rem' }}>
              ⚡ Integration in unter 2 Minuten
            </div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'white', marginBottom: '0.6rem' }}>Offizielles SDK für jeden Stack</h2>
            <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.45)', maxWidth: '500px', margin: '0 auto' }}>
              JS/TS, Python, Go — plus fertige Middleware für alle gängigen Frameworks
            </p>
          </div>

          {/* Code snippet */}
          <div style={{ background: 'rgba(4,9,20,0.9)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, overflow: 'hidden', maxWidth: 680, margin: '0 auto 2.5rem' }}>
            <div style={{ padding: '0.6rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>typescript</span>
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)' }}>Express Middleware</span>
            </div>
            <pre style={{ margin: 0, padding: '1.25rem', fontSize: '0.82rem', lineHeight: 1.7, color: '#e2e8f0', fontFamily: "'Fira Code', monospace", overflowX: 'auto' }}><code>{`import { createExpressMiddleware } from '@ratelimit-api/sdk';

app.use('/api/', createExpressMiddleware({
  apiKey: process.env.RATELIMIT_API_KEY,
  failureMode: 'open',
  onBlocked: (req, res, result) => {
    res.status(429).json({ error: 'Too many requests',
      retryAfter: result.retryAfter });
  },
}));`}</code></pre>
          </div>

          {/* Framework pills */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { icon: '🟢', label: 'Node.js SDK', sub: 'npm install' },
              { icon: '▲', label: 'Next.js', sub: 'Middleware' },
              { icon: '🟠', label: 'CF Workers', sub: 'Snippet' },
              { icon: '🐍', label: 'Python SDK', sub: 'pip install' },
              { icon: '🔵', label: 'Go SDK', sub: 'go get' },
              { icon: '⚡', label: 'REST API', sub: 'cURL / HTTP' },
            ].map(f => (
              <a key={f.label} href="/integrations" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.55rem 1.125rem', borderRadius: 9, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(59,130,246,0.12)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(59,130,246,0.3)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'; }}>
                <span style={{ fontSize: '1rem' }}>{f.icon}</span>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'white' }}>{f.label}</div>
                  <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)' }}>{f.sub}</div>
                </div>
              </a>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
            <a href="/integrations" style={{ fontSize: '0.85rem', color: '#60a5fa', textDecoration: 'none' }}
               onMouseEnter={e => (e.currentTarget.style.color = '#93c5fd')}
               onMouseLeave={e => (e.currentTarget.style.color = '#60a5fa')}>
              Alle Integrationen & SDK-Dokumentation ansehen →
            </a>
          </div>
        </div>

        {/* ── Pricing Section ── */}
        <div id="pricing" style={{ maxWidth: '1200px', margin: '0 auto 8rem', padding: '0 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: '700', color: 'white', marginBottom: '0.75rem' }}>
              Einfache, faire Preise
            </h2>
            <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.45)', maxWidth: '540px', margin: '0 auto' }}>
              Starte kostenlos. Upgrade wenn du mehr brauchst. Kein Lock-in.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
            {/* Free */}
            <HomePricingCard
              planId="free"
              highlight={false}
              ctaLabel={isLoggedIn ? 'Dashboard öffnen' : 'Kostenlos starten'}
              ctaHref={isLoggedIn ? '/dashboard' : '/register'}
            />
            {/* Pro */}
            <HomePricingCard
              planId="pro"
              highlight={true}
              ctaLabel="Jetzt upgraden – €4,99/Mo"
              ctaHref="/pricing"
            />
            {/* Enterprise */}
            <HomePricingCard
              planId="enterprise"
              highlight={false}
              ctaLabel="Kontakt aufnehmen →"
              ctaHref="mailto:enterprise@ratelimit-api.com?subject=Enterprise%20Plan%20Anfrage"
            />
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.75rem' }}>
            <a href="/pricing" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none', fontSize: '0.88rem' }}
               onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
               onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}>
              Vollständige Preisübersicht ansehen →
            </a>
          </div>
        </div>

        {/* ── SEO Content ── */}
        <SeoSection />

        {/* ── CTA ── */}
        <div style={{ maxWidth: '1000px', margin: '3.5rem auto 8rem', padding: '0 2rem' }}>
          <div style={{ background: 'linear-gradient(135deg,rgba(59,130,246,0.1),rgba(139,92,246,0.1),rgba(236,72,153,0.1))', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 24, padding: '3.5rem 2.5rem', textAlign: 'center' }}>
            <a href="/register" style={{ display: 'inline-block', fontSize: '1.25rem', padding: '1rem 3rem', textDecoration: 'none', borderRadius: 12, fontWeight: 800, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: 'white', boxShadow: '0 10px 40px -10px rgba(59,130,246,0.5)', marginBottom: '1.75rem' }}>
              Kostenlos starten →
            </a>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.35)', marginBottom: '0.6rem' }}>Weitere Infos:</p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {[['Dokumentation','/docs'],['FAQ','/faq'],['Preise','/pricing'],['Changelog','/changelog']].map(([label,href]) => (
                <a key={href} href={href} style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.75)', textDecoration: 'none', padding: '0.75rem 2rem', borderRadius: 9, fontWeight: 600, fontSize: '0.95rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '2.5rem 2rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: '1.75rem', justifyContent: 'center', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              {[['Anmelden','/login'],['Registrieren','/register'],['Dashboard','/dashboard'],['Preise','/pricing'],['Docs','/docs'],['Changelog','/changelog'],['Impressum','/impressum'],['Datenschutz','/datenschutz']].map(([label,href]) => (
                <a key={href} href={href} style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}
                   onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                   onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}>
                  {label}
                </a>
              ))}
            </div>
            <div>
              © 2026 RateLimit API · powered by{' '}
              <a href="https://frame-sphere.vercel.app/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>FrameSphere</a>
            </div>
          </div>
        </footer>
      </div>

      <style>{`
        @keyframes float {
          0%,100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(30px,-30px) scale(1.1); }
          66% { transform: translate(-20px,20px) scale(0.9); }
        }
      `}</style>
    </div>
  );
}

// ── Compact pricing card for HomePage ──────────────────────────────────────────

function HomePricingCard({ planId, highlight, ctaLabel, ctaHref }: {
  planId: 'free' | 'pro' | 'enterprise';
  highlight: boolean;
  ctaLabel: string;
  ctaHref: string;
}) {
  const plan = PLANS[planId];
  const isExternal = ctaHref.startsWith('mailto:');

  const topFeatures = plan.features.filter(f => f.included).slice(0, 4);

  return (
    <div style={{
      background: highlight
        ? 'linear-gradient(135deg, rgba(109,40,217,0.15), rgba(139,92,246,0.08))'
        : 'rgba(14,22,36,0.85)',
      border: highlight ? '2px solid rgba(139,92,246,0.45)' : '1px solid rgba(255,255,255,0.07)',
      borderRadius: 18, padding: '1.75rem',
      position: 'relative',
      boxShadow: highlight ? '0 20px 60px -20px rgba(139,92,246,0.3)' : 'none',
    }}>
      {plan.badge && (
        <div style={{
          position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
          background: plan.gradient, color: 'white',
          padding: '2px 14px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700,
          whiteSpace: 'nowrap',
        }}>
          ⭐ {plan.badge}
        </div>
      )}

      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'white' }}>{plan.name}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginTop: '0.5rem' }}>
          <span style={{ fontSize: '2rem', fontWeight: 800, color: 'white', letterSpacing: '-0.04em' }}>
            {plan.priceLabel}
          </span>
          {plan.price !== null && plan.price > 0 && (
            <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)' }}>/Mo</span>
          )}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.28)', marginTop: 2 }}>{plan.billingNote}</div>
      </div>

      {/* Key numbers */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 7, padding: '0.4rem 0.6rem', flex: 1, minWidth: 80 }}>
          <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', fontWeight: 700 }}>Keys</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: highlight ? '#c4b5fd' : 'white' }}>
            {plan.limits.apiKeys === null ? '∞' : plan.limits.apiKeys}
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 7, padding: '0.4rem 0.6rem', flex: 1, minWidth: 80 }}>
          <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', fontWeight: 700 }}>Requests</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: highlight ? '#c4b5fd' : 'white' }}>
            {formatRequests(plan.limits.requestsPerMonth)}
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 7, padding: '0.4rem 0.6rem', flex: 1, minWidth: 80 }}>
          <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', fontWeight: 700 }}>Analytics</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: highlight ? '#c4b5fd' : 'white' }}>
            {plan.limits.analyticsHistory}
          </div>
        </div>
      </div>

      {/* Top features */}
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
        {topFeatures.map(f => (
          <li key={f.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={highlight ? '#a78bfa' : '#4ade80'} strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span style={{ color: 'rgba(255,255,255,0.65)' }}>{f.label}</span>
          </li>
        ))}
      </ul>

      <a
        href={ctaHref}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        style={{
          display: 'block', width: '100%', textAlign: 'center',
          padding: '0.7rem', borderRadius: 9, fontSize: '0.9rem', fontWeight: 700,
          textDecoration: 'none',
          background: highlight
            ? 'linear-gradient(135deg,#7c3aed,#8b5cf6)'
            : planId === 'enterprise'
              ? 'linear-gradient(135deg,#b45309,#f59e0b)'
              : 'rgba(255,255,255,0.06)',
          color: highlight || planId === 'enterprise' ? 'white' : 'rgba(255,255,255,0.7)',
          border: highlight || planId === 'enterprise' ? 'none' : '1px solid rgba(255,255,255,0.1)',
          boxShadow: highlight ? '0 6px 24px -6px rgba(139,92,246,0.55)' : 'none',
          transition: 'transform 0.15s, opacity 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'none'}
      >
        {ctaLabel}
      </a>
    </div>
  );
}
