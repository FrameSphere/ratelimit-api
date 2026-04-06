import { useState, useRef, useEffect } from 'react';

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

function Callout({ type, children }: { type: 'info' | 'warning' | 'tip' | 'success' | 'pro'; children: React.ReactNode }) {
  const styles = {
    info:    { bg: 'rgba(59,130,246,0.07)',  border: 'rgba(59,130,246,0.2)',  color: '#60a5fa',  icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg> },
    warning: { bg: 'rgba(251,191,36,0.07)', border: 'rgba(251,191,36,0.22)', color: '#fbbf24', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
    tip:     { bg: 'rgba(16,185,129,0.07)',  border: 'rgba(16,185,129,0.2)',  color: '#34d399', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg> },
    success: { bg: 'rgba(34,197,94,0.07)',   border: 'rgba(34,197,94,0.2)',   color: '#4ade80', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg> },
    pro:     { bg: 'rgba(139,92,246,0.08)',  border: 'rgba(139,92,246,0.25)', color: '#a78bfa', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> },
  };
  const s = styles[type];
  return (
    <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 10, padding: '0.875rem 1rem', margin: '1rem 0', display: 'flex', gap: '0.625rem', alignItems: 'flex-start' }}>
      <span style={{ color: s.color, flexShrink: 0, marginTop: 1 }}>{s.icon}</span>
      <div style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.65 }}>{children}</div>
    </div>
  );
}

const BASE_URL = 'https://ratelimit-api.karol-paschek.workers.dev';

