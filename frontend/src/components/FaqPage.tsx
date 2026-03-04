import { useState } from 'react';
import { SiteNav } from './shared/SiteNav';
import { SiteFooter } from './shared/SiteFooter';
import { B } from './blog/CloudflareGuide';

interface FAQItem {
  q: string;
  a: React.ReactNode;
  category: string;
}

const FAQS: FAQItem[] = [
  // Integration
  {
    category: 'Integration',
    q: 'Wie integriere ich RateLimit API in meine bestehende Anwendung?',
    a: (
      <>
        <p style={{ ...B.p, marginBottom: '0.75rem' }}>
          Die Integration dauert ca. 5 Minuten. Du schickst vor jeder API-Anfrage einen Check-Request
          an unseren Endpoint und wertest das <code style={B.code}>allowed</code>-Feld aus:
        </p>
        <pre style={{ ...B.pre, marginBottom: 0 }}>{`const res = await fetch('https://ratelimit-api.karol-paschek.workers.dev/check', {
  headers: { 'X-API-Key': 'your-api-key' }
});
const { allowed, remaining } = await res.json();
if (!allowed) return res.status(429).json({ error: 'Rate limit exceeded' });`}</pre>
      </>
    ),
  },
  {
    category: 'Integration',
    q: 'Welche Programmiersprachen und Frameworks werden unterstützt?',
    a: (
      <p style={{ ...B.p, marginBottom: 0 }}>
        Da RateLimit API ein einfacher HTTP-Endpoint ist, funktioniert er mit <strong style={{ color: '#e2e8f0' }}>jeder Sprache und jedem Framework</strong>:
        Node.js, Python (Flask, FastAPI, Django), Go, PHP, Ruby, Java, .NET, Rust – und natürlich auch
        direkt aus anderen Cloudflare Workers heraus. Beispielcode für alle gängigen Sprachen findest
        du in der Dokumentation im Dashboard.
      </p>
    ),
  },
  {
    category: 'Integration',
    q: 'Kann ich mehrere API Keys für verschiedene Endpunkte nutzen?',
    a: (
      <p style={{ ...B.p, marginBottom: 0 }}>
        Ja, das ist sogar empfohlen. Erstelle im Dashboard separate API Keys für verschiedene
        Endpunkte oder Umgebungen (Dev / Staging / Prod). Jeder Key hat seine eigene
        Rate-Limit-Konfiguration. So kannst du z.B. deinen Login-Endpoint mit 5 req/min und
        deine öffentliche API mit 100 req/min konfigurieren.
      </p>
    ),
  },
  {
    category: 'Integration',
    q: 'Was passiert, wenn RateLimit API kurz nicht erreichbar ist?',
    a: (
      <p style={{ ...B.p, marginBottom: 0 }}>
        Da RateLimit API auf Cloudflare Workers läuft (99.99% Uptime SLA), ist das sehr unwahrscheinlich.
        Wir empfehlen trotzdem ein <strong style={{ color: '#e2e8f0' }}>Fail-Open-Pattern</strong>:
        Bei einem Timeout den Request durchlassen (nicht blockieren), damit deine eigene API nie
        wegen eines externen Dienstes ausfällt. Setze einen Timeout von ~50ms für den Check.
      </p>
    ),
  },

  // Technik
  {
    category: 'Technik',
    q: 'Welchen Rate-Limiting-Algorithmus verwendet RateLimit API?',
    a: (
      <p style={{ ...B.p, marginBottom: 0 }}>
        RateLimit API verwendet den <strong style={{ color: '#e2e8f0' }}>Token-Bucket-Algorithmus</strong>.
        Dieser erlaubt kurze natürliche Bursts (z.B. wenn ein Nutzer schnell mehrere Seiten lädt),
        ohne dass das Gesamtlimit überschritten wird. Die Bucket-Kapazität und Füllrate konfigurierst
        du im Dashboard. Mehr dazu im{' '}
        <a href="/blog/rate-limiting-algorithms" style={{ color: '#60a5fa' }}>Algorithmen-Guide</a>.
      </p>
    ),
  },
  {
    category: 'Technik',
    q: 'Wie niedrig ist die Latenz des Rate-Limit-Checks?',
    a: (
      <p style={{ ...B.p, marginBottom: 0 }}>
        Der Check läuft auf Cloudflare's Edge Network in über 300 Rechenzentren weltweit.
        Die P50-Latenz aus Europa beträgt typischerweise <strong style={{ color: '#e2e8f0' }}>4–8ms</strong>,
        P95 unter 15ms. Der Check wird parallel zur restlichen Request-Verarbeitung ausgeführt
        und fügt in der Praxis keine wahrnehmbare Latenz hinzu.
      </p>
    ),
  },
  {
    category: 'Technik',
    q: 'Kann ich IP-basiertes und API-Key-basiertes Rate Limiting kombinieren?',
    a: (
      <p style={{ ...B.p, marginBottom: 0 }}>
        Ja. Du kannst im Dashboard Filter-Regeln (IP-Blacklist, Whitelist, CIDR-Ranges, User-Agent)
        kombinieren mit Token-Bucket-Limits pro API Key. Filter-Regeln greifen vor dem Bucket-Check –
        eine geblockte IP verbraucht keine Tokens und erreicht nie deinen Origin-Server.
      </p>
    ),
  },
  {
    category: 'Technik',
    q: 'Wie funktioniert das IP-Blacklisting genau?',
    a: (
      <p style={{ ...B.p, marginBottom: 0 }}>
        Du kannst einzelne IPs, CIDR-Ranges (z.B. <code style={B.code}>192.168.0.0/24</code>) oder
        komplette Netze in die Blacklist eintragen. Einträge werden sofort aktiv – kein Deployment
        erforderlich. Die Prüfung passiert am Edge, bevor die Anfrage dein Backend erreicht.
        Für bekannte Bot-Netzwerke empfehlen wir außerdem den User-Agent-Filter.
      </p>
    ),
  },
  {
    category: 'Technik',
    q: 'Werden Daten in der EU gespeichert (DSGVO)?',
    a: (
      <p style={{ ...B.p, marginBottom: 0 }}>
        Ja. RateLimit API nutzt Cloudflare D1 als Storage, die Hauptdatenbank liegt in der EU-Region.
        Request-Logs enthalten nur IP-Adresse, Endpoint, Timestamp und Blocked-Flag – keine
        personenbezogenen Daten des Endnutzers. Mehr dazu in unserer{' '}
        <a href="/datenschutz" style={{ color: '#60a5fa' }}>Datenschutzerklärung</a>.
      </p>
    ),
  },

  // Pricing
  {
    category: 'Preise & Pläne',
    q: 'Ist RateLimit API wirklich kostenlos?',
    a: (
      <p style={{ ...B.p, marginBottom: 0 }}>
        Der kostenlose Plan ist dauerhaft kostenlos – keine Kreditkarte, keine Trial-Periode.
        Du bekommst API Keys mit konfigurierbaren Rate Limits, IP-Filter und Analytics.
        Für höhere Volumina und erweiterte Features (z.B. Webhook-Benachrichtigungen, SLA-Garantie,
        Prioritäts-Support) gibt es bezahlte Pläne. Das aktuelle Pricing findest du im Dashboard.
      </p>
    ),
  },
  {
    category: 'Preise & Pläne',
    q: 'Gibt es ein Rate Limit für den Rate-Limit-Service selbst?',
    a: (
      <p style={{ ...B.p, marginBottom: 0 }}>
        Auf dem Free-Plan gibt es eine Fair-Use-Obergrenze für Check-Requests. Diese ist
        für kleine bis mittlere Projekte mehr als ausreichend. Für hochvolumige Produktions-APIs
        empfehlen wir einen bezahlten Plan ohne Obergrenze.
      </p>
    ),
  },

  // Use Cases
  {
    category: 'Use Cases',
    q: 'Kann ich RateLimit API für meinen Login-Endpoint nutzen (Brute-Force-Schutz)?',
    a: (
      <p style={{ ...B.p, marginBottom: 0 }}>
        Absolut – das ist einer der häufigsten Use Cases. Erstelle einen separaten API Key
        nur für deinen Auth-Endpoint und konfiguriere ein striktes Limit (z.B. 5 req / 15 min
        pro IP). Kombiniere das mit einem IP-Blacklist-Filter für bekannte Bot-Netzwerke.
        Detaillierte Anleitung im{' '}
        <a href="/blog/api-use-cases" style={{ color: '#60a5fa' }}>Use Cases Guide</a>.
      </p>
    ),
  },
  {
    category: 'Use Cases',
    q: 'Eignet sich RateLimit API für KI-APIs (OpenAI-Wrapper, eigene LLMs)?',
    a: (
      <p style={{ ...B.p, marginBottom: 0 }}>
        Ja, KI-APIs sind ein Kernuse-Case. RateLimit API verhindert, dass ein einzelner Nutzer
        deine OpenAI/Anthropic-Rechnung sprengt. Empfehlung: 10–20 req/min pro API Key,
        kombiniert mit app-seitigem Token-Limit pro Request. Mehr im{' '}
        <a href="/blog/api-use-cases#ki" style={{ color: '#60a5fa' }}>KI-API Abschnitt</a> des Use-Case-Guides.
      </p>
    ),
  },
  {
    category: 'Use Cases',
    q: 'Kann ich RateLimit API auch für interne Microservices nutzen?',
    a: (
      <p style={{ ...B.p, marginBottom: 0 }}>
        Ja. Nutze die Whitelist-Funktion, um nur bekannte interne IPs oder Service-Accounts
        zuzulassen. So verhinderst du, dass ein fehlerhafter Microservice durch eine Endlosschleife
        andere Services überlastet. Das ist besonders in Kubernetes-Umgebungen sinnvoll.
      </p>
    ),
  },

  // Vergleich
  {
    category: 'Vergleich',
    q: 'Was ist der Unterschied zwischen RateLimit API und Upstash Rate Limiting?',
    a: (
      <p style={{ ...B.p, marginBottom: 0 }}>
        Beide nutzen Edge-Computing. Der Hauptunterschied: Upstash Rate Limiting ist eine
        Low-Level-Library, die du selbst in deinen Cloudflare Worker einbauen musst. RateLimit API
        ist ein fertiger, konfigurierbarer Service mit Dashboard, Analytics und IP-Filtern –
        ohne eigenen Code. Für einen vollständigen Vergleich:{' '}
        <a href="/vergleich" style={{ color: '#60a5fa' }}>Tool-Vergleich ansehen</a>.
      </p>
    ),
  },
];

