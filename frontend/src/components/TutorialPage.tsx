import { useState, useRef, useEffect } from 'react';

// ── Shared building blocks ────────────────────────────────────────────────────
function Code({ lang, children }: { lang?: string; children: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ position: 'relative', margin: '0.875rem 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.04)', borderRadius: '8px 8px 0 0', border: '1px solid rgba(255,255,255,0.08)', borderBottom: 'none', padding: '0.45rem 1rem' }}>
        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{lang || 'CODE'}</span>
        <button onClick={() => { navigator.clipboard.writeText(children.trim()); setCopied(true); setTimeout(() => setCopied(false), 1800); }}
          style={{ fontSize: '0.7rem', padding: '0.18rem 0.55rem', borderRadius: 4, border: '1px solid rgba(255,255,255,0.1)', background: copied ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)', color: copied ? '#34d399' : 'rgba(255,255,255,0.4)', cursor: 'pointer', fontWeight: 600 }}>
          {copied ? '✓ Kopiert' : 'Kopieren'}
        </button>
      </div>
      <pre style={{ margin: 0, padding: '1.1rem', background: '#060b16', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0 0 8px 8px', overflow: 'auto', fontFamily: "'JetBrains Mono','Fira Code',monospace", fontSize: '0.82rem', lineHeight: 1.65, color: '#cbd5e1' }}>
        {children.trim()}
      </pre>
    </div>
  );
}

function Callout({ type, children }: { type: 'info' | 'warning' | 'tip' | 'success'; children: React.ReactNode }) {
  const styles = {
    info:    { bg: 'rgba(59,130,246,0.07)',  border: 'rgba(59,130,246,0.2)',  color: '#60a5fa',  icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg> },
    warning: { bg: 'rgba(251,191,36,0.07)', border: 'rgba(251,191,36,0.22)', color: '#fbbf24', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
    tip:     { bg: 'rgba(16,185,129,0.07)',  border: 'rgba(16,185,129,0.2)',  color: '#34d399', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg> },
    success: { bg: 'rgba(34,197,94,0.07)',   border: 'rgba(34,197,94,0.2)',   color: '#4ade80', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg> },
  };
  const s = styles[type];
  return (
    <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 10, padding: '0.875rem 1rem', margin: '1rem 0', display: 'flex', gap: '0.625rem', alignItems: 'flex-start' }}>
      <span style={{ color: s.color, flexShrink: 0, marginTop: 1 }}>{s.icon}</span>
      <div style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.65 }}>{children}</div>
    </div>
  );
}

function StepBadge({ n, color = '#6366f1' }: { n: number; color?: string }) {
  return (
    <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg,${color},${color}bb)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.82rem', fontWeight: 700, color: 'white', flexShrink: 0, boxShadow: `0 4px 12px -4px ${color}60` }}>
      {n}
    </div>
  );
}

// ── Tutorial step sections ────────────────────────────────────────────────────
interface TutorialSection {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

const BASE_URL = 'https://ratelimit-api.karol-paschek.workers.dev';

function buildSections(): TutorialSection[] {
  return [
    {
      id: 'intro',
      title: 'Was ist RateLimit API?',
      subtitle: 'Grundlagen & Konzepte',
      color: '#6366f1',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
      content: (
        <>
          <p style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, fontSize: '0.93rem', marginBottom: '1.5rem' }}>
            RateLimit API ist ein gehosteter Service, der auf Cloudflare Workers läuft. Du integrierst einen einzigen API-Aufruf in deine Anwendung und erhältst sofortigen Schutz vor Missbrauch, DDoS-Attacken und übermäßigem Traffic — ohne eigene Infrastruktur.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '0.875rem', marginBottom: '1.75rem' }}>
            {[
              { title: 'Ohne Rate Limiting', items: ['Jeder kann unbegrenzt Requests senden', 'Bot-Attacken belasten deine Server', 'API-Kosten explodieren', 'Echte User werden langsamer bedient'], bad: true },
              { title: 'Mit Rate Limiting', items: ['Jeder User bekommt ein faires Kontingent', 'Bots und Scraper werden geblockt', 'Kosten bleiben vorhersagbar', 'Stabile Performance für alle'], bad: false },
            ].map(col => (
              <div key={col.title} style={{ background: col.bad ? 'rgba(248,113,113,0.05)' : 'rgba(52,211,153,0.05)', border: `1px solid ${col.bad ? 'rgba(248,113,113,0.15)' : 'rgba(52,211,153,0.15)'}`, borderRadius: 12, padding: '1.1rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: col.bad ? '#f87171' : '#34d399', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {col.bad
                    ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  }
                  {col.title}
                </div>
                {col.items.map(item => (
                  <div key={item} style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', padding: '0.25rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)', lineHeight: 1.5 }}>{item}</div>
                ))}
              </div>
            ))}
          </div>