interface AdvSection {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  badge?: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

function buildAdvancedSections(): AdvSection[] {
  return [
    {
      id: 'analytics',
      title: 'Analytics verstehen',
      subtitle: 'Traffic lesen, Muster erkennen',
      color: '#3b82f6',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
      content: (
        <>
          <p style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, fontSize: '0.93rem', marginBottom: '1.5rem' }}>
            Im Dashboard unter "Analytics" siehst du für jeden API Key, wie viel Traffic wann ankommt und wie viel davon geblockt wird. Hier erkennst du Angriffsmuster, Spitzenstunden und ob dein Rate Limit zu streng oder zu locker ist.
          </p>

          <h3 style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.875rem' }}>Wichtige Metriken & was sie bedeuten</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {[
              { metric: 'Total Requests', color: '#60a5fa', desc: 'Alle Requests im Zeitraum. Dient als Basis für alle anderen Metriken.' },
              { metric: 'Blocked Rate %', color: '#f87171', desc: 'Anteil geblockter Requests. Über 10% deutet auf Angriffe oder zu strenges Limit hin.' },
              { metric: 'Unique IPs', color: '#34d399', desc: 'Anzahl verschiedener IP-Adressen. Viele IPs = organisch; wenige IPs mit viel Traffic = Bot.' },
              { metric: 'Peak Hour', color: '#fbbf24', desc: 'Spitzenstunde des Tages. Passe dein Limit so an, dass echte User hier nicht geblockt werden.' },
            ].map(m => (
              <div key={m.metric} style={{ background: 'rgba(255,255,255,0.025)', border: `1px solid ${m.color}20`, borderRadius: 10, padding: '0.875rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: m.color, marginBottom: '0.4rem' }}>{m.metric}</div>
                <div style={{ fontSize: '0.77rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.55 }}>{m.desc}</div>
              </div>
            ))}
          </div>

          <Code lang="javascript">{`// Analytics per API abrufen
const token = 'YOUR_JWT_TOKEN';
const apiKeyId = 1;

// Letzte 24 Stunden
const res = await fetch(\`${BASE_URL}/api/analytics/\${apiKeyId}?range=24h\`, {
  headers: { 'Authorization': \`Bearer \${token}\` }
});
const data = await res.json();

console.log(\`Total: \${data.total}\`);
console.log(\`Geblockt: \${data.blocked} (\${data.blockedPercent?.toFixed(1)}%)\`);
console.log(\`Unique IPs: \${data.uniqueIps}\`);

// Chart-Daten für eigene Visualisierung
data.chart.forEach(point => {
  console.log(\`\${point.hour}: \${point.requests} Requests, \${point.blocked} geblockt\`);
});

// Verfügbare Zeiträume: 24h | 7d | 30d (30d nur Pro)`}</Code>

          <h3 style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.875rem', marginTop: '1.5rem' }}>Request Logs filtern & exportieren</h3>
          <Code lang="javascript">{`// Logs mit Filtern abrufen
const logs = await fetch(
  \`${BASE_URL}/api/logs/\${apiKeyId}?limit=100&ip=203.0.113.42&status=blocked\`,
  { headers: { 'Authorization': \`Bearer \${token}\` } }
).then(r => r.json());

// CSV Export (Pro)
const csvBlob = await fetch(
  \`${BASE_URL}/api/logs/\${apiKeyId}/export?range=7d\`,
  { headers: { 'Authorization': \`Bearer \${token}\` } }
).then(r => r.blob());

const url = URL.createObjectURL(csvBlob);
const a = document.createElement('a');
a.href = url; a.download = 'logs.csv'; a.click();`}</Code>

          <Callout type="tip">
            <strong style={{ color: '#34d399' }}>Anomalie-Erkennung:</strong> Wenn eine einzelne IP mehr als 20% deiner geblockten Requests ausmacht, füge sie zur Blacklist hinzu. Im Log-Tab kannst du nach IP filtern, um solche Muster schnell zu finden.
          </Callout>
        </>
      )
    },
    {
      id: 'adaptive',
      title: 'Adaptive Rate Limiting',
      subtitle: 'KI-gestützte automatische Optimierung',
      color: '#8b5cf6',
      badge: 'Pro',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.04-4.79A2.5 2.5 0 0 1 5 12a2.5 2.5 0 0 1 1.37-2.22 2.5 2.5 0 0 1 2.13-4.78A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.04-4.79A2.5 2.5 0 0 0 19 12a2.5 2.5 0 0 0-1.37-2.22 2.5 2.5 0 0 0-2.13-4.78A2.5 2.5 0 0 0 14.5 2Z"/></svg>,
      content: (
        <>
          <Callout type="pro">
            <strong style={{ color: '#a78bfa' }}>Pro-Feature.</strong> Adaptive Rate Limiting erfordert einen aktiven Pro-Plan und mindestens 7 Tage Traffic-Daten für aussagekräftige Empfehlungen.
          </Callout>

          <p style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, fontSize: '0.93rem', marginBottom: '1.5rem' }}>
            Statt das Limit manuell anzupassen, analysiert das System deine letzten 7 Tage Logs und berechnet, welches Limit optimal für dein tatsächliches Traffic-Muster wäre. Zu eng eingestellte Limits blockieren echte User — zu weit eingestellte schützen nicht.
          </p>

          <h3 style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.875rem' }}>So nutzt du es im Dashboard</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.5rem' }}>
            {[
              { n: '1', title: 'Dashboard öffnen → API Key wählen → Tab "Adaptive RL"', color: '#8b5cf6' },
              { n: '2', title: 'Empfehlungen werden automatisch für alle Konfigurationen berechnet', color: '#8b5cf6' },
              { n: '3', title: 'Details lesen: Konfidenz, Begründung, Spitzenstunde, Ø-Nutzung', color: '#8b5cf6' },
              { n: '4', title: 'Auf "Empfehlung anwenden" klicken — sofort aktiv ohne Neustart', color: '#8b5cf6' },
            ].map(s => (
              <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.875rem', background: 'rgba(255,255,255,0.025)', border: `1px solid ${s.color}15`, borderRadius: 8 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: `linear-gradient(135deg,${s.color},${s.color}bb)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>{s.n}</div>
                <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>{s.title}</span>
              </div>
            ))}
          </div>

          <Code lang="javascript">{`// Empfehlungen per API abrufen (Pro)
const { suggestions } = await fetch(
  \`${BASE_URL}/api/adaptive/\${apiKeyId}\`,
  { headers: { 'Authorization': \`Bearer \${token}\` } }
).then(r => r.json());

// Beispiel-Empfehlung:
// {
//   configId: 1,
//   configName: "Standard Limit",
//   currentLimit: 100,        ← dein aktuelles Limit
//   suggestedLimit: 145,      ← empfohlenes Limit
//   confidence: 0.87,         ← 87% Konfidenz
//   reason: "Ø-Nutzung bei 87% des Limits",
//   peakHour: "14:00",
//   avgRequestsPerHour: 93
// }

// Empfehlung anwenden
suggestions.forEach(async (suggestion) => {
  if (suggestion.confidence > 0.8) {  // Nur bei hoher Konfidenz
    await fetch(\`${BASE_URL}/api/adaptive/apply\`, {
      method: 'POST',
      headers: { 'Authorization': \`Bearer \${token}\`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ configId: suggestion.configId })
    });
    console.log(\`Limit angepasst: \${suggestion.currentLimit} → \${suggestion.suggestedLimit}\`);
  }
});`}</Code>

