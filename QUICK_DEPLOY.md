# Quick Deploy naar Vercel - 5 Minuten

**Datum:** 24 Januari 2026

---

## 🚀 Snelle Deployment (2 opties)

### Optie 1: Via Vercel Dashboard (Aanbevolen - Makkelijkst)

#### Stap 1: Code Pushen (2 minuten)

```bash
# Check wat er gewijzigd is
git status

# Voeg alles toe
git add .

# Commit
git commit -m "Security fixes, mobile improvements, enhanced previews, week view, dark mode"

# Push naar GitHub
git push origin main
```

#### Stap 2: Vercel Setup (3 minuten)

1. **Ga naar [vercel.com](https://vercel.com)** en login
2. **Klik "Add New Project"**
3. **Import je GitHub repository**
4. **Klik "Deploy"** (Vercel detecteert Next.js automatisch)

#### Stap 3: Environment Variables (BELANGRIJK!)

**In Vercel Dashboard → Project Settings → Environment Variables:**

Voeg toe voor **Production**:

```bash
# VERPLICHT - Genereer eerst:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
SESSION_SECRET=your-generated-secret-here

# VERPLICHT - Genereer eerst:
# node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
ENCRYPTION_KEY=your-generated-key-here

# VERPLICHT - Je database connection string
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Optioneel
NEXTAUTH_URL=https://your-app.vercel.app
```

**Klik "Redeploy"** na het toevoegen van environment variables!

#### Stap 4: Database Migrations

Na eerste deploy, run migrations:

```bash
# Via Vercel CLI (als geïnstalleerd)
vercel env pull .env.local
npx prisma migrate deploy

# Of via Vercel Dashboard → Functions → Run command
```

**Done!** 🎉

---

### Optie 2: Via Vercel CLI (Voor Developers)

```bash
# Installeer Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (preview)
vercel

# Of direct production
vercel --prod
```

---

## ⚠️ BELANGRIJK: Environment Variables

**Genereer secrets eerst:**

```bash
# Terminal 1: Session Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Terminal 2: Encryption Key  
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Kopieer de output en voeg toe in Vercel dashboard!**

---

## 📋 Post-Deployment

### 1. Test Deployed App

- [ ] Open je Vercel URL
- [ ] Test login/register
- [ ] Test content generatie
- [ ] Test mobile responsive
- [ ] Test preview component

### 2. Database Setup

```bash
# Run migrations
npx prisma migrate deploy

# Maak admin user (optioneel)
# Via API of handmatig in database
```

### 3. Monitor

- Check Vercel Analytics
- Monitor error logs
- Check database performance

---

## 🆘 Problemen?

### Build Fails
- Check build logs in Vercel
- Test lokaal: `npm run build`
- Check voor missing dependencies

### App Crasht
- Check environment variables
- Check database connection
- Check Vercel function logs

### Database Errors
- Check `DATABASE_URL` format
- Check of database publiek toegankelijk is
- Run migrations: `npx prisma migrate deploy`

---

## 📚 Meer Info

- **Volledige guide:** `DEPLOY_TO_VERCEL.md`
- **Checklist:** `VERCEL_DEPLOY_CHECKLIST.md`
- **Deployment script:** `scripts/deploy-vercel.sh`

---

**Klaar om te deployen! 🚀**
