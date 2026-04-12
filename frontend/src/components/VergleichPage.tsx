import { SiteNav } from './shared/SiteNav';
import { SiteFooter } from './shared/SiteFooter';
import { B, BlogCard } from './blog/CloudflareGuide';

function Check({ ok }: { ok: boolean }) {
  return ok
    ? <span style={{ color: '#34d399', fontWeight: 700, fontSize: '1rem' }}>✓</span>
    : <span style={{ color: '#f87171', fontWeight: 700, fontSize: '1rem' }}>✗</span>;
}

function Partial() {
  return <span style={{ color: '#fbbf24', fontWeight: 700 }}>~</span>;
}

function Table({ headers, rows }: { headers: string[]; rows: (string | React.ReactNode)[][] }) {
  return (
    <div style={{ overflowX: 'auto', marginBottom: '1.75rem' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
        <thead>
          <tr>{headers.map(h => (
            <th key={h} style={{ background: 'rgba(30,41,59,0.9)', color: '#94a3b8', fontWeight: 700, padding: '10px 14px', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.08)', whiteSpace: 'nowrap' }}>{h}</th>
          ))}</tr>
        </thead>
        <tbody>{rows.map((row, i) => (
          <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
            {row.map((cell, j) => (
              <td key={j} style={{ padding: '9px 14px', color: j === 0 ? '#e2e8f0' : 'rgba(255,255,255,0.6)', verticalAlign: 'top', fontWeight: j === 0 ? 600 : 400 }}>{cell}</td>
            ))}
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

function ToolBadge({ name, color, sub }: { name: string; color: string; sub: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '1rem' }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: color, margin: '0 auto 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>{name[0]}</div>
      <div style={{ fontWeight: 700, color: 'white', fontSize: '0.9rem' }}>{name}</div>
      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>{sub}</div>
    </div>
  );
}

export function VergleichPage() {
  return (
    <div style={B.page}>
      <SiteNav activeHref="/vergleich" />

      {/* Hero */}
      <div style={B.hero}>
        <div style={B.heroInner}>
          <div style={B.tag}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/></svg>
            Tool-Vergleich 2026
          </div>
          <h1 style={B.h1}>RateLimit API vs. Upstash vs. Kong vs. Redis –<br />API Rate Limiting Services im direkten Vergleich</h1>
          <p style={B.lead}>
            Welches Rate-Limiting-Tool passt zu deinem Projekt? Wir vergleichen RateLimit API mit den
            bekanntesten Alternativen – ehrlich, mit Vor- und Nachteilen, Kosten und konkreten Empfehlungen.
          </p>
          <div style={B.meta}>
            <span>⏱ ca. 10 Min. Lesezeit</span>
            <span>📅 Januar 2026</span>
            <span>🎯 Entwickler · Architekten · Tech-Leads</span>
          </div>
        </div>
      </div>

      <div style={B.body}>

        {/* Tool overview */}
        <h2 style={B.h2}>Die Tools im Überblick</h2>
        <p style={B.p}>
          Wir vergleichen fünf Ansätze für API Rate Limiting: von managed Services bis hin zu
          selbst-gehosteten Lösungen. Jeder Ansatz hat seine Berechtigung – je nach Teamgröße,
          Budget und technischen Anforderungen.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '0.5rem', marginBottom: '2rem', background: 'rgba(30,41,59,0.5)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)', padding: '1rem' }}>
          <ToolBadge name="RateLimit API" color="linear-gradient(135deg,#3b82f6,#8b5cf6)" sub="Managed Edge" />
          <ToolBadge name="Upstash" color="linear-gradient(135deg,#10b981,#059669)" sub="Redis Edge" />
          <ToolBadge name="Kong" color="linear-gradient(135deg,#3b82f6,#1d4ed8)" sub="API Gateway" />
          <ToolBadge name="Redis (selbst)" color="linear-gradient(135deg,#ef4444,#b91c1c)" sub="Self-hosted" />
          <ToolBadge name="AWS WAF" color="linear-gradient(135deg,#f59e0b,#b45309)" sub="Cloud WAF" />
        </div>

        {/* Big feature matrix */}
        <h2 style={B.h2}>Vollständige Feature-Matrix</h2>

        <Table
          headers={['Feature', 'RateLimit API', 'Upstash', 'Kong', 'Redis', 'AWS WAF']}
          rows={[
            ['Kein eigener Server nötig', <Check ok />, <Check ok />, <Check ok={false}/>, <Check ok={false}/>, <Check ok />],
            ['Edge Computing (<10ms)', <Check ok />, <Check ok />, <Check ok={false}/>, <Check ok={false}/>, <Partial />],
            ['Dashboard / GUI', <Check ok />, <Partial />, <Check ok />, <Check ok={false}/>, <Check ok />],
            ['JS / Python / Go SDK', <Check ok />, <Check ok />, <Partial />, <Check ok={false}/>, <Check ok={false}/>],
            ['Express / Next.js Middleware', <Check ok />, <Partial />, <Check ok={false}/>, <Check ok={false}/>, <Check ok={false}/>],
            ['IP Reputation Score', <Check ok />, <Check ok={false}/>, <Check ok={false}/>, <Check ok={false}/>, <Partial />],
            ['Bot-UA-Erkennung', <Check ok />, <Check ok={false}/>, <Check ok />, <Check ok={false}/>, <Check ok />],
            ['What-if Simulation', <Check ok />, <Check ok={false}/>, <Check ok={false}/>, <Check ok={false}/>, <Check ok={false}/>],
            ['Adaptive Rate Limits (KI)', <Check ok />, <Check ok={false}/>, <Check ok={false}/>, <Check ok={false}/>, <Check ok={false}/>],
            ['Auto IP Blocking', <Check ok />, <Check ok={false}/>, <Check ok />, 'Manuell', <Check ok />],
            ['IP-Blacklisting / Whitelisting', <Check ok />, <Check ok={false}/>, <Check ok />, 'Manuell', <Check ok />],
            ['User-Agent-Filter', <Check ok />, <Check ok={false}/>, <Check ok />, <Check ok={false}/>, <Check ok />],
            ['Geo-Blocking', <Check ok />, <Check ok={false}/>, <Check ok />, <Check ok={false}/>, <Check ok />],
            ['Token Bucket', <Check ok />, <Check ok />, <Check ok />, 'Custom', <Check ok={false}/>],
            ['Sliding Window', <Check ok />, <Check ok />, <Check ok />, 'Custom', <Check ok={false}/>],
            ['Live Stream / Echtzeit-Feed', <Check ok />, <Check ok={false}/>, <Partial />, <Check ok={false}/>, <Check ok={false}/>],
            ['Explainability (Warum blockiert?)', <Check ok />, <Check ok={false}/>, <Check ok={false}/>, <Check ok={false}/>, <Check ok={false}/>],
            ['Echtzeit-Analytics', <Check ok />, <Partial />, <Partial />, <Check ok={false}/>, <Partial />],
            ['Request-Logs', <Check ok />, <Check ok={false}/>, <Check ok />, 'Custom', <Partial />],
            ['Webhook-Alerts (Slack/Discord)', <Check ok />, <Check ok={false}/>, <Check ok />, <Check ok={false}/>, <Partial />],
            ['Scheduled Email Reports', <Check ok />, <Check ok={false}/>, <Check ok={false}/>, <Check ok={false}/>, <Check ok={false}/>],
            ['CSV Log-Export', <Check ok />, <Check ok={false}/>, <Partial />, <Check ok={false}/>, <Partial />],
            ['Multi-API-Key', <Check ok />, <Check ok />, <Check ok />, 'Custom', <Check ok={false}/>],
            ['Sandbox / Test-Modus', <Check ok />, <Check ok={false}/>, <Check ok={false}/>, <Check ok={false}/>, <Check ok={false}/>],
            ['Kostenlos nutzbar', <Check ok />, <Partial />, <Check ok={false}/>, <Check ok />, <Check ok={false}/>],
            ['Kein Code für Setup', <Check ok />, <Check ok={false}/>, <Check ok={false}/>, <Check ok={false}/>, <Partial />],
            ['DSGVO EU-Storage', <Check ok />, <Partial />, <Partial />, <Check ok />, <Check ok={false}/>],
          ]}
        />

        {/* Performance */}
        <h2 style={B.h2}>Performance-Vergleich</h2>
        <p style={B.p}>
          Die Latenz des Rate-Limit-Checks ist entscheidend – sie addiert sich zu jeder Anfrage.
          Gemessene Werte von Frankfurt (P50 / P95):
        </p>

        <Table
          headers={['Tool', 'P50 Latenz', 'P95 Latenz', 'Infrastruktur', 'Globale Verteilung']}
          rows={[
            ['RateLimit API', '4–6ms', '9–13ms', 'Cloudflare Workers + D1', '300+ PoPs'],
            ['Upstash Rate Limiting', '5–8ms', '12–18ms', 'Cloudflare Workers + Upstash Redis', '250+ PoPs'],
            ['Kong (Konnect Cloud)', '15–30ms', '40–80ms', 'Managed Kubernetes', 'Begrenzt'],
            ['Redis selbst-gehostet', '2–5ms (lokal)', '5–15ms', 'Eigener Server (1 Region)', 'Nein'],
            ['AWS WAF', '8–20ms', '25–50ms', 'AWS CloudFront Edge', '400+ PoPs'],
          ]}
        />

        {/* Kosten */}
        <h2 style={B.h2}>Kostenvergleich</h2>
        <p style={B.p}>
          Die Kostenstruktur unterscheidet sich erheblich. Besonders Self-Hosted-Lösungen haben
          versteckte Kosten durch Ops-Aufwand und Server-Betrieb:
        </p>

        <Table
          headers={['Tool', 'Free Tier', 'Entry-Level', 'Pro-Level', 'Hidden Costs']}
          rows={[
            ['RateLimit API', '✓ Dauerhaft kostenlos', 'Günstig', 'Moderat', 'Keine'],
            ['Upstash', '10.000 req/Tag', '$0.2/10k req', '$0.1/10k req', 'Bei hohem Volumen teuer'],
            ['Kong', 'Nein', '$250/Monat', '$750+/Monat', 'Setup + DevOps Zeit'],
            ['Redis', 'Server-Kosten', '~$20/Monat (VPS)', '~$100+/Monat', 'DevOps, Backup, Monitoring'],
            ['AWS WAF', '$5/Monat Basis', '$5 + $1/1M req', '$5 + $1/1M req', 'Komplexe Regelpreise'],
          ]}
        />

        <div style={B.callout}>
          <strong>Kosteneffizienz:</strong> Für die meisten Startups und mittlere Teams ist RateLimit API
          das beste Preis-Leistungs-Verhältnis. Redis selbst-gehostet ist nur günstiger, wenn du bereits
          DevOps-Kapazitäten hast und kein Dashboard benötigst.
        </div>

        {/* Detailvergleiche */}
        <h2 style={B.h2}>RateLimit API vs. Upstash – detaillierter Vergleich</h2>
        <p style={B.p}>
          Beide Lösungen nutzen Cloudflare Workers für Edge Rate Limiting. Der Unterschied liegt im Ansatz:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ ...B.card, borderColor: 'rgba(59,130,246,0.25)' }}>
            <div style={{ fontWeight: 700, color: '#60a5fa', marginBottom: '0.75rem', fontSize: '1rem' }}>
              RateLimit API
            </div>
            <ul style={{ ...B.ul, marginBottom: 0, fontSize: '0.875rem' }}>
              <li><strong style={{ color: '#e2e8f0' }}>Managed Service</strong> – du schickst nur einen HTTP-Request</li>
              <li>Dashboard mit GUI für Konfiguration</li>
              <li>JS/Python/Go SDK + Express/Next.js Middleware</li>
              <li>IP-Filter, Blacklisting, Auto-Blocking out-of-the-box</li>
              <li>IP Reputation Score + Bot-Erkennung</li>
              <li>What-if Simulation + Adaptive Limits (KI)</li>
              <li>Live Stream + Explainability Panel</li>
              <li>Kostenlos starten, keine Kreditkarte</li>
            </ul>
          </div>
          <div style={{ ...B.card, borderColor: 'rgba(16,185,129,0.25)' }}>
            <div style={{ fontWeight: 700, color: '#34d399', marginBottom: '0.75rem', fontSize: '1rem' }}>
              Upstash Rate Limiting
            </div>
            <ul style={{ ...B.ul, marginBottom: 0, fontSize: '0.875rem' }}>
              <li><strong style={{ color: '#e2e8f0' }}>Library</strong> – du baust es selbst in deinen Worker ein</li>
              <li>Mehr Algorithmen (Sliding Window, Fixed Window)</li>
              <li>Kein Dashboard für IP-Filter</li>
              <li>Benötigt Upstash Redis Account</li>
              <li>Mehr Flexibilität, mehr Aufwand</li>
              <li>Teuer bei hohem Volumen</li>
            </ul>
          </div>
        </div>

        <p style={B.p}>
          <strong style={{ color: 'white' }}>Empfehlung:</strong> Wenn du schnell starten willst und
          ein Dashboard bevorzugst → RateLimit API. Wenn du bereits einen Cloudflare Worker selbst
          betreibst und maximale Algorithmus-Flexibilität willst → Upstash.
        </p>

        <h2 style={B.h2}>RateLimit API vs. Kong – wann welches?</h2>
        <p style={B.p}>
          Kong ist ein vollständiges API Gateway, Rate Limiting ist nur ein kleines Feature davon.
          Es bringt eine riesige Komplexität mit sich – Kubernetes, Plugins, Enterprise-Lizenzen.
        </p>

        <Table
          headers={['Kriterium', 'RateLimit API', 'Kong Gateway']}
          rows={[
            ['Setup-Zeit', '5 Minuten', '2–5 Tage'],
            ['Zielgruppe', 'Startups, Mid-Size Teams', 'Enterprise, große Teams'],
            ['Nur Rate Limiting', '✓ Perfekt', '✗ Overkill'],
            ['Routing, Auth, Transforms', '✗', '✓ vollständig'],
            ['Kosten (Entry)', 'Kostenlos', '$250+/Monat'],
            ['Ops-Aufwand', 'Keiner', 'Hoch (DevOps)'],
            ['Empfehlung', 'Rate Limiting fokussiert', 'Wenn du sowieso ein API Gateway brauchst'],
          ]}
        />

        <h2 style={B.h2}>RateLimit API vs. Redis selbst-gehostet</h2>
        <p style={B.p}>
          Redis ist das meistverbreitete Backend für Rate Limiting – aber „selbst gehostet" bedeutet:
          du bist für Verfügbarkeit, Backups, Monitoring und Skalierung verantwortlich.
        </p>

        <Table
          headers={['Aspekt', 'RateLimit API', 'Redis (selbst)' ]}
          rows={[
            ['Time-to-Setup', '5 Min', '2–8 Stunden'],
            ['Maintenance', 'Keine', 'Regelmäßig (Updates, Backups)'],
            ['Ausfallrisiko', 'Cloudflare SLA 99.99%', 'Abhängig von deinem Hosting'],
            ['Latenz global', '<10ms überall', 'Gut (lokal), schlecht (global)'],
            ['IP-Filter', 'GUI, sofort', 'Custom Code'],
            ['Analytics', 'Dashboard', 'Eigenes Setup (Grafana etc.)'],
            ['DSGVO', '✓ EU', 'Du bist verantwortlich'],
          ]}
        />

        <div style={B.warn}>
          <strong>Der versteckte Aufwand:</strong> Redis selbst zu hosten ist nicht nur günstiger,
          es kostet auch Entwicklungszeit. Eine Stunde Entwicklerzeit à €80 macht das "kostenlose"
          Redis nach wenigen Stunden teurer als ein bezahlter Managed Service.
        </div>

        {/* Recommendation matrix */}
        <h2 style={B.h2}>Empfehlungsmatrix: Welches Tool für wen?</h2>

        <Table
          headers={['Projekttyp', 'Empfehlung', 'Begründung']}
          rows={[
            ['Indie Hacker / Side Project', 'RateLimit API (Free)', 'Null Aufwand, kostenlos, sofort produktionsbereit'],
            ['Startup (Seed–Series A)', 'RateLimit API', 'Schnell, günstig, fokussiert auf Rate Limiting'],
            ['Mid-Size SaaS', 'RateLimit API Pro', 'Skaliert mit euch, kein DevOps-Overhead'],
            ['Enterprise mit bestehendem Gateway', 'Kong + RateLimit API', 'Kong für Routing, RateLimit API für Edge-Layer'],
            ['Team mit starker Redis-Expertise', 'Upstash oder Redis', 'Wenn ihr ohnehin im Redis-Ökosystem seid'],
            ['Maximale Kontrolle gewünscht', 'Redis selbst-gehostet', 'Wenn Compliance eigene Infra vorschreibt'],
            ['AWS-Shop', 'AWS WAF + RateLimit API', 'WAF für Layer-7, RateLimit API für App-Layer'],
          ]}
        />

        <h2 style={B.h2}>Fazit</h2>
        <p style={B.p}>
          Es gibt kein universell "bestes" Rate-Limiting-Tool – aber es gibt das richtige für deinen Kontext.
          Für die <strong style={{ color: 'white' }}>meisten modernen API-Projekte</strong> bietet RateLimit API
          die beste Kombination aus Geschwindigkeit, Einfachheit und Kosten. Wer bereits ein API Gateway
          betreibt oder maximale Redis-Flexibilität braucht, findet mit Upstash oder Kong bessere Optionen.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '0.75rem', marginTop: '2.5rem' }}>
          <BlogCard href="/blog/cloudflare-rate-limiting" tag="Cloudflare Guide" title="Rate Limiting mit Cloudflare Workers" desc="Von der Theorie zur Production-Integration." />
          <BlogCard href="/blog/rate-limiting-algorithms" tag="Algorithmen" title="Token Bucket vs Fixed Window" desc="Welcher Algorithmus für welchen Use Case." />
          <BlogCard href="/faq" tag="FAQ" title="Häufige Fragen" desc="Schnelle Antworten zu Integration und Preisen." />
        </div>

        <div style={{ marginTop: '3rem', textAlign: 'center' }}>
          <a href="/register" style={{ display: 'inline-block', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: 'white', textDecoration: 'none', padding: '0.875rem 2.5rem', borderRadius: 10, fontWeight: 700, fontSize: '1rem', boxShadow: '0 10px 40px -10px rgba(59,130,246,0.4)' }}>
            RateLimit API kostenlos testen →
          </a>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
