# 🚀 Schnellstart Guide

## Voraussetzungen

- Node.js 18+ installiert
- Cloudflare Account
- Git installiert

## 1️⃣ Wrangler CLI installieren

```bash
npm install -g wrangler
wrangler login
```

## 2️⃣ Backend Setup (5 Minuten)

```bash
cd backend

# Dependencies installieren
npm install

# D1 Database erstellen
wrangler d1 create ratelimit-db

# ⚠️ WICHTIG: Kopiere die database_id aus der Ausgabe
# und ersetze sie in wrangler.toml unter database_id

# Database Schema laden
wrangler d1 execute ratelimit-db --file=./schema.sql

# JWT Secret setzen
wrangler secret put JWT_SECRET
# Eingabe z.B.: mein-super-geheimer-jwt-key-12345

# Deployen
npm run deploy

# ✅ Notiere dir die Worker URL!
# Beispiel: https://ratelimit-api.your-name.workers.dev
```

## 3️⃣ Frontend Setup (5 Minuten)

```bash
cd ../frontend

# Dependencies installieren
npm install

# Environment konfigurieren
echo "VITE_API_URL=https://ratelimit-api.your-name.workers.dev" > .env

# Lokal testen
npm run dev
# Öffne http://localhost:5173
```

## 4️⃣ Frontend auf Cloudflare Pages deployen

```bash
# Git Repository initialisieren (falls noch nicht geschehen)
cd ..
git init
git add .
git commit -m "Initial commit"

# Repository auf GitHub/GitLab pushen
git remote add origin YOUR_GIT_URL
git push -u origin main
```

Dann:
1. Gehe zu https://dash.cloudflare.com
2. Pages → Create a project
3. Connect to Git
4. Wähle dein Repository
5. Build settings:
   - Framework: **Vite**
   - Build command: `cd frontend && npm install && npm run build`
   - Build output: `frontend/dist`
6. Environment variables:
   - Name: `VITE_API_URL`
   - Value: `https://ratelimit-api.your-name.workers.dev`
7. Deploy!

## 5️⃣ Erste Schritte

1. **Registriere dich** auf deiner Frontend-URL
2. **Erstelle einen API Key**
3. **Konfiguriere RateLimit**:
   - Max Requests: `100`
   - Window: `3600` (1 Stunde)
4. **Teste dein RateLimit**:

```bash
# Ersetze YOUR_API_KEY mit deinem generierten Key
curl -H "X-API-Key: YOUR_API_KEY" \
     "https://ratelimit-api.your-name.workers.dev/check?endpoint=/test&method=GET"
```

## 📊 Analytics ansehen

1. Im Dashboard auf "Analytics" klicken
2. Zeitraum wählen (24h, 7d, 30d)
3. Charts und Logs ansehen

## 🔧 Lokale Entwicklung

**Backend:**
```bash
cd backend
npm run dev  # Läuft auf http://localhost:8787
```

**Frontend:**
```bash
cd frontend
npm run dev  # Läuft auf http://localhost:5173
```

## ❓ Probleme?

**Database Fehler:**
```bash
wrangler d1 execute ratelimit-db --file=./schema.sql
```

**Token ungültig:**
- Browser Console öffnen
- `localStorage.clear()` eingeben
- Seite neu laden

**CORS Fehler:**
- Überprüfe ob Backend-URL in Frontend .env korrekt ist
- Backend neu deployen: `cd backend && npm run deploy`

## 🎯 Nächste Schritte

- [ ] Eigene API mit RateLimit absichern
- [ ] Filter-Regeln hinzufügen
- [ ] Analytics überwachen
- [ ] Mehrere API Keys für verschiedene Projekte erstellen

## 📚 Mehr Infos

Siehe vollständige Dokumentation in [README.md](README.md)
