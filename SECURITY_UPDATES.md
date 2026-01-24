# Security Updates - Implementatie Overzicht

**Datum:** 24 Januari 2026  
**Status:** ✅ Geïmplementeerd

---

## 🔒 Geïmplementeerde Security Fixes

### 1. ✅ JWT Session Signing

**Probleem opgelost:** Plain JSON cookies zonder verificatie - gebruikers konden hun role manipuleren.

**Implementatie:**
- JWT tokens met `jsonwebtoken` library
- Tokens worden gesigneerd met `SESSION_SECRET`
- Automatische verificatie bij elke request
- Token expiry (7 dagen)
- Email verificatie (security check)

**Bestanden:**
- `app/lib/auth.ts` - Volledig herschreven met JWT

**Environment Variable:**
```bash
SESSION_SECRET="your-secret-key-min-32-chars"
# Of gebruik NEXTAUTH_SECRET als fallback
```

**Breaking Changes:**
- ⚠️ Bestaande sessies worden ongeldig na deze update
- Gebruikers moeten opnieuw inloggen

---

### 2. ✅ Rate Limiting

**Probleem opgelost:** Geen bescherming tegen brute force attacks en DDoS.

**Implementatie:**
- In-memory rate limiter (voor productie: gebruik Redis/Upstash)
- Pre-configured limiters voor verschillende endpoints
- Rate limit headers in responses

**Bestanden:**
- `app/lib/rate-limit.ts` - Rate limiting utility
- Toegevoegd aan:
  - `/api/auth/login` - 5 pogingen per 15 minuten
  - `/api/auth/register` - 5 pogingen per 15 minuten
  - `/api/generate` - 20 generaties per uur
  - `/api/images/upload` - 10 uploads per minuut

**Rate Limits:**
```typescript
auth: 5 requests / 15 minuten
generate: 20 requests / uur
upload: 10 requests / minuut
api: 60 requests / minuut (algemeen)
```

**Headers:**
- `X-RateLimit-Limit`: Maximum requests
- `X-RateLimit-Remaining`: Resterende requests
- `X-RateLimit-Reset`: Timestamp wanneer limit reset
- `Retry-After`: Seconden tot retry

**Voor Productie:**
Overweeg Upstash Redis voor distributed rate limiting:
```bash
npm install @upstash/ratelimit @upstash/redis
```

---

### 3. ✅ Wachtwoordbeleid Verbetering

**Probleem opgelost:** Minimum 6 tekens, geen strength requirements.

**Implementatie:**
- Minimum 8 tekens (was 6)
- Vereist: kleine letter, hoofdletter, cijfer
- Zxcvbn strength checking (score 0-4)
- Minimum strength score: 2 (redelijk)
- Gedetailleerde feedback voor gebruikers

**Bestanden:**
- `app/lib/password-validation.ts` - Password validation utility
- `app/api/auth/register/route.ts` - Updated met nieuwe validatie

**Validatie Regels:**
- ✅ Minimaal 8 tekens
- ✅ Maximaal 128 tekens
- ✅ Minimaal 1 kleine letter
- ✅ Minimaal 1 hoofdletter
- ✅ Minimaal 1 cijfer
- ✅ Strength score minimaal 2/4

**Response Format:**
```json
{
  "error": "Wachtwoord voldoet niet aan de vereisten",
  "details": ["Wachtwoord moet minimaal één hoofdletter bevatten"],
  "strength": {
    "score": 1,
    "feedback": ["Voeg meer variatie toe aan je wachtwoord"]
  }
}
```

---

### 4. ✅ Security Headers

**Probleem opgelost:** Geen security headers in responses.

**Implementatie:**
- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Referrer-Policy
- Permissions-Policy
- Strict-Transport-Security (productie)

**Bestanden:**
- `app/lib/security-headers.ts` - Security headers utility
- `middleware.ts` - Headers toegevoegd aan alle responses