          <h3 style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.875rem' }}>Wie der Flow funktioniert</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {[
              { from: 'Dein User', arrow: 'sendet Request', to: 'Deine App' },
              { from: 'Deine App', arrow: 'fragt RateLimit API', to: '/check Endpoint' },
              { from: 'RateLimit API', arrow: 'antwortet mit', to: '{ allowed: true/false }' },
              { from: 'Deine App', arrow: 'verarbeitet oder blockt', to: 'den Request' },
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 0.875rem', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'white', minWidth: 100 }}>{step.from}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(99,102,241,0.7)" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                <span style={{ fontSize: '0.78rem', color: '#a5b4fc', flex: 1 }}>{step.arrow}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(99,102,241,0.7)" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                <code style={{ fontSize: '0.78rem', color: '#93c5fd', background: 'rgba(59,130,246,0.08)', padding: '0.1rem 0.4rem', borderRadius: 4, minWidth: 160, textAlign: 'right' }}>{step.to}</code>
              </div>
            ))}
          </div>

          <Callout type="info">
            RateLimit API läuft im Edge-Netzwerk von Cloudflare — mit über 300 Rechenzentren weltweit sorgt das für Sub-10ms-Antwortzeiten, egal wo deine User sind.
          </Callout>
        </>
      )
    },
    {
      id: 'register',
      title: 'Account & Erster Login',
      subtitle: 'Registrierung & Authentifizierung',
      color: '#8b5cf6',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
      content: (
        <>
          <p style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, fontSize: '0.93rem', marginBottom: '1.5rem' }}>
            Es gibt zwei Wege, einen Account zu erstellen: klassisch per E-Mail/Passwort oder per OAuth (Google, GitHub). Bei OAuth wirst du automatisch eingeloggt, wenn du den Provider-Prozess abschließt.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { n: 1, title: 'Registrieren', desc: 'Gehe zu /register und erstelle einen Account mit E-Mail und Passwort — oder nutze einen OAuth-Provider.', color: '#8b5cf6' },
              { n: 2, title: 'JWT Token erhalten', desc: 'Nach der Registrierung erhältst du einen JWT Token. Er wird automatisch im Browser gespeichert und für alle Dashboard-API-Calls genutzt.', color: '#8b5cf6' },
              { n: 3, title: 'Token verwenden', desc: 'Für alle Management-Endpoints (/api/*) musst du den Token als Authorization: Bearer TOKEN Header mitsenden.', color: '#8b5cf6' },
            ].map(s => (
              <div key={s.n} style={{ display: 'flex', gap: '0.875rem', padding: '0.875rem 1rem', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(139,92,246,0.12)', borderRadius: 10 }}>
                <StepBadge n={s.n} color={s.color} />
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'white', marginBottom: 4 }}>{s.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <Code lang="bash">{`# Registrierung per cURL
curl -X POST ${BASE_URL}/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"email":"user@example.com","password":"sicher123","name":"Max"}'

# Response
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": 1, "email": "user@example.com", "name": "Max" }
}`}</Code>

          <Callout type="warning">
            <strong style={{ color: '#fbbf24' }}>Token-Sicherheit:</strong> Speichere deinen JWT Token niemals in öffentlichem Code oder commit ihn ins Git. Nutze Umgebungsvariablen oder Secrets.
          </Callout>

          <Code lang="javascript">{`// Token in Requests verwenden
const token = localStorage.getItem('token'); // im Browser automatisch gesetzt

const response = await fetch('${BASE_URL}/api/keys', {
  headers: {
    'Authorization': \`Bearer \${token}\`,
    'Content-Type': 'application/json'
  }
});`}</Code>
        </>
      )
    },
    {
      id: 'apikey',
      title: 'API Keys erstellen',
      subtitle: 'Keys verwalten & organisieren',
      color: '#06b6d4',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>,
      content: (
        <>
          <p style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, fontSize: '0.93rem', marginBottom: '1.5rem' }}>
            API Keys sind das Herzstück. Jeder Key hat einen eindeutigen Identifier (z.B. <code style={{ color: '#93c5fd', background: 'rgba(59,130,246,0.1)', padding: '0.1rem 0.35rem', borderRadius: 3, fontSize: '0.82rem' }}>rla_live_abc123...</code>) und kann eigene Rate-Limit-Regeln haben. Du kannst mehrere Keys für verschiedene Projekte oder Umgebungen anlegen.
          </p>

          <h3 style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem' }}>Best Practices</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '0.625rem', marginBottom: '1.5rem' }}>
            {[
              { title: 'Eigener Key pro Projekt', desc: 'z.B. "production-webapp", "staging-api", "dev-test"' },
              { title: 'Niemals teilen', desc: 'Jeder Key sollte nur von einem System genutzt werden' },
              { title: 'Bei Verdacht rotieren', desc: 'Alten Key löschen, neuen erstellen — sofort aktiv' },
            ].map(tip => (
              <div key={tip.title} style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)', borderRadius: 8, padding: '0.75rem' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#67e8f9', marginBottom: 4 }}>{tip.title}</div>
                <div style={{ fontSize: '0.77rem', color: 'rgba(255,255,255,0.4)' }}>{tip.desc}</div>
              </div>
            ))}
          </div>

          <Code lang="javascript">{`// Neuen API Key erstellen
const res = await fetch('${BASE_URL}/api/keys', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ keyName: 'production-app' })
});

const { apiKey } = await res.json();
// apiKey.api_key = "rla_live_abc123xyz..."
// WICHTIG: Sofort sichern! Wird nicht nochmal angezeigt.
console.log('Dein API Key:', apiKey.api_key);`}</Code>

          <Callout type="warning">
            <strong style={{ color: '#fbbf24' }}>Einmalige Anzeige:</strong> Der vollständige API Key wird nach dem Erstellen nur einmal angezeigt. Kopiere ihn sofort und speichere ihn sicher (z.B. in einer .env-Datei oder einem Passwort-Manager).
          </Callout>

          <Code lang="bash">{`# Alle Keys abrufen (Keys sind maskiert: rla_live_abc1***)
curl -X GET ${BASE_URL}/api/keys \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Key deaktivieren
curl -X PUT ${BASE_URL}/api/keys/1 \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"isActive": false}'

# Key löschen
curl -X DELETE ${BASE_URL}/api/keys/1 \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"`}</Code>
        </>
      )
    },
    {
      id: 'config',
      title: 'Rate Limit konfigurieren',
      subtitle: 'Regeln definieren & Algorithmen verstehen',
      color: '#10b981',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
      content: (
        <>
          <p style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, fontSize: '0.93rem', marginBottom: '1.5rem' }}>
            Konfigurationen definieren für einen API Key, wie viele Requests in welchem Zeitraum erlaubt sind. Du kannst mehrere Konfigurationen pro Key anlegen, z.B. verschiedene Limits für verschiedene Endpoints.
          </p>

          <h3 style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.875rem' }}>Algorithmen im Vergleich</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem', marginBottom: '1.5rem' }}>
            {[
              {
                name: 'Sliding Window',
                badge: 'Standard',
                badgeColor: '#10b981',
                desc: 'Das Fenster bewegt sich kontinuierlich mit der Zeit. Verhindert Bursts an Fenstergrenzen.',
                pros: ['Gleichmäßige Verteilung', 'Kein Burst-Problem', 'Einfach zu verstehen'],
                best: 'APIs, bei denen gleichmäßiger Traffic gewünscht ist',
              },
              {
                name: 'Token Bucket',
                badge: 'Für Bursts',
                badgeColor: '#06b6d4',
                desc: 'Tokens werden kontinuierlich nachgefüllt. Ermöglicht kurze Bursts, solange Tokens vorhanden sind.',
                pros: ['Erlaubt kurzfristige Spitzen', 'Konfigurierbarer Burst-Size', 'Natürlicheres Nutzungsverhalten'],
                best: 'Interaktive Apps mit gelegentlichen Aktivitätsspitzen',
              },
            ].map(algo => (
              <div key={algo.name} style={{ background: 'rgba(255,255,255,0.025)', border: `1px solid ${algo.badgeColor}20`, borderRadius: 12, padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>{algo.name}</span>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: algo.badgeColor, background: `${algo.badgeColor}15`, padding: '0.15rem 0.45rem', borderRadius: 4 }}>{algo.badge}</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, marginBottom: '0.625rem' }}>{algo.desc}</p>
                {algo.pros.map(pro => (
                  <div key={pro} style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: 2 }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={algo.badgeColor} strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    {pro}
                  </div>
                ))}
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', marginTop: '0.5rem', fontStyle: 'italic' }}>Best für: {algo.best}</div>
              </div>
            ))}
          </div>

          <Code lang="javascript">{`// Sliding Window — Standard
await fetch('${BASE_URL}/api/configs', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer TOKEN', 'Content-Type': 'application/json' },
  body: JSON.stringify({
    apiKeyId: 1,
    name: 'Standard Limit',
    maxRequests: 100,
    windowSeconds: 3600,       // 1 Stunde
    algorithm: 'sliding_window'
  })
});

// Token Bucket — mit Burst
await fetch('${BASE_URL}/api/configs', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer TOKEN', 'Content-Type': 'application/json' },
  body: JSON.stringify({
    apiKeyId: 1,
    name: 'Burst Config',
    maxRequests: 100,
    windowSeconds: 3600,
    algorithm: 'token_bucket',
    burstSize: 20,             // Max 20 Requests auf einmal
    refillRate: 28             // 28 Tokens/Stunde nachgefüllt
  })
});`}</Code>

          <Callout type="tip">
            <strong style={{ color: '#34d399' }}>Empfehlung für den Start:</strong> Nutze Sliding Window mit 100 req/h. Schau dir nach 1-2 Tagen deine Analytics an und passe das Limit auf Basis des echten Traffics an — oder nutze Adaptive Rate Limiting (Pro) für automatische Optimierung.
          </Callout>
        </>
      )
    },
    {
      id: 'integration',
      title: 'API integrieren',
      subtitle: 'Der /check Endpoint in der Praxis',
      color: '#f59e0b',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
      content: (
        <>
          <p style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, fontSize: '0.93rem', marginBottom: '1.5rem' }}>
            Der <code style={{ color: '#93c5fd', background: 'rgba(59,130,246,0.1)', padding: '0.1rem 0.35rem', borderRadius: 3, fontSize: '0.85rem' }}>/check</code> Endpoint ist das eigentliche Herzstück der Integration. Er entscheidet in Millisekunden, ob ein Request erlaubt oder geblockt wird.
          </p>

          <h3 style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem' }}>Node.js / Express Middleware</h3>
          <Code lang="javascript">{`// middleware/rateLimiter.js
const API_KEY = process.env.RATELIMIT_API_KEY;

export async function rateLimitMiddleware(req, res, next) {
  try {
    const response = await fetch('${BASE_URL}/check', {
      headers: { 'X-API-Key': API_KEY }
    });
    const { allowed, remaining, reset, limit } = await response.json();

    // Informative Headers für den Client setzen
    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', reset);

    if (!allowed) {
      return res.status(429).json({
        error: 'Zu viele Anfragen. Bitte warte kurz.',
        retryAfter: Math.ceil((reset * 1000 - Date.now()) / 1000)
      });
    }
    next();
  } catch (err) {
    // Fail-open: Bei Fehler Request trotzdem erlauben
    console.warn('Rate limit check failed, allowing request:', err.message);
    next();
  }
}

// app.js
import { rateLimitMiddleware } from './middleware/rateLimiter.js';
app.use('/api', rateLimitMiddleware);`}</Code>

          <h3 style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem', marginTop: '1.5rem' }}>Per-User Rate Limiting mit Identifier</h3>
          <Code lang="javascript">{`// Statt IP-basiert: User-ID oder E-Mail als Identifier
app.post('/api/data', async (req, res) => {
  const userId = req.user?.id || req.ip; // aus Auth-Middleware

  const rlRes = await fetch('${BASE_URL}/check', {
    method: 'POST',
    headers: {
      'X-API-Key': process.env.RATELIMIT_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ identifier: \`user_\${userId}\` })
  });

  const { allowed } = await rlRes.json();
  if (!allowed) return res.status(429).json({ error: 'Rate limit exceeded' });

  // Deine Logik hier
  res.json({ data: 'hello world' });
});`}</Code>

          <h3 style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem', marginTop: '1.5rem' }}>Python / FastAPI</h3>
          <Code lang="python">{`import httpx
from fastapi import Depends, HTTPException, Request

API_KEY = "rla_live_your_key"

async def rate_limit(request: Request):
    async with httpx.AsyncClient() as client:
        r = await client.get(
            "${BASE_URL}/check",
            headers={"X-API-Key": API_KEY},
            timeout=5.0
        )
        data = r.json()
        if not data.get("allowed"):
            raise HTTPException(
                status_code=429,
                detail="Rate limit exceeded",
                headers={"Retry-After": str(data.get("retry_after", 60))}
            )

@app.get("/api/data", dependencies=[Depends(rate_limit)])
async def get_data():
    return {"data": "your response"}`}</Code>

          <Callout type="success">
            <strong style={{ color: '#4ade80' }}>Fail-Open Prinzip:</strong> Wenn der RateLimit-API Aufruf selbst fehlschlägt (Netzwerkfehler, Timeout), solltest du den Request trotzdem erlauben (fail-open). Verfügbarkeit deines Dienstes hat Vorrang vor Rate Limiting.
          </Callout>
        </>
      )
    },
    {
      id: 'filters',
      title: 'IP-Filter & Regeln',
      subtitle: 'Blacklists, Whitelists & User Agent Blocking',
      color: '#ef4444',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
      content: (
        <>
          <p style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, fontSize: '0.93rem', marginBottom: '1.5rem' }}>
            Filter ergänzen das Rate Limiting: Bestimmte IPs werden unabhängig vom Limit immer geblockt (Blacklist) oder immer erlaubt (Whitelist). User-Agent-Filter blocken bekannte Bots und Scraper automatisch.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {[
              { type: 'ip_blacklist', label: 'IP Blacklist', desc: 'Immer blockieren', color: '#f87171', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> },
              { type: 'ip_whitelist', label: 'IP Whitelist', desc: 'Immer erlauben', color: '#34d399', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> },
              { type: 'user_agent', label: 'User Agent', desc: 'Bot-Pattern blockieren', color: '#fbbf24', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="5"/><path d="M3 21v-2a7 7 0 0 1 14 0v2"/></svg> },
            ].map(f => (
              <div key={f.type} style={{ background: 'rgba(255,255,255,0.025)', border: `1px solid ${f.color}25`, borderRadius: 10, padding: '0.875rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem', color: f.color }}>
                  {f.icon}
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'white' }}>{f.label}</span>
                </div>
                <code style={{ fontSize: '0.7rem', color: f.color, background: `${f.color}12`, padding: '0.12rem 0.35rem', borderRadius: 3, fontFamily: 'monospace', display: 'block', marginBottom: '0.4rem' }}>{f.type}</code>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{f.desc}</div>
              </div>
            ))}
          </div>

          <Code lang="javascript">{`// Alle Beispiele in einem Skript

const headers = {
  'Authorization': 'Bearer YOUR_JWT_TOKEN',
  'Content-Type': 'application/json'
};

// 1. Bekannte Angreifer-IP dauerhaft blockieren
await fetch('${BASE_URL}/api/filters', {
  method: 'POST', headers,
  body: JSON.stringify({ configId: 1, ruleType: 'ip_blacklist', ruleValue: '192.168.1.100', action: 'block' })
});

// 2. Eigene Server-IP immer whitelisten (z.B. Monitoring)
await fetch('${BASE_URL}/api/filters', {
  method: 'POST', headers,
  body: JSON.stringify({ configId: 1, ruleType: 'ip_whitelist', ruleValue: '10.0.0.5', action: 'allow' })
});

// 3. Bekannte Bot User Agents blockieren
await fetch('${BASE_URL}/api/filters', {
  method: 'POST', headers,
  body: JSON.stringify({ configId: 1, ruleType: 'user_agent', ruleValue: 'Scrapy', action: 'block' })
});`}</Code>

          <Callout type="tip">
            Bekannte Bot User Agents zum Blockieren: <code style={{ color: '#34d399', fontSize: '0.8rem' }}>Scrapy</code>, <code style={{ color: '#34d399', fontSize: '0.8rem' }}>python-requests</code>, <code style={{ color: '#34d399', fontSize: '0.8rem' }}>curl/7</code>, <code style={{ color: '#34d399', fontSize: '0.8rem' }}>Go-http-client</code>. Whiteliste aber unbedingt deinen eigenen Monitoring-Dienst!
          </Callout>
        </>
      )
    },
  ];
}

