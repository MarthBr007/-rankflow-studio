# Social Media Integratie Setup Guide

## 📋 Overzicht

Deze guide helpt je bij het opzetten van Instagram en LinkedIn integraties voor direct posten vanuit RankFlow Studio.

---

## 🔧 Stap 1: Environment Variables

Voeg de volgende environment variables toe aan je `.env.local`:

```bash
# Meta/Instagram OAuth
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

# App URL (voor OAuth callbacks)
NEXT_PUBLIC_APP_URL=https://your-domain.com
# Of voor lokale development:
# NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 📱 Stap 2: Meta/Instagram App Aanmaken

### 2.1 Meta for Developers Account
1. Ga naar [Meta for Developers](https://developers.facebook.com/)
2. Maak een account aan of log in
3. Klik op "My Apps" → "Create App"

### 2.2 App Type Selecteren
1. Kies "Business" als app type
2. Vul app naam in (bijv. "RankFlow Studio")
3. Klik "Create App"

### 2.3 Instagram Basic Display Product Toevoegen
1. Ga naar "Add Products" in de sidebar
2. Zoek "Instagram" → "Instagram Basic Display"
3. Klik "Set Up"

### 2.4 Instagram Graph API Product Toevoegen
1. Ga naar "Add Products" → "Instagram Graph API"
2. Klik "Set Up"

### 2.5 OAuth Redirect URI Configureren
1. Ga naar "Settings" → "Basic"
2. Noteer je **App ID** en **App Secret**
3. Scroll naar "Add Platform" → "Website"
4. Voeg toe: `https://your-domain.com` (of `http://localhost:3000` voor development)

### 2.6 OAuth Redirect URIs
1. Ga naar "Products" → "Instagram" → "Basic Display" → "Settings"
2. Voeg toe aan "Valid OAuth Redirect URIs":
   ```
   https://your-domain.com/api/social-auth/instagram/callback
   http://localhost:3000/api/social-auth/instagram/callback (voor development)
   ```

### 2.7 Permissions Requesten
1. Ga naar "App Review" → "Permissions and Features"
2. Request de volgende permissions:
   - `instagram_basic`
   - `instagram_content_publish`
   - `pages_read_engagement`
   - `pages_show_list`

### 2.8 Instagram Business Account Vereisten
- Je Instagram account moet een **Business** of **Creator** account zijn
- Je Instagram account moet gekoppeld zijn aan een **Facebook Page**
- De Facebook Page moet beheerd worden door dezelfde gebruiker

---

## 💼 Stap 3: LinkedIn App Aanmaken