          <Callout type="tip">
            <strong style={{ color: '#34d399' }}>Wann automatisch anwenden?</strong> Nutze Empfehlungen mit Konfidenz &gt; 0.8 (80%) automatisiert via API. Bei niedrigerer Konfidenz lieber manuell im Dashboard überprüfen — das kann auf ungewöhnliche Traffic-Muster hindeuten.
          </Callout>
        </>
      )
    },
    {
      id: 'alerts',
      title: 'Webhook Alerts einrichten',
      subtitle: 'Slack, Discord & Custom Webhooks',
      color: '#f59e0b',
      badge: 'Pro',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
      content: (
        <>
          <Callout type="pro">
            <strong style={{ color: '#a78bfa' }}>Pro-Feature.</strong> Webhook Alerts erfordern einen aktiven Pro-Plan.
          </Callout>

          <p style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, fontSize: '0.93rem', marginBottom: '1.5rem' }}>
            Statt ständig das Dashboard zu überwachen, richte Webhooks ein, die dich in Slack oder Discord benachrichtigen, sobald etwas Ungewöhnliches passiert — etwa ein Angriff oder eine nahende Limite.
          </p>

          <h3 style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.875rem' }}>Slack-Webhook einrichten</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {[
              'Gehe in Slack zu: Apps → Incoming Webhooks → "Add to Slack"',
              'Kanal auswählen und bestätigen → Webhook URL kopieren (https://hooks.slack.com/services/...)',
              'Im RateLimit Dashboard: API Key → Tab "Alerts" → "Neuer Alert"',
              'Webhook URL einfügen, Typ "Slack" wählen, Schwellenwerte setzen',
              '"Test senden" klicken und Slack-Kanal prüfen',
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(245,158,11,0.1)', borderRadius: 7 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 700, color: '#fbbf24', flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{step}</span>
              </div>
            ))}
          </div>

          <Code lang="javascript">{`// Alert via API erstellen
await fetch('${BASE_URL}/api/alerts', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer TOKEN', 'Content-Type': 'application/json' },
  body: JSON.stringify({
    apiKeyId: 1,
    name: 'Production Monitoring',
    webhookUrl: 'https://hooks.slack.com/services/T00/B00/yourtoken',
    webhookType: 'slack',  // slack | discord | custom

    // Schwellenwerte (0 = deaktiviert)
    threshold429Pct: 15,         // Alert wenn >15% der Requests geblockt
    thresholdSpikePct: 200,      // Alert bei >200% Traffic gegenüber Schnitt
    thresholdNearLimitPct: 80,   // Alert wenn 80% des Limits aufgebraucht

    enabled: true
  })
});

// Discord Webhook (leicht abweichendes Format)
// Webhook URL aus: Discord Server → Einstellungen → Integrationen → Webhooks
await fetch('${BASE_URL}/api/alerts', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer TOKEN', 'Content-Type': 'application/json' },
  body: JSON.stringify({
    apiKeyId: 1,
    name: 'Discord Alert',
    webhookUrl: 'https://discord.com/api/webhooks/xxx/yyy',
    webhookType: 'discord',
    threshold429Pct: 20,
    enabled: true
  })
});`}</Code>

          <Callout type="tip">
            <strong style={{ color: '#34d399' }}>Empfohlene Schwellenwerte für den Start:</strong> 429-Rate &gt; 15%, Near-Limit &gt; 80%. Spike-Alerts erst nach ein paar Tagen einrichten, wenn du weißt, was dein normales Traffic-Niveau ist.
          </Callout>

          <h3 style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem', marginTop: '1.5rem' }}>Custom Webhook — eigene Integration</h3>
          <Code lang="javascript">{`// Custom Webhook empfangen (Node.js/Express)
app.post('/webhook/ratelimit', (req, res) => {
  const { alertName, alertType, currentValue, threshold, apiKeyName } = req.body;

  console.log(\`Alert: \${alertName}\`);
  console.log(\`Typ: \${alertType}\`);           // rate_429 | spike | near_limit
  console.log(\`Aktuell: \${currentValue}%\`);
  console.log(\`Schwellenwert: \${threshold}%\`);
  console.log(\`API Key: \${apiKeyName}\`);

  // Eigene Logik: PagerDuty, Email, SMS, etc.
  if (alertType === 'rate_429' && currentValue > 50) {
    sendEmergencyNotification();
  }

  res.status(200).json({ received: true });
});`}</Code>
        </>
      )
    },
    {
      id: 'sandbox',
      title: 'Sandbox & Testing',
      subtitle: 'Testen ohne Produktions-Traffic zu beeinflussen',
      color: '#06b6d4',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18"/></svg>,
      content: (
        <>
          <p style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, fontSize: '0.93rem', marginBottom: '1.5rem' }}>
            Im Dashboard-Tab "Sandbox" kannst du Requests gegen einen API Key simulieren, ohne echten Traffic zu generieren. Perfekt zum Testen neuer Konfigurationen oder Filter, bevor du sie in Produktion rollst.
          </p>

          <h3 style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.875rem' }}>Was du in der Sandbox testen kannst</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {[
              { title: 'Rate Limit ausschöpfen', desc: 'Mehrfach absenden bis 429 erscheint — siehst du den Reset-Timer?', color: '#06b6d4' },
              { title: 'Identifier testen', desc: 'User-IDs als Identifier übergeben und Per-User-Limits verifizieren', color: '#06b6d4' },
              { title: 'Filter-Regeln prüfen', desc: 'Eigene IP oder User Agent blocken — greift der Filter sofort?', color: '#06b6d4' },
              { title: 'Response-Headers lesen', desc: 'X-RateLimit-Remaining, Reset, Retry-After korrekt gesetzt?', color: '#06b6d4' },
            ].map(item => (
              <div key={item.title} style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)', borderRadius: 10, padding: '0.875rem' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#67e8f9', marginBottom: '0.35rem' }}>{item.title}</div>
                <div style={{ fontSize: '0.77rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            ))}
          </div>

          <h3 style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem' }}>Automatisiertes Testing mit curl</h3>
          <Code lang="bash">{`#!/bin/bash
# test-ratelimit.sh — Rate Limit ausschöpfen und Reset beobachten

API_KEY="rla_live_YOUR_KEY"
ENDPOINT="${BASE_URL}/check"
LIMIT=10  # Dein konfiguriertes Limit

echo "Sende \$((LIMIT + 5)) Requests..."

for i in $(seq 1 $((LIMIT + 5))); do
  response=$(curl -s -w "\\n%{http_code}" -H "X-API-Key: $API_KEY" "$ENDPOINT")
  http_code=$(echo "$response" | tail -1)
  body=$(echo "$response" | head -1)

  remaining=$(echo "$body" | grep -o '"remaining":[0-9]*' | cut -d: -f2)

  if [ "$http_code" = "429" ]; then
    echo "Request $i: ❌ GEBLOCKT (429)"
    echo "  Body: $body"
    break
  else
    echo "Request $i: ✓ Erlaubt — Verbleibend: $remaining"
  fi

  sleep 0.1  # Kleines Delay zwischen Requests
done`}</Code>

          <Callout type="info">
            Der Sandbox-Tab im Dashboard zeigt dir den Live-Status (Verbleibende Requests, Reset-Zeit) direkt in der UI. Du kannst dort auch custom Headers und Identifier eingeben, ohne Code zu schreiben.
          </Callout>
        </>
      )
    },
    {
      id: 'bestpractices',
      title: 'Best Practices & Produktions-Setup',
      subtitle: 'Was du vor dem Launch wissen solltest',
      color: '#10b981',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
      content: (
        <>
          <p style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, fontSize: '0.93rem', marginBottom: '1.5rem' }}>
            Bevor du live gehst, hier die wichtigsten Punkte für ein robustes Setup — aus häufigen Fehlern anderer Nutzer zusammengestellt.
          </p>

          <h3 style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.875rem' }}>Checkliste vor dem Launch</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Separater Key für Prod & Dev/Staging', desc: 'Niemals denselben Key in verschiedenen Umgebungen nutzen — du kannst Logs nicht trennen' },
              { label: 'Fail-Open implementiert', desc: 'Bei RateLimit-API-Fehler Request trotzdem erlauben — dein Service bleibt verfügbar' },
              { label: 'Timeout gesetzt', desc: '5 Sekunden sind ausreichend. Mehr schadet deiner Antwortzeit bei Problemen' },
              { label: 'API Key in .env — nicht im Code', desc: 'Niemals RATELIMIT_API_KEY hardcoded im Source Code' },
              { label: 'X-RateLimit Headers weiterleiten', desc: 'Clients können ihren Status anzeigen und Requests smart zurückhalten' },
              { label: 'Retry-After Header lesen', desc: 'Bei 429: dem Client sagen, wann er es erneut versuchen soll' },
              { label: 'Alert eingerichtet (Pro)', desc: 'Spätestens bei 80% des Limits möchtest du benachrichtigt werden' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.75rem', padding: '0.625rem 0.875rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(16,185,129,0.1)', borderRadius: 8 }}>
                <div style={{ width: 18, height: 18, borderRadius: 4, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'white' }}>{item.label}</div>
                  <div style={{ fontSize: '0.77rem', color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <h3 style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.875rem' }}>Vollständiges Produktions-Setup (Node.js)</h3>
          <Code lang="javascript">{`// lib/rateLimit.js — Production-ready
const RATELIMIT_URL = '${BASE_URL}/check';
const API_KEY = process.env.RATELIMIT_API_KEY;
const TIMEOUT_MS = 5000;

export async function checkRateLimit({ identifier = null } = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(RATELIMIT_URL, {
      method: identifier ? 'POST' : 'GET',
      headers: {
        'X-API-Key': API_KEY,
        ...(identifier && { 'Content-Type': 'application/json' }),
      },
      body: identifier ? JSON.stringify({ identifier }) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const data = await res.json();

    return {
      allowed: data.allowed,
      remaining: data.remaining,
      limit: data.limit,
      reset: data.reset,
      retryAfter: data.retry_after,
    };
  } catch (err) {
    clearTimeout(timeoutId);
    // Fail-open: Bei Fehler erlauben
    console.warn('[RateLimit] Check failed, allowing request:', err.message);
    return { allowed: true, remaining: null, limit: null };
  }
}

// Middleware
export async function rateLimitMiddleware(req, res, next) {
  const { allowed, remaining, limit, reset, retryAfter } = await checkRateLimit({
    identifier: req.user?.id  // Per-User wenn eingeloggt, sonst IP
  });

  // Immer informative Headers setzen
  if (limit) {
    res.set('X-RateLimit-Limit', limit);
    res.set('X-RateLimit-Remaining', remaining ?? 0);
    res.set('X-RateLimit-Reset', reset);
  }

  if (!allowed) {
    if (retryAfter) res.set('Retry-After', retryAfter);
    return res.status(429).json({
      error: 'Rate limit exceeded',
      retryAfter,
      message: \`Bitte warte \${Math.ceil(retryAfter / 60)} Minuten.\`
    });
  }

  next();
}`}</Code>

          <Callout type="success">
            Du hast jetzt alles was du für ein professionelles Rate-Limiting-Setup brauchst. Fang einfach an — ein Basic-Setup mit einem Key und einer Config reicht für die meisten Projekte vollkommen aus.
          </Callout>

          <div style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.1),rgba(139,92,246,0.08))', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 14, padding: '1.5rem', marginTop: '1.5rem', textAlign: 'center' }}>
            <h3 style={{ color: 'white', fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.5rem' }}>Bereit loszulegen?</h3>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>Account erstellen und in wenigen Minuten deine erste Integration starten.</p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/register" style={{ padding: '0.7rem 1.75rem', borderRadius: 9, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: '0.88rem' }}>
                Kostenlos starten
              </a>
              <a href="/docs" style={{ padding: '0.7rem 1.25rem', borderRadius: 9, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.65)', textDecoration: 'none', fontWeight: 600, fontSize: '0.88rem' }}>
                Zur vollständigen Doku
              </a>
            </div>
          </div>
        </>
      )
    },
  ];
}