**Headers:**
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: [configured]
Strict-Transport-Security: max-age=31536000 (productie)
```

---

### 5. ✅ CSRF Protection

**Probleem opgelost:** Geen CSRF protection op state-changing endpoints.

**Implementatie:**
- CSRF token generatie
- Token verificatie
- Constant-time comparison (timing attack protection)

**Bestanden:**
- `app/lib/csrf.ts` - CSRF utility

**Gebruik:**
```typescript
import { requireCsrfToken, generateCsrfToken } from '@/app/lib/csrf';

// In API route:
const csrfCheck = await requireCsrfToken(request);
if (!csrfCheck.valid) {
  return NextResponse.json({ error: csrfCheck.error }, { status: 403 });
}

// In frontend (optioneel - kan later toegevoegd worden):
const token = await generateCsrfToken();
// Stuur token in header: x-csrf-token
```

**Status:** ✅ Geïmplementeerd, maar nog niet actief op alle endpoints (optioneel voor later)

---

### 6. ✅ Environment Variables Validatie

**Probleem opgelost:** Geen validatie van environment variables bij startup.

**Implementatie:**
- Validatie van required variables
- Warnings voor development
- Errors voor production
- Encryption key length check

**Bestanden:**
- `app/lib/env-validation.ts` - Environment validation

**Gebruik:**
```typescript
import { initEnv, validateEnv } from '@/app/lib/env-validation';

// Bij app startup:
initEnv(); // Throws error als required vars ontbreken

// Of check alleen:
const { valid, errors, warnings } = validateEnv();
```

**Required Variables:**
- `DATABASE_URL`
- `ENCRYPTION_KEY` (32 bytes)

**Production Required:**
- `SESSION_SECRET` of `NEXTAUTH_SECRET`

---

## 📋 Setup Instructies

### 1. Environment Variables

Voeg toe aan `.env.local`:

```bash
# Session Secret (minimaal 32 karakters)
SESSION_SECRET="your-very-long-random-secret-key-min-32-chars"

# Of gebruik NEXTAUTH_SECRET als fallback
NEXTAUTH_SECRET="your-secret-key"

# Encryption Key (32 bytes - plain of base64)
ENCRYPTION_KEY="your-32-byte-encryption-key"
# Of base64:
# ENCRYPTION_KEY="base64-encoded-32-byte-key"
```

**Genereer Secrets:**
```bash
# Session Secret (64 karakters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Encryption Key (32 bytes base64)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 2. Install Dependencies

```bash
npm install jsonwebtoken @types/jsonwebtoken zxcvbn @types/zxcvbn
```

### 3. Test de Implementatie

**Test JWT Sessions:**
1. Log in
2. Check cookie: moet JWT token zijn (niet plain JSON)
3. Probeer cookie te manipuleren: moet falen

**Test Rate Limiting:**
1. Probeer 6x in te loggen met verkeerd wachtwoord
2. 6e poging moet 429 error geven
3. Check headers: `X-RateLimit-*`

**Test Password Validation:**
1. Probeer te registreren met zwak wachtwoord
2. Moet error geven met details
3. Test met sterk wachtwoord: moet werken

---

## ⚠️ Breaking Changes

1. **Sessions:** Alle bestaande sessies zijn ongeldig. Gebruikers moeten opnieuw inloggen.

2. **Password Policy:** Nieuwe gebruikers moeten sterkere wachtwoorden gebruiken.

3. **Rate Limits:** Te veel requests geven nu 429 errors.

---

## 🚀 Volgende Stappen (Optioneel)

### Voor Productie:

1. **Redis Rate Limiting:**
   ```bash
   npm install @upstash/ratelimit @upstash/redis
   ```
   Update `app/lib/rate-limit.ts` om Upstash te gebruiken.

2. **CSRF Activeren:**
   Voeg CSRF checks toe aan alle POST/PUT/DELETE endpoints.

3. **Monitoring:**
   - Setup error tracking (Sentry)
   - Monitor rate limit hits
   - Log security events

4. **Security Audit:**
   - Run security scan (npm audit)
   - Penetration testing
   - Code review

---

## 📚 Referenties

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)

---

**Laatste update:** 24 Januari 2026