const CATEGORIES = ['Alle', ...Array.from(new Set(FAQS.map(f => f.category)))];

export function FaqPage() {
  const [activeCategory, setActiveCategory] = useState('Alle');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filtered = activeCategory === 'Alle' ? FAQS : FAQS.filter(f => f.category === activeCategory);

  return (
    <div style={B.page}>
      <SiteNav activeHref="/faq" />

      {/* Hero */}
      <div style={B.hero}>
        <div style={B.heroInner}>
          <div style={B.tag}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            Häufige Fragen
          </div>
          <h1 style={B.h1}>FAQ – Alles zu RateLimit API</h1>
          <p style={B.lead}>
            Antworten auf die häufigsten Fragen zu Integration, Technik, Preisen und Use Cases.
            Nicht dabei? Schreib uns über das{' '}
            <a href="/dashboard" style={{ color: '#60a5fa' }}>Support-System im Dashboard</a>.
          </p>
          <div style={B.meta}>
            <span>📋 {FAQS.length} Fragen</span>
            <span>🔄 Zuletzt aktualisiert: Januar 2026</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '3rem 2rem 5rem' }}>

        {/* Category filter */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '2rem' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setOpenIndex(null); }}
              style={{
                padding: '5px 14px', borderRadius: 7, border: `1px solid ${activeCategory === cat ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.08)'}`,
                background: activeCategory === cat ? 'rgba(59,130,246,0.12)' : 'transparent',
                color: activeCategory === cat ? '#93c5fd' : 'rgba(255,255,255,0.5)',
                fontSize: '0.83rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all .12s',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {filtered.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                style={{
                  background: isOpen ? 'rgba(30,41,59,0.7)' : 'rgba(30,41,59,0.4)',
                  border: `1px solid ${isOpen ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: 10,
                  overflow: 'hidden',
                  transition: 'border-color .15s',
                }}
              >
                {/* Question row */}
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '1rem 1.25rem', background: 'none', border: 'none', cursor: 'pointer',
                    textAlign: 'left', gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flex: 1 }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: 'rgba(99,102,241,0.12)', color: '#818cf8', whiteSpace: 'nowrap', marginTop: 2 }}>
                      {item.category}
                    </span>
                    <span style={{ fontWeight: 600, color: isOpen ? 'white' : '#e2e8f0', fontSize: '0.95rem', lineHeight: 1.45 }}>
                      {item.q}
                    </span>
                  </div>
                  <svg
                    width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2"
                    style={{ flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}
                  >
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>

                {/* Answer */}
                {isOpen && (
                  <div style={{ padding: '0 1.25rem 1.25rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ paddingTop: '1rem' }}>
                      {item.a}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div style={{
          marginTop: '3rem', padding: '2rem', borderRadius: 14,
          background: 'linear-gradient(135deg,rgba(59,130,246,0.08),rgba(139,92,246,0.08))',
          border: '1px solid rgba(99,102,241,0.2)', textAlign: 'center',
        }}>
          <div style={{ fontWeight: 700, color: 'white', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
            Deine Frage ist nicht dabei?
          </div>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
            Nutze unser Support-System im Dashboard – wir antworten in der Regel innerhalb von 24 Stunden.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/register" style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: 'white', textDecoration: 'none', padding: '0.7rem 1.75rem', borderRadius: 9, fontWeight: 700, fontSize: '0.9rem' }}>
              Kostenlos registrieren →
            </a>
            <a href="/vergleich" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.75)', textDecoration: 'none', padding: '0.7rem 1.75rem', borderRadius: 9, fontWeight: 600, fontSize: '0.9rem', border: '1px solid rgba(255,255,255,0.1)' }}>
              Tool-Vergleich ansehen
            </a>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