### 3.1 LinkedIn Developers Account
1. Ga naar [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Log in met je LinkedIn account
3. Klik op "Create app"

### 3.2 App Details Invullen
1. **App name**: RankFlow Studio (of jouw naam)
2. **LinkedIn Page**: Selecteer een LinkedIn Page (optioneel, voor bedrijfspagina's)
3. **Privacy Policy URL**: `https://your-domain.com/privacy` (vereist)
4. **App logo**: Upload een logo (vereist)
5. Klik "Create app"

### 3.3 OAuth 2.0 Settings
1. Ga naar "Auth" tab
2. Noteer je **Client ID** en **Client Secret**
3. Voeg toe aan "Authorized redirect URLs":
   ```
   https://your-domain.com/api/social-auth/linkedin/callback
   http://localhost:3000/api/social-auth/linkedin/callback (voor development)
   ```

### 3.4 Products Requesten
1. Ga naar "Products" tab
2. Request "Sign In with LinkedIn using OpenID Connect"
3. Request "Marketing Developer Platform" (voor posting)

### 3.5 Permissions Requesten
1. Ga naar "Auth" → "Products"
2. Request de volgende scopes:
   - `openid`
   - `profile`
   - `email`
   - `w_member_social` (voor persoonlijke profielen)
   - `w_organization_social` (voor bedrijfspagina's)

---

## 🗄️ Stap 4: Database Migration

Run de Prisma migration om de nieuwe tabellen aan te maken:

```bash
npx prisma migrate dev --name add_social_media_accounts
```

Of als je al in productie bent:

```bash
npx prisma migrate deploy
```

---

## ✅ Stap 5: Testen

### 5.1 Instagram Connectie Testen
1. Log in op RankFlow Studio
2. Ga naar Settings → Social Media Accounts
3. Klik "Connect Instagram"
4. Autoriseer de app in Meta
5. Controleer of het account gekoppeld is

### 5.2 LinkedIn Connectie Testen
1. Ga naar Settings → Social Media Accounts
2. Klik "Connect LinkedIn"
3. Autoriseer de app in LinkedIn
4. Controleer of het account gekoppeld is

### 5.3 Post Testen
1. Ga naar Planner
2. Maak een nieuwe post
3. Klik "Publish Now"
4. Controleer of de post op Instagram/LinkedIn verschijnt

---

## ⚠️ Belangrijke Opmerkingen

### Instagram:
- ✅ Alleen **Business** of **Creator** accounts
- ✅ Moet gekoppeld zijn aan een **Facebook Page**
- ✅ Max **25 posts per dag** per account
- ✅ Afbeeldingen moeten **publiek toegankelijk** zijn (HTTPS)

### LinkedIn:
- ✅ **Persoonlijke profielen** en **bedrijfspagina's** ondersteund
- ✅ Max **3 posts per dag** voor persoonlijke profielen
- ✅ Hogere limits voor bedrijfspagina's
- ✅ Afbeeldingen: max **9MB** per afbeelding

### Security:
- ✅ Tokens worden **encrypted** opgeslagen in database
- ✅ Gebruik altijd **HTTPS** in productie
- ✅ **Refresh tokens** worden automatisch gebruikt bij verlopen

---

## 🐛 Troubleshooting

### "Instagram account niet gevonden"
- Zorg dat je Instagram account een **Business** of **Creator** account is
- Zorg dat je Instagram account gekoppeld is aan een **Facebook Page**
- Check of je de juiste permissions hebt aangevraagd

### "LinkedIn token expired"
- Refresh tokens worden automatisch gebruikt
- Als dit niet werkt, ontkoppel en koppel het account opnieuw

### "Image upload failed"
- Zorg dat afbeeldingen **publiek toegankelijk** zijn (HTTPS)
- Check of de image URL correct is
- Voor LinkedIn: max 9MB per afbeelding

### "Rate limit exceeded"
- Instagram: max 25 posts/dag
- LinkedIn: max 3 posts/dag (persoonlijk profiel)
- Wacht tot de volgende dag of gebruik een ander account

---

## 📚 API Endpoints

### OAuth:
- `GET /api/social-auth/instagram/authorize` - Start Instagram OAuth
- `GET /api/social-auth/instagram/callback` - Instagram OAuth callback
- `GET /api/social-auth/linkedin/authorize` - Start LinkedIn OAuth
- `GET /api/social-auth/linkedin/callback` - LinkedIn OAuth callback
- `GET /api/social-auth/accounts` - Haal gekoppelde accounts op
- `DELETE /api/social-auth/accounts?id=...` - Ontkoppel account

### Posting:
- `POST /api/social-posts/publish` - Publiceer een post
  ```json
  {
    "postId": "post-id",
    "accountId": "account-id", // Optioneel
    "publishNow": true // true = nu, false = gebruik scheduledDate
  }
  ```

---

## 🚀 Volgende Stappen

1. ✅ **Scheduler Service**: Background job voor geplande posts
2. ✅ **UI Componenten**: Account management en post buttons
3. ✅ **Error Handling**: Betere error messages en retry logica
4. ✅ **Analytics**: Post performance tracking

---

## 📞 Support

Voor vragen of problemen:
- Check de [Social Media Integration Plan](./SOCIAL_MEDIA_INTEGRATION_PLAN.md)
- Check de API documentatie van [Meta](https://developers.facebook.com/docs/instagram-api) en [LinkedIn](https://docs.microsoft.com/en-us/linkedin/)

