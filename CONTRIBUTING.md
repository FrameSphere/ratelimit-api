# Contributing to RateLimit API

Vielen Dank für dein Interesse an diesem Projekt! 🎉

## 🐛 Bug Reports

Wenn du einen Bug gefunden hast:

1. Überprüfe, ob der Bug bereits gemeldet wurde
2. Erstelle ein neues Issue mit:
   - Klarer Beschreibung des Problems
   - Schritten zur Reproduktion
   - Erwartetes vs. tatsächliches Verhalten
   - Screenshots (falls relevant)
   - Browser/Environment-Informationen

## 💡 Feature Requests

Für neue Features:

1. Beschreibe das Feature und den Use Case
2. Erkläre, warum es nützlich wäre
3. Skizziere mögliche Implementierungen

## 🔧 Development Setup

### Prerequisites

- Node.js 18+
- Cloudflare Account (für Workers & D1)
- Git

### Setup

1. **Repository forken und clonen**
   ```bash
   git clone https://github.com/YOUR_USERNAME/ratelimit-api.git
   cd ratelimit-api
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # D1 Database erstellen (lokal)
   wrangler d1 execute ratelimit-db --local --file=./schema.sql
   
   # Development starten
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   
   # .env erstellen
   echo "VITE_API_URL=http://localhost:8787" > .env
   
   # Development starten
   npm run dev
   ```

## 📝 Code Style

- **TypeScript** für alle neuen Dateien
- **ESLint** & **Prettier** für Formatting
- **Kommentare** für komplexe Logik
- **Aussagekräftige Variablennamen**

### Beispiel:

```typescript
// ✅ Gut
async function createRateLimitConfig(
  apiKeyId: number,
  maxRequests: number,
  windowSeconds: number
): Promise<Config> {
  // Validierung
  if (maxRequests < 1) {
    throw new Error('maxRequests must be positive');
  }
  
  // Config erstellen
  const config = await db.createConfig({
    apiKeyId,
    maxRequests,
    windowSeconds,
  });
  
  return config;
}

// ❌ Schlecht
async function create(a, b, c) {
  const x = await db.create({ a, b, c });
  return x;
}
```

## 🧪 Testing

Vor dem Pull Request:

1. **Backend testen**
   ```bash
   cd backend
   npm run dev
   # In anderem Terminal:
   ../test-api.sh http://localhost:8787
   ```

2. **Frontend testen**
   ```bash
   cd frontend
   npm run build  # Sollte ohne Fehler durchlaufen
   npm run preview  # Teste den Build
   ```

## 📤 Pull Requests

1. **Feature Branch erstellen**
   ```bash
   git checkout -b feature/meine-neue-funktion
   ```

2. **Commits**
   - Kleine, fokussierte Commits
   - Aussagekräftige Commit-Messages
   - Verwende [Conventional Commits](https://www.conventionalcommits.org/)

   ```bash
   git commit -m "feat: Add IP range filter support"
   git commit -m "fix: Correct rate limit calculation"
   git commit -m "docs: Update README with new examples"
   ```

3. **Pull Request erstellen**
   - Klarer Titel und Beschreibung
   - Referenziere Related Issues
   - Screenshots bei UI-Änderungen
   - Checklist:
     - [ ] Code funktioniert
     - [ ] Tests laufen durch
     - [ ] Dokumentation aktualisiert
     - [ ] Keine Breaking Changes (oder dokumentiert)

## 🏗️ Projekt-Struktur

```
Ratelimit_API/
├── backend/
│   ├── src/
│   │   ├── auth/           # Authentifizierung
│   │   ├── ratelimit/      # RateLimit-Logik
│   │   ├── analytics/      # Analytics & Logging
│   │   ├── middleware/     # Express-like Middleware
│   │   └── index.ts        # Haupteinstiegspunkt
│   ├── schema.sql          # D1 Database Schema
│   └── wrangler.toml       # Cloudflare Config
│
└── frontend/
    ├── src/
    │   ├── components/     # React Komponenten
    │   ├── lib/            # Utilities & API Client
    │   ├── styles/         # CSS Styles
    │   └── main.tsx        # React Einstiegspunkt
    └── package.json
```

## 🎯 Entwicklungs-Richtlinien

### Backend

- **Hono Framework** für Routing
- **D1 Database** für Persistenz
- **Prepared Statements** IMMER (SQL Injection vermeiden)
- **Error Handling** mit try/catch
- **Type Safety** mit TypeScript

### Frontend

- **React** mit Hooks
- **TypeScript** für alle Komponenten
- **CSS Custom Properties** für Theming
- **Responsive Design** (Mobile First)

## 🔐 Sicherheit

Wenn du ein Sicherheitsproblem findest:

1. **NICHT** öffentlich melden
2. Kontaktiere die Maintainer privat
3. Gib Details und PoC (falls möglich)

## 📚 Weitere Resourcen

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [D1 Database Docs](https://developers.cloudflare.com/d1/)
- [Hono Framework](https://hono.dev/)
- [React Docs](https://react.dev/)

## ❓ Fragen?

- Erstelle ein GitHub Issue
- Diskutiere in GitHub Discussions

## 📜 Lizenz

Indem du zu diesem Projekt beiträgst, stimmst du zu, dass deine Beiträge unter der MIT Lizenz lizenziert werden.

---

Vielen Dank für deine Beiträge! 🙏
