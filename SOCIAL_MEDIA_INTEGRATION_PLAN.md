# Social Media Integratie Plan - Instagram & LinkedIn

## 🎯 Doel
Direct posten naar Instagram en LinkedIn vanuit RankFlow Studio, inclusief:
- OAuth authenticatie
- Direct posten (nu)
- Geplande posts (scheduled)
- Multi-account support
- Retry logica bij falen

---

## 📋 Technische Vereisten

### Instagram Graph API
**Requirements:**
- ✅ Meta Business Account nodig
- ✅ Instagram Business of Creator account
- ✅ Facebook Page gekoppeld aan Instagram account
- ✅ Meta App geregistreerd in Meta for Developers
- ✅ OAuth 2.0 flow voor authenticatie
- ✅ Access tokens (kortlopend + langlopend)

**Limitaties:**
- ❌ Alleen Business/Creator accounts (geen persoonlijke accounts)
- ❌ Max 25 posts per dag per account
- ❌ Carousel posts: max 10 afbeeldingen
- ❌ Video posts: max 60 seconden
- ❌ Reels: aparte API endpoint

**API Endpoints:**
- `POST /{ig-user-id}/media` - Upload media container
- `POST /{ig-user-id}/media_publish` - Publiceer post
- `GET /{ig-user-id}/media` - Haal posts op

### LinkedIn API
**Requirements:**
- ✅ LinkedIn Developer Account
- ✅ LinkedIn App geregistreerd
- ✅ OAuth 2.0 flow voor authenticatie
- ✅ Access tokens (kortlopend + refresh tokens)

**Limitaties:**
- ✅ Persoonlijke profielen EN bedrijfspagina's
- ✅ Max 3 posts per dag per persoonlijk profiel
- ✅ Bedrijfspagina's: hogere limits
- ✅ Afbeeldingen: max 9MB per afbeelding
- ✅ Video: max 200MB

**API Endpoints:**
- `POST /ugcPosts` - Maak UGC post
- `POST /shares` - Deel content (persoonlijk profiel)
- `POST /assets` - Upload afbeeldingen/video's

---

## 🗄️ Database Schema Uitbreiding

### Nieuwe Prisma Models:

```prisma
// Social Media Account Connecties
model SocialMediaAccount {
  id            String   @id @default(cuid())
  organizationId String? // Voor multi-tenant
  userId        String   // User die account heeft gekoppeld
  platform      String   // 'instagram' | 'linkedin'
  accountType   String   // 'business' | 'personal' | 'page'
  accountId     String   // Platform account ID (IG user ID, LinkedIn URN)
  accountName   String   // Display name
  username      String?  // Instagram username, LinkedIn handle
  
  // OAuth tokens
  accessToken   String   @db.Text // Encrypted
  refreshToken  String?  @db.Text // Encrypted (LinkedIn)
  tokenExpiresAt DateTime?
  
  // Metadata
  isActive      Boolean  @default(true)
  isDefault     Boolean  @default(false) // Default account voor platform
  metadata      Json?    // Extra platform-specifieke data
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Relations
  posts         SocialPost[]
  
  @@unique([organizationId, platform, accountId])
  @@index([userId, platform])
}

// Uitbreiding SocialPost model
// (toevoegen aan bestaande SocialPost)
// - socialMediaAccountId String? // FK naar SocialMediaAccount
// - publishedPostId     String? // Platform post ID na publicatie
// - publishError        String? // Error message bij falen
// - publishAttempts     Int     @default(0)
// - lastPublishAttempt  DateTime?
```

---

## 🔐 OAuth Flow Implementatie

### Instagram OAuth Flow:

```
1. User klikt "Connect Instagram"
2. Redirect naar Meta OAuth:
   https://www.facebook.com/v18.0/dialog/oauth?
     client_id={APP_ID}
     redirect_uri={REDIRECT_URI}
     scope=instagram_basic,instagram_content_publish,pages_read_engagement
     response_type=code

3. User autoriseert → redirect terug met code
4. Exchange code voor access token:
   POST https://graph.facebook.com/v18.0/oauth/access_token
   - client_id, client_secret, code, redirect_uri

5. Exchange short-lived token voor long-lived token:
   GET https://graph.facebook.com/v18.0/oauth/access_token?
     grant_type=fb_exchange_token
     client_id={APP_ID}
     client_secret={APP_SECRET}
     fb_exchange_token={SHORT_LIVED_TOKEN}

6. Haal Instagram Business Account ID op:
   GET https://graph.facebook.com/v18.0/{page-id}?
     fields=instagram_business_account

7. Sla account info + tokens op in database
```

