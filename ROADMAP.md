# RateLimit API — Roadmap & Feature-Plan
*Stand: April 2026 — Erstellt auf Basis der aktuellen Feature-Analyse*

---

## 🎯 Strategische Positionierung
**Von:** "Rate Limit Tool"  
**Zu:** "Smart API Protection Platform"

**3 Core Differenzierer:**
1. Auto-Optimizing Limits (KI + Auto-Apply)
2. Ultra-easy Integration (1-Min Setup, SDKs, Middleware)
3. Echtzeit + Explainability (Live Stream, Why-Blocked, What-if)

---

## ✅ Bereits implementiert (Stand jetzt)

### Core
- [x] Sliding Window + Token Bucket Algorithmus
- [x] Per-Endpoint Limits
- [x] IP Whitelist / Blacklist
- [x] Geo-Block + Geo-Allowlist (CF-IPCountry)
- [x] User-Agent Blocking
- [x] Auto IP Blocking (Violations-Counter + temporäre Sperre)
- [x] Filter-System mit Badges

### Analytics & Monitoring
- [x] Realtime Counter (1min/5min)
- [x] Traffic Charts (Area/Bar)
- [x] Top Endpoints + Top IPs
- [x] Anomaly Detection (Spike, Blockierrate, IP-Dominanz)
- [x] Retry/Burst Insights
- [x] Near-Limit Panel (Gauges)
- [x] Live Stream (SSE, Attack Mode UI)
- [x] Log-Tabelle mit 7 Filtern + CSV Export
- [x] Explainability Panel (Warum blockiert + Wie beheben)
- [x] block_reason in Logs

### Intelligence
- [x] Adaptive Rate Limits (7-Tage Analyse, Suggest + Apply)
- [x] Auto-Apply Toggle (30min Intervall)

### Notifications
- [x] Alerts: Slack, Discord, Custom HTTP, Email (Resend)
- [x] Webhook HMAC-SHA256 Signierung
- [x] Scheduled Email Reports (Daily/Weekly/Monthly)
- [x] Cloudflare Cron Triggers

### Billing & Auth
- [x] Stripe Checkout + Portal
- [x] Free/Pro/Enterprise Tiers
- [x] OAuth: Google, GitHub, FrameSphere
- [x] Sandbox/Test-Modus

### API
- [x] /check Endpunkt mit allen RL-Headers
- [x] /check/status Debug-View

---

## 🗺️ ROADMAP

---

### 🌊 WELLE 1 — Developer Experience (JETZT)
*Ziel: "1-Minute Integration" — größter Growth-Hebel*

#### 1.1 JavaScript/TypeScript SDK
**Datei:** `sdk/js/` (separates npm-Package)
```
npm install @ratelimit-api/sdk
```
```typescript
import { RateLimit } from '@ratelimit-api/sdk'
const rl = new RateLimit({ apiKey: 'rl_...' })
const { allowed, remaining } = await rl.check({ ip, endpoint })
```
- [ ] `RateLimit` Client-Klasse
- [ ] `check()`, `status()` Methoden
- [ ] TypeScript Types + JSDoc
- [ ] Retry-Logic eingebaut
- [ ] npm publish vorbereiten
- [ ] README + Quickstart

#### 1.2 Framework Middleware
- [ ] **Express Middleware** — `app.use(ratelimit.express({ apiKey }))`
- [ ] **Next.js Middleware** — `middleware.ts` Template
- [ ] **Cloudflare Worker Snippet** — Copy-Paste fertig
- [ ] **Hono Middleware** (da Backend selbst Hono nutzt)
- [ ] **Fastify Plugin**

#### 1.3 Python SDK
```
pip install ratelimit-api
```
```python
from ratelimit_api import RateLimit
rl = RateLimit(api_key="rl_...")
result = rl.check(ip=request.remote_addr, endpoint=request.path)
```
- [ ] Sync + Async Support (requests + httpx)
- [ ] PyPI publish vorbereiten

#### 1.4 Go SDK
```go
import "github.com/framesphere/ratelimit-api-go"
```
- [ ] Go module setup
- [ ] context.Context Support

#### 1.5 Onboarding Wizard im Dashboard
- [ ] Welcome-Screen nach erstem Login
- [ ] Guided Setup: Key erstellen → Config → Ersten Request testen
- [ ] Copy-Paste Code-Snippets (Node/Python/Go/cURL) direkt im Onboarding
- [ ] "Integration Test" Button — prüft ob erster Request ankam

---

### 🌊 WELLE 2 — Intelligence & Security (DANACH)
*Ziel: Von "Rate Limiting" zu "API Protection Platform"*

#### 2.1 Simulation / What-if Analysis
- [ ] Backend: `/api/simulate/:apiKeyId` Endpunkt
  - nimmt `hypothetical_limit` als Parameter
  - rechnet auf historischen Daten: wie viele Requests wären durchgekommen/blockiert
