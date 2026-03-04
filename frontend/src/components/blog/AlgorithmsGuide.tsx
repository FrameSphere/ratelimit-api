import { SiteNav } from '../shared/SiteNav';
import { SiteFooter } from '../shared/SiteFooter';
import { B, Table, BlogCard } from './CloudflareGuide';

export function AlgorithmsGuide() {
  return (
    <div style={B.page}>
      <SiteNav activeHref="/blog/rate-limiting-algorithms" />

      <div style={B.hero}>
        <div style={B.heroInner}>
          <div style={B.tag}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            Guide · Algorithmen
          </div>
          <h1 style={B.h1}>Token Bucket vs Fixed Window vs Sliding Window –<br />Rate Limiting Algorithmen im Vergleich</h1>
          <p style={B.lead}>
            Nicht jeder Rate-Limiting-Algorithmus ist gleich. Token Bucket, Fixed Window, Sliding Window und Leaky Bucket
            haben unterschiedliche Stärken. Dieser Guide zeigt dir, welcher Algorithmus für welchen Use Case der richtige ist –
            mit mathematischer Erklärung, Vor-/Nachteile-Tabellen und konkreten Empfehlungen.
          </p>
          <div style={B.meta}>
            <span>⏱ ca. 14 Min. Lesezeit</span>
            <span>📅 Januar 2026</span>
            <span>🎯 Backend-Entwickler · API-Architekten</span>
          </div>
        </div>
      </div>

      <div style={B.body}>

        <h2 style={B.h2}>Überblick: Die 4 wichtigsten Algorithmen</h2>
        <p style={B.p}>
          Rate Limiting klingt simpel – „maximal X Anfragen pro Zeitraum" – aber die Implementierung dahinter
          hat erhebliche Auswirkungen auf das Nutzererlebnis, die Serverbelastung und die Angriffssicherheit.
          Bevor wir ins Detail gehen, ein schneller Überblick:
        </p>

        <Table
          headers={['Algorithmus', 'Burst-Traffic', 'Speicher', 'Fairness', 'Komplexität', 'Typischer Einsatz']}
          rows={[
            ['Fixed Window', 'Erlaubt (am Rand)', 'O(1)', 'Mittel', 'Sehr gering', 'Einfache APIs, Intern'],
            ['Sliding Window Log', 'Exakt kontrolliert', 'O(n)', 'Hoch', 'Mittel', 'Public APIs mit fairem Limit'],
            ['Sliding Window Counter', 'Annähernd kontrolliert', 'O(1)', 'Hoch', 'Gering', 'Empfohlen für die meisten APIs'],
            ['Token Bucket', 'Explizit erlaubt', 'O(1)', 'Mittel', 'Gering', 'APIs mit Burst-Anforderung'],
            ['Leaky Bucket', 'Gleichmäßig (Queue)', 'O(n)', 'Sehr hoch', 'Mittel', 'Streaming, Webhooks'],
          ]}
        />

        {/* Fixed Window */}
        <h2 style={B.h2}>1. Fixed Window Counter</h2>
        <p style={B.p}>
          Der einfachste Algorithmus. Das Zeitfenster wird in feste Intervalle aufgeteilt
          (z.B. jede Minute von :00 bis :59). Pro Fenster wird ein Zähler hochgezählt.
          Erreicht der Zähler das Limit, werden alle weiteren Anfragen abgelehnt.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ ...B.card, borderColor: 'rgba(52,211,153,0.2)' }}>
            <div style={{ fontWeight: 700, color: '#34d399', marginBottom: 6, fontSize: '0.88rem' }}>✓ Vorteile</div>
            <ul style={{ ...B.ul, marginBottom: 0, fontSize: '0.88rem' }}>
              <li>Extrem einfach zu implementieren</li>
              <li>Minimaler Speicherverbrauch (1 Counter pro Key)</li>
              <li>Vorhersehbar für Nutzer</li>
            </ul>
          </div>
          <div style={{ ...B.card, borderColor: 'rgba(248,113,113,0.2)' }}>
            <div style={{ fontWeight: 700, color: '#f87171', marginBottom: 6, fontSize: '0.88rem' }}>✗ Nachteile</div>
            <ul style={{ ...B.ul, marginBottom: 0, fontSize: '0.88rem' }}>
              <li>Boundary-Problem: 2× Burst am Fensterrand möglich</li>
              <li>Ungleichmäßige Verteilung (Rush am Fenster-Reset)</li>
              <li>Kein Schutz vor koordinierten Bursts</li>
            </ul>
          </div>
        </div>

        <div style={B.warn}>
          <strong>Das Boundary-Problem:</strong> Wenn das Limit 100 req/min ist, kann ein Angreifer
          99 Anfragen um 00:58 senden und nochmals 99 um 01:02 – insgesamt 198 Anfragen in 4 Sekunden.
          Das ist das Hauptproblem von Fixed Window.
        </div>

        <pre style={B.pre}>{`// Fixed Window in TypeScript (konzeptionell)
async function fixedWindowCheck(key: string, limit: number, windowMs: number): Promise<boolean> {
  const window = Math.floor(Date.now() / windowMs);
  const redisKey = \`ratelimit:\${key}:\${window}\`;
  
  const count = await redis.incr(redisKey);
  if (count === 1) await redis.expire(redisKey, windowMs / 1000);
  
  return count <= limit;
}`}</pre>

        {/* Token Bucket */}
        <h2 style={B.h2}>2. Token Bucket (empfohlen für die meisten APIs)</h2>
        <p style={B.p}>
          Das Token-Bucket-Modell ist intuitiv: Stell dir einen Eimer vor, der kontinuierlich
          mit Tokens befüllt wird (z.B. 10 Tokens/Sekunde). Jede Anfrage verbraucht einen Token.
          Ist der Eimer leer → 429. Burst-Traffic ist erlaubt, solange Tokens vorhanden sind.
        </p>

        <div style={B.callout}>
          <strong>Mathematisch:</strong> Wenn der Eimer die Kapazität C hat und die Füllrate R Tokens/Sekunde beträgt,
          kann ein Nutzer maximal C Anfragen gleichzeitig absetzen (Burst) und danach R Anfragen/Sekunde dauerhaft.
          RateLimit API verwendet diesen Algorithmus.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ ...B.card, borderColor: 'rgba(52,211,153,0.2)' }}>
            <div style={{ fontWeight: 700, color: '#34d399', marginBottom: 6, fontSize: '0.88rem' }}>✓ Vorteile</div>
            <ul style={{ ...B.ul, marginBottom: 0, fontSize: '0.88rem' }}>
              <li>Erlaubt natürliche Bursts (gut für UX)</li>
              <li>Kein Boundary-Problem</li>
              <li>O(1) Speicher pro Key</li>
              <li>Einfache Konfiguration (Kapazität + Rate)</li>
            </ul>
          </div>
          <div style={{ ...B.card, borderColor: 'rgba(248,113,113,0.2)' }}>
            <div style={{ fontWeight: 700, color: '#f87171', marginBottom: 6, fontSize: '0.88rem' }}>✗ Nachteile</div>
            <ul style={{ ...B.ul, marginBottom: 0, fontSize: '0.88rem' }}>
              <li>Burst kann Server kurzzeitig überlasten</li>
              <li>Schwieriger zu erklären als Fixed Window</li>
            </ul>
          </div>
        </div>

        <pre style={B.pre}>{`// Token Bucket Implementation
interface TokenBucket {
  tokens: number;
  lastRefill: number;
  capacity: number;
  refillRate: number; // tokens per second
}

function checkTokenBucket(bucket: TokenBucket): boolean {
  const now = Date.now() / 1000;
  const elapsed = now - bucket.lastRefill;
  
  // Refill tokens based on elapsed time
  bucket.tokens = Math.min(
    bucket.capacity,
    bucket.tokens + elapsed * bucket.refillRate
  );
  bucket.lastRefill = now;
  
  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return true; // allowed
  }
  return false; // rate limited
}`}</pre>

        {/* Sliding Window */}
        <h2 style={B.h2}>3. Sliding Window (fairstes Ergebnis)</h2>
        <p style={B.p}>
          Sliding Window löst das Boundary-Problem von Fixed Window. Statt eines festen Zeitfensters
          wird immer das letzte Zeitfenster relativ zur aktuellen Zeit betrachtet. Es gibt zwei Varianten:
        </p>

        <h3 style={B.h3}>Sliding Window Log</h3>
        <p style={B.p}>
          Jeder Timestamp einer Anfrage wird gespeichert. Beim Check werden alle Timestamps außerhalb
          des Fensters gelöscht, dann wird gezählt. Exakt, aber speicherintensiv (O(n)).
        </p>

        <h3 style={B.h3}>Sliding Window Counter (empfohlen)</h3>
        <p style={B.p}>
          Eine Approximation: Zwei Fixed-Window-Counter werden gewichtet kombiniert.
          Aktuelles Fenster × aktueller Anteil + vorheriges Fenster × (1 - Anteil). Nur O(2) Speicher,
          sehr genaue Approximation (&lt;1% Fehler in der Praxis).
        </p>

        <pre style={B.pre}>{`// Sliding Window Counter (approximiert)
async function slidingWindowCheck(key: string, limit: number, windowMs: number): Promise<boolean> {
  const now = Date.now();
  const currentWindow = Math.floor(now / windowMs);
  const previousWindow = currentWindow - 1;
  
  const [currentCount, previousCount] = await redis.mget(
    \`rl:\${key}:\${currentWindow}\`,
    \`rl:\${key}:\${previousWindow}\`
  );
  
  // Anteil des aktuellen Fensters (0.0 – 1.0)
  const windowProgress = (now % windowMs) / windowMs;
  
  // Gewichtete Summe
  const estimatedCount = 
    (Number(currentCount) || 0) * windowProgress +
    (Number(previousCount) || 0) * (1 - windowProgress);
  
  return estimatedCount < limit;
}`}</pre>

        {/* Leaky Bucket */}
        <h2 style={B.h2}>4. Leaky Bucket (für gleichmäßigen Traffic)</h2>
        <p style={B.p}>
          Der Leaky Bucket verarbeitet Anfragen in einer Queue mit gleichmäßiger Rate –
          wie Wasser, das aus einem Eimer tropft. Burst-Traffic wird gepuffert, nicht abgelehnt.
          Das erzeugt gleichmäßigen Traffic zum Origin-Server, ist aber komplex und führt zu Latenz.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ ...B.card, borderColor: 'rgba(52,211,153,0.2)' }}>
            <div style={{ fontWeight: 700, color: '#34d399', marginBottom: 6, fontSize: '0.88rem' }}>✓ Ideal für</div>
            <ul style={{ ...B.ul, marginBottom: 0, fontSize: '0.88rem' }}>
              <li>Webhooks und Callbacks</li>
              <li>Streaming-APIs</li>
              <li>Messaging-Systeme</li>
              <li>Wenn gleichmäßiger Durchsatz wichtig ist</li>
            </ul>
          </div>
          <div style={{ ...B.card, borderColor: 'rgba(248,113,113,0.2)' }}>
            <div style={{ fontWeight: 700, color: '#f87171', marginBottom: 6, fontSize: '0.88rem' }}>✗ Nicht geeignet für</div>
            <ul style={{ ...B.ul, marginBottom: 0, fontSize: '0.88rem' }}>
              <li>Interaktive APIs (zu viel Latenz)</li>
              <li>Einfache REST APIs</li>
              <li>Burst-intensive Anwendungen</li>
            </ul>
          </div>
        </div>

        {/* Entscheidungsmatrix */}
        <h2 style={B.h2}>Entscheidungsmatrix: Welcher Algorithmus für welchen Use Case?</h2>

        <Table
          headers={['Use Case', 'Empfohlener Algorithmus', 'Konfigurationsbeispiel']}
          rows={[
            ['Login / Auth-Endpoints', 'Fixed Window', '5 req / 15 min pro IP'],
            ['Öffentliche REST API (Free Plan)', 'Token Bucket', '100 req / min, Burst: 20'],
            ['AI API (Cost-Control)', 'Token Bucket', '10 req / min, Burst: 3'],
            ['Gaming-Leaderboard', 'Sliding Window Counter', '30 req / 10s pro User'],
            ['Webhook-Delivery', 'Leaky Bucket', '10 req/s, Queue: 1000'],
            ['SaaS Paid Plan', 'Token Bucket', '1000 req / min, Burst: 100'],
            ['File-Upload Endpoint', 'Fixed Window', '10 uploads / Stunde'],
            ['Search-API', 'Sliding Window Counter', '20 req / 5s'],
          ]}
        />

        <h2 style={B.h2}>RateLimit API: Welchen Algorithmus nutzt es?</h2>
        <p style={B.p}>
          RateLimit API implementiert eine optimierte Variante des <strong style={{ color: 'white' }}>Token Bucket</strong>-Algorithmus,
          gespeichert direkt in Cloudflare's D1-Datenbank am Edge. Das bedeutet:
        </p>
        <ul style={B.ul}>
          <li>O(1) Speicher pro API-Key – keine Redis-Cluster nötig</li>
          <li>Burst-Traffic ist konfigurierbar erlaubt</li>
          <li>Unter 10ms Check-Latenz durch Edge-Storage</li>
          <li>Keine Datenbank-Synchronisation zwischen Regionen nötig</li>
        </ul>

        <div style={{ marginTop: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '0.75rem' }}>
          <BlogCard href="/blog/cloudflare-rate-limiting" tag="Cloudflare Guide" title="Rate Limiting mit Cloudflare Workers" desc="Integration, Code-Beispiele und Best Practices für Production." />
          <BlogCard href="/blog/api-use-cases" tag="Use Cases" title="Rate Limiting für SaaS, Gaming & AI" desc="Konkrete Konfigurationsempfehlungen für verschiedene Branchen." />
          <BlogCard href="/vergleich" tag="Vergleich" title="RateLimit API vs. Upstash vs. Kong" desc="Tool-Vergleich mit Feature-Matrix und Kostenanalyse." />
        </div>

        <div style={{ marginTop: '3rem', textAlign: 'center' }}>
          <a href="/register" style={{ display: 'inline-block', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: 'white', textDecoration: 'none', padding: '0.875rem 2.5rem', borderRadius: 10, fontWeight: 700, fontSize: '1rem', boxShadow: '0 10px 40px -10px rgba(59,130,246,0.4)' }}>
            Token Bucket kostenlos testen →
          </a>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
