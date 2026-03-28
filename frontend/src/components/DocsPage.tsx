import { useState } from 'react';

// ── Types ────────────────────────────────────────────────────────
type SectionId =
  | 'overview'
  | 'quickstart'
  | 'auth'
  | 'apikeys'
  | 'ratelimit'
  | 'configs'
  | 'filters'
  | 'analytics'
  | 'examples'
  | 'errors'
  | 'support';

interface NavSection {
  id: SectionId;
  label: string;
  icon: React.ReactNode;
}

const NAV: NavSection[] = [
  { id: 'overview', label: 'Übersicht', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
  { id: 'quickstart', label: 'Quick Start', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> },
  { id: 'auth', label: 'Authentifizierung', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> },
  { id: 'apikeys', label: 'API Keys', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg> },
  { id: 'ratelimit', label: 'Rate Limit Check', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  { id: 'configs', label: 'Konfigurationen', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6m5.2-13.2l-4.2 4.2m0 6l4.2 4.2M23 12h-6m-6 0H5m13.2 5.2l-4.2-4.2m0-6l4.2-4.2"/></svg> },
  { id: 'filters', label: 'Filter & Regeln', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg> },
  { id: 'analytics', label: 'Analytics API', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
  { id: 'examples', label: 'Code Beispiele', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg> },
  { id: 'errors', label: 'Status Codes', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
  { id: 'support', label: 'Support', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
];

const BASE_URL = 'https://ratelimit-api.karol-paschek.workers.dev';
const isLoggedIn = () => !!localStorage.getItem('token');

// ── Code block component ─────────────────────────────────────────
function Code({ lang, children }: { lang?: string; children: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(children.trim()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <div style={{ position: 'relative', margin: '1rem 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.04)', borderRadius: '8px 8px 0 0', border: '1px solid rgba(255,255,255,0.08)', borderBottom: 'none', padding: '0.5rem 1rem' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{lang || 'CODE'}</span>
        <button onClick={copy} style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem', borderRadius: 4, border: '1px solid rgba(255,255,255,0.1)', background: copied ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)', color: copied ? '#34d399' : 'rgba(255,255,255,0.45)', cursor: 'pointer', transition: 'all .15s', fontWeight: 600 }}>
          {copied ? '✓ Kopiert' : 'Kopieren'}
        </button>
      </div>
      <pre style={{ margin: 0, padding: '1.25rem', background: '#060b16', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0 0 8px 8px', overflow: 'auto', fontFamily: "'JetBrains Mono','Fira Code',monospace", fontSize: '0.82rem', lineHeight: 1.65, color: '#cbd5e1' }}>
        {children.trim()}
      </pre>
    </div>
  );
}

// ── Method badge ─────────────────────────────────────────────────
function Method({ method }: { method: string }) {
  const colors: Record<string, [string, string]> = {
    GET:    ['rgba(52,211,153,0.12)', '#34d399'],
    POST:   ['rgba(59,130,246,0.12)', '#60a5fa'],
    PUT:    ['rgba(251,191,36,0.12)', '#fbbf24'],
    DELETE: ['rgba(248,113,113,0.12)', '#f87171'],
  };
  const [bg, fg] = colors[method] || ['rgba(255,255,255,0.08)', '#fff'];
  return (
    <span style={{ display: 'inline-block', padding: '0.15rem 0.55rem', borderRadius: 5, background: bg, color: fg, fontSize: '0.72rem', fontWeight: 800, fontFamily: 'monospace', letterSpacing: '0.05em' }}>
      {method}
    </span>
  );
}

// ── Section wrapper ───────────────────────────────────────────────
function Section({ id, title, icon, children }: { id: string; title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section id={id} style={{ marginBottom: '3.5rem', scrollMarginTop: '80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '0.875rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg,rgba(59,130,246,0.2),rgba(139,92,246,0.2))', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa', flexShrink: 0 }}>
          {icon}
        </div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'white', letterSpacing: '-0.02em', margin: 0 }}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

// ── Endpoint row ─────────────────────────────────────────────────
function Endpoint({ method, path, desc }: { method: string; path: string; desc?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, marginBottom: '0.5rem' }}>
      <Method method={method} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <code style={{ fontSize: '0.83rem', color: '#e2e8f0', fontFamily: "'JetBrains Mono','Fira Code',monospace" }}>{path}</code>
        {desc && <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>{desc}</div>}
      </div>
    </div>
  );
}

// ── Param row ────────────────────────────────────────────────────
function Param({ name, type, req, desc }: { name: string; type: string; req?: boolean; desc: string }) {
  return (
    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <td style={{ padding: '0.625rem 0.75rem', fontFamily: 'monospace', fontSize: '0.82rem', color: '#93c5fd', whiteSpace: 'nowrap' }}>{name}</td>
      <td style={{ padding: '0.625rem 0.75rem' }}>
        <span style={{ fontSize: '0.72rem', color: '#fbbf24', background: 'rgba(251,191,36,0.1)', padding: '0.1rem 0.4rem', borderRadius: 4 }}>{type}</span>
      </td>
      <td style={{ padding: '0.625rem 0.75rem' }}>
        {req ? <span style={{ fontSize: '0.72rem', color: '#f87171', background: 'rgba(248,113,113,0.1)', padding: '0.1rem 0.4rem', borderRadius: 4 }}>Pflicht</span> : <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)' }}>Optional</span>}
      </td>
      <td style={{ padding: '0.625rem 0.75rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{desc}</td>
    </tr>
  );
}

function ParamTable({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ overflowX: 'auto', margin: '1rem 0' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, overflow: 'hidden' }}>
        <thead>
          <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
            {['Parameter', 'Typ', 'Pflicht', 'Beschreibung'].map(h => (
              <th key={h} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.07em', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────
export function DocsPage() {
  const [activeSection, setActiveSection] = useState<SectionId>('overview');

  const scrollTo = (id: SectionId) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#080d1a', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '30%', height: '30%', background: 'radial-gradient(circle,rgba(59,130,246,0.07) 0%,transparent 70%)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '25%', height: '25%', background: 'radial-gradient(circle,rgba(139,92,246,0.07) 0%,transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      {/* ── Top nav ── */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(8,13,26,0.92)', backdropFilter: 'blur(16px)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 1.5rem', height: 60, display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'white' }}>RateLimit API</span>
          </a>

          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)' }} />
          <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>Dokumentation</span>

          <div style={{ flex: 1 }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <span style={{ fontSize: '0.72rem', background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)', padding: '0.2rem 0.6rem', borderRadius: 5, fontWeight: 700, fontFamily: 'monospace' }}>
              v1.0
            </span>
            <a href="/" style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', textDecoration: 'none', padding: '0.3rem 0.75rem', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}
               onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'white'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)'; }}
               onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}>
              ← Startseite
            </a>
            {isLoggedIn() ? (
              <a href="/dashboard" style={{ fontSize: '0.82rem', color: 'white', textDecoration: 'none', padding: '0.3rem 0.875rem', borderRadius: 6, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', fontWeight: 600 }}>
                Dashboard →
              </a>
            ) : (
              <a href="/register" style={{ fontSize: '0.82rem', color: 'white', textDecoration: 'none', padding: '0.3rem 0.875rem', borderRadius: 6, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', fontWeight: 600 }}>
                Kostenlos starten
              </a>
            )}
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '2rem 1.5rem', display: 'flex', gap: '2rem', position: 'relative', zIndex: 1 }}>

        {/* ── Sidebar ── */}
        <aside style={{ width: 236, flexShrink: 0, position: 'sticky', top: 76, height: 'fit-content', maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}>
          <div style={{ background: 'rgba(14,22,36,0.8)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '1rem', backdropFilter: 'blur(8px)' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 0.25rem', marginBottom: '0.5rem' }}>
              Inhalt
            </div>
            {NAV.map(item => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  width: '100%', padding: '0.45rem 0.5rem', borderRadius: 6,
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                  fontSize: '0.82rem', fontWeight: activeSection === item.id ? 600 : 400,
                  color: activeSection === item.id ? '#60a5fa' : 'rgba(255,255,255,0.45)',
                  background: activeSection === item.id ? 'rgba(59,130,246,0.1)' : 'transparent',
                  transition: 'all .12s',
                }}
                onMouseEnter={e => { if (activeSection !== item.id) { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)'; } }}
                onMouseLeave={e => { if (activeSection !== item.id) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)'; } }}
              >
                <span style={{ opacity: activeSection === item.id ? 1 : 0.6 }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          {/* Quick start CTA */}
          <div style={{ marginTop: '1rem', background: 'linear-gradient(135deg,rgba(59,130,246,0.1),rgba(139,92,246,0.1))', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 12, padding: '1rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'white', marginBottom: '0.4rem' }}>Bereit loszulegen?</div>
            <div style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.75rem', lineHeight: 1.5 }}>Kostenlos registrieren und in Minuten starten.</div>
            <a href="/register" style={{ display: 'block', textAlign: 'center', padding: '0.45rem', borderRadius: 7, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: 'white', textDecoration: 'none', fontSize: '0.78rem', fontWeight: 700 }}>
              Kostenlos starten →
            </a>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main style={{ flex: 1, minWidth: 0 }}>

          {/* ── Overview ── */}
          <Section id="overview" title="Übersicht" icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>}>
            <p style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              Die <strong style={{ color: 'white' }}>RateLimit API</strong> ist ein gehosteter Rate-Limiting-Service, der auf Cloudflare Workers läuft und global mit minimaler Latenz verfügbar ist. Du kannst damit deine eigene API oder Anwendung vor Missbrauch und Überlastung schützen – ohne eigene Infrastruktur.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '0.875rem', marginBottom: '1.5rem' }}>
              {[
                { icon: '⚡', title: 'Edge-Speed', desc: 'Cloudflare Workers — globales Edge-Netzwerk, Sub-10ms-Latenz', color: '#fbbf24' },
                { icon: '🔒', title: 'Sicher', desc: 'JWT-Auth, OAuth & vollständige Zugriffskontrolle', color: '#34d399' },
                { icon: '📊', title: 'Analytics', desc: 'Echtzeit-Logs, Charts und Traffic-Analysen', color: '#60a5fa' },
                { icon: '🛠', title: 'Flexibel', desc: 'IP-Filter, Whitelist/Blacklist, User-Agent-Regeln', color: '#a78bfa' },
              ].map(f => (
                <div key={f.title} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '1rem' }}>
                  <div style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{f.icon}</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: f.color, marginBottom: '0.25rem' }}>{f.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>{f.desc}</div>
                </div>
              ))}
            </div>

            <div style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 10, padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#60a5fa', marginBottom: '0.4rem' }}>🌐 Base URL</div>
              <code style={{ fontSize: '0.85rem', color: '#e2e8f0', fontFamily: 'monospace' }}>{BASE_URL}</code>
            </div>
          </Section>

          {/* ── Quick Start ── */}
          <Section id="quickstart" title="Quick Start" icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>}>
            <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '1.25rem', fontSize: '0.9rem', lineHeight: 1.7 }}>
              In wenigen Schritten einsatzbereit:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {[
                { n: 1, title: 'Account erstellen', desc: 'Registriere dich kostenlos unter ratelimit-api.karol-paschek.workers.dev/register', cta: { label: 'Registrieren →', href: '/register' } },
                { n: 2, title: 'API Key erstellen', desc: 'Erstelle im Dashboard einen neuen API Key für dein Projekt.' },
                { n: 3, title: 'Rate Limit konfigurieren', desc: 'Definiere max. Anfragen pro Zeitfenster (z.B. 100 req/h). Optional: IP-Filter aktivieren.' },
                { n: 4, title: 'In deine App integrieren', desc: 'Rufe /check mit deinem X-API-Key Header auf, bevor du Anfragen verarbeitest.' },
              ].map(s => (
                <div key={s.n} style={{ display: 'flex', gap: '1rem', padding: '0.875rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                    {s.n}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'white', marginBottom: 3 }}>{s.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>{s.desc}</div>
                    {s.cta && <a href={s.cta.href} style={{ display: 'inline-block', marginTop: 6, fontSize: '0.75rem', color: '#60a5fa', textDecoration: 'none', fontWeight: 600 }}>{s.cta.label}</a>}
                  </div>
                </div>
              ))}
            </div>

            <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)', marginBottom: '0.5rem' }}>Minimales Beispiel:</p>
            <Code lang="javascript">{`const res = await fetch('${BASE_URL}/check', {
  headers: { 'X-API-Key': 'rla_live_YOUR_KEY' }
});
const { allowed, remaining, limit } = await res.json();

if (!allowed) {
  // 429 zurückgeben
  throw new Error('Rate limit exceeded');
}`}</Code>
          </Section>

          {/* ── Auth ── */}
          <Section id="auth" title="Authentifizierung" icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}>
            <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '1.25rem', fontSize: '0.9rem', lineHeight: 1.7 }}>
              Das Dashboard-API verwendet <strong style={{ color: '#60a5fa' }}>JWT Bearer Tokens</strong> für alle Management-Endpoints. Der Rate-Limit-Check nutzt direkt deinen <strong style={{ color: '#60a5fa' }}>X-API-Key</strong> Header.
            </p>

            <h3 style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.75rem' }}>Registrierung</h3>
            <Endpoint method="POST" path="/auth/register" desc="Neuen Account erstellen" />
            <ParamTable>
              <Param name="email" type="string" req desc="Gültige E-Mail-Adresse" />
              <Param name="password" type="string" req desc="Mindestens 8 Zeichen" />
              <Param name="name" type="string" req desc="Anzeigename des Nutzers" />
            </ParamTable>
            <Code lang="json">{`// Request
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "Max Mustermann"
}

// Response 201
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Max Mustermann"
  }
}`}</Code>

            <h3 style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.75rem', marginTop: '1.5rem' }}>Login</h3>
            <Endpoint method="POST" path="/auth/login" desc="Mit E-Mail und Passwort einloggen" />
            <Code lang="json">{`// Request
{
  "email": "user@example.com",
  "password": "securepassword123"
}

// Response 200
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": 1, "email": "user@example.com", "name": "Max Mustermann" }
}`}</Code>

            <h3 style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.75rem', marginTop: '1.5rem' }}>OAuth Login</h3>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>Unterstützte Provider: Google, GitHub, FrameSphere</p>
            <Endpoint method="GET" path="/auth/oauth/google" />
            <Endpoint method="GET" path="/auth/oauth/github" />
            <Endpoint method="GET" path="/auth/oauth/framesphere" />

            <div style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.18)', borderRadius: 8, padding: '0.875rem 1rem', marginTop: '1rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: 700, marginBottom: 4 }}>⚠️ Token-Verwendung</div>
              <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
                Den erhaltenen JWT Token immer als <code style={{ color: '#93c5fd', background: 'rgba(59,130,246,0.1)', padding: '0.1rem 0.35rem', borderRadius: 3 }}>Authorization: Bearer TOKEN</code> Header bei Management-Endpoints mitsenden.
              </div>
            </div>
          </Section>

          {/* ── API Keys ── */}
          <Section id="apikeys" title="API Keys" icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>}>
            <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '1.25rem', fontSize: '0.9rem', lineHeight: 1.7 }}>
              API Keys werden für den Rate-Limit-Check verwendet (<code style={{ color: '#93c5fd', background: 'rgba(59,130,246,0.1)', padding: '0.1rem 0.35rem', borderRadius: 3 }}>X-API-Key</code> Header). Alle Endpoints erfordern einen JWT Token.
            </p>

            <Endpoint method="GET" path="/api/keys" desc="Alle API Keys des aktuellen Nutzers abrufen" />
            <Endpoint method="POST" path="/api/keys" desc="Neuen API Key erstellen" />
            <Endpoint method="DELETE" path="/api/keys/:id" desc="API Key löschen" />

            <h3 style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.75rem', marginTop: '1.5rem' }}>API Key erstellen</h3>
            <Code lang="json">{`// POST /api/keys
// Authorization: Bearer YOUR_JWT_TOKEN

// Request
{
  "keyName": "Production API"
}

// Response 201
{
  "apiKey": {
    "id": 1,
    "api_key": "rla_live_abc123xyz...",
    "key_name": "Production API",
    "is_active": 1,
    "created_at": "2025-01-15T10:30:00Z"
  }
}`}</Code>

            <div style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '0.875rem 1rem', marginTop: '0.75rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#f87171', fontWeight: 700, marginBottom: 4 }}>🔑 Wichtig: Key nur einmal sichtbar</div>
              <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
                Der vollständige <code>api_key</code> wird nur beim Erstellen einmalig angezeigt. Danach ist er aus Sicherheitsgründen nicht mehr abrufbar – speichere ihn sicher!
              </div>
            </div>
          </Section>

          {/* ── Rate Limit Check ── */}
          <Section id="ratelimit" title="Rate Limit Check" icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}>
            <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '1.25rem', fontSize: '0.9rem', lineHeight: 1.7 }}>
              Das ist der Haupt-Endpoint deiner Integration. Rufe ihn vor jeder Anfrage in deiner App auf, um zu prüfen ob das Limit noch nicht erreicht ist.
            </p>

            <Endpoint method="GET" path="/check" desc="Rate Limit prüfen (kein Body)" />
            <Endpoint method="POST" path="/check" desc="Rate Limit prüfen mit optionalem Identifier" />

            <div style={{ marginTop: '1rem' }}>
              <h3 style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.75rem' }}>Request Headers</h3>
              <ParamTable>
                <Param name="X-API-Key" type="string" req desc="Dein API Key (rla_live_...)" />
                <Param name="Content-Type" type="string" desc="application/json (nur bei POST)" />
              </ParamTable>

              <h3 style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.75rem', marginTop: '1.25rem' }}>POST Body (optional)</h3>
              <ParamTable>
                <Param name="identifier" type="string" desc="Eigener Identifier (z.B. User-ID oder E-Mail) um per-User Limits zu implementieren" />
              </ParamTable>

              <h3 style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.75rem', marginTop: '1.25rem' }}>Responses</h3>
              <Code lang="json">{`// ✅ Erlaubt (200 OK)
{
  "allowed": true,
  "remaining": 95,      // Verbleibende Anfragen im aktuellen Fenster
  "limit": 100,         // Maximale Anfragen pro Fenster
  "reset": 1642242600   // Unix-Timestamp: wann das Fenster resettet
}

// ❌ Blockiert (429 Too Many Requests)
{
  "allowed": false,
  "remaining": 0,
  "limit": 100,
  "reset": 1642242600,
  "retry_after": 3600   // Sekunden bis zum Reset
}`}</Code>
            </div>
          </Section>

          {/* ── Configs ── */}
          <Section id="configs" title="Konfigurationen" icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6m5.2-13.2l-4.2 4.2m0 6l4.2 4.2M23 12h-6m-6 0H5m13.2 5.2l-4.2-4.2m0-6l4.2-4.2"/></svg>}>
            <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '1.25rem', fontSize: '0.9rem', lineHeight: 1.7 }}>
              Konfigurationen definieren die Rate-Limit-Regeln für einen API Key. Du kannst mehrere Konfigurationen pro Key erstellen.
            </p>

            <Endpoint method="GET" path="/api/configs/:apiKeyId" desc="Alle Konfigurationen eines API Keys" />
            <Endpoint method="POST" path="/api/configs" desc="Neue Konfiguration erstellen" />
            <Endpoint method="PUT" path="/api/configs/:id" desc="Konfiguration aktualisieren" />
            <Endpoint method="DELETE" path="/api/configs/:id" desc="Konfiguration löschen" />

            <h3 style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.75rem', marginTop: '1.25rem' }}>Konfiguration erstellen</h3>
            <ParamTable>
              <Param name="apiKeyId" type="number" req desc="ID des zugehörigen API Keys" />
              <Param name="name" type="string" req desc="Bezeichnung (z.B. 'Standard Limit')" />
              <Param name="maxRequests" type="number" req desc="Maximale Anfragen pro Zeitfenster" />
              <Param name="windowSeconds" type="number" req desc="Fenstergröße in Sekunden (z.B. 3600 = 1h)" />
            </ParamTable>
            <Code lang="json">{`// POST /api/configs
{
  "apiKeyId": 1,
  "name": "Standard Limit",
  "maxRequests": 100,
  "windowSeconds": 3600
}

// Response 201
{
  "config": {
    "id": 1,
    "name": "Standard Limit",
    "max_requests": 100,
    "window_seconds": 3600,
    "enabled": 1,
    "created_at": "2025-01-15T10:30:00Z"
  }
}`}</Code>
          </Section>

          {/* ── Filters ── */}
          <Section id="filters" title="Filter & Regeln" icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>}>
            <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '1.25rem', fontSize: '0.9rem', lineHeight: 1.7 }}>
              Filter erlauben es dir, spezifische IPs, Netzwerke oder User Agents gezielt zu blockieren oder dauerhaft zu erlauben – unabhängig vom Rate Limit.
            </p>

            <Endpoint method="GET" path="/api/filters/:configId" desc="Alle Filter einer Konfiguration" />
            <Endpoint method="POST" path="/api/filters" desc="Neuen Filter erstellen" />
            <Endpoint method="DELETE" path="/api/filters/:id" desc="Filter löschen" />

            <h3 style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.75rem', marginTop: '1.25rem' }}>Filter-Typen</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '0.625rem', marginBottom: '1.25rem' }}>
              {[
                { type: 'ip_blacklist', desc: 'Einzelne IP blockieren', example: '192.168.1.100' },
                { type: 'ip_whitelist', desc: 'IP immer erlauben', example: '10.0.0.1' },
                { type: 'user_agent', desc: 'User Agent blockieren', example: 'BadBot/1.0' },
              ].map(f => (
                <div key={f.type} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '0.75rem' }}>
                  <code style={{ fontSize: '0.75rem', color: '#a78bfa', background: 'rgba(139,92,246,0.1)', padding: '0.15rem 0.4rem', borderRadius: 4, fontFamily: 'monospace' }}>{f.type}</code>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginTop: 6, marginBottom: 4 }}>{f.desc}</div>
                  <div style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace' }}>z.B.: {f.example}</div>
                </div>
              ))}
            </div>

            <Code lang="json">{`// POST /api/filters
{
  "configId": 1,
  "ruleType": "ip_blacklist",
  "ruleValue": "192.168.1.100",
  "action": "block"
}

// Response 201
{
  "filter": {
    "id": 1,
    "rule_type": "ip_blacklist",
    "rule_value": "192.168.1.100",
    "action": "block",
    "created_at": "2025-01-15T10:30:00Z"
  }
}`}</Code>
          </Section>

          {/* ── Analytics ── */}
          <Section id="analytics" title="Analytics API" icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>}>
            <Endpoint method="GET" path="/api/analytics/:apiKeyId" desc="Statistik-Übersicht mit optionalem Zeitraum" />
            <Endpoint method="GET" path="/api/logs/:apiKeyId" desc="Einzelne Request-Logs abrufen" />

            <ParamTable>
              <Param name="range" type="string" desc="Zeitraum: 24h | 7d | 30d (Default: 24h)" />
            </ParamTable>

            <Code lang="json">{`// GET /api/analytics/1?range=7d

{
  "total": 8750,
  "blocked": 312,
  "uniqueIps": 847,
  "blockedPercent": 3.57,
  "chart": [
    { "hour": "2025-01-15T10:00:00Z", "requests": 428, "blocked": 17 },
    { "hour": "2025-01-15T11:00:00Z", "requests": 392, "blocked": 12 }
  ]
}`}</Code>

            <Code lang="json">{`// GET /api/logs/1?limit=50

{
  "logs": [
    {
      "id": 1,
      "ip": "203.0.113.42",
      "allowed": true,
      "user_agent": "Mozilla/5.0...",
      "created_at": "2025-01-15T10:45:12Z"
    }
  ]
}`}</Code>
          </Section>

          {/* ── Examples ── */}
          <Section id="examples" title="Code Beispiele" icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>}>

            <h3 style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.75rem' }}>Node.js / Express Middleware</h3>
            <Code lang="javascript">{`const axios = require('axios');

const RATE_LIMIT_API = '${BASE_URL}/check';
const API_KEY = process.env.RATELIMIT_API_KEY;

async function rateLimitMiddleware(req, res, next) {
  try {
    const response = await axios.get(RATE_LIMIT_API, {
      headers: { 'X-API-Key': API_KEY },
      timeout: 5000,
    });

    const { allowed, remaining, reset } = response.data;

    // Nützliche Headers setzen
    res.set({
      'X-RateLimit-Limit': response.data.limit,
      'X-RateLimit-Remaining': remaining,
      'X-RateLimit-Reset': reset,
    });

    if (!allowed) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfter: response.data.retry_after,
      });
    }

    next();
  } catch (err) {
    // Bei Fehler: Request durchlassen (fail-open)
    console.error('Rate limit check failed:', err.message);
    next();
  }
}

app.use('/api', rateLimitMiddleware);`}</Code>

            <h3 style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.75rem', marginTop: '1.5rem' }}>Python / FastAPI</h3>
            <Code lang="python">{`import httpx
from fastapi import HTTPException, Request
import os

API_KEY = os.getenv("RATELIMIT_API_KEY")
BASE = "${BASE_URL}"

async def check_rate_limit(identifier: str = None) -> bool:
    async with httpx.AsyncClient() as client:
        body = {"identifier": identifier} if identifier else None
        r = await client.post(
            f"{BASE}/check",
            headers={"X-API-Key": API_KEY},
            json=body,
            timeout=5.0,
        )
        data = r.json()
        return data.get("allowed", False)

# FastAPI dependency
async def rate_limit(request: Request):
    user_ip = request.client.host
    if not await check_rate_limit(identifier=user_ip):
        raise HTTPException(status_code=429, detail="Rate limit exceeded")

@app.get("/api/data", dependencies=[Depends(rate_limit)])
async def get_data():
    return {"data": "your response"}`}</Code>

            <h3 style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.75rem', marginTop: '1.5rem' }}>PHP / Laravel</h3>
            <Code lang="php">{`<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class RateLimitMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $response = Http::withHeaders([
            'X-API-Key' => config('services.ratelimit.key'),
        ])->get('${BASE_URL}/check');

        $data = $response->json();

        if (!$data['allowed']) {
            return response()->json(
                ['error' => 'Rate limit exceeded'],
                429
            )->header('Retry-After', $data['retry_after'] ?? 60);
        }

        return $next($request);
    }
}`}</Code>

            <h3 style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.75rem', marginTop: '1.5rem' }}>cURL</h3>
            <Code lang="bash">{`# Rate Limit prüfen
curl -X GET ${BASE_URL}/check \\
  -H "X-API-Key: rla_live_YOUR_KEY"

# Mit custom Identifier
curl -X POST ${BASE_URL}/check \\
  -H "X-API-Key: rla_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"identifier": "user@example.com"}'`}</Code>
          </Section>

          {/* ── Errors ── */}
          <Section id="errors" title="HTTP Status Codes" icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, overflow: 'hidden' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                    {['Code', 'Status', 'Bedeutung'].map(h => (
                      <th key={h} style={{ padding: '0.6rem 0.875rem', textAlign: 'left', fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.07em', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { code: '200', status: 'OK', desc: 'Anfrage erfolgreich verarbeitet', color: '#34d399' },
                    { code: '201', status: 'Created', desc: 'Ressource erfolgreich erstellt', color: '#34d399' },
                    { code: '400', status: 'Bad Request', desc: 'Fehlende oder ungültige Parameter', color: '#f87171' },
                    { code: '401', status: 'Unauthorized', desc: 'Fehlender oder ungültiger JWT Token', color: '#f87171' },
                    { code: '403', status: 'Forbidden', desc: 'Keine Berechtigung für diese Ressource', color: '#f87171' },
                    { code: '404', status: 'Not Found', desc: 'Ressource nicht gefunden', color: '#fbbf24' },
                    { code: '429', status: 'Too Many Requests', desc: 'Rate Limit überschritten – warte auf Reset', color: '#fb923c' },
                    { code: '500', status: 'Internal Server Error', desc: 'Serverfehler – bitte Support kontaktieren', color: '#f87171' },
                  ].map(row => (
                    <tr key={row.code} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '0.625rem 0.875rem' }}>
                        <code style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: row.color, background: `${row.color}15`, padding: '0.15rem 0.5rem', borderRadius: 4 }}>{row.code}</code>
                      </td>
                      <td style={{ padding: '0.625rem 0.875rem', fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{row.status}</td>
                      <td style={{ padding: '0.625rem 0.875rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)' }}>{row.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* ── Support ── */}
          <Section id="support" title="Support" icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}>
            <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: 1.7 }}>
              Bei Fragen, Bugs oder Feature-Wünschen stehen wir dir zur Verfügung.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '0.875rem' }}>
              {[
                { icon: '🎫', title: 'Support-Ticket', desc: 'Erstelle ein Ticket direkt im Dashboard und erhalte Antworten innerhalb von 24h.', cta: { label: 'Dashboard öffnen', href: '/dashboard' }, color: '#60a5fa' },
                { icon: '🐙', title: 'GitHub', desc: 'Bugs melden, Feature Requests und Open-Source-Code auf GitHub.', cta: { label: 'GitHub öffnen', href: 'https://github.com/FrameSphere/ratelimit-api' }, color: '#a78bfa' },
                { icon: '📧', title: 'E-Mail', desc: 'Direkter Kontakt per E-Mail für komplexe Anfragen.', cta: { label: 'support@ratelimit-api.com', href: 'mailto:support@ratelimit-api.com' }, color: '#34d399' },
              ].map(c => (
                <div key={c.title} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '1.25rem' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.625rem' }}>{c.icon}</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'white', marginBottom: '0.4rem' }}>{c.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.6, marginBottom: '0.875rem' }}>{c.desc}</div>
                  <a href={c.cta.href} target={c.cta.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" style={{ fontSize: '0.78rem', color: c.color, textDecoration: 'none', fontWeight: 600 }}>
                    {c.cta.label} →
                  </a>
                </div>
              ))}
            </div>
          </Section>

        </main>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '2rem 1.5rem', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[['Startseite', '/'], ['Dashboard', '/dashboard'], ['Changelog', '/changelog'], ['FAQ', '/faq'], ['Impressum', '/impressum']].map(([l, h]) => (
            <a key={h} href={h} style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.25)', textDecoration: 'none' }}
               onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
               onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.25)')}>{l}</a>
          ))}
        </div>
        <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.15)' }}>© 2026 RateLimit API</div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080d1a; color: #f1f5f9; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
      `}</style>
    </div>
  );
}
