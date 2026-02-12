#!/bin/bash

# RateLimit API Deployment Script
# Dieses Script automatisiert das Deployment von Backend und Frontend

echo "🚀 RateLimit API Deployment"
echo "=========================="
echo ""

# Farben für Output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Backend deployen
echo -e "${YELLOW}📦 Deploying Backend...${NC}"
cd backend

# Überprüfe ob wrangler installiert ist
if ! command -v wrangler &> /dev/null
then
    echo -e "${RED}❌ Wrangler CLI nicht gefunden!${NC}"
    echo "Installiere mit: npm install -g wrangler"
    exit 1
fi

# Dependencies installieren
echo "Installing backend dependencies..."
npm install

# Deployen
echo "Deploying to Cloudflare Workers..."
npm run deploy

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend deployment successful!${NC}"
else
    echo -e "${RED}❌ Backend deployment failed!${NC}"
    exit 1
fi

# Zurück zum Root
cd ..

# Frontend bauen
echo ""
echo -e "${YELLOW}📦 Building Frontend...${NC}"
cd frontend

# Dependencies installieren
echo "Installing frontend dependencies..."
npm install

# Build
echo "Building frontend..."
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend build successful!${NC}"
else
    echo -e "${RED}❌ Frontend build failed!${NC}"
    exit 1
fi

cd ..

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "📝 Nächste Schritte:"
echo "1. Gehe zu Cloudflare Pages Dashboard"
echo "2. Verbinde dein Git Repository"
echo "3. Setze Build-Einstellungen:"
echo "   - Build command: cd frontend && npm install && npm run build"
echo "   - Build output: frontend/dist"
echo "   - Environment: VITE_API_URL=<deine-worker-url>"
echo ""
echo "Weitere Infos in README.md"
