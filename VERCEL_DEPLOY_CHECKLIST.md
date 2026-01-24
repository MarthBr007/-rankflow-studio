# Vercel Deployment Checklist

**Datum:** 24 Januari 2026

---

## ✅ Pre-Deployment Checklist

### Code
- [x] Alle security fixes geïmplementeerd
- [x] Mobile/tablet improvements
- [x] Enhanced previews
- [x] Weekweergave calendar
- [x] Dark mode
- [x] Drag & drop component (klaar voor gebruik)

### Dependencies
- [x] Alle packages in package.json
- [x] package-lock.json up-to-date
- [x] Build command werkt: `npm run build`

### Environment Variables (VERPLICHT!)

**Genereer secrets:**
```bash
# Session Secret
node -e "console.log('SESSION_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"

# Encryption Key
node -e "console.log('ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('base64'))"
```

**Voeg toe aan Vercel:**
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `SESSION_SECRET` - Minimaal 32 karakters
- [ ] `ENCRYPTION_KEY` - 32 bytes (plain of base64)
- [ ] `NEXTAUTH_SECRET` - (optioneel, als fallback)
- [ ] `NEXTAUTH_URL` - https://your-app.vercel.app

### Database
- [ ] Database aangemaakt (Vercel Postgres/Supabase/Neon)
- [ ] Connection string gekopieerd
- [ ] Migrations klaar: `npx prisma migrate deploy`

---

## 🚀 Deployment Stappen

### 1. Git Commit & Push

```bash
# Check status
git status

# Add alle wijzigingen
git add .

# Commit
git commit -m "Security fixes, mobile improvements, enhanced previews"

# Push
git push origin main
```

### 2. Vercel Setup

1. **Ga naar [vercel.com](https://vercel.com)**
2. **Login** met GitHub
3. **"Add New Project"**
4. **Import repository**
5. **Configureer:**
   - Framework: Next.js (auto-detect)
   - Root: `./`
   - Build: `npm run build` (auto)
   - Output: `.next` (auto)

### 3. Environment Variables

**In Vercel Dashboard → Settings → Environment Variables:**

Voeg toe voor **Production**:

```bash
DATABASE_URL=postgresql://...
SESSION_SECRET=your-generated-secret
ENCRYPTION_KEY=your-generated-key
NEXTAUTH_URL=https://your-app.vercel.app
```

**Optioneel:**
```bash
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...
META_APP_ID=...
META_APP_SECRET=...
LINKEDIN_CLIENT_ID=...
LINKEDIN_CLIENT_SECRET=...
SLACK_WEBHOOK_URL=...
PUSHER_APP_ID=...
PUSHER_KEY=...
PUSHER_SECRET=...
PUSHER_CLUSTER=eu
```

### 4. Deploy

1. **Klik "Deploy"**
2. **Wacht op build** (2-5 minuten)
3. **Check build logs** voor errors

### 5. Database Migrations

**Na eerste deploy:**

```bash
# Via Vercel CLI
vercel env pull .env.local
npx prisma migrate deploy

# Of via Vercel dashboard → Functions → Run command
```

### 6. Test

- [ ] Open deployed URL
- [ ] Test login
- [ ] Test content generatie
- [ ] Test mobile responsive
- [ ] Test preview component
- [ ] Test dark mode

---

## 🔧 Post-Deployment

### Database Setup

```bash
# Run migrations
npx prisma migrate deploy

# Maak admin user (via API of script)
# Of gebruik Vercel Functions om script te runnen
```

### Monitoring

- [ ] Check Vercel Analytics
- [ ] Monitor error logs
- [ ] Check database performance
- [ ] Monitor API usage

---

## ⚠️ Belangrijke Notities

1. **Image Uploads:**
   - `public/uploads/` werkt niet op Vercel (read-only)
   - Implementeer externe storage (S3, Cloudinary) voor productie

2. **API Timeouts:**
   - Vercel Hobby: 10 seconden max
   - Vercel Pro: 60 seconden max
   - Lange AI calls kunnen timeout krijgen

3. **Environment Variables:**
   - Voeg ALLE secrets toe in Vercel dashboard
   - Gebruik Production environment voor live site

4. **Database:**
   - Gebruik publieke database (niet localhost!)
   - Check connection string format
   - Test connection voor deployment

---

## 🆘 Troubleshooting

### Build Fails
- Check build logs in Vercel
- Test lokaal: `npm run build`
- Check voor missing dependencies

### Runtime Errors
- Check environment variables
- Check database connection
- Check Vercel function logs

### Performance Issues
- Check Vercel Analytics
- Monitor database queries
- Overweeg caching

---

**Klaar om te deployen! 🚀**
