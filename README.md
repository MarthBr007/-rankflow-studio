# RankFlow Studio - AI Content Generatie Platform

Een krachtig Next.js platform voor het genereren van SEO-geoptimaliseerde content en social media posts met AI. Volledig white-label en multi-tenant ready.

## ✨ Features

### 🎯 Content Generatie
- **5 Content Types**: Blog, Product, Landing, Categorie, Social Media
- **Multi-AI Provider Support**: OpenAI, Anthropic (Claude), Google (Gemini)
- **Fast Mode**: 2-3x snellere generatie met geoptimaliseerde instellingen
- **Image Upload**: Upload afbeeldingen voor social media posts
- **SEO Optimalisatie**: Automatische SEO metadata, interne links, structured data
- **Content Previews**: Visuele previews voor alle content types

### 📅 Social Media Planner
- **Calendar View**: Maand/week overzicht van geplande posts
- **Bulk Actions**: Meerdere posts tegelijk beheren (delete, status wijzigen, export)
- **Post Previews**: Instagram Carousel, Reel, LinkedIn Post previews
- **Direct Posting**: Automatisch posten naar Instagram en LinkedIn
- **Scheduler**: Automatische posting op geplande tijden
- **Templates**: Herbruikbare social media templates

### 🏢 Multi-Tenant / White Label
- **Per-Tenant AI Configuratie**: Elke klant heeft eigen API key, model en provider
- **Custom Prompts**: Per tenant eigen schrijfstijl en tone of voice
- **Access Control**: Role-based permissions (viewer, editor, admin)
- **Tenant Management**: Beheer meerdere klanten/organisaties

### 📚 Content Library
- **Versiebeheer**: Volledige versiegeschiedenis van alle content
- **Status Management**: Draft, Review, Approved workflow
- **Tags & Filtering**: Organiseer content met tags en filters
- **Diff View**: Vergelijk verschillende versies
- **Export**: JSON, Markdown, WordPress, Webflow export

### 📊 Analytics & Logging
- **Generation Logs**: Track alle content generaties
- **Token Usage**: Monitor AI token verbruik
- **Performance Metrics**: Generatie tijden en success rates
- **Social Media Analytics**: Post statistieken (binnenkort)

### 🔔 Integraties
- **Slack Webhooks**: Volledige content notificaties in Slack
- **Instagram API**: Direct posten naar Instagram Business accounts
- **LinkedIn API**: Direct posten naar LinkedIn pages
- **Webhook Support**: Custom webhooks voor externe systemen

### ⚙️ Advanced Features
- **Prompt Management**: Beheer en versiebeheer van AI prompts
- **SEO Rules**: Configureerbare SEO richtlijnen
- **User Management**: Beheer gebruikers en rollen
- **Profile Management**: Wachtwoord wijzigen, profiel bewerken
- **Real-time Collaboration**: Live presence indicators

## 🚀 Quick Start

### Installatie

```bash
# Clone repository
git clone <repository-url>
cd content-bot

# Installeer dependencies
npm install

# Setup database
npx prisma generate
npx prisma db push

# Maak admin gebruiker
node scripts/create-admin.js
```

### Environment Variables

Maak een `.env.local` bestand:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/rankflow"

# Session Security (NIEUW - vereist!)
SESSION_SECRET="your-very-long-random-secret-key-min-32-chars"
# Of gebruik NEXTAUTH_SECRET als fallback
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Encryption (vereist)
ENCRYPTION_KEY="your-32-byte-encryption-key"

# AI Providers (optioneel - kan ook via UI worden ingesteld)
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
GOOGLE_API_KEY="..."

# Social Media Integrations (optioneel)
META_APP_ID="..."
META_APP_SECRET="..."
LINKEDIN_CLIENT_ID="..."
LINKEDIN_CLIENT_SECRET="..."

# Slack (optioneel)
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/..."

# Pusher (voor real-time features)
PUSHER_APP_ID="..."
PUSHER_KEY="..."
PUSHER_SECRET="..."
PUSHER_CLUSTER="eu"
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in je browser.

## 📖 Documentatie

- **[USER_GUIDE.md](./USER_GUIDE.md)** - Volledige gebruikershandleiding
- **[API_KEYS_GUIDE.md](./API_KEYS_GUIDE.md)** - Hoe API keys aanmaken
- **[SOCIAL_MEDIA_SETUP.md](./SOCIAL_MEDIA_SETUP.md)** - Instagram & LinkedIn setup
- **[SCHEDULER_SETUP.md](./SCHEDULER_SETUP.md)** - Automatische posting setup
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment instructies
- **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** - Database setup

## 🏗️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL met Prisma ORM
- **Authentication**: NextAuth.js
- **AI Providers**: OpenAI, Anthropic, Google
- **Styling**: CSS Modules
- **Real-time**: Pusher
- **Image Processing**: Sharp
- **Type Safety**: TypeScript

## 📁 Project Structuur

```
app/
  ├── api/                    # API routes
  │   ├── generate/          # Content generatie
  │   ├── social-posts/      # Social media posts
  │   ├── social-auth/       # OAuth integraties
  │   ├── config/            # AI configuratie
  │   └── ...
  ├── components/             # React components
  │   ├── ContentForm.tsx    # Content generatie formulier
  │   ├── ContentResult.tsx  # Resultaat weergave
  │   ├── CalendarView.tsx   # Calendar view
  │   └── ...
  ├── planner/               # Social media planner
  ├── library/               # Content library
  ├── settings/              # Settings pagina
  └── ...
```

## 🎯 Content Types

### 1. Blog
- **Input**: Titel, onderwerp, doelgroep, regio's
- **Output**: Complete blog artikel (1500-2200 woorden) met SEO metadata, secties, FAQ's, interne links

### 2. Product
- **Input**: Productnaam, categorie, use case, doelgroep
- **Output**: Product pagina met SEO titel, meta, H1, beschrijving, voordelen, CTA

### 3. Landing
- **Input**: Onderwerp, doelgroep, tone of voice
- **Output**: Landing pagina met body blocks, FAQ's, scenario's

### 4. Categorie
- **Input**: Categorie naam, beschrijving
- **Output**: Categorie pagina met intro, voordelen, gebruikssituaties

### 5. Social Media
- **Input**: Platform (Instagram/LinkedIn), onderwerp, afbeelding (optioneel)
- **Output**: Social media post met optimale lengte voor het platform, hashtags, CTA

## 🔐 Rollen & Permissions

- **Viewer**: Content genereren, bekijken, opslaan
- **Editor**: Alles van Viewer + content bewerken, status wijzigen, tags bewerken
- **Admin**: Alles + prompts bewerken, gebruikers beheren, instellingen wijzigen

## 🚀 Deployment

Zie [DEPLOYMENT.md](./DEPLOYMENT.md) voor gedetailleerde deployment instructies.

## 📝 License

Proprietary - Alle rechten voorbehouden

## 🤝 Support

Voor vragen of problemen, raadpleeg de [USER_GUIDE.md](./USER_GUIDE.md) of neem contact op met je admin.

---

**Laatste update:** Januari 2025
