# Deploy naar Vercel - Stap voor Stap Guide

**Datum:** 24 Januari 2026

---

## 🚀 Quick Deploy (5 minuten)

### Stap 1: Code Committen

```bash
# Check status
git status

# Voeg alle wijzigingen toe
git add .

# Commit met beschrijving
git commit -m "Security fixes, quick wins, mobile improvements, enhanced previews"

# Push naar GitHub
git push origin main
```

---

### Stap 2: Vercel Deployment

#### Optie A: Via Vercel Dashboard (Aanbevolen)

1. **Ga naar [vercel.com](https://vercel.com)**
2. **Login** met GitHub account
3. **Klik "Add New Project"**
4. **Import je GitHub repository**
5. **Configureer project:**
   - Framework Preset: **Next.js** (automatisch gedetecteerd)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (automatisch)
   - Output Directory: `.next` (automatisch)
   - Install Command: `npm install` (automatisch)

6. **Environment Variables toevoegen:**
   Klik op "Environment Variables" en voeg toe:

   ```bash
   # Database (VERPLICHT)
   DATABASE_URL=postgresql://user:password@host:5432/dbname

   # Session Secret (VERPLICHT - nieuw!)
   SESSION_SECRET=your-very-long-random-secret-key-min-32-chars

   # Encryption Key (VERPLICHT)
   ENCRYPTION_KEY=your-32-byte-encryption-key

   # NextAuth (optioneel, als fallback)
   NEXTAUTH_SECRET=your-secret-key
   NEXTAUTH_URL=https://your-app.vercel.app

   # AI Providers (optioneel)
   OPENAI_API_KEY=sk-...
   ANTHROPIC_API_KEY=sk-ant-...
   GOOGLE_API_KEY=...

   # Social Media (optioneel)
   META_APP_ID=...
   META_APP_SECRET=...
   LINKEDIN_CLIENT_ID=...
   LINKEDIN_CLIENT_SECRET=...

   # Slack (optioneel)
   SLACK_WEBHOOK_URL=...

   # Pusher (optioneel)
   PUSHER_APP_ID=...
   PUSHER_KEY=...
   PUSHER_SECRET=...
   PUSHER_CLUSTER=eu
   ```

7. **Klik "Deploy"**
8. **Wacht op build** (2-5 minuten)
9. **Done!** Je krijgt een URL zoals `https://your-app.vercel.app`

#### Optie B: Via Vercel CLI

```bash
# Installeer Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Volg de prompts:
# - Link to existing project? N
# - Project name? (content-bot)
# - Directory? (./)
# - Override settings? N

# Production deploy
vercel --prod
```

---

## ⚙️ Pre-Deployment Checklist

### ✅ Code Ready
- [x] Security fixes geïmplementeerd
- [x] Mobile/tablet improvements
- [x] Enhanced previews
- [x] All dependencies in package.json
- [x] Build command werkt lokaal

### ⚠️ Environment Variables (VERPLICHT!)

**Genereer secrets:**
```bash
# Session Secret (64 karakters hex)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Encryption Key (32 bytes base64)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Voeg toe aan Vercel:**
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Minimaal 32 karakters
- `ENCRYPTION_KEY` - 32 bytes (plain of base64)

### ⚠️ Database Setup

**Je hebt een database nodig!** Opties:

1. **Vercel Postgres** (aanbevolen)
   - In Vercel dashboard → Storage → Create Database
   - Automatisch `DATABASE_URL` environment variable
   - Gratis tier: 256MB storage

2. **Supabase** (gratis tier)
   - Ga naar [supabase.com](https://supabase.com)
   - Maak project
   - Copy connection string
   - Voeg toe als `DATABASE_URL`

3. **Neon** (gratis tier)
   - Ga naar [neon.tech](https://neon.tech)
   - Maak project
   - Copy connection string

**Na database setup:**
```bash
# Run migrations
npx prisma migrate deploy
# Of
npx prisma db push
```

---

## 🔧 Vercel-Specifieke Configuratie

### Build Settings

Vercel detecteert automatisch Next.js, maar je kunt ook handmatig instellen:

**In Vercel Dashboard → Settings → General:**
- Framework Preset: **Next.js**
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

### Environment Variables

**Belangrijk:** Voeg ALLE environment variables toe in Vercel dashboard!

**Voor Production:**
- Ga naar Project Settings → Environment Variables
- Voeg toe voor **Production**, **Preview**, en **Development**
- Gebruik **Production** voor live site

### Database Migrations

**Optie 1: Via Vercel Build Command**
```json
// package.json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

**Optie 2: Via Vercel Post-Deploy Hook**
- Gebruik Vercel's Post-Deploy script
- Of run migrations handmatig na eerste deploy

---

## 🚨 Belangrijke Aanpassingen voor Vercel

### 1. Image Upload Path

**Huidige situatie:** Images worden opgeslagen in `public/uploads/`

**Probleem:** Vercel is serverless - `public/` folder is read-only na build

**Oplossing:**
- Gebruik externe storage (S3, Cloudinary, etc.)
- Of gebruik Vercel Blob Storage (betaalde feature)

**Quick fix voor nu:**
- Images werken tijdens development
- Voor productie: implementeer externe storage

### 2. File System Access

**Huidige situatie:** Code leest `prompts.json`, `config.json` lokaal

**Status:** ✅ Al gefixt! Code gebruikt nu database (Prisma)

### 3. API Route Timeouts

**Vercel Limits:**
- Hobby (gratis): 10 seconden per request
- Pro: 60 seconden per request

**Impact:** Lange AI calls kunnen timeout krijgen

**Oplossing:**
- Streaming responses (als mogelijk)
- Background jobs voor lange operaties
- Of upgrade naar Pro plan

---

## 📋 Deployment Stappen (Samenvatting)

### 1. Voorbereiding
```bash
# Test build lokaal
npm run build

# Check voor errors
npm run lint
```

### 2. Git Push
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 3. Vercel Setup
1. Login op vercel.com
2. Import GitHub repo
3. Configureer environment variables
4. Deploy

### 4. Database Setup
1. Maak database (Vercel Postgres/Supabase/Neon)
2. Run migrations: `npx prisma migrate deploy`
3. Maak admin user (via script of handmatig)

### 5. Test
1. Open deployed URL
2. Test login/register
3. Test content generatie
4. Check mobile responsiveness

---

## 🔍 Troubleshooting

### Build Fails

**Error: "Module not found"**
```bash
# Check of alle dependencies in package.json staan
npm install
npm run build
```

**Error: "Prisma Client not generated"**
```bash
# Voeg toe aan package.json:
"postinstall": "prisma generate"
```

### Runtime Errors

**Error: "SESSION_SECRET not configured"**
→ Voeg `SESSION_SECRET` toe aan Vercel environment variables

**Error: "Database connection failed"**
→ Check `DATABASE_URL` in Vercel environment variables
→ Check of database publiek toegankelijk is (niet localhost!)

**Error: "ENCRYPTION_KEY invalid"**
→ Check of key exact 32 bytes is (plain of base64)

### Performance Issues

**Slow API responses:**
→ Check Vercel function logs
→ Overweeg caching
→ Check database query performance

---

## 🎯 Post-Deployment

### 1. Test Alles

- [ ] Login werkt
- [ ] Content generatie werkt
- [ ] Social media planner werkt
- [ ] Mobile responsive werkt
- [ ] Preview component werkt
- [ ] Dark mode werkt

### 2. Monitor

- Check Vercel Analytics
- Monitor error logs
- Check database performance
- Monitor API usage

### 3. Updates

**Voor toekomstige updates:**
```bash
# Maak wijzigingen
git add .
git commit -m "Update description"
git push origin main

# Vercel deployt automatisch!
```

---

## 💡 Tips

1. **Gebruik Vercel Preview Deployments**
   - Elke PR krijgt automatisch preview URL
   - Test voordat je naar production merge

2. **Environment Variables per Environment**
   - Production: Live credentials
   - Preview: Test credentials
   - Development: Local credentials

3. **Database Backups**
   - Zet automatische backups aan
   - Test restore procedure

4. **Monitoring**
   - Setup error tracking (Sentry)
   - Monitor API usage
   - Check performance metrics

---

## 📞 Hulp Nodig?

Als deployment faalt:
1. Check Vercel build logs
2. Check environment variables
3. Test build lokaal: `npm run build`
4. Check database connection

**Veel succes met de deployment! 🚀**