### LinkedIn OAuth Flow:

```
1. User klikt "Connect LinkedIn"
2. Redirect naar LinkedIn OAuth:
   https://www.linkedin.com/oauth/v2/authorization?
     response_type=code
     client_id={CLIENT_ID}
     redirect_uri={REDIRECT_URI}
     scope=r_liteprofile,r_emailaddress,w_member_social,w_organization_social
     state={RANDOM_STATE}

3. User autoriseert → redirect terug met code
4. Exchange code voor access token:
   POST https://www.linkedin.com/oauth/v2/accessToken
   - grant_type=authorization_code
   - code, redirect_uri, client_id, client_secret

5. Haal user profile op:
   GET https://api.linkedin.com/v2/userinfo

6. Sla account info + tokens op in database
```

---

## 🚀 API Routes Implementatie

### 1. OAuth Routes

**`/api/social-auth/instagram/authorize`**
- Redirect naar Meta OAuth URL

**`/api/social-auth/instagram/callback`**
- Handle OAuth callback
- Exchange tokens
- Sla account op in database

**`/api/social-auth/linkedin/authorize`**
- Redirect naar LinkedIn OAuth URL

**`/api/social-auth/linkedin/callback`**
- Handle OAuth callback
- Exchange tokens
- Sla account op in database

**`/api/social-auth/accounts`**
- GET: Haal gekoppelde accounts op
- DELETE: Ontkoppel account

### 2. Posting Routes

**`/api/social-posts/publish`**
```typescript
POST /api/social-posts/publish
{
  postId: string,
  accountId?: string, // Optioneel, anders default account
  publishNow?: boolean // true = nu, false = gebruik scheduledDate
}
```

**`/api/social-posts/publish/batch`**
- Bulk publishing voor meerdere posts

### 3. Scheduler Service

**Background job** (cron of queue):
- Check elke minuut voor scheduled posts
- Posts waar `scheduledDate <= now()` en `status === 'scheduled'`
- Publiceer automatisch
- Update status naar `published` of `failed`

---

## 📦 NPM Packages Nodig

```json
{
  "axios": "^1.6.0", // HTTP requests
  "form-data": "^4.0.0", // File uploads
  "node-cron": "^3.0.0", // Scheduler
  "bull": "^4.11.0", // Job queue (optioneel, beter dan cron)
  "redis": "^4.6.0" // Voor Bull queue
}
```

---

## 🔧 Implementatie Stappen

### Fase 1: Database & OAuth (Week 1)
1. ✅ Prisma schema uitbreiden
2. ✅ OAuth routes implementeren
3. ✅ Token encryption/decryption
4. ✅ Account management UI

### Fase 2: Instagram Posting (Week 2)
1. ✅ Instagram media upload
2. ✅ Instagram post publishing
3. ✅ Error handling & retry
4. ✅ UI voor direct posten

### Fase 3: LinkedIn Posting (Week 2-3)
1. ✅ LinkedIn asset upload
2. ✅ LinkedIn post publishing
3. ✅ Error handling & retry
4. ✅ UI voor direct posten

### Fase 4: Scheduler (Week 3)
1. ✅ Background job voor scheduled posts
2. ✅ Retry logica
3. ✅ Notification bij success/failure
4. ✅ Logging & analytics

### Fase 5: UI/UX (Week 4)
1. ✅ Account connectie UI
2. ✅ Post button in planner
3. ✅ Status indicators (draft/scheduled/published)
4. ✅ Error messages & retry buttons

---

## 🎨 UI Componenten

### Account Management
```tsx
// Settings → Social Media Accounts
<SocialAccountManager>
  - Lijst van gekoppelde accounts
  - "Connect Instagram" button
  - "Connect LinkedIn" button
  - Account status (connected/disconnected)
  - Default account selector
  - Disconnect button
</SocialAccountManager>
```

### Post Actions
```tsx
// In planner, bij elke post:
<PostActions>
  - "Publish Now" button (als status = draft/scheduled)
  - "Schedule" button
  - "Edit" button
  - Status badge (draft/scheduled/published/failed)
  - Error message (als failed)
  - "Retry" button (als failed)
</PostActions>
```

---

## ⚠️ Belangrijke Overwegingen

### Security
- ✅ **Encrypt tokens** in database (gebruik `crypto` library)
- ✅ **Refresh tokens** automatisch voor verlopen tokens
- ✅ **Rate limiting** respecteren (25 posts/dag Instagram)
- ✅ **Error handling** voor expired tokens

