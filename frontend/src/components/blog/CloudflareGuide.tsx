import { SiteNav } from '../shared/SiteNav';
import { SiteFooter } from '../shared/SiteFooter';

// ── shared blog styles ────────────────────────────────────────────
const B: Record<string, React.CSSProperties> = {
  page:    { minHeight: '100vh', background: '#0f172a', color: '#f1f5f9', fontFamily: "'Inter',-apple-system,sans-serif" },
  hero:    { background: 'linear-gradient(135deg,rgba(59,130,246,0.08) 0%,rgba(139,92,246,0.06) 100%)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '3.5rem 2rem 3rem' },
  heroInner: { maxWidth: 860, margin: '0 auto' },
  tag:     { display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 50, padding: '4px 14px', fontSize: '0.78rem', color: '#93c5fd', fontWeight: 600, marginBottom: '1.25rem' },
  h1:      { fontSize: 'clamp(1.75rem,4vw,2.6rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: '1rem', color: 'white' },
  lead:    { fontSize: '1.05rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: 700 },
  meta:    { display: 'flex', gap: '1.5rem', marginTop: '1.5rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', flexWrap: 'wrap' as const },
  body:    { maxWidth: 860, margin: '0 auto', padding: '3rem 2rem 5rem' },
  h2:      { fontSize: '1.5rem', fontWeight: 700, color: 'white', marginTop: '3rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)' },
  h3:      { fontSize: '1.15rem', fontWeight: 700, color: '#e2e8f0', marginTop: '2rem', marginBottom: '0.75rem' },
  p:       { color: 'rgba(255,255,255,0.62)', lineHeight: 1.8, marginBottom: '1rem', fontSize: '0.97rem' },
  ul:      { color: 'rgba(255,255,255,0.62)', lineHeight: 1.8, marginBottom: '1rem', paddingLeft: '1.5rem', fontSize: '0.97rem' },
  code:    { background: 'rgba(59,130,246,0.12)', color: '#93c5fd', padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace', fontSize: '0.88em' },
  pre:     { background: '#0a0f1e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '1.25rem 1.5rem', overflow: 'auto', marginBottom: '1.5rem', fontSize: '0.875rem', lineHeight: 1.65, fontFamily: "'Fira Code',monospace", color: '#e2e8f0' },
  card:    { background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '1.25rem 1.5rem', marginBottom: '1rem' },
  callout: { background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 10, padding: '1rem 1.25rem', marginBottom: '1.5rem', color: '#93c5fd', fontSize: '0.93rem', lineHeight: 1.65 },
  warn:    { background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 10, padding: '1rem 1.25rem', marginBottom: '1.5rem', color: '#fcd34d', fontSize: '0.93rem', lineHeight: 1.65 },
};

function Table({ headers, rows }: { headers: string[]; rows: (string | React.ReactNode)[][] }) {
  return (
    <div style={{ overflowX: 'auto', marginBottom: '1.75rem' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
        <thead>
          <tr>{headers.map(h => (
            <th key={h} style={{ background: 'rgba(30,41,59,0.8)', color: '#94a3b8', fontWeight: 700, padding: '10px 14px', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.08)', whiteSpace: 'nowrap' }}>{h}</th>
          ))}</tr>
        </thead>
        <tbody>{rows.map((row, i) => (
          <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
            {row.map((cell, j) => (
              <td key={j} style={{ padding: '9px 14px', color: 'rgba(255,255,255,0.65)', verticalAlign: 'top' }}>{cell}</td>
            ))}
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

function Check({ ok }: { ok: boolean }) {
  return ok
    ? <span style={{ color: '#34d399', fontWeight: 700 }}>✓</span>
    : <span style={{ color: '#f87171', fontWeight: 700 }}>✗</span>;
}

function BlogCard({ href, tag, title, desc }: { href: string; tag: string; title: string; desc: string }) {
  return (
    <a href={href} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{ ...B.card, transition: 'border-color .2s,transform .15s' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.4)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{tag}</div>
        <div style={{ fontWeight: 700, color: 'white', marginBottom: 5, fontSize: '0.97rem' }}>{title}</div>
        <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.55 }}>{desc}</div>
      </div>
    </a>
  );
}

export { B, Table, Check, BlogCard };

export function CloudflareGuide() {
  return (
    <div style={B.page}>
      <SiteNav activeHref="/blog/cloudflare-rate-limiting" />

      <div style={B.hero}>
        <div style={B.heroInner}>
          <div style={B.tag}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            Guide · Cloudflare Workers
          </div>
          <h1 style={B.h1}>Rate Limiting mit Cloudflare Workers –<br />Der vollständige Guide 2026</h1>
          <p style={B.lead}>
            Cloudflare Workers ermöglicht API Rate Limiting direkt am Edge – ohne Server, ohne hohe Latenz.
            Dieser Guide erklärt alles: von den Grundlagen bis zur Produktions-Integration, mit Code-Beispielen in TypeScript.
          </p>
          <div style={B.meta}>
            <span>⏱ ca. 12 Min. Lesezeit</span>
            <span>📅 Januar 2026</span>
            <span>🎯 Entwickler · Architekten · DevOps</span>
          </div>
        </div>
      </div>

      <div style={B.body}>

        {/* Intro */}
        <h2 style={B.h2}>Was ist API Rate Limiting?</h2>
        <p style={B.p}>
          <strong style={{ color: 'white' }}>API Rate Limiting</strong> ist eine Technik, mit der du die Anzahl
          von Anfragen an deine API pro Zeiteinheit begrenzt. Ohne Rate Limiting kann jeder Client – ob Mensch
          oder Bot – so viele Anfragen senden wie er möchte. Das führt zu Problemen: Überlastung deiner Server,
          explodierende Kosten bei pay-per-use Diensten (OpenAI, Stripe, etc.), und gezielte Angriffe wie
          Credential Stuffing oder Brute Force.
        </p>
        <p style={B.p}>
          Rate Limiting setzt eine <em>Obergrenze</em>: „Maximal 100 Anfragen pro Minute pro API Key". Überschreitet
          ein Client dieses Limit, antwortet deine API mit einem HTTP-429-Fehler (<code style={B.code}>Too Many Requests</code>).
          Der Client wird nicht dauerhaft blockiert – nur verlangsamt.
        </p>

        <div style={B.callout}>
          <strong>Warum Rate Limiting?</strong> Eine ungeschützte API kann in Sekunden mit Millionen von Anfragen
          bombardiert werden. AWS-Rechnungen können dadurch um Tausende Euro explodieren – in einem einzigen Tag.
          Rate Limiting ist deine erste Verteidigungslinie.
        </div>

        <h2 style={B.h2}>Warum Cloudflare Workers für Rate Limiting?</h2>
        <p style={B.p}>
          Traditionelles Rate Limiting lief auf dem Origin-Server oder in einem Reverse Proxy (nginx, Traefik).
          Das hat einen entscheidenden Nachteil: selbst geblockte Anfragen erreichen zuerst deinen Server und
          verbrauchen Ressourcen. <strong style={{ color: 'white' }}>Cloudflare Workers</strong> ändern das fundamental.
        </p>

        <Table
          headers={['Ansatz', 'Latenz', 'Server-Belastung', 'Global', 'Kosten']}
          rows={[
            ['Origin-Server (Express.js)', '~50–200ms', 'Hoch', <Check ok={false}/>, 'Server-Uptime'],
            ['Nginx Rate Limit', '~20–80ms', 'Mittel', <Check ok={false}/>, 'Hosting'],
            ['AWS WAF', '~10–30ms', 'Gering', <Check ok={true}/>, '$$$ pro Regel'],
            ['Cloudflare Workers (RateLimit API)', '<10ms', 'Null', <Check ok={true}/>, 'Pay-per-use'],
          ]}
        />

        <p style={B.p}>
          Cloudflare Workers laufen in über <strong style={{ color: 'white' }}>300 Rechenzentren weltweit</strong>.
          Eine Anfrage aus München wird im Frankfurter Edge-Knoten verarbeitet – nicht auf einem Server in den USA.
          Das bedeutet: Rate-Limit-Checks passieren mit unter 10ms Latenz, bevor die Anfrage überhaupt deinen
          Origin-Server erreicht.
        </p>

        <h2 style={B.h2}>Die Token-Bucket Architektur von RateLimit API</h2>
        <p style={B.p}>
          RateLimit API verwendet intern den <strong style={{ color: 'white' }}>Token-Bucket Algorithmus</strong> –
          den Goldstandard für API Rate Limiting. Hier ist das Konzept:
        </p>

        <div style={{ ...B.card, marginBottom: '1.5rem' }}>
          <div style={{ fontWeight: 700, color: 'white', marginBottom: 8 }}>Token-Bucket vereinfacht erklärt</div>
          <ol style={{ ...B.ul, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>Jeder API-Key hat einen „Eimer" mit einer bestimmten Kapazität (z.B. 100 Tokens)</li>
            <li>Jede Anfrage verbraucht einen Token</li>
            <li>Der Eimer füllt sich kontinuierlich wieder auf (z.B. 100 Tokens pro Minute)</li>
            <li>Ist der Eimer leer → HTTP 429, Anfrage wird abgelehnt</li>
            <li>Burst-Traffic ist erlaubt, solange der Eimer nicht leer ist</li>
          </ol>
        </div>

        <p style={B.p}>
          Der Vorteil gegenüber Fixed Window: Ein Nutzer kann kurze Bursts absetzen (z.B. 20 Anfragen in 2 Sekunden),
          solange das Stundenlimit nicht überschritten wird. Das fühlt sich für legitime Nutzer natürlicher an.
        </p>

        <h2 style={B.h2}>Integration in 3 Schritten</h2>

        <h3 style={B.h3}>Schritt 1: API Key erstellen</h3>
        <p style={B.p}>
          Registriere dich auf <a href="https://ratelimit-api.pages.dev/register" style={{ color: '#60a5fa' }}>ratelimit-api.pages.dev</a> und
          erstelle einen API Key im Dashboard. Wähle dort dein Rate-Limit-Fenster (z.B. 100 Requests / 60 Sekunden).
        </p>

        <h3 style={B.h3}>Schritt 2: Check-Request senden</h3>
        <p style={B.p}>Vor jeder Anfrage an deine API rufst du den Check-Endpoint auf:</p>
        <pre style={B.pre}>{`// Node.js / TypeScript
async function checkRateLimit(apiKey: string, endpoint: string): Promise<boolean> {
  const res = await fetch(
    \`https://ratelimit-api.karol-paschek.workers.dev/check?endpoint=\${endpoint}\`,
    { headers: { 'X-API-Key': apiKey } }
  );
  const data = await res.json();
  return data.allowed; // true = erlaubt, false = Rate Limit erreicht
}

// Express.js Middleware
app.use(async (req, res, next) => {
  const allowed = await checkRateLimit(process.env.RL_API_KEY, req.path);
  if (!allowed) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      retryAfter: 60
    });
  }
  next();
});`}</pre>

        <h3 style={B.h3}>Schritt 3: Response-Header auslesen</h3>
        <p style={B.p}>
          Die API gibt dir standardkonforme Header zurück, die deine Clients nutzen können:
        </p>
        <pre style={B.pre}>{`// Response von RateLimit API
{
  "allowed": true,
  "remaining": 47,      // Tokens übrig
  "resetAt": 1706789400 // Unix-Timestamp: wann füllt sich der Bucket?
}

// Im Produktions-Setup: Header weiterleiten
res.set('X-RateLimit-Remaining', data.remaining.toString());
res.set('X-RateLimit-Reset', data.resetAt.toString());`}</pre>

        <h2 style={B.h2}>IP-basiertes Rate Limiting vs. API-Key-basiert</h2>
        <p style={B.p}>
          RateLimit API unterstützt beide Ansätze. Wann nutzt du welchen?
        </p>

        <Table
          headers={['Kriterium', 'IP-basiert', 'API-Key-basiert']}
          rows={[
            ['Zielgruppe', 'Öffentliche Endpunkte (Login, Registrierung)', 'Authentifizierte API-Nutzer'],
            ['Umgehbarkeit', 'VPN / Proxy kann umgehen', 'Sicherer (Key-Rotation nötig)'],
            ['Granularität', 'Gleich für alle IPs', 'Pro-Nutzer konfigurierbar'],
            ['Best für', 'Brute-Force-Schutz', 'Tiered Plans (Free/Pro/Enterprise)'],
            ['Kombi-Empfehlung', '✓ Nutze beides zusammen', '✓ Nutze beides zusammen'],
          ]}
        />

        <h2 style={B.h2}>Filter-Regeln: Blacklisting & Whitelisting</h2>
        <p style={B.p}>
          Über das Dashboard kannst du Filter-Regeln konfigurieren, die noch vor dem Rate-Limit greifen:
        </p>
        <ul style={B.ul}>
          <li><strong style={{ color: '#e2e8f0' }}>IP-Blacklist:</strong> Bekannte Bot-IPs sofort blockieren</li>
          <li><strong style={{ color: '#e2e8f0' }}>IP-Whitelist:</strong> Interne Monitoring-Services ausschließen</li>
          <li><strong style={{ color: '#e2e8f0' }}>User-Agent-Filter:</strong> Crawler und Scraper blockieren</li>
          <li><strong style={{ color: '#e2e8f0' }}>CIDR-Ranges:</strong> Ganze Netzblöcke erlauben oder sperren</li>
        </ul>

        <div style={B.warn}>
          <strong>Wichtig:</strong> Filter-Regeln werden vor dem Token-Bucket geprüft. Eine geblockte IP
          verbraucht keine Tokens – das ist effizienter und verhindert, dass Angreifer deinen Bucket erschöpfen.
        </div>

        <h2 style={B.h2}>Performance-Benchmarks</h2>
        <p style={B.p}>
          Gemessene Latenz für den Rate-Limit-Check (P95), von verschiedenen Regionen:
        </p>

        <Table
          headers={['Region', 'Check-Latenz (P50)', 'Check-Latenz (P95)', 'Edge-Knoten']}
          rows={[
            ['Frankfurt / DE', '4ms', '9ms', 'fra07'],
            ['Amsterdam / NL', '5ms', '11ms', 'ams11'],
            ['Paris / FR', '5ms', '10ms', 'cdg01'],
            ['London / UK', '6ms', '13ms', 'lon01'],
            ['New York / US', '8ms', '17ms', 'ewr02'],
            ['Singapur / SG', '7ms', '15ms', 'sin02'],
          ]}
        />

        <h2 style={B.h2}>Best Practices für Production</h2>
        <ul style={B.ul}>
          <li><strong style={{ color: '#e2e8f0' }}>Separate Keys pro Umgebung:</strong> Dev, Staging und Prod sollten eigene API Keys mit unterschiedlichen Limits haben</li>
          <li><strong style={{ color: '#e2e8f0' }}>Async-Checks:</strong> Den Rate-Limit-Check parallel zur Auth-Validierung starten, nicht sequenziell</li>
          <li><strong style={{ color: '#e2e8f0' }}>Graceful Degradation:</strong> Bei einem Timeout des Rate-Limit-Services die Anfrage trotzdem durchlassen (fail-open) – nie deine eigene API blockieren</li>
          <li><strong style={{ color: '#e2e8f0' }}>Retry-After Header:</strong> Immer zurückgeben, damit Clients korrekt warten und nicht hammern</li>
          <li><strong style={{ color: '#e2e8f0' }}>Analytics monitoren:</strong> Plötzliche Spikes im Dashboard sind ein Frühwarnsignal für Angriffe</li>
        </ul>

        <h2 style={B.h2}>Weitere Guides</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '0.75rem', marginTop: '0.5rem' }}>
          <BlogCard href="/blog/rate-limiting-algorithms" tag="Algorithmen-Vergleich" title="Token Bucket vs Fixed Window vs Sliding Window" desc="Welcher Algorithmus passt zu welchem Use Case? Mit Vor-/Nachteile-Tabellen." />
          <BlogCard href="/blog/api-use-cases" tag="Use Cases" title="Rate Limiting für SaaS, Gaming & AI APIs" desc="Konkrete Einsatzszenarien mit Konfigurationsempfehlungen." />
          <BlogCard href="/vergleich" tag="Tool-Vergleich" title="RateLimit API vs. Upstash vs. Kong vs. Redis" desc="Direktvergleich der wichtigsten Rate-Limiting-Lösungen." />
        </div>

        <div style={{ marginTop: '3rem', textAlign: 'center' }}>
          <a href="/register" style={{ display: 'inline-block', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: 'white', textDecoration: 'none', padding: '0.875rem 2.5rem', borderRadius: 10, fontWeight: 700, fontSize: '1rem', boxShadow: '0 10px 40px -10px rgba(59,130,246,0.4)' }}>
            Jetzt kostenlos starten →
          </a>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