export function TutorialAdvancedPage() {
  const [activeSection, setActiveSection] = useState('analytics');
  const scrollingRef = useRef(false);
  const sections = buildAdvancedSections();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (scrollingRef.current) return;
        const visible = entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActiveSection(visible[0].target.id.replace('adv-', ''));
      },
      { rootMargin: '-10% 0px -60% 0px', threshold: 0 }
    );
    sections.forEach(s => {
      const el = document.getElementById(`adv-${s.id}`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    setActiveSection(id);
    scrollingRef.current = true;
    setTimeout(() => { scrollingRef.current = false; }, 800);
    document.getElementById(`adv-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#080d1a', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Ambient */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '0', width: '40%', height: '40%', background: 'radial-gradient(circle,rgba(139,92,246,0.07) 0%,transparent 70%)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '0', left: '0', width: '30%', height: '30%', background: 'radial-gradient(circle,rgba(59,130,246,0.06) 0%,transparent 70%)', filter: 'blur(60px)' }} />
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
          <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>Tutorial — Erweiterte Features</span>
          <div style={{ flex: 1 }} />
          <a href="/tutorial" style={{ fontSize: '0.82rem', color: '#a5b4fc', textDecoration: 'none', padding: '0.3rem 0.875rem', borderRadius: 6, border: '1px solid rgba(99,102,241,0.25)', background: 'rgba(99,102,241,0.06)', fontWeight: 600 }}>
            ← Teil 1: Grundlagen
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
      <div style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(99,102,241,0.05))', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '3rem 1.5rem', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.28)', borderRadius: 100, padding: '0.35rem 0.875rem', fontSize: '0.77rem', fontWeight: 600, color: '#c4b5fd', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          Teil 2 von 2
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'white', letterSpacing: '-0.03em', marginBottom: '0.75rem', lineHeight: 1.2 }}>
          Erweiterte Features &{' '}
          <span style={{ background: 'linear-gradient(135deg,#8b5cf6,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Produktions-Setup</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '1.05rem', maxWidth: 540, margin: '0 auto 2rem', lineHeight: 1.7 }}>
          Analytics, Adaptive RL, Webhook Alerts, Sandbox-Testing und alles für einen produktionsreifen Einsatz.
        </p>
        <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {sections.map(s => (
            <button key={s.id} onClick={() => scrollTo(s.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.875rem', borderRadius: 7, border: `1px solid ${s.color}30`, background: `${s.color}0a`, color: s.color, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = `${s.color}18`}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = `${s.color}0a`}>
              {s.title}
              {s.badge && <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#a78bfa', background: 'rgba(139,92,246,0.2)', padding: '0.08rem 0.35rem', borderRadius: 3 }}>{s.badge}</span>}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '2rem 1.5rem', display: 'flex', gap: '2rem', position: 'relative', zIndex: 1 }}>

        {/* Sidebar */}
        <aside style={{ width: 236, flexShrink: 0, position: 'sticky', top: 76, height: 'fit-content', maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}>
          <div style={{ background: 'rgba(14,22,36,0.8)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '1rem', backdropFilter: 'blur(8px)' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 0.25rem', marginBottom: '0.5rem' }}>Teil 2 — Erweitert</div>
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
                <span style={{ fontSize: '0.79rem', flex: 1 }}>{s.title}</span>
                {s.badge && <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#a78bfa', background: 'rgba(139,92,246,0.15)', padding: '0.07rem 0.3rem', borderRadius: 3, flexShrink: 0 }}>{s.badge}</span>}
              </button>
            ))}
          </div>

          <div style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '1rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'white', marginBottom: '0.4rem' }}>Teil 1 verpasst?</div>
            <div style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.75rem', lineHeight: 1.5 }}>Grundlagen: Keys, Config & erste Integration</div>
            <a href="/tutorial" style={{ display: 'block', textAlign: 'center', padding: '0.45rem', borderRadius: 7, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.78rem', fontWeight: 600 }}>
              ← Teil 1 starten
            </a>
          </div>
        </aside>

        {/* Content */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {sections.map((s, idx) => (
            <section key={s.id} id={`adv-${s.id}`} style={{ marginBottom: '4rem', scrollMarginTop: '80px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.75rem', paddingBottom: '1rem', borderBottom: `1px solid ${s.color}25` }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: `${s.color}15`, border: `1px solid ${s.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>
                  {s.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: s.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Teil 2 — Schritt {idx + 1} von {sections.length}
                    </div>
                    {s.badge && <span style={{ fontSize: '0.66rem', fontWeight: 700, color: '#a78bfa', background: 'rgba(139,92,246,0.15)', padding: '0.1rem 0.4rem', borderRadius: 4 }}>{s.badge}</span>}
                  </div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em', marginBottom: '0.2rem' }}>{s.title}</h2>
                  <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)' }}>{s.subtitle}</p>
                </div>
              </div>
              {s.content}

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
                ) : null}
              </div>
            </section>
          ))}
        </main>
      </div>

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '2rem 1.5rem', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[['Startseite', '/'], ['Dashboard', '/dashboard'], ['Docs', '/docs'], ['Tutorial Teil 1', '/tutorial'], ['FAQ', '/faq']].map(([l, h]) => (
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
