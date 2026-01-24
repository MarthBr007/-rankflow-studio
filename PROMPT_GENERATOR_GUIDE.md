# Automatische Prompt Generator - Handleiding

## 🎯 Wat is het?

De automatische prompt generator maakt het mogelijk om **automatisch uitgebreide prompts te genereren** op basis van bedrijfsinformatie. In plaats van handmatig prompts te schrijven, vul je een formulier in en genereert het systeem prompts met dezelfde kwaliteit als de Broers Verhuur prompts.

## ✅ Wat is aangepast?

### 1. **Toegankelijk voor alle gebruikers**
- **Voorheen**: Alleen admins konden prompts genereren
- **Nu**: Alle gebruikers kunnen prompts genereren voor tenants waar ze toegang toe hebben

### 2. **Toegangscontrole**
- Gebruikers zien alleen tenants waar ze toegang toe hebben
- Globale admins zien alle tenants
- Gebruikers kunnen alleen prompts genereren voor tenants waar ze edit/admin rechten hebben

### 3. **Nieuwe tenant aanmaken**
- Gebruikers kunnen een nieuwe tenant ID invoeren
- Prompts worden gegenereerd voor die tenant
- Tenant wordt automatisch aangemaakt (zonder API key - die kan later worden toegevoegd)

## 📋 Stap-voor-stap: Prompts genereren

### Stap 1: Ga naar Settings → Prompts
1. Log in op de applicatie
2. Ga naar **Settings** in de sidebar
3. Klik op de tab **"Basis Instructie"** of een andere prompt tab
4. Je ziet nu de **"Automatische Prompt Generator"** sectie bovenaan

### Stap 2: Open het intake formulier
1. Klik op **"Toon Intake Formulier"**
2. Het formulier wordt uitgevouwen

### Stap 3: Selecteer of maak een tenant
**Optie A: Bestaande tenant selecteren**
- Kies een tenant uit de dropdown
- Je ziet alleen tenants waar je toegang toe hebt

**Optie B: Nieuwe tenant aanmaken**
- Voer een nieuwe tenant ID in (bijv. `mijn-bedrijf`)
- Deze tenant wordt automatisch aangemaakt

### Stap 4: Vul bedrijfsinformatie in

**Verplichte velden:**
- **Bedrijfsnaam** (verplicht)

**Optionele velden (maar aanbevolen):**
- **Branche / Type Bedrijf**: Bijv. "Verhuurbedrijf voor evenementen en horeca"
- **Tone of Voice**: Bijv. "Vriendelijk, praktisch, servicegericht, inspirerend. Geen marketingtaal."
- **Regio's**: Bijv. "Haarlem, Amsterdam, Hoofddorp"
- **Producten / Diensten**: Bijv. "Servies, glazen, tafelkleden, statafels"
- **Doelgroep**: Bijv. "Particulieren en bedrijven die evenementen organiseren"
- **Merkwaarden**: Bijv. "Servicegericht, praktisch, betrouwbaar, lokaal"
- **Te Vermijden Woorden**: Bijv. "premium, ultiem, beste, unieke beleving"
- **Te Benadrukken Woorden**: Bijv. "makkelijk, zonder gedoe, direct, wij regelen"
- **Servicebeloftes**: Bijv. "Wij leveren alles schoon en klaar voor gebruik. Wij doen de afwas na afloop."
- **Scenario's**: Bijv. "diner thuis, tuinfeest, borrel op kantoor, bruiloft"
- **Website URL**: Bijv. "https://www.example.nl"
- **Social Media**: Bijv. "https://www.instagram.com/example"

### Stap 5: Genereer prompts
1. Klik op **"Genereer Prompts"**
2. Wacht 1-2 minuten (het systeem gebruikt AI om prompts te genereren)
3. Je krijgt een bevestiging wanneer het klaar is

### Stap 6: Prompts zijn klaar!
- De prompts worden automatisch opgeslagen voor de geselecteerde tenant
- Je kunt ze nu gebruiken voor content generatie
- Je kunt ze ook handmatig aanpassen in de prompt editor

## 🔐 Toegangscontrole

### Wie kan prompts genereren?
- **Alle ingelogde gebruikers** kunnen prompts genereren
- **Niet-ingelogde gebruikers** kunnen dit niet

### Voor welke tenants?
- **Globale admins**: Alle tenants
- **Normale gebruikers**: Alleen tenants waar ze toegang toe hebben (via TenantUser model)
- **Nieuwe tenants**: Gebruikers kunnen een nieuwe tenant ID invoeren, maar moeten wel toegang hebben om prompts te genereren

### Rechten nodig:
- **Editor** of **Admin** rol voor de tenant (om prompts te kunnen bewerken/genereren)
- **Viewer** rol is niet genoeg (alleen lezen)

## 💡 Tips

### Tip 1: Wees specifiek
Hoe meer informatie je invult, hoe beter de gegenereerde prompts. Bijvoorbeeld:
- Specifieke tone of voice beschrijving
- Concrete producten/diensten
- Duidelijke servicebeloftes

### Tip 2: Gebruik voorbeelden
Kijk naar de Broers Verhuur prompts als voorbeeld voor de kwaliteit die je kunt verwachten.

### Tip 3: Test en pas aan
Na generatie kun je de prompts altijd handmatig aanpassen in de prompt editor.

### Tip 4: Tenant eerst aanmaken
Voor de beste ervaring:
1. Maak eerst de tenant aan (Settings → White Label Tenant)
2. Voeg API key toe
3. Genereer dan prompts

