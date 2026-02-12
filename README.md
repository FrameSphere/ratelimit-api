# RateLimit API - Control Center

Ein vollständiges RateLimit-Management-System mit Cloudflare Workers, D1 Database und React Frontend.

## 🚀 Features

- **Benutzer-Authentifizierung**: Registrierung und Login mit JWT
- **API Key Management**: Erstellen und Verwalten von API Keys
- **RateLimit-Konfiguration**: Flexible RateLimit-Einstellungen pro API Key
- **Filter-Regeln**: IP-Blacklists, IP-Whitelists, User-Agent-Filter
- **Analytics**: Detaillierte Statistiken und Request-Logs
- **Real-time Monitoring**: Überwachung von Requests und blockierten Anfragen

## 📁 Projektstruktur

```
Ratelimit_API/
├── backend/          # Cloudflare Workers Backend
│   ├── src/
│   │   ├── auth/     # Authentifizierung
│   │   ├── ratelimit/# RateLimit-Logik
│   │   ├── analytics/# Analytics
│   │   └── middleware/# Middleware
│   ├── schema.sql    # D1 Database Schema
│   └── wrangler.toml # Cloudflare Config
└── frontend/         # React Frontend
    ├── src/
    │   ├── components/
    │   ├── lib/
    │   └── styles/
    └── package.json
```

## 🛠️ Setup

### Backend (Cloudflare Workers)

