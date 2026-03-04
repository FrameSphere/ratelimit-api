import { BlogCard } from './blog/CloudflareGuide';

function SeoTable({ headers, rows }: { headers: string[]; rows: (string | React.ReactNode)[][] }) {
  return (
    <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
        <thead>
          <tr>{headers.map(h => (
            <th key={h} style={{ background: 'rgba(15,23,42,0.8)', color: '#94a3b8', fontWeight: 700, padding: '10px 14px', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>{h}</th>
          ))}</tr>
        </thead>
        <tbody>{rows.map((row, i) => (
          <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
            {row.map((cell, j) => (
              <td key={j} style={{ padding: '9px 14px', color: j === 0 ? '#e2e8f0' : 'rgba(255,255,255,0.55)', fontWeight: j === 0 ? 600 : 400, verticalAlign: 'top' }}>{cell}</td>
            ))}
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  section: { maxWidth: '1100px', margin: '0 auto', padding: '0 2rem 6rem' },
  label:   { display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 50, padding: '4px 14px', fontSize: '0.78rem', color: '#93c5fd', fontWeight: 600, marginBottom: '1.25rem' },
  h2:      { fontSize: 'clamp(1.5rem,3.5vw,2.1rem)', fontWeight: 800, color: 'white', marginBottom: '1rem', letterSpacing: '-0.02em', lineHeight: 1.25 },
  h3:      { fontSize: '1.1rem', fontWeight: 700, color: '#e2e8f0', marginTop: '2.25rem', marginBottom: '0.65rem' },
  p:       { color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, marginBottom: '0.875rem', fontSize: '0.95rem' },
  ul:      { color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, paddingLeft: '1.5rem', marginBottom: '1rem', fontSize: '0.95rem' },
  code:    { background: 'rgba(59,130,246,0.12)', color: '#93c5fd', padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace', fontSize: '0.87em' },
  callout: { background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.18)', borderRadius: 10, padding: '1rem 1.25rem', marginBottom: '1.5rem', color: '#93c5fd', fontSize: '0.9rem', lineHeight: 1.65 },
  divider: { border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', margin: '3rem 0' },
};

export function SeoSection() {
  return (
    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '5rem', background: 'rgba(0,0,0,0.15)' }}>
      <div style={S.section}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem', maxWidth: 700, margin: '0 auto 3.5rem' }}>
          <div style={S.label}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            Alles über API Rate Limiting
          </div>
          <h2 style={{ ...S.h2, textAlign: 'center' }}>Was ist API Rate Limiting und warum brauche ich es?</h2>
          <p style={{ ...S.p, textAlign: 'center', maxWidth: 620, margin: '0 auto' }}>
            API Rate Limiting ist die Technik, mit der du die Anzahl von Anfragen an deine API pro Zeiteinheit begrenzt.
            Hier findest du alles: Grundlagen, Algorithmen, Use Cases und den Einstieg in unter 5 Minuten.
          </p>
        </div>

        {/* What is rate limiting */}
        <h3 style={S.h3}>API Rate Limiting erklärt</h3>
        <p style={S.p}>
          Ohne Rate Limiting kann jeder Client – Mensch oder Bot – beliebig viele Anfragen pro Sekunde an deine
          API senden. Das hat direkte Konsequenzen: Server werden überlastet, Kosten bei pay-per-use Diensten
          explodieren und gezielte Angriffe wie Brute Force oder Credential Stuffing werden ermöglicht.
        </p>
        <p style={S.p}>
          <strong style={{ color: 'white' }}>Rate Limiting setzt eine Obergrenze</strong>: „Maximal 100 Anfragen
          pro Minute pro API Key." Überschreitet ein Client dieses Limit, antwortet deine API mit
          <code style={S.code}>HTTP 429 – Too Many Requests</code>. Der Client wird nicht dauerhaft blockiert –
          nur verlangsamt. Nach dem Reset des Zeitfensters kann er wieder normal anfragen.
        </p>

        <div style={S.callout}>
          <strong>Reales Beispiel:</strong> Ein Startup ohne Rate Limiting verlor über 12.000 USD an
          KI-API-Kosten an einem einzigen Wochenende, als ein Nutzer einen automatisierten Loop startete.
          Mit einem Limit von 50 req/Stunde wäre das auf unter 20 USD begrenzt geblieben.
        </div>

        {/* Algorithms */}
        <h3 style={S.h3}>Die 4 wichtigsten Rate-Limiting-Algorithmen</h3>
        <p style={S.p}>
          Nicht jede Methode ist gleich – die Wahl des Algorithmus hat direkten Einfluss auf Nutzererfahrung
          und Sicherheitsniveau:
        </p>

        <SeoTable
          headers={['Algorithmus', 'Burst-Traffic', 'Fairness', 'Einsatz']}
          rows={[
            ['Token Bucket ← RateLimit API', 'Explizit erlaubt', 'Mittel–Hoch', 'REST APIs, SaaS, KI-APIs'],
            ['Fixed Window Counter', 'Grenzproblem vorhanden', 'Mittel', 'Einfache Auth-Limits'],
            ['Sliding Window Counter', 'Genau kontrolliert', 'Sehr hoch', 'Public APIs, Fairness-kritisch'],
            ['Leaky Bucket', 'Queue (kein Burst)', 'Sehr hoch', 'Webhooks, Streaming'],
          ]}
        />

        <p style={S.p}>
          RateLimit API nutzt den <strong style={{ color: 'white' }}>Token-Bucket-Algorithmus</strong>:
          Jeder API-Key hat einen Eimer mit Tokens. Jede Anfrage verbraucht einen Token.
          Der Eimer füllt sich kontinuierlich auf. Das erlaubt natürliche Lastspitzen,
          ohne dass das Gesamtlimit überschritten wird.
          → <a href="/blog/rate-limiting-algorithms" style={{ color: '#60a5fa' }}>Vollständiger Algorithmen-Vergleich</a>
        </p>

        <hr style={S.divider} />

        {/* Why Cloudflare */}
        <h3 style={S.h3}>Warum Rate Limiting auf dem Edge?</h3>
        <p style={S.p}>
          Traditionelles Rate Limiting lief auf dem Origin-Server oder in einem Reverse Proxy.
          Das Problem: Selbst geblockte Anfragen erreichen deinen Server und verbrauchen Ressourcen.
          <strong style={{ color: 'white' }}> Cloudflare Workers</strong> ändern das fundamental –
          Rate-Limit-Checks passieren an über 300 Edge-Knoten weltweit, bevor der Traffic
          deinen Server überhaupt erreicht.
        </p>

        <SeoTable
          headers={['Ansatz', 'Latenz', 'Server-Belastung', 'Global']}
          rows={[
            ['Origin-Server (Express.js)', '50–200ms', 'Hoch', 'Nein'],
            ['Nginx Rate Limit', '20–80ms', 'Mittel', 'Nein'],
            ['RateLimit API (Cloudflare Edge)', '<10ms', 'Null', 'Ja – 300+ PoPs'],
            ['AWS WAF', '10–30ms', 'Gering', 'Ja (teuer)'],
          ]}
        />

        <hr style={S.divider} />

        {/* Use cases */}
        <h3 style={S.h3}>Rate Limiting Use Cases</h3>
        <p style={S.p}>
          Rate Limiting ist kein One-Size-Fits-All. Verschiedene Branchen haben unterschiedliche
          Anforderungen – hier die wichtigsten:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {[
            { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>, title: 'SaaS-Plattform', body: 'Tiered Plans (Free/Pro/Enterprise) mit verschiedenen API-Limits. Rate Limiting wird zum Business-Tool und erzwingt natürlich Upgrades.' },
            { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>, title: 'KI / LLM APIs', body: 'Verhindert Token-Missbrauch und unkontrollierte Kostensteigerungen bei OpenAI/Anthropic-Wrappern. Kritisch für jeden KI-Dienst.' },
            { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, title: 'Gaming-API', body: 'Schutz vor Score-Manipulation und Bot-Farming. Echtzeit-Aktionen in Matches brauchen präzise Limits ohne hohe Latenz.' },
            { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>, title: 'Fintech', body: 'Strengste Limits für Auth-Endpunkte. Brute-Force-Schutz auf Login, Transaktionslimits, Whitelist-Only für interne Services.' },
            { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>, title: 'E-Commerce', body: 'Cart-Slamming-Schutz, Anti-Scraping für Produktpreise, saisonale Limit-Erhöhung zu Black Friday ohne Deployment.' },
            { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e879f9" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>, title: 'Öffentliche API', body: 'API-Key-Pflicht mit Tiered Limits verhindert Scraping und stellt faire Nutzung für alle sicher.' },
          ].map(uc => (
            <div key={uc.title} style={{ background: 'rgba(30,41,59,0.4)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '1rem 1.125rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                {uc.icon}
                <span style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.9rem' }}>{uc.title}</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.83rem', lineHeight: 1.6, margin: 0 }}>{uc.body}</p>
            </div>
          ))}
        </div>

        <p style={{ ...S.p, fontSize: '0.875rem' }}>
          → <a href="/blog/api-use-cases" style={{ color: '#60a5fa' }}>Vollständiger Use-Cases-Guide mit Code-Beispielen</a>
        </p>

        <hr style={S.divider} />

        {/* Quick Start */}
        <h3 style={S.h3}>Integration in unter 5 Minuten</h3>
        <p style={S.p}>
          RateLimit API ist ein einfacher HTTP-Endpoint. Du schickst einen Check-Request,
          wertest <code style={S.code}>allowed</code> aus – fertig. Keine Bibliothek, kein
          Redis-Setup, keine Konfigurationsdateien.
        </p>

        <SeoTable
          headers={['Schritt', 'Aufwand', 'Was passiert']}
          rows={[
            ['1. Registrieren', '1 Min', 'Account erstellen, API Key generieren'],
            ['2. Limit konfigurieren', '2 Min', 'Dashboard: max. Requests + Zeitfenster festlegen'],
            ['3. Check einbauen', '2 Min', '1 fetch()-Aufruf in deiner Middleware'],
            ['4. Testen', '1 Min', 'Analytics im Dashboard prüfen'],
          ]}
        />

        <hr style={S.divider} />

        {/* Links to guides */}
        <h3 style={S.h3}>Weiterführende Guides</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(270px,1fr))', gap: '0.75rem', marginTop: '0.5rem' }}>
          <BlogCard
            href="/blog/cloudflare-rate-limiting"
            tag="Cloudflare Guide"
            title="Rate Limiting mit Cloudflare Workers"
            desc="Integration, Code-Beispiele, Performance-Benchmarks und Best Practices für Produktion."
          />
          <BlogCard
            href="/blog/rate-limiting-algorithms"
            tag="Algorithmen erklärt"
            title="Token Bucket vs Fixed Window vs Sliding Window"
            desc="Welcher Algorithmus ist für deinen Use Case der richtige? Mit Entscheidungsmatrix."
          />
          <BlogCard
            href="/blog/api-use-cases"
            tag="Use Cases"
            title="Rate Limiting für SaaS, Gaming & AI APIs"
            desc="Branchenspezifische Konfigurationen mit konkreten Code-Beispielen."
          />
        </div>

        {/* CTA */}
        <div style={{ marginTop: '3rem', textAlign: 'center', padding: '2.5rem 2rem', background: 'linear-gradient(135deg,rgba(59,130,246,0.07),rgba(139,92,246,0.07))', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 16 }}>
          <h3 style={{ color: 'white', fontWeight: 800, fontSize: '1.3rem', marginBottom: '0.5rem' }}>
            Bereit loszulegen?
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Kostenlos starten – keine Kreditkarte, keine Laufzeiten. API Key in 2 Minuten.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/register" style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: 'white', textDecoration: 'none', padding: '0.75rem 2rem', borderRadius: 9, fontWeight: 700, fontSize: '0.95rem', boxShadow: '0 8px 30px -8px rgba(59,130,246,0.4)' }}>
              Kostenlos starten →
            </a>
            <a href="/faq" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.75)', textDecoration: 'none', padding: '0.75rem 2rem', borderRadius: 9, fontWeight: 600, fontSize: '0.95rem', border: '1px solid rgba(255,255,255,0.1)' }}>
              FAQ ansehen
            </a>
            <a href="/vergleich" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.75)', textDecoration: 'none', padding: '0.75rem 2rem', borderRadius: 9, fontWeight: 600, fontSize: '0.95rem', border: '1px solid rgba(255,255,255,0.1)' }}>
              Tool-Vergleich
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