- [ ] Frontend: SimulationTab oder Panel im Analytics
  - Slider für "Was wäre mit X req/h passiert?"
  - Vergleichs-Chart: Aktuell vs. Simuliert
  - Ausgabe: "+23% weniger Blocks, 0 legit Users verloren"
- [ ] Integration in Adaptive Tab: Suggestion preview bevor Apply

#### 2.2 Bot / Abuse Intelligence
- [ ] **IP Reputation Score** (0-100) basierend auf:
  - Violation-History
  - Req/s Rate
  - Block-Rate
  - User-Agent Muster (bekannte Bot-Strings)
- [ ] **Behavioral Fingerprinting**:
  - Kombination IP + UA + Endpoint-Pattern → Fingerprint-Hash
  - Erkennt: selbes Verhalten von verschiedenen IPs
- [ ] **Known Bad User-Agent DB**: eingebaute Liste von Scraper/Bot UAs
- [ ] Frontend: IP-Reputation Badge in Log-Tabelle + Detail-Panel
- [ ] Backend: `ip_reputation` Tabelle mit Score + History

#### 2.3 A/B Testing für Rate Limits
- [ ] Backend: `ab_test_configs` Tabelle
  - Config A + Config B + Traffic-Split-% 
  - Cloudflare: IP-Hash % 100 → Gruppe A oder B
- [ ] Analytics: Vergleich A vs B (Blockierrate, User-Experience)
- [ ] Frontend: A/B Tab in ConfigManager
- [ ] Auto-Winner nach konfigurierter Laufzeit

#### 2.4 Context-Aware Limits (Policy Engine)
- [ ] **Auth-Level Rules**: Header-basiert
  - `X-Auth-Level: guest|user|premium` → verschiedene Limits
- [ ] **Role-based**: Custom Header → Limit-Tier
- [ ] **Device-Type Detection**: User-Agent Parsing (Mobile/Bot/Backend)
- [ ] Frontend: Neuer Filter-Typ `auth_level` + `device_type` in ConfigManager

---

### 🌊 WELLE 3 — Scale & B2B (DANACH)
*Ziel: Enterprise-Funktionen, Team-Features*

#### 3.1 Quota Sharing (Team Budget)
- [ ] `quota_groups` Tabelle: mehrere Keys teilen ein Budget
- [ ] Backend: Group-Check vor individuellem Key-Check
- [ ] Frontend: Quota Groups Tab im Dashboard
- [ ] Anzeige: Gruppenverbrauch + wer wie viel verbraucht hat

#### 3.2 Team / Organisation Features
- [ ] `organizations` + `org_members` Tabellen
- [ ] Rollen: Owner, Admin, Developer, Viewer
- [ ] Shared API Keys innerhalb einer Org
- [ ] Member invite per Email
- [ ] Frontend: Team-Settings Tab

#### 3.3 Multi-Region / Distributed Limits
- [ ] Cloudflare Durable Objects für globalen Counter
- [ ] KV als schnellerer Sync-Layer
- [ ] Config: "Global" vs "Per-Region" Limits
- [ ] Sichtbar im Dashboard: Region-Breakdown in Analytics

#### 3.4 Request Replay / Debugging
- [ ] Log-Eintrag → "Replay Request" Button
- [ ] Sendet identischen Request (IP/UA/Endpoint) gegen Sandbox
- [ ] Zeigt: "Wäre mit aktuellem Limit erlaubt/blockiert"
- [ ] Zeigt: "Wäre mit neuem Limit X erlaubt/blockiert"

#### 3.5 Public Status Page / Transparency
- [ ] Öffentliche Seite: `ratelimit-api.com/stats`
  - "X Requests verarbeitet heute"
  - "Y Angriffe blockiert"
  - "Uptime: 99.99%"
- [ ] "Protected by RateLimit API" Badge (embed-fähig)
- [ ] Viral-Effekt: Kunden zeigen Badge auf eigener Seite

---

### 🌊 WELLE 4 — SEO & Marketing (ABSCHLUSS)
*Ziel: Alle Features werden gefunden und konvertieren*

#### 4.1 HomePage Komplett-Überarbeitung
- [ ] **Hero Section**: "Smart API Protection" Headline
  - Code-Snippet im Hero (Copy-Paste)
  - "1-Minute Setup" USP
- [ ] **Feature Grid**: alle 20+ Features visuell
- [ ] **Vergleichstabelle**: RateLimit API vs Cloudflare vs AWS WAF vs Kong
- [ ] **Social Proof**: Requests-Counter, Attack-Counter live
- [ ] **Integration Gallery**: Express, Next.js, Python, Go Icons

