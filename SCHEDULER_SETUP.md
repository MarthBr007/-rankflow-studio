# Scheduler Service Setup

## 📋 Overzicht

De scheduler service controleert automatisch op geplande posts en publiceert ze op het juiste moment.

---

## 🔧 Setup Opties

### Optie 1: Vercel Cron Jobs (Aanbevolen voor Vercel)

Voeg toe aan `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/social-posts/scheduler",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

Dit roept de scheduler elke 5 minuten aan.

### Optie 2: External Cron Service

Gebruik een service zoals:
- **Cron-job.org** (gratis)
- **EasyCron** (gratis tier beschikbaar)
- **Uptime Robot** (gratis)

Configureer:
- **URL**: `https://your-domain.com/api/social-posts/scheduler`
- **Method**: GET
- **Headers**: `Authorization: Bearer YOUR_SCHEDULER_SECRET`
- **Schedule**: Elke 5 minuten

### Optie 3: Node.js Cron (Lokaal/Server)

Installeer `node-cron`:

```bash
npm install node-cron
```

Maak een `scheduler.js` bestand:

```javascript
const cron = require('node-cron');
const https = require('https');

const SCHEDULER_URL = process.env.SCHEDULER_URL || 'http://localhost:3000/api/social-posts/scheduler';
const SCHEDULER_SECRET = process.env.SCHEDULER_SECRET;

// Run elke 5 minuten
cron.schedule('*/5 * * * *', () => {
  const url = new URL(SCHEDULER_URL);
  
  const options = {
    hostname: url.hostname,
    port: url.port || (url.protocol === 'https:' ? 443 : 80),
    path: url.pathname,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${SCHEDULER_SECRET}`,
    },
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log(`Scheduler run: ${res.statusCode} - ${data}`);
    });
  });

  req.on('error', (error) => {
    console.error('Scheduler error:', error);
  });

  req.end();
});

console.log('Scheduler started - running every 5 minutes');
```

Run met:
```bash
node scheduler.js
```

---

## 🔐 Security

Voeg toe aan `.env.local`:

```bash
SCHEDULER_SECRET=your-random-secret-key-here
```

De scheduler endpoint controleert deze secret in de Authorization header.

---

## ✅ Testen

Test de scheduler handmatig:

```bash
curl -X GET "http://localhost:3000/api/social-posts/scheduler" \
  -H "Authorization: Bearer YOUR_SCHEDULER_SECRET"
```

Of in de browser (zonder auth, alleen als SCHEDULER_SECRET niet is gezet):
```
http://localhost:3000/api/social-posts/scheduler
```

---

## 📊 Monitoring

De scheduler retourneert:
```json
{
  "success": true,
  "message": "Verwerkt: 5, Succes: 4, Gefaald: 1",
  "results": {
    "processed": 5,
    "success": 4,
    "failed": 1,
    "errors": ["Post abc123: Geen afbeelding gevonden"]
  }
}
```

---

## ⚙️ Configuratie

### Interval Aanpassen

Standaard controleert de scheduler posts die binnen 5 minuten gepland zijn. Pas aan in `scheduler/route.ts`:

```typescript
const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
```

### Batch Size

Standaard verwerkt de scheduler max 50 posts per run. Pas aan:

```typescript
take: 50, // Verander dit getal
```

---

## 🐛 Troubleshooting

### Posts worden niet gepubliceerd
1. Check of scheduler draait (logs)
2. Check of posts `status: 'scheduled'` hebben
3. Check of `scheduledDate` in de toekomst ligt
4. Check of account gekoppeld is (`socialMediaAccountId`)

### "Unauthorized" error
- Zorg dat `SCHEDULER_SECRET` is gezet
- Zorg dat Authorization header correct is: `Bearer YOUR_SECRET`

### Posts blijven "scheduled"
- Check of scheduler endpoint wordt aangeroepen
- Check server logs voor errors
- Check of account tokens nog geldig zijn

---

## 📝 Logs

Voor productie, log scheduler runs:

```typescript
// In scheduler/route.ts
console.log(`Scheduler run at ${new Date().toISOString()}:`, {
  processed: results.processed,
  success: results.success,
  failed: results.failed,
});
```