// ── Main Component ────────────────────────────────────────────────────────────
export function TutorialPage() {
  const [activeSection, setActiveSection] = useState('intro');
  const scrollingRef = useRef(false);
  const sections = buildSections();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (scrollingRef.current) return;
        const visible = entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActiveSection(visible[0].target.id);
      },
      { rootMargin: '-10% 0px -60% 0px', threshold: 0 }
    );
    sections.forEach(s => {
      const el = document.getElementById(`tut-${s.id}`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    setActiveSection(id);
    scrollingRef.current = true;
    setTimeout(() => { scrollingRef.current = false; }, 800);
    document.getElementById(`tut-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#080d1a', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Ambient */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10%', left: '0', width: '40%', height: '40%', background: 'radial-gradient(circle,rgba(99,102,241,0.06) 0%,transparent 70%)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '0', right: '0', width: '35%', height: '35%', background: 'radial-gradient(circle,rgba(16,185,129,0.06) 0%,transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(8,13,26,0.92)', backdropFilter: 'blur(16px)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 1.5rem', height: 60, display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/><circle cx="12" cy="12" r="3"/></svg>
            </div>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'white' }}>RateLimit API</span>
          </a>
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)' }} />
          <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>Tutorial — Grundlagen</span>
          <div style={{ flex: 1 }} />
          <a href="/tutorial/advanced" style={{ fontSize: '0.82rem', color: '#a5b4fc', textDecoration: 'none', padding: '0.3rem 0.875rem', borderRadius: 6, border: '1px solid rgba(99,102,241,0.25)', background: 'rgba(99,102,241,0.06)', fontWeight: 600 }}>
            Teil 2: Erweiterte Features →
          </a>
          <a href="/docs" style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', textDecoration: 'none', padding: '0.3rem 0.75rem', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
            Docs
          </a>
          {!!localStorage.getItem('token') ? (
            <a href="/dashboard" style={{ fontSize: '0.82rem', color: 'white', textDecoration: 'none', padding: '0.3rem 0.875rem', borderRadius: 6, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', fontWeight: 600 }}>Dashboard →</a>
          ) : (
            <a href="/register" style={{ fontSize: '0.82rem', color: 'white', textDecoration: 'none', padding: '0.3rem 0.875rem', borderRadius: 6, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', fontWeight: 600 }}>Kostenlos starten</a>
          )}
        </div>
      </header>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.05))', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '3rem 1.5rem', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 100, padding: '0.35rem 0.875rem', fontSize: '0.77rem', fontWeight: 600, color: '#a5b4fc', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          Teil 1 von 2
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'white', letterSpacing: '-0.03em', marginBottom: '0.75rem', lineHeight: 1.2 }}>
          RateLimit API —{' '}
          <span style={{ background: 'linear-gradient(135deg,#6366f1,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Grundlagen</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '1.05rem', maxWidth: 520, margin: '0 auto 2rem', lineHeight: 1.7 }}>
          Von der Registrierung bis zur ersten Integration — in 30 Minuten lernst du alles Wichtige.
        </p>
        <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {sections.map(s => (
            <button key={s.id} onClick={() => scrollTo(s.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.875rem', borderRadius: 7, border: `1px solid ${s.color}30`, background: `${s.color}0a`, color: s.color, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = `${s.color}18`}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = `${s.color}0a`}>
              {s.title}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '2rem 1.5rem', display: 'flex', gap: '2rem', position: 'relative', zIndex: 1 }}>

        {/* Sidebar */}
        <aside style={{ width: 236, flexShrink: 0, position: 'sticky', top: 76, height: 'fit-content', maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}>
          <div style={{ background: 'rgba(14,22,36,0.8)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '1rem', backdropFilter: 'blur(8px)' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 0.25rem', marginBottom: '0.5rem' }}>Teil 1 — Grundlagen</div>
            {sections.map(s => (
              <button key={s.id} onClick={() => scrollTo(s.id)} style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                width: '100%', padding: '0.45rem 0.5rem', borderRadius: 6,
                border: 'none', cursor: 'pointer', textAlign: 'left',
                fontSize: '0.81rem', fontWeight: activeSection === s.id ? 600 : 400,
                color: activeSection === s.id ? s.color : 'rgba(255,255,255,0.45)',
                background: activeSection === s.id ? `${s.color}12` : 'transparent',
                transition: 'all .12s',
              }}
                onMouseEnter={e => { if (activeSection !== s.id) { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)'; } }}
                onMouseLeave={e => { if (activeSection !== s.id) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)'; } }}>
                <span style={{ color: s.color, opacity: activeSection === s.id ? 1 : 0.5 }}>{s.icon}</span>
                <span style={{ fontSize: '0.79rem' }}>{s.title}</span>
              </button>
            ))}
          </div>

          <div style={{ marginTop: '1rem', background: 'linear-gradient(135deg,rgba(99,102,241,0.08),rgba(16,185,129,0.06))', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 12, padding: '1rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'white', marginBottom: '0.4rem' }}>Teil 2 verfügbar</div>
            <div style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.75rem', lineHeight: 1.5 }}>Analytics, Adaptive RL, Webhooks & mehr</div>
            <a href="/tutorial/advanced" style={{ display: 'block', textAlign: 'center', padding: '0.45rem', borderRadius: 7, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white', textDecoration: 'none', fontSize: '0.78rem', fontWeight: 700 }}>
              Teil 2 starten →
            </a>
          </div>
        </aside>

        {/* Content */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {sections.map((s, idx) => (
            <section key={s.id} id={`tut-${s.id}`} style={{ marginBottom: '4rem', scrollMarginTop: '80px' }}>
              {/* Section header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.75rem', paddingBottom: '1rem', borderBottom: `1px solid ${s.color}25` }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: `${s.color}15`, border: `1px solid ${s.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>
                  {s.icon}
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, color: s.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
                    Schritt {idx + 1} von {sections.length}
                  </div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em', marginBottom: '0.2rem' }}>{s.title}</h2>
                  <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)' }}>{s.subtitle}</p>
                </div>
              </div>
              {s.content}

              {/* Navigation */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                {idx > 0 && (
                  <button onClick={() => scrollTo(sections[idx - 1].id)} style={{ padding: '0.6rem 1.25rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'}>
                    ← {sections[idx - 1].title}
                  </button>
                )}
                {idx < sections.length - 1 ? (
                  <button onClick={() => scrollTo(sections[idx + 1].id)} style={{ padding: '0.6rem 1.25rem', borderRadius: 8, border: `1px solid ${sections[idx + 1].color}30`, background: `${sections[idx + 1].color}0d`, color: sections[idx + 1].color, fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', transition: 'background 0.15s', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = `${sections[idx + 1].color}18`}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = `${sections[idx + 1].color}0d`}>
                    {sections[idx + 1].title}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                ) : (
                  <a href="/tutorial/advanced" style={{ padding: '0.6rem 1.5rem', borderRadius: 8, border: '1px solid rgba(99,102,241,0.3)', background: 'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.15))', color: '#a5b4fc', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                    Weiter zu Teil 2 — Erweiterte Features
                  </a>
                )}
              </div>
            </section>
          ))}
        </main>
      </div>

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '2rem 1.5rem', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[['Startseite', '/'], ['Dashboard', '/dashboard'], ['Docs', '/docs'], ['Tutorial Teil 2', '/tutorial/advanced'], ['FAQ', '/faq']].map(([l, h]) => (
            <a key={h} href={h} style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.25)', textDecoration: 'none' }}
               onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
               onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.25)')}>{l}</a>
          ))}
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
      `}</style>
    </div>
  );
}
