import { SiteNav } from '../shared/SiteNav';
import { SiteFooter } from '../shared/SiteFooter';
import { B, Table, BlogCard } from './CloudflareGuide';

export function UseCasesGuide() {
  return (
    <div style={B.page}>
      <SiteNav activeHref="/blog/api-use-cases" />

      <div style={B.hero}>
        <div style={B.heroInner}>
          <div style={B.tag}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            Guide · Use Cases
          </div>
          <h1 style={B.h1}>API Rate Limiting für SaaS, Gaming & AI APIs –<br />Konkrete Use Cases &amp; Konfigurationen</h1>
          <p style={B.lead}>
            Rate Limiting ist kein One-Size-Fits-All. Eine Gaming-API hat andere Anforderungen als ein SaaS-Dashboard
            oder ein KI-Dienst. Dieser Guide zeigt dir branchenspezifische Konfigurationen, typische Angriffsmuster
            und wie RateLimit API in jedem Szenario konkret eingesetzt wird.
          </p>
          <div style={B.meta}>
            <span>⏱ ca. 15 Min. Lesezeit</span>
            <span>📅 Januar 2026</span>
            <span>🎯 Startup-Gründer · CTO · Backend-Teams</span>
          </div>
        </div>
      </div>

      <div style={B.body}>

        <h2 style={B.h2}>Warum branchenspezifisches Rate Limiting wichtig ist</h2>
        <p style={B.p}>
          Die meisten Entwickler konfigurieren Rate Limiting einmalig und vergessen es dann. Das ist ein Fehler.
          Ein zu strenges Limit frustriert legitime Nutzer; ein zu lockeres Limit macht dich zum Ziel von
          Missbrauch. Die richtige Konfiguration hängt stark vom Nutzungsverhalten deiner Zielgruppe ab.
        </p>

        <Table
          headers={['Branche', 'Typisches Nutzungsmuster', 'Häufigstes Angriffsszenario', 'Empfohlene Strategie']}
          rows={[
            ['SaaS / B2B', 'Gleichmäßig über den Arbeitstag', 'Credential Stuffing auf Login', 'Strikte Login-Limits, lockere API-Limits'],
            ['Gaming', 'Spitzen in Echtzeit (Matches)', 'Score-Manipulation, Bot-Farming', 'IP + User-basiert kombiniert'],
            ['AI API (LLM)', 'Burst beim Start, dann ruhig', 'Token-Missbrauch, Kosten-Explosion', 'Cost-basiertes Token Bucket'],
            ['E-Commerce', 'Saisonal (Black Friday)', 'Cart-Slamming, Price-Scraping', 'Adaptive Limits + Blacklisting'],
            ['Open Data API', 'Gleichmäßig, viele Nutzer', 'Scraping ohne Attribution', 'API-Key-Pflicht + Tiered Limits'],
            ['Fintech / Banking', 'Niedrig aber kritisch', 'Account-Takeover, Fraud', 'Strengste Limits, Whitelist-Only intern'],
          ]}
        />

        {/* SaaS */}
        <h2 style={B.h2}>Use Case 1: SaaS-Plattform</h2>
        <p style={B.p}>
          SaaS-Produkte haben typischerweise mehrere API-Tiers: Free, Pro, Enterprise. Rate Limiting ist hier
          gleichzeitig ein Sicherheits- und ein Business-Tool – es erzwingt Upgrades und schützt vor Missbrauch.
        </p>

        <h3 style={B.h3}>Das Tiered-Plan-Modell</h3>
        <Table
          headers={['Plan', 'API-Requests/Min', 'Burst', 'IP-Filter', 'Preis']}
          rows={[
            ['Free', '20 req / min', '5', 'Nein', 'Kostenlos'],
            ['Starter', '100 req / min', '20', 'Ja (Blacklist)', '€9/Monat'],
            ['Pro', '500 req / min', '100', 'Ja (Black + White)', '€29/Monat'],
            ['Enterprise', 'Unbegrenzt', 'Konfigurierbar', 'Vollständig', 'Individuell'],
          ]}
        />

        <p style={B.p}>
          Mit RateLimit API erstellst du für jeden Plan einen separaten API Key mit unterschiedlichen Limits.
          In deiner Middleware liest du den Plan des eingeloggten Nutzers aus der DB und wählst den entsprechenden Key:
        </p>

        <pre style={B.pre}>{`// SaaS Multi-Tier Rate Limiting
const PLAN_KEYS: Record<string, string> = {
  free:       process.env.RL_KEY_FREE!,
  starter:    process.env.RL_KEY_STARTER!,
  pro:        process.env.RL_KEY_PRO!,
  enterprise: process.env.RL_KEY_ENTERPRISE!,
};

app.use(async (req: AuthenticatedRequest, res, next) => {
  const userPlan = req.user?.plan ?? 'free';
  const apiKey = PLAN_KEYS[userPlan];
  
  const rl = await checkRateLimit(apiKey, req.path);
  
  if (!rl.allowed) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      plan: userPlan,
      upgradeUrl: 'https://yourapp.com/pricing',
      retryAfter: rl.resetAt - Math.floor(Date.now() / 1000),
    });
  }
  
  // Pass remaining to client for UX
  res.set('X-RateLimit-Remaining', String(rl.remaining));
  next();
});`}</pre>

        <div style={B.callout}>
          <strong>SaaS-Tipp:</strong> Zeige im Frontend einen Fortschrittsbalken mit dem verbleibenden Rate-Limit.
          Das erhöht die Upgrade-Conversion erheblich – Nutzer, die sehen, dass sie 95% ihrer Limits erreicht haben,
          upgraden öfter als wenn sie plötzlich einen 429-Fehler sehen.
        </div>

        {/* Gaming */}
        <h2 style={B.h2}>Use Case 2: Gaming-API</h2>
        <p style={B.p}>
          Gaming-APIs sind eines der herausforderndsten Rate-Limiting-Szenarien: legitime Spieler senden
          in Echtzeit-Matches hunderte Requests pro Sekunde, während Bots versuchen, Leaderboards zu manipulieren
          oder Ressourcen zu farmen.
        </p>

        <h3 style={B.h3}>Typische Angriffsvektoren in Gaming-APIs</h3>
        <ul style={B.ul}>
          <li><strong style={{ color: '#e2e8f0' }}>Score-Injection:</strong> Bot sendet gefälschte Score-Updates in Millisekunden-Abstand</li>
          <li><strong style={{ color: '#e2e8f0' }}>Resource-Farming:</strong> Automatisierter Abruf von Spielressourcen im Sekundentakt</li>
          <li><strong style={{ color: '#e2e8f0' }}>Match-Making-Abuse:</strong> Tausende gleichzeitige Match-Requests von einer IP</li>
          <li><strong style={{ color: '#e2e8f0' }}>DDoS auf Game-Server:</strong> Koordinierter Angriff während Turnieren</li>
        </ul>

        <h3 style={B.h3}>Empfohlene Konfiguration: Endpoint-spezifische Limits</h3>
        <Table
          headers={['Endpoint', 'Limit', 'Fenster', 'Filter', 'Begründung']}
          rows={[
            ['POST /scores', '1 req / 5s', 'per User-ID', 'User-Agent Bot-Block', 'Verhindert Score-Spamming'],
            ['GET /leaderboard', '10 req / min', 'per IP', 'Keine', 'Lesen ist OK, Burst für Live-Updates'],
            ['POST /matchmaking', '3 req / min', 'per User-ID', 'IP-Blacklist', 'Verhindert Queue-Flooding'],
            ['GET /player/:id', '30 req / min', 'per IP', 'Keine', 'Profile-Abruf ist normal'],
            ['POST /action', '20 req / s', 'per Session', 'User-Agent', 'Echtzeit-Aktionen in Matches'],
          ]}
        />

        <pre style={B.pre}>{`// Gaming: Endpoint-spezifisches Rate Limiting
const GAME_LIMITS: Record<string, string> = {
  '/scores':      process.env.RL_SCORES_KEY!,
  '/leaderboard': process.env.RL_LEADERBOARD_KEY!,
  '/matchmaking': process.env.RL_MATCH_KEY!,
  '/action':      process.env.RL_ACTION_KEY!,
};

// Rate-Limit-Key = user_id + endpoint für granulare Kontrolle
async function checkGameLimit(userId: string, endpoint: string): Promise<boolean> {
  const limitKey = GAME_LIMITS[endpoint] ?? GAME_LIMITS['/action'];
  const result = await fetch(
    \`https://ratelimit-api.karol-paschek.workers.dev/check?endpoint=\${endpoint}&user=\${userId}\`,
    { headers: { 'X-API-Key': limitKey } }
  );
  return (await result.json()).allowed;
}`}</pre>

        {/* AI */}
        <h2 style={B.h2}>Use Case 3: KI / LLM APIs (GPT, Claude, eigene Modelle)</h2>
        <p style={B.p}>
          KI-APIs haben ein Problem, das andere APIs nicht kennen: <strong style={{ color: 'white' }}>Kosten sind
          proportional zur Nutzung</strong>. Jeder Token, den ein Nutzer verarbeitet, kostet Geld. Ohne Rate Limiting
          kann ein einzelner Nutzer deine monatliche KI-Rechnung in einem Nachmittag aufbrauchen.
        </p>

        <div style={B.warn}>
          <strong>Reales Szenario:</strong> Ein Startup ohne Rate Limiting verlor 12.000 USD an OpenAI-Kosten
          in einem Wochenende, als ein Nutzer einen automatisierten Loop startete. Rate Limiting hätte das
          bei einem Limit von 50 API-Calls/Stunde auf unter 20 USD begrenzt.
        </div>

        <h3 style={B.h3}>Token-basiertes Rate Limiting für LLM-APIs</h3>
        <p style={B.p}>
          Klassisches Request-basiertes Rate Limiting ist für LLMs unzureichend – eine Anfrage kann
          10 Tokens oder 10.000 Tokens verbrauchen. Besser: Kombiniere Request-Limits mit
          response-basierten Limits:
        </p>

        <Table
          headers={['Limit-Typ', 'Konfiguration', 'Schutz vor']}
          rows={[
            ['Request-Limit (RateLimit API)', '10 req / min', 'Anfrage-Flooding'],
            ['Token-Limit (App-seitig)', 'Max 2000 Tokens/Request', 'Riesige Einzelanfragen'],
            ['Daily-Limit (App-seitig)', 'Max 50.000 Tokens/Tag', 'Kostenkontrolle'],
            ['Concurrent-Limit (App-seitig)', 'Max 3 simultane Requests', 'Parallelisierter Missbrauch'],
          ]}
        />

        <pre style={B.pre}>{`// AI API: Multi-Layer Rate Limiting
app.post('/api/chat', async (req, res) => {
  const { messages, userId } = req.body;
  
  // Layer 1: RateLimit API Check (Request-Frequenz)
  const rl = await checkRateLimit(process.env.RL_AI_KEY!, '/chat');
  if (!rl.allowed) {
    return res.status(429).json({ error: 'Too many requests', retryAfter: 60 });
  }
  
  // Layer 2: Token-Schätzung (app-seitig)
  const estimatedTokens = estimateTokens(messages);
  if (estimatedTokens > 2000) {
    return res.status(400).json({ error: 'Message too long', maxTokens: 2000 });
  }
  
  // Layer 3: Daily Budget (aus DB)
  const dailyUsage = await getUserDailyTokens(userId);
  if (dailyUsage + estimatedTokens > 50000) {
    return res.status(429).json({ error: 'Daily token limit reached' });
  }
  
  // Proceed with AI call
  const response = await openai.chat.completions.create({ ... });
  await incrementUserDailyTokens(userId, response.usage.total_tokens);
  
  res.json(response);
});`}</pre>

        {/* E-Commerce */}
        <h2 style={B.h2}>Use Case 4: E-Commerce & Marktplätze</h2>
        <p style={B.p}>
          E-Commerce-Plattformen haben besondere Herausforderungen: saisonale Traffic-Spitzen
          (Black Friday, Cyber Monday) und gezielte Angriffe auf kritische Endpunkte.
        </p>

        <h3 style={B.h3}>Kritische Endpunkte und ihre Limits</h3>
        <Table
          headers={['Endpunkt', 'Angriffsszenario', 'Empfohlenes Limit', 'Zusatzschutz']}
          rows={[
            ['POST /cart/add', 'Cart-Slamming (Produkt-Hoarding)', '5 req / 10s pro IP', 'CAPTCHA nach 3 Fehlern'],
            ['POST /checkout', 'Carding (Kreditkarten-Test)', '3 req / min pro IP', 'Strikte IP-Blacklist'],
            ['GET /products/search', 'Price-Scraping', '30 req / min pro IP', 'Bot-Detection'],
            ['POST /wishlist', 'Automated Wishlist-Flooding', '10 req / min pro User', 'User-Agent-Filter'],
            ['GET /inventory', 'Stock-Level-Monitoring (Bots)', '5 req / min pro IP', 'API-Key-Pflicht'],
          ]}
        />

        <div style={B.callout}>
          <strong>Black Friday Tipp:</strong> Erhöhe deine Rate Limits temporär für bekannte Nutzer
          (registrierte Accounts mit Kaufhistorie) und halte strikte Limits für neue/anonyme IPs.
          RateLimit API unterstützt dies über separate API Keys pro Nutzergruppe.
        </div>

        {/* Fintech */}
        <h2 style={B.h2}>Use Case 5: Fintech & Banking-APIs</h2>
        <p style={B.p}>
          Fintech-APIs erfordern die strengsten Rate-Limiting-Konfigurationen.
          Hier geht es nicht nur um Performance – sondern um Betrugsverhinderung und regulatorische Compliance.
        </p>

        <ul style={B.ul}>
          <li><strong style={{ color: '#e2e8f0' }}>Login-Brute-Force:</strong> 3 Fehlversuche → 15 Minuten Sperrzeit, 10 Fehlversuche → 24h Sperre</li>
          <li><strong style={{ color: '#e2e8f0' }}>Transaktions-API:</strong> Max. 10 Transaktionen pro Stunde pro Nutzer</li>
          <li><strong style={{ color: '#e2e8f0' }}>Balance-Abruf:</strong> Max. 60 Abfragen pro Stunde (verhindert Echtzeit-Monitoring durch Dritte)</li>
          <li><strong style={{ color: '#e2e8f0' }}>Whitelist-Only intern:</strong> Interne Microservices nur von bekannten IPs erlauben</li>
        </ul>

        <h2 style={B.h2}>Allgemeine Konfigurationsempfehlungen</h2>
        <Table
          headers={['Endpunkt-Typ', 'Startkonfiguration', 'Anpassung nach']}
          rows={[
            ['Auth-Endpunkte (Login, OTP)', '5 req / 15 min', 'Brute-Force-Logs analysieren'],
            ['Read-Endpunkte (GET)', '100 req / min', 'Durchschnittlicher Traffic × 3'],
            ['Write-Endpunkte (POST)', '20 req / min', 'Durchschnittlicher Traffic × 2'],
            ['Webhook-Empfang', '50 req / min', 'Anzahl Webhook-Provider × 5'],
            ['File-Upload', '5 req / 5 min', 'Nutzerfeedback bei 429s'],
            ['Search / Suche', '30 req / 30s', 'Query-Performance × 2'],
          ]}
        />

        <div style={{ marginTop: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '0.75rem' }}>
          <BlogCard href="/blog/cloudflare-rate-limiting" tag="Cloudflare Guide" title="Rate Limiting mit Cloudflare Workers" desc="Integration, Code-Beispiele und Best Practices." />
          <BlogCard href="/blog/rate-limiting-algorithms" tag="Algorithmen" title="Token Bucket vs Fixed Window erklärt" desc="Welcher Algorithmus für welchen Use Case?" />
          <BlogCard href="/faq" tag="FAQ" title="Häufige Fragen zu RateLimit API" desc="Alles was du zur Integration wissen musst." />
        </div>

        <div style={{ marginTop: '3rem', textAlign: 'center' }}>
          <a href="/register" style={{ display: 'inline-block', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: 'white', textDecoration: 'none', padding: '0.875rem 2.5rem', borderRadius: 10, fontWeight: 700, fontSize: '1rem', boxShadow: '0 10px 40px -10px rgba(59,130,246,0.4)' }}>
            Kostenlos testen – kein Kreditkarte →
          </a>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