## 📦 Social Engine module (RankFlow Studio)
Gebruik deze module-instructie in je social prompt zodat de AI automatisch contenttype, timing, hashtags en Broers-stijl toepast.

### Basis instructie
```
🔵 SOCIAL ENGINE — BASIS INSTRUCTIE

Jij genereert social media content voor Broers Verhuur en RankFlow Studio.

Gebruik altijd:
- dezelfde tone of voice als in de SEO-engine
- korte, duidelijke zinnen
- inspiratie + advies + informatie
- scenario’s zoals: 21 diner, tuinfeest, congres, borrel op kantoor, feestdagen, bruiloft
- concrete materialen: servies, glaswerk, tafels, statafels, verlichting, bloemstukken

De Social Engine moet automatisch bepalen:
- het beste contenttype (Reel / Carrousel / Single Post / LinkedIn)
- het beste postmoment
- de juiste hashtagset
- de caption in Broers-stijl
- een CTA
- of er een visuele hook nodig is (voor Reels & Carrousels)
```

### Post timing logica
- Instagram: 07:30–09:00 (woon-werk), 12:00–13:30 (lunch), 19:30–21:00 (avond scroll)
- LinkedIn: 07:30–09:30, 11:30–13:30, beste dagen: di/wo/do

### Contenttype logica
- **Reel**: iets beweegt, voor/na, 3–5 bullets uitleg, behind the scenes
- **Carrousel**: uitleg, tips, checklists, stappenplannen, scenario’s (bv. 21-diner)
- **Single Image**: sfeerfoto, mooi gedekte tafel, testimonial
- **LinkedIn tekstpost**: case study, procesverbetering, ondernemerslessen, AI/RankFlow/automatisering

### Hashtag logica
- Instagram: 8–15 hashtags; verdeling groot(3) / middel(5) / niche(5) / branded(2)
- LinkedIn: max 5 hashtags; niche + professioneel; geen generieke (#business #love)

### Output JSON schema
```
{
  "platform": "instagram | linkedin",
  "bestTimeToPost": "07:30",
  "contentType": "reel | carousel | single_image | linkedin_post",
  "hook": "string met sterke eerste zin",
  "caption": "volledige caption in Broers-stijl",
  "hashtags": ["#h1", "#h2", "..."],
  "cta": "korte actie zin",
  "visualInstructions": "uitleg aan ontwerp: wat moet er in beeld komen",
  "scenarioDetected": "bijv. tuinfeest, 21 diner, bruiloft",
  "imageSuggestions": ["glazen op tafel", "bloemstuk", "21-diner setting"],
  "postNotes": "advies waarom dit format gekozen is"
}
```

### Extra slimme regels
- Caption structuur: Hook → korte uitleg → waarde (tips/advies/scenario) → soft CTA
- Always Saveable Content: elke post lost iets op, legt iets uit of inspireert
- Geen saaie verhuurposts: beantwoord “Hoe helpt dit de organisator van een feest?”
- Maximaal 2 regels per zin voor mobiele leesbaarheid

## ⚠️ Belangrijk

1. **AI API Key nodig**: Het systeem gebruikt de standaard AI configuratie om prompts te genereren. Zorg dat er een API key is ingesteld (Settings → AI Configuratie).

2. **Tenant toegang**: Als je een nieuwe tenant ID invoert, moet je er wel toegang toe hebben om prompts te kunnen genereren. Als je geen toegang hebt, vraag een admin om je toe te voegen aan de tenant.

3. **Kosten**: Prompt generatie gebruikt AI credits. Elke generatie kost ongeveer $0.10-0.50 (afhankelijk van model).

4. **Tijd**: Prompt generatie duurt 1-2 minuten. Wees geduldig!

## 🎓 Voorbeeld Workflow

**Scenario: Nieuwe klant aanmelden**

1. **Admin maakt tenant aan:**
   - Settings → White Label Tenant
   - Tenant ID: `klant-abc`
   - API Key: (van klant)
   - Model: `gpt-5`
   - Provider: `OpenAI`

2. **Admin voegt gebruiker toe:**
   - Settings → Tenant Management
   - Voeg gebruiker toe met rol "editor" of "admin"

3. **Gebruiker genereert prompts:**
   - Settings → Prompts
   - Selecteer tenant `klant-abc`
   - Vul bedrijfsinformatie in
   - Klik "Genereer Prompts"
   - Wacht 1-2 minuten

4. **Gebruiker test prompts:**
   - Homepage → Selecteer tenant `klant-abc`
   - Genereer content
   - Controleer of prompts correct werken

5. **Aanpassen indien nodig:**
   - Settings → Prompts
   - Selecteer tenant
   - Pas prompts handmatig aan

## ❓ Veelgestelde Vragen

**Q: Kan ik prompts genereren zonder tenant?**
A: Nee, je moet een tenant ID opgeven. Je kunt "global" niet gebruiken voor prompt generatie.

**Q: Wat als ik geen toegang heb tot een tenant?**
A: Vraag een admin om je toe te voegen aan de tenant met rol "editor" of "admin".

**Q: Kan ik prompts genereren voor meerdere tenants?**
A: Ja, maar je moet dit één voor één doen. Selecteer een tenant, genereer prompts, selecteer volgende tenant, etc.

**Q: Wat als de gegenereerde prompts niet goed zijn?**
A: Je kunt ze altijd handmatig aanpassen in de prompt editor. De gegenereerde prompts zijn een startpunt.

**Q: Kan ik prompts opnieuw genereren?**
A: Ja, je kunt opnieuw prompts genereren voor dezelfde tenant. Dit maakt een nieuwe versie aan.

---

**Laatste update:** December 2025