1. **Cloudflare Account einrichten**
   - Erstelle einen Account auf [cloudflare.com](https://cloudflare.com)
   - Installiere Wrangler CLI: `npm install -g wrangler`
   - Login: `wrangler login`

2. **D1 Database erstellen**
   ```bash
   cd backend
   
   # D1 Datenbank erstellen
   wrangler d1 create ratelimit-db
   
   # Kopiere die database_id aus der Ausgabe in wrangler.toml
   ```

3. **Database Schema initialisieren**
   ```bash
   # Für Production
   wrangler d1 execute ratelimit-db --file=./schema.sql
   
   # Für lokale Entwicklung
   wrangler d1 execute ratelimit-db --local --file=./schema.sql
   ```

4. **Secrets setzen**
   ```bash
   # JWT Secret setzen (ersetze mit eigenem Wert)
   wrangler secret put JWT_SECRET
   # Eingabe: your-super-secret-jwt-key-here
   ```

5. **Abhängigkeiten installieren**
   ```bash
   npm install
   ```

6. **Entwicklung starten**
   ```bash
   npm run dev
   ```

7. **Deployen**
   ```bash
   npm run deploy
   ```

   Nach dem Deployment erhältst du eine URL wie: `https://ratelimit-api.your-subdomain.workers.dev`

### Frontend (Cloudflare Pages)

1. **Abhängigkeiten installieren**
   ```bash
   cd frontend
   npm install
   ```

2. **Environment konfigurieren**
   ```bash
   # .env Datei erstellen
   cp .env.example .env
   
   # Backend-URL eintragen (nach Backend-Deployment)
   VITE_API_URL=https://ratelimit-api.your-subdomain.workers.dev
   ```

3. **Lokale Entwicklung**
   ```bash
   npm run dev
   ```

4. **Build**
   ```bash
   npm run build
   ```

5. **Git Repository einrichten**
   ```bash
   # Im Hauptverzeichnis
   git init
   git add .
   git commit -m "Initial commit"
   
   # GitHub/GitLab Repository erstellen und pushen
   git remote add origin YOUR_REPO_URL
   git push -u origin main
   ```

6. **Cloudflare Pages Deployment**
   - Gehe zu [dash.cloudflare.com](https://dash.cloudflare.com)
   - Pages → Create a project
   - Connect to Git → Wähle dein Repository
   - Build settings:
     - Framework preset: `Vite`
     - Build command: `cd frontend && npm install && npm run build`
     - Build output directory: `frontend/dist`
   - Environment variables:
     - `VITE_API_URL`: Deine Worker URL
   - Deploy!

## 🔑 API Nutzung

### Rate Limit prüfen

Nachdem du einen API Key erstellt hast, kannst du RateLimits so prüfen:

```bash
# GET Request
curl -H "X-API-Key: rlapi_your_key_here" \
     "https://your-worker.workers.dev/check?endpoint=/api/users&method=GET"

# POST Request
curl -X POST \
     -H "X-API-Key: rlapi_your_key_here" \
     "https://your-worker.workers.dev/check?endpoint=/api/users&method=POST"
```

**Response:**
```json
{
  "allowed": true,
  "remaining": 95,
  "resetAt": 1708012345,
  "blocked": false
}
```

Bei Rate Limit Überschreitung:
```json
{
  "allowed": false,
  "remaining": 0,
  "resetAt": 1708012345,
  "blocked": true,
  "reason": "Rate limit exceeded"
}
```

## 🔧 Konfiguration

### RateLimit Beispiele

**100 Requests pro Stunde:**
- Max Requests: `100`
- Zeitfenster: `3600` (Sekunden)

**1000 Requests pro Tag:**
- Max Requests: `1000`
- Zeitfenster: `86400` (Sekunden)

**10 Requests pro Minute:**
- Max Requests: `10`
- Zeitfenster: `60` (Sekunden)

### Filter-Regeln

**IP Blacklist:**
- Typ: `ip_blacklist`
- Wert: `192.168.1.100`
- Aktion: `block`

**IP Whitelist:**
- Typ: `ip_whitelist`
- Wert: `10.0.0.5`
- Aktion: `allow`

**User Agent Filter:**
- Typ: `user_agent`
- Wert: `bot`
- Aktion: `block`

## 📊 Analytics

Das Dashboard zeigt:
- **Gesamt Requests**: Anzahl aller Requests im gewählten Zeitraum
- **Blockierte Requests**: Anzahl blockierter Requests
- **Unique IPs**: Anzahl eindeutiger IP-Adressen
- **Zeitverlauf**: Chart mit Requests über Zeit
- **Top Endpoints**: Meist aufgerufene Endpoints
- **Top IPs**: IPs mit den meisten Requests
- **Request Logs**: Detaillierte Logs der letzten Requests

## 🔒 Sicherheit

- Passwörter werden mit bcrypt gehasht (10 Rounds)
- JWT Tokens mit HS256 Algorithmus
- 24h Token-Gültigkeit
- CORS ist standardmäßig aktiviert (in Production anpassen!)
- SQL Injection Schutz durch Prepared Statements

## 🚨 Wichtige Hinweise

1. **JWT_SECRET ändern**: In `wrangler.toml` und via `wrangler secret put JWT_SECRET`
2. **CORS konfigurieren**: In `backend/src/middleware/cors.ts` für Production anpassen
3. **Database ID**: Nach D1-Erstellung in `wrangler.toml` eintragen
4. **Environment Variables**: Frontend `.env` mit korrekter Backend-URL

## 📝 Entwicklung

### Backend Entwicklung
```bash
cd backend
npm run dev          # Startet lokalen Dev-Server
npm run deploy       # Deployed zu Cloudflare Workers
npm run db:init      # Initialisiert Production DB
npm run db:local     # Initialisiert lokale DB
```

### Frontend Entwicklung
```bash
cd frontend
npm run dev          # Startet Vite Dev-Server
npm run build        # Build für Production
npm run preview      # Preview des Builds
```

## 🐛 Troubleshooting

**Database Fehler:**
```bash
# Database zurücksetzen
wrangler d1 execute ratelimit-db --file=./schema.sql
```

**CORS Fehler:**
- Überprüfe CORS-Einstellungen in `backend/src/middleware/cors.ts`
- Stelle sicher, dass Frontend-URL erlaubt ist

**Token ungültig:**
- Lösche Token im Browser: `localStorage.clear()`
- Stelle sicher, dass JWT_SECRET in Backend gesetzt ist

## 📄 Lizenz

MIT

## 🤝 Support

Bei Fragen oder Problemen:
1. Überprüfe die Logs: `wrangler tail` (für Backend)
2. Browser Console (für Frontend)
3. D1 Dashboard in Cloudflare

## 🎯 Nächste Schritte

- [ ] Rate Limit Strategien erweitern (Sliding Window, Token Bucket)
- [ ] Webhook Notifications bei Limits
- [ ] API Key Rotation
- [ ] Multi-Tenant Support
- [ ] Custom Error Messages
- [ ] Rate Limit Presets
