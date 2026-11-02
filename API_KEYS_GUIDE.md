# API Keys Aanmaken - Handleiding

## Wat zijn API Keys?

API keys zijn unieke codes die je nodig hebt om toegang te krijgen tot AI services zoals OpenAI, Anthropic en Google. Elke provider heeft zijn eigen manier om API keys aan te maken.

## 1. OpenAI API Key (voor GPT-5, GPT-4o, etc.)

### Stap 1: Account aanmaken
1. Ga naar [https://platform.openai.com](https://platform.openai.com)
2. Maak een account aan of log in
3. Verifieer je email adres

### Stap 2: API Key aanmaken
1. Ga naar [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Klik op **"Create new secret key"**
3. Geef de key een naam (bijv. "Content Bot Production")
4. Kopieer de key direct (je ziet hem daarna niet meer!)
5. De key begint met `sk-proj-...` of `sk-...`

### Stap 3: Credits toevoegen
1. Ga naar [https://platform.openai.com/account/billing](https://platform.openai.com/account/billing)
2. Voeg credits toe (bijv. $10, $50, $100)
3. Zet een spending limit in om onverwachte kosten te voorkomen

### Kosten:
- GPT-5: ~$0.005 per 1K tokens (input), ~$0.015 per 1K tokens (output)
- GPT-4o: ~$0.0025 per 1K tokens (input), ~$0.01 per 1K tokens (output)
- GPT-4o-mini: ~$0.15 per 1M tokens (input), ~$0.60 per 1M tokens (output)

---

## 2. Anthropic API Key (voor Claude)

### Stap 1: Account aanmaken
1. Ga naar [https://console.anthropic.com](https://console.anthropic.com)
2. Maak een account aan of log in
3. Verifieer je email adres

### Stap 2: API Key aanmaken
1. Ga naar [https://console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)
2. Klik op **"Create Key"**
3. Geef de key een naam
4. Kopieer de key direct
5. De key begint met `sk-ant-...`

### Stap 3: Credits toevoegen
1. Ga naar [https://console.anthropic.com/settings/billing](https://console.anthropic.com/settings/billing)
2. Voeg credits toe

### Kosten:
- Claude 3.5 Sonnet: ~$3 per 1M tokens (input), ~$15 per 1M tokens (output)
- Claude 3 Opus: ~$15 per 1M tokens (input), ~$75 per 1M tokens (output)

---

## 3. Google API Key (voor Gemini)

### Stap 1: Google Cloud Account
1. Ga naar [https://console.cloud.google.com](https://console.cloud.google.com)
2. Maak een project aan
3. Activeer de Gemini API

### Stap 2: API Key aanmaken
1. Ga naar [https://console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)
2. Klik op **"Create Credentials"** → **"API Key"**
3. Kopieer de key
4. Beperk de key tot alleen Gemini API (veiligheid)

### Kosten:
- Gemini Pro: Gratis tier beschikbaar, daarna betaald

---

## Veiligheid Tips

1. **Deel je API keys NOOIT publiekelijk**
2. **Gebruik environment variables** in productie
3. **Zet spending limits** in bij alle providers
4. **Monitor je gebruik** regelmatig
5. **Roteer keys** als ze gelekt zijn

---

## In deze applicatie gebruiken

### Optie 1: Standaard AI Configuratie
- Ga naar **Settings → AI Configuratie**
- Vul je API key in
- Kies je model en provider
- Klik op **Opslaan**

### Optie 2: Tenant Configuratie (White Label)
- Ga naar **Settings → White Label Tenant**
- Vul in:
  - **Tenant ID**: Unieke ID voor deze klant (bijv. "klant-123")
  - **API Key**: API key van deze klant
  - **Provider**: OpenAI, Anthropic of Google
  - **Model**: Bijv. "gpt-5", "claude-3-5-sonnet-20241022"
- Klik op **Opslaan (tenant)**

De tenant configuratie wordt versleuteld opgeslagen in de database en wordt automatisch gebruikt wanneer je content genereert met die `organizationId`.

---

## Dezelfde waarden op Vercel gebruiken

Als je lokaal in `.env.local` al alles hebt staan, kun je die **variabelnamen en waarden** overnemen naar Vercel.

### Stappen

1. Ga naar [vercel.com](https://vercel.com) → jouw project → **Settings** → **Environment Variables**.
2. Voeg voor **Production** (en eventueel Preview) deze variabelen toe. De **waarde** kopieer je uit je eigen `.env.local` (niet hier uit de docs):

| Naam | Waar je de waarde vandaan haalt |
|------|---------------------------------|
| `OPENAI_API_KEY` | Regel in .env.local met OPENAI_API_KEY=... |
| `OPENAI_MODEL` | Regel met OPENAI_MODEL=... (bijv. gpt-4o-mini) |
| `DATABASE_URL` | Regel met DATABASE_URL="..." (Neon connection string) |
| `SLACK_WEBHOOK_URL` | Regel met SLACK_WEBHOOK_URL=... |

3. Voor sessie/encryptie op Vercel heb je ook nodig (als je die nog niet hebt):
   - `SESSION_SECRET` of `NEXTAUTH_SECRET` – willekeurige lange string
   - `ENCRYPTION_KEY` – 32 bytes hex (bijv. gegenereerd met `openssl rand -hex 32`)

4. Klik op **Save** en voer daarna een **Redeploy** uit (Deployments → … bij laatste deploy → Redeploy).

Daarna gebruikt Vercel dezelfde configuratie als lokaal (met de waarden die jij in het dashboard plakt).

### Automatisch vanuit .env.local (CLI)

Je kunt de waarden uit `.env.local` in één keer naar Vercel pushen:

1. Zorg dat je bent ingelogd en het project gekoppeld hebt:
   ```bash
   npx vercel login
   npx vercel link
   ```
2. Voer het script uit (vanuit de projectmap):
   ```bash
   node scripts/push-env-to-vercel.js
   ```
3. Daarna opnieuw deployen:
   ```bash
   npx vercel --prod
   ```

Het script leest `.env.local` en zet `OPENAI_API_KEY`, `OPENAI_MODEL`, `DATABASE_URL`, `SLACK_WEBHOOK_URL` (en eventueel `SESSION_SECRET`, `NEXTAUTH_SECRET`, `ENCRYPTION_KEY`) op Vercel voor **Production**. Bestaande variabelen worden niet overschreven; die kun je in het Vercel-dashboard aanpassen of eerst daar verwijderen.
