# Deployment Guide - RankFlow Studio

## Overzicht

Deze Next.js applicatie kan online worden gezet via verschillende hosting providers. Hieronder staan de stappen en aanpassingen die nodig zijn.

## 🚀 Aanbevolen: Vercel (gratis tier beschikbaar)

**Waarom Vercel:**
- Next.js is gemaakt door Vercel → perfecte integratie
- Automatische deployments vanuit GitHub
- Gratis tier voor persoonlijke projecten
- Serverless functions voor API routes
- Environment variables beheer

### Stappen voor Vercel:

1. **Push code naar GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <jouw-github-repo-url>
   git push -u origin main
   ```

2. **Maak Vercel account**
   - Ga naar [vercel.com](https://vercel.com)
   - Login met GitHub
   - Klik "New Project"
   - Import je GitHub repository

3. **Configureer Environment Variables**
   In Vercel dashboard → Project Settings → Environment Variables:
   - `OPENAI_API_KEY` (optioneel, als je OpenAI gebruikt)
   - `ANTHROPIC_API_KEY` (optioneel, als je Claude gebruikt)
   - `GOOGLE_API_KEY` (optioneel, als je Gemini gebruikt)

4. **Aanpassingen nodig voor online deployment:**

   ⚠️ **BELANGRIJK:** De app gebruikt nu lokale bestanden (`config.json`, `content-library.json`, `prompts.json`). Deze werken niet op serverless platforms zoals Vercel.

   **Oplossingen:**
   
   **Optie A: Database gebruiken (aanbevolen)**
   - Gebruik een database zoals:
     - **Vercel Postgres** (gratis tier)
     - **Supabase** (gratis tier)
     - **PlanetScale** (gratis tier)
     - **MongoDB Atlas** (gratis tier)
   
   **Optie B: Vercel KV / Upstash Redis**
   - Voor simpele key-value storage
   - Goed voor config en library data

   **Optie C: Aanpassen naar environment variables + externe storage**
   - API keys via environment variables
   - Library data via externe service (bijv. Supabase)

## 📝 Aanpassingen die nodig zijn

### 1. Configuratie opslag
**Huidige situatie:** `config.json` lokaal bestand
**Voor online:** 
- Gebruik environment variables voor API keys
- Of database voor gebruikers-specifieke configuratie

### 2. Library opslag
**Huidige situatie:** `content-library.json` lokaal bestand
**Voor online:**
- Database tabel voor content items
- Of externe storage service

### 3. Prompts opslag
**Huidige situatie:** `prompts.json` lokaal bestand
**Voor online:**
- Database tabel
- Of hardcoded defaults + database voor custom prompts

## 🔧 Alternatieve hosting opties

### Netlify
- Ook goede Next.js support
- Gratis tier beschikbaar
- Serverless functions
- **Let op:** Ook hier geen lokale bestanden

### Railway
- Betaalde service (maar goedkoop)
- Ondersteunt persistent storage
- Kan lokale bestanden gebruiken (maar niet aanbevolen)

### DigitalOcean App Platform
- Betaalde service
- Ondersteunt persistent storage
- Goed voor production workloads

### Self-hosted (VPS)
- Bijv. DigitalOcean Droplet, Hetzner, AWS EC2
- Volledige controle
- Kan lokale bestanden gebruiken
- Moet zelf server beheren

## 🛠️ Quick Start: Vercel met Supabase (aanbevolen)

1. **Maak Supabase project** (gratis)
   - Ga naar [supabase.com](https://supabase.com)
   - Maak nieuw project
   - Noteer je connection string

2. **Database schema maken:**
   ```sql
   -- Config tabel
   CREATE TABLE config (
     id SERIAL PRIMARY KEY,
     api_key TEXT,
     model TEXT,
     provider TEXT,
     updated_at TIMESTAMP DEFAULT NOW()
   );

   -- Library tabel
   CREATE TABLE library (
     id TEXT PRIMARY KEY,
     type TEXT NOT NULL,
     title TEXT NOT NULL,
     data JSONB NOT NULL,
     preview TEXT,
     created_at TIMESTAMP DEFAULT NOW()
   );

   -- Prompts tabel
   CREATE TABLE prompts (
     id SERIAL PRIMARY KEY,
     type TEXT UNIQUE,
     content TEXT,
     updated_at TIMESTAMP DEFAULT NOW()
   );
   ```

3. **Code aanpassen:**
   - Vervang `fs/promises` calls met Supabase client calls
   - Gebruik environment variables voor API keys

4. **Deploy naar Vercel:**
   - Push naar GitHub
   - Connect met Vercel
   - Voeg Supabase credentials toe als environment variables

## 📦 Build commando's

De app heeft al de juiste scripts:
```json
{
  "build": "next build",
  "start": "next start"
}
```

Vercel detecteert dit automatisch.

## 🔐 Security checklist

- ✅ API keys via environment variables (niet in code)
- ✅ Rate limiting toevoegen aan API routes
- ✅ Input validatie (al aanwezig)
- ⚠️ Authentication toevoegen (als je meerdere gebruikers wilt)
- ⚠️ CORS configuratie (als je externe API's aanroept)

## 💰 Kosten overzicht

**Gratis opties:**
- Vercel: Gratis tier (100GB bandwidth, unlimited requests)
- Supabase: Gratis tier (500MB database, 2GB bandwidth)
- Netlify: Gratis tier (100GB bandwidth)

**Betaalde opties:**
- Vercel Pro: $20/maand (meer bandwidth, team features)
- Supabase Pro: $25/maand (meer storage, backups)

## 🚨 Belangrijke notities

1. **Lokale bestanden werken NIET op serverless platforms**
   - Vercel, Netlify zijn serverless
   - Elke request kan op een andere server draaien
   - Lokale bestanden zijn niet persistent

2. **Session storage blijft werken**
   - `sessionStorage` en `localStorage` werken in de browser
   - Maar library data moet op de server worden opgeslagen

3. **API routes hebben timeouts**
   - Vercel: 10 seconden (Hobby), 60 seconden (Pro)
   - Lange AI calls kunnen timeout krijgen
   - Overweeg streaming responses of background jobs

## 📞 Hulp nodig?

Als je hulp wilt bij het aanpassen van de code voor online deployment, kan ik:
1. Database integratie toevoegen (Supabase/Postgres)
2. Environment variables implementeren
3. Code aanpassen voor serverless deployment

Laat me weten welke optie je voorkeur heeft!

