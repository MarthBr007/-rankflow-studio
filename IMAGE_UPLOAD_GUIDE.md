# Image Upload & Social Media Post Generator - Handleiding

## 🎯 Overzicht

Je kunt nu **afbeeldingen uploaden** en deze gebruiken om **social media posts te genereren**. De AI zal de afbeelding analyseren en een relevante post maken op basis van wat er op de foto staat.

## ✅ Wat is geïmplementeerd?

### 1. **Image Upload Functionaliteit**
- Drag & drop upload
- Automatische image optimalisatie (resize, compressie)
- Ondersteunde formaten: JPEG, PNG, WebP, GIF
- Max bestandsgrootte: 10MB
- Images worden opgeslagen in `public/uploads/`

### 2. **Image Gallery**
- Overzicht van alle geüploade afbeeldingen
- Zoeken op bestandsnaam, alt tekst of tags
- Filteren op tags
- Selecteren van afbeeldingen voor posts
- Verwijderen van afbeeldingen

### 3. **Social Media Post Generator met Images**
- Selecteer een afbeelding voordat je een post genereert
- De AI analyseert de afbeelding en maakt een relevante post
- Posts worden automatisch gekoppeld aan de afbeelding
- Images worden getoond in de Social Media Planner

## 📋 Stap-voor-stap: Social Post met Afbeelding

### Stap 1: Ga naar Content Generator
1. Log in op de applicatie
2. Selecteer **"Social Media"** in de sidebar
3. Je ziet nu het content formulier

### Stap 2: Upload of Selecteer een Afbeelding
1. Scroll naar beneden naar de sectie **"Afbeelding selecteren (optioneel)"**
2. Je ziet een **Image Gallery** met:
   - Upload knop (drag & drop)
   - Overzicht van alle geüploade afbeeldingen
3. **Optie A: Upload nieuwe afbeelding**
   - Klik op de upload zone of sleep een bestand
   - Wacht tot upload klaar is
   - De afbeelding wordt automatisch geselecteerd
4. **Optie B: Selecteer bestaande afbeelding**
   - Klik op een afbeelding in de gallery
   - De afbeelding wordt geselecteerd (blauwe border)

### Stap 3: Vul Post Details In
1. **Onderwerp**: Bijv. "Glaswerk voor bruiloft"
2. **Platform**: Instagram of LinkedIn
3. **Regio's**: Optioneel (standaard Haarlem)

### Stap 4: Genereer Post
1. Klik op **"Genereer Content"**
2. De AI analyseert:
   - De geselecteerde afbeelding
   - Het onderwerp
   - De platform-specifieke regels
3. Wacht 1-2 minuten
4. Je krijgt 4 varianten:
   - Instagram Carousel
   - Instagram Reel
   - LinkedIn Post
   - Instagram Story

### Stap 5: Bekijk Resultaat
1. De gegenereerde posts worden getoond
2. De afbeelding is automatisch gekoppeld
3. Klik op **"Opslaan in Planner"** om posts op te slaan

### Stap 6: Bekijk in Planner
1. Ga naar **"Social Planner"** in de sidebar
2. Je ziet alle posts met afbeeldingen
3. Klik op een post om details te zien

## 🖼️ Image Management

### Uploaden
- **Formaten**: JPEG, PNG, WebP, GIF
- **Max grootte**: 10MB
- **Automatische optimalisatie**: 
  - Resize naar max 2000px (langste zijde)
  - JPEG compressie (85% kwaliteit)
  - Behouden van aspect ratio

### Organiseren
- **Tags**: Voeg tags toe aan afbeeldingen (via API of later via UI)
- **Alt tekst**: Voeg alt tekst toe voor SEO
- **Zoeken**: Zoek op bestandsnaam, alt tekst of tags

### Verwijderen
- Klik op het prullenbak icoon in de gallery
- Bevestig verwijdering
- Afbeelding wordt verwijderd uit database en filesystem

## 💡 Tips

### Tip 1: Kies Relevante Afbeeldingen
- Upload afbeeldingen die passen bij je merk/onderwerp
- Gebruik hoge kwaliteit afbeeldingen (worden automatisch geoptimaliseerd)
- Zorg voor goede belichting en compositie

### Tip 2: Gebruik Tags
- Tag afbeeldingen met relevante keywords
- Bijv. "servies", "bruiloft", "horeca"
- Dit maakt zoeken en filteren makkelijker

### Tip 3: Alt Tekst
- Voeg alt tekst toe voor SEO en toegankelijkheid
- Beschrijf wat er op de afbeelding staat
- Bijv. "Wit servies op houten tafel voor bruiloft"

### Tip 4: Meerdere Posts per Afbeelding
- Je kunt dezelfde afbeelding gebruiken voor meerdere posts
- Genereer verschillende varianten met verschillende onderwerpen

## 🔧 Technische Details

### Image Storage
- **Lokaal**: `public/uploads/` folder
- **Database**: Metadata in `UploadedImage` tabel
- **URL Format**: `/uploads/{timestamp}-{random}.{ext}`

### Image Processing
- **Library**: Sharp (Node.js image processing)
- **Resize**: Automatisch naar max 2000px
- **Format**: Geconverteerd naar JPEG (85% kwaliteit)
- **Metadata**: Width, height, size, mimeType opgeslagen

### Database Schema
```prisma
model UploadedImage {
  id             String   @id @default(cuid())
  organizationId String?
  filename       String
  originalName   String
  url            String
  mimeType       String
  size           Int
  width          Int?
  height         Int?
  alt            String?
  tags           String[]
  createdBy      String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

## ⚠️ Belangrijk

1. **Database Migratie**: Voer eerst de migratie uit:
   ```bash
   export DATABASE_URL="your-database-url"
   npx prisma migrate dev --name add_image_upload
   ```

2. **File Permissions**: Zorg dat de `public/uploads/` folder schrijfrechten heeft

3. **Production**: Voor productie, overweeg:
   - Cloud storage (S3, Cloudinary, etc.)
   - CDN voor snelle image delivery
   - Image optimization service

4. **Security**: 
   - Images worden gevalideerd op type en grootte
   - Alleen geautoriseerde gebruikers kunnen uploaden
   - Images zijn gekoppeld aan organizationId (multi-tenant)

## 🚀 Toekomstige Uitbreidingen

- [ ] Image editing (crop, resize, filters)
- [ ] Bulk upload
- [ ] Image templates
- [ ] AI image generation
- [ ] Cloud storage integratie
- [ ] Image CDN
- [ ] Advanced tagging UI
- [ ] Image search met AI

---

**Laatste update:** December 2025

