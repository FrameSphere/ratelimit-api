import { useState, useEffect } from 'react';
import { getLatestChangelog } from '../lib/hq';

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

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a' }}>
      {/* Animated Background Gradients – isolated so they never affect scroll */}
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
            <a href="#features" onClick={handleFeaturesClick} style={{ color: 'rgba(255,255,255,0.65)', textDecoration: 'none', padding: '6px 14px', borderRadius: 7, fontSize: '0.9rem', transition: 'color .15s', cursor: 'pointer' }}
               onMouseEnter={e => (e.currentTarget.style.color = 'white')}
               onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}>
              Features
            </a>
            <a href="/changelog" style={{ color: 'rgba(255,255,255,0.65)', textDecoration: 'none', padding: '6px 14px', borderRadius: 7, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6, transition: 'color .15s' }}
               onMouseEnter={e => (e.currentTarget.style.color = 'white')}
               onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
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

          {/* Latest release badge — links to changelog */}
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
            ⚡ Cloudflare Workers • Edge Computing • Global
          </div>

          <h1 style={{ fontSize: 'clamp(2.5rem,8vw,5rem)', fontWeight: '800', marginBottom: '1.5rem', lineHeight: '1.1', letterSpacing: '-0.02em' }}>
            <span style={{ background: 'linear-gradient(135deg,#3b82f6 0%,#8b5cf6 50%,#ec4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Rate Limiting
            </span>
            <br />
            <span style={{ color: 'white' }}>für moderne APIs</span>
          </h1>

          <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.55)', marginBottom: '3rem', maxWidth: '700px', margin: '0 auto 3rem', lineHeight: '1.65' }}>
            Schütze deine APIs vor Missbrauch und Überlastung. Einfache Integration,
            leistungsstarke Kontrolle und detaillierte Analytics – alles in einer Lösung.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '4rem' }}>
            <a href="/register" style={{ fontSize: '1.05rem', padding: '0.9rem 2.25rem', textDecoration: 'none', borderRadius: 10, fontWeight: 700, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: 'white', boxShadow: '0 10px 40px -10px rgba(59,130,246,0.5)' }}>
              Jetzt kostenlos starten →
            </a>
            <a href="#features" onClick={handleFeaturesClick} style={{ fontSize: '1.05rem', padding: '0.9rem 2.25rem', textDecoration: 'none', borderRadius: 10, fontWeight: 600, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
              Mehr erfahren
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
                borderRadius: 16,
                padding: '1.5rem 2rem',
                display: 'flex', alignItems: 'flex-start', gap: '1.25rem',
                transition: 'border-color .2s, transform .15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = (TYPE_COLOR[latestRelease.type] || '#60a5fa') + '60'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = (TYPE_COLOR[latestRelease.type] || '#60a5fa') + '30'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}>

                {/* Icon */}
                <div style={{
                  width: 52, height: 52, flexShrink: 0, borderRadius: 12,
                  background: TYPE_BG[latestRelease.type] || 'rgba(59,130,246,0.12)',
                  border: `1px solid ${TYPE_COLOR[latestRelease.type] || '#60a5fa'}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24,
                }}>
                  {TYPE_ICON[latestRelease.type] || '📋'}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      Neueste Version
                    </span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.88rem', color: TYPE_COLOR[latestRelease.type] || '#60a5fa', background: `${TYPE_BG[latestRelease.type]}`, padding: '2px 9px', borderRadius: 5 }}>
                      {latestRelease.version}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>
                      {fmtDate(latestRelease.created_at)}
                    </span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'white', marginBottom: latestRelease.description ? 6 : 0 }}>
                    {latestRelease.title}
                  </div>
                  {latestRelease.description && (
                    <div style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.55 }}>
                      {latestRelease.description.slice(0, 160)}{latestRelease.description.length > 160 ? '…' : ''}
                    </div>
                  )}
                </div>

                {/* Arrow */}
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
        <div id="features" style={{ maxWidth: '1400px', margin: '4rem auto 8rem', padding: '0 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: '700', marginBottom: '0.75rem', color: 'white' }}>Alles was du brauchst</h2>
            <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.45)', maxWidth: '560px', margin: '0 auto' }}>
              Professionelles Rate Limiting mit Enterprise-Features für Teams jeder Größe
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: '1.5rem' }}>
            {[
              { gradient: ['#3b82f6','#2563eb'], border: 'rgba(59,130,246,0.2)', glow: 'rgba(59,130,246,0.25)', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>, title: 'Echtzeit-Kontrolle', desc: 'Passe deine Rate Limits sofort an – keine Deployments, keine Downtime.' },
              { gradient: ['#8b5cf6','#7c3aed'], border: 'rgba(139,92,246,0.2)', glow: 'rgba(139,92,246,0.25)', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>, title: 'Intelligente Filter', desc: 'IP-Blacklists, Whitelists und User-Agent-Filter für maximale Kontrolle.' },
              { gradient: ['#ec4899','#db2777'], border: 'rgba(236,72,153,0.2)', glow: 'rgba(236,72,153,0.25)', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>, title: 'Detaillierte Analytics', desc: 'Echtzeit-Charts, Request-Logs und vollständige Traffic-Analysen.' },
              { gradient: ['#10b981','#059669'], border: 'rgba(16,185,129,0.2)', glow: 'rgba(16,185,129,0.25)', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>, title: 'Multi-Konfiguration', desc: 'Mehrere API Keys mit unterschiedlichen Limits für verschiedene Umgebungen.' },
              { gradient: ['#f59e0b','#d97706'], border: 'rgba(245,158,11,0.2)', glow: 'rgba(245,158,11,0.25)', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>, title: 'Edge Performance', desc: 'Cloudflare Workers Edge Network – minimale Latenz, global verfügbar.' },
              { gradient: ['#6366f1','#4f46e5'], border: 'rgba(99,102,241,0.2)', glow: 'rgba(99,102,241,0.25)', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>, title: 'Enterprise Security', desc: 'JWT-Tokens, OAuth und vollständige Zugriffskontrolle für Teams.' },
            ].map(f => (
              <div key={f.title} style={{ background: `linear-gradient(135deg,${f.border.replace('0.2','0.05')} 0%,transparent 100%)`, border: `1px solid ${f.border}`, borderRadius: 14, padding: '1.75rem', transition: 'transform .2s,box-shadow .2s', cursor: 'default' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform='translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow=`0 16px 50px -10px ${f.glow}`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform='none'; (e.currentTarget as HTMLElement).style.boxShadow='none'; }}>
                <div style={{ width:52,height:52,borderRadius:10,background:`linear-gradient(135deg,${f.gradient[0]},${f.gradient[1]})`,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'1.25rem' }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize:'1.15rem',fontWeight:700,color:'white',marginBottom:'0.6rem' }}>{f.title}</h3>
                <p style={{ color:'rgba(255,255,255,0.5)',lineHeight:1.6,fontSize:'0.9rem' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ── */}
        <div style={{ maxWidth: '1000px', margin: '0 auto 8rem', padding: '0 2rem' }}>
          <div style={{ background: 'linear-gradient(135deg,rgba(59,130,246,0.1),rgba(139,92,246,0.1),rgba(236,72,153,0.1))', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 24, padding: '3.5rem 2.5rem', textAlign: 'center' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: '700', marginBottom: '0.75rem', color: 'white' }}>Kostenlos starten</h2>
            <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.5)', maxWidth: 520, margin: '0 auto 2rem', lineHeight: 1.6 }}>
              Keine Kreditkarte erforderlich. Upgrade jederzeit möglich.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/register" style={{ fontSize: '1.1rem', padding: '0.9rem 2.5rem', textDecoration: 'none', borderRadius: 10, fontWeight: 700, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: 'white', boxShadow: '0 10px 40px -10px rgba(59,130,246,0.5)' }}>
                Jetzt durchstarten →
              </a>
              <a href="/changelog" style={{ fontSize: '1.1rem', padding: '0.9rem 2.5rem', textDecoration: 'none', borderRadius: 10, fontWeight: 600, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.1)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                Changelog
              </a>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '2.5rem 2rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: '1.75rem', justifyContent: 'center', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              {[['Anmelden','/login'],['Registrieren','/register'],['Dashboard','/dashboard'],['Changelog','/changelog'],['Impressum','/impressum'],['Datenschutz','/datenschutz']].map(([label,href]) => (
                <a key={href} href={href} style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}
                   onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                   onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}>
                  {label}
                </a>
              ))}
            </div>
            <div>© 2026 RateLimit API</div>
          </div>
        </footer>
      </div>

      export default function TestComponent() {
      const obj: any = undefined;

      return <div>{obj.test}</div>;
}

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
