# Broers Verhuur - SEO Content Generator

Een Next.js applicatie voor het genereren van SEO-geoptimaliseerde content voor Broers Verhuur.

## Installatie

```bash
npm install
```

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in je browser.

## AI Provider Configuratie (OpenAI ChatGPT)

De applicatie is geconfigureerd om OpenAI's ChatGPT API te gebruiken.

### Stap 1: Maak een `.env.local` bestand

Maak een bestand genaamd `.env.local` in de root van het project:

```bash
# OpenAI API Configuration
OPENAI_API_KEY=sk-proj-je-api-key-hier

# Optioneel: Kies het model (default is gpt-4o-mini)
# Opties: gpt-4o-mini (goedkoper, snel), gpt-4o (beter, duurder), gpt-4-turbo
OPENAI_MODEL=gpt-4o-mini
```

### Stap 2: Haal je OpenAI API key op

1. Ga naar [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Log in met je OpenAI account
3. Klik op "Create new secret key"
4. Kopieer de key en plak deze in je `.env.local` bestand

### Stap 3: Kies een model (optioneel)

- **gpt-4o-mini** (default): Goedkoper en snel, prima voor SEO teksten
- **gpt-4o**: Beter kwaliteit, maar duurder
- **gpt-4-turbo**: Goede balans tussen kwaliteit en snelheid

De `callAi` functie in `app/api/generate/route.ts` is al geïmplementeerd en gebruikt automatisch je API key uit `.env.local`.

## Content Types

De applicatie ondersteunt 5 content types:

1. **Product** - Productteksten met SEO titel, meta description, H1, beschrijvingen en CTA
2. **Categorie** - Categoriepagina's met intro, voordelen en gebruikssituaties
3. **Landing** - Landingspagina's met body blocks en FAQ
4. **Blog** - Blogartikelen met secties
5. **Social** - Social media posts voor Instagram of LinkedIn

## Structuur

```
app/
  ├── api/
  │   └── generate/
  │       └── route.ts          # API endpoint voor content generatie
  ├── components/
  │   ├── ContentForm.tsx       # Formulier component
  │   ├── ContentResult.tsx     # Resultaat weergave
  │   └── CopyButton.tsx          # Kopieer functionaliteit
  ├── page.tsx                  # Hoofdpagina
  ├── layout.tsx                # Root layout
  └── globals.css               # Styling
```