### Compliance
- ✅ **Meta Terms of Service** naleven
- ✅ **LinkedIn API Terms** naleven
- ✅ **GDPR compliance** voor opgeslagen tokens
- ✅ **User consent** duidelijk vragen

### Reliability
- ✅ **Retry logic** bij tijdelijke fouten
- ✅ **Queue system** voor scheduled posts
- ✅ **Monitoring** voor failed posts
- ✅ **Notifications** bij success/failure

### User Experience
- ✅ **Clear error messages** als posting faalt
- ✅ **Status updates** in real-time
- ✅ **Preview** voordat je post
- ✅ **Undo** mogelijkheid (binnen platform limits)

---

## 📊 Kosten Overwegingen

### Meta/Instagram:
- ✅ **Gratis** voor basis API access
- ⚠️ **Rate limits** kunnen beperkend zijn
- ⚠️ **App Review** nodig voor productie

### LinkedIn:
- ✅ **Gratis** voor Marketing Developer Platform
- ⚠️ **Rate limits** (3 posts/dag persoonlijk profiel)
- ⚠️ **App Review** nodig voor productie

### Infrastructure:
- ✅ **Background jobs**: Bull + Redis (~€10-20/maand)
- ✅ **OAuth callbacks**: HTTPS vereist (Vercel/Cloudflare)
- ✅ **Storage**: Voor media uploads (optioneel, kan direct naar platform)

---

## 🚦 Launch Checklist

### Pre-Launch:
- [ ] Meta App geregistreerd en goedgekeurd
- [ ] LinkedIn App geregistreerd en goedgekeurd
- [ ] OAuth flows getest
- [ ] Token refresh logica getest
- [ ] Error handling getest
- [ ] Rate limiting geïmplementeerd
- [ ] Background scheduler werkend
- [ ] UI/UX getest

### Post-Launch:
- [ ] Monitoring setup
- [ ] Error alerts geconfigureerd
- [ ] User feedback verzamelen
- [ ] Performance optimaliseren
- [ ] Documentation bijwerken

---

## 📝 Code Voorbeelden

### Instagram Post Example:
```typescript
async function postToInstagram(
  accountId: string,
  caption: string,
  imageUrl: string
) {
  // 1. Haal account op
  const account = await getSocialAccount(accountId);
  
  // 2. Upload image naar Instagram
  const mediaResponse = await fetch(
    `https://graph.facebook.com/v18.0/${account.accountId}/media`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${account.accessToken}`,
      },
      body: JSON.stringify({
        image_url: imageUrl,
        caption: caption,
      }),
    }
  );
  
  const { id: containerId } = await mediaResponse.json();
  
  // 3. Publiceer post
  const publishResponse = await fetch(
    `https://graph.facebook.com/v18.0/${account.accountId}/media_publish`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${account.accessToken}`,
      },
      body: JSON.stringify({
        creation_id: containerId,
      }),
    }
  );
  
  const { id: postId } = await publishResponse.json();
  return postId;
}
```

### LinkedIn Post Example:
```typescript
async function postToLinkedIn(
  accountId: string,
  text: string,
  imageUrl?: string
) {
  const account = await getSocialAccount(accountId);
  
  // 1. Upload image (als aanwezig)
  let imageUrn;
  if (imageUrl) {
    const uploadResponse = await uploadImageToLinkedIn(
      account.accessToken,
      imageUrl
    );
    imageUrn = uploadResponse.value;
  }
  
  // 2. Maak UGC post
  const postResponse = await fetch(
    'https://api.linkedin.com/v2/ugcPosts',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${account.accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify({
        author: `urn:li:person:${account.accountId}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: text,
            },
            shareMediaCategory: imageUrn ? 'IMAGE' : 'NONE',
            media: imageUrn ? [{
              status: 'READY',
              media: imageUrn,
            }] : [],
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
      }),
    }
  );
  
  const post = await postResponse.json();
  return post.id;
}
```

---

## 🎯 Conclusie

**Ja, het is mogelijk!** Instagram en LinkedIn bieden beide API's voor direct posten. 

**Implementatie tijd:** ~3-4 weken voor volledige integratie

**Complexiteit:** Medium-Hoog (OAuth, token management, error handling)

**Waarde:** ⭐⭐⭐⭐⭐ (Zeer hoog - complete automatisering)

**Next Steps:**
1. Meta App aanmaken
2. LinkedIn App aanmaken
3. Database schema uitbreiden
4. OAuth flows implementeren
5. Posting functionaliteit bouwen