#### 4.2 SEO-Technisch
- [ ] `<head>` Meta-Tags: title, description, keywords, og:*, twitter:*
- [ ] Structured Data (JSON-LD): SoftwareApplication Schema
- [ ] Sitemap.xml automatisch generieren
- [ ] robots.txt optimieren
- [ ] Core Web Vitals optimieren
- [ ] Canonical URLs

#### 4.3 Keyword-Targets
Primär:
- "API Rate Limiting"
- "Rate Limit API"  
- "API Protection"
- "API Security Cloudflare Workers"

Long-Tail:
- "Rate Limiting as a Service"
- "Express Rate Limit Middleware"
- "Next.js API Rate Limiting"
- "Cloudflare API Protection"
- "Auto Rate Limiting AI"
- "IP Blocking API"
- "Token Bucket Algorithm API"

#### 4.4 Docs-Komplettüberarbeitung
- [ ] Quickstart Guide (< 5 Min bis erster Request)
- [ ] SDK Dokumentation (JS/Python/Go)
- [ ] Middleware Guides (Express/Next.js/CF Worker)
- [ ] API Reference (alle Endpoints)
- [ ] Concept Pages: Sliding Window, Token Bucket, Adaptive RL
- [ ] Troubleshooting Guide
- [ ] Migration Guide (von anderen Tools)
- [ ] FAQ-Page mit SEO-Keywords

#### 4.5 Tutorial-Seiten
- [ ] "API Rate Limiting in Node.js — Complete Guide"
- [ ] "Protect Your Next.js API with Rate Limiting"
- [ ] "Stop API Abuse with Geo-Blocking"
- [ ] "Token Bucket vs Sliding Window — Which is Better?"
- [ ] "Auto-Scaling Rate Limits with AI"
- [ ] "Detecting API Attacks in Real-Time"

#### 4.6 Vergleichsseiten
- [ ] "RateLimit API vs Upstash Redis Rate Limit"
- [ ] "RateLimit API vs Cloudflare Rate Limiting"
- [ ] "Best API Rate Limiting Tools 2026"

---

## 📊 Prioritäts-Matrix

| Feature | Impact | Aufwand | Priorität |
|---|---|---|---|
| JS/TS SDK | 🔥🔥🔥 | Mittel | **P1** |
| Express/Next.js Middleware | 🔥🔥🔥 | Klein | **P1** |
| Onboarding Wizard | 🔥🔥🔥 | Mittel | **P1** |
| Simulation/What-if | 🔥🔥 | Mittel | **P2** |
| Bot Intelligence | 🔥🔥🔥 | Groß | **P2** |
| A/B Testing | 🔥🔥 | Groß | **P3** |
| Context-Aware Limits | 🔥🔥 | Mittel | **P2** |
| Quota Sharing | 🔥🔥 | Mittel | **P3** |
| Team Features | 🔥🔥 | Groß | **P3** |
| Multi-Region | 🔥 | Sehr groß | **P4** |
| Public Status Page | 🔥🔥 | Klein | **P2** |
| SEO Überarbeitung | 🔥🔥🔥 | Mittel | **P1 (nach Features)** |

---

## 🏁 Nächste Schritte (JETZT starten)

### Sprint 1 (Welle 1 Start):
1. **JS/TS SDK** — `src/` Struktur + `RateLimit` Klasse + `check()` Methode
2. **Express Middleware** — fertig in ~2h, riesiger Conversion-Impact
3. **Next.js Middleware** — Copy-Paste Template + Doku
4. **Onboarding Wizard** — Welcome-Screen mit Code-Snippets

### Sprint 2 (Welle 2):
5. **Simulation Panel** im Adaptive Tab
6. **IP Reputation Score** im Log + Backend
7. **Context-Aware Limits** im ConfigManager

### Sprint 3 (Welle 3 + SEO):
8. **Quota Sharing**
9. **Public Stats Page**
10. **SEO + Docs Überarbeitung**

---

## 🔐 Secrets die noch gesetzt werden müssen
```bash
npx wrangler secret put RESEND_API_KEY        # Email Reports + Alerts
npx wrangler secret put WEBHOOK_HMAC_SECRET   # Webhook-Signierung
```

## 🗄️ DB-Migrationen die noch laufen müssen
```bash
# Auto Block
npx wrangler d1 execute ratelimit-db --remote --command "CREATE TABLE IF NOT EXISTS ip_violations ..."
npx wrangler d1 execute ratelimit-db --remote --command "CREATE TABLE IF NOT EXISTS auto_block_settings ..."
# Reports
npx wrangler d1 execute ratelimit-db --remote --command "CREATE TABLE IF NOT EXISTS report_schedules ..."
```
*(Exakte Befehle im jeweiligen Dashboard-Tab angezeigt)*
