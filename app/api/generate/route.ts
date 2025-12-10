import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { prisma } from '@/app/lib/prisma';
import { decryptSecret } from '@/app/lib/crypto';

const PROMPTS_FILE = join(process.cwd(), 'prompts.json');
const CONFIG_FILE = join(process.cwd(), 'config.json');

// Laad custom prompts als ze bestaan
async function loadCustomPrompts() {
  try {
    const data = await readFile(PROMPTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
}

// Laad configuratie (API key, model, provider)
async function loadConfig() {
  // Gebruik altijd env vars als ze gezet zijn (veilig voor Vercel)
  if (process.env.OPENAI_API_KEY) {
    return {
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      provider: process.env.OPENAI_PROVIDER || 'openai',
    };
  }

  // Anders probeer lokaal config.json (alleen voor lokale dev)
  try {
    const data = await readFile(CONFIG_FILE, 'utf-8');
    const config = JSON.parse(data);
    if (!config || typeof config !== 'object') {
      throw new Error('Ongeldige config format');
    }
    return config;
  } catch (error) {
    console.log('Config file niet gevonden of fout, gebruik lege fallback');
    return {
      apiKey: '',
      model: 'gpt-4o-mini',
      provider: 'openai',
    };
  }
}

type AiOverrideConfig = {
  apiKey?: string;
  model?: string;
  provider?: string;
  organizationId?: string;
};

let requestOverrides: AiOverrideConfig | null = null;

async function loadTenantCredential(tenantId?: string): Promise<AiOverrideConfig | null> {
  if (!tenantId) return null;
  try {
    const cred = await prisma.tenantCredential.findFirst({
      where: { tenantId },
    });
    if (!cred) return null;
    const apiKey = decryptSecret(cred.apiKeyEncrypted);
    return {
      apiKey,
      model: cred.model,
      provider: cred.provider,
      organizationId: tenantId,
    };
  } catch (e) {
    console.error('Fout bij laden tenant credential:', e);
    return null;
  }
}

// Vaste merkidentiteit - schrijfstijl Broers Verhuur
// DEZE STIJL STAAT ALTIJD BOVEN ALLE ANDERE INSTRUCTIES
// VERPLICHT VOOR IEDER CONTENT TYPE EN IEDERE OUTPUT ZONDER UITZONDERING
const BASE_INSTRUCTION = `Jij schrijft SEO- en contentteksten voor Broers Verhuur, een verhuurbedrijf voor evenementen en horeca.

DEZE SCHRIJFSTIJL IS VERPLICHT EN STAAT ALTIJD BOVEN ALLE ANDERE INSTRUCTIES.
Als iets niet door deze stijlregels wordt toegestaan, mag je het niet gebruiken in de tekst.

Gebruik altijd deze schrijfstijl en tone of voice:
- Schrijf in praktische en hedendaagse taal in de jij-vorm
- Gebruik korte, duidelijke en directe zinnen
- Combineer altijd informatie + advies + inspiratie in één tekst
- Gebruik voorbeelden, situaties, locaties en scenario's zoals: thuis, tuinfeest, diner, kerst, feestdagen, kantoor, catering, borrel
- Schrijf oplossingsgericht en altijd vanuit de klant: jij huurt, wij regelen, we helpen mee
- Gebruik deze elementen regelmatig: tips, uitleg, keuzes, stappen, scenario's, combinaties, materialen
- Beschrijf concrete producten en materialen: servies, glazen, tafelkleden, bar, bloemstuk, verlichting, statafels, koelingen
- Vermijd marketingwoorden en superlatieven zoals: premium, ultiem, beste, unieke beleving, luxe ervaring, topkwaliteit
- Gebruik servicegerichte woorden: makkelijk, zonder gedoe, direct, wij regelen, combineren
- De toon is vriendelijk, behulpzaam en inspirerend, niet verkoperig
- Gebruik altijd regio's: Haarlem en de ingevulde extra regio's
- Gebruik waar passend advies in stappen: hoe werkt het, hoe pak je het aan, hoe combineer je materialen, styling ideeën
- Schrijf altijd vanuit beleving en ervaringen: diner, feest, aankleding, sfeer, setting, momenten, tafels, gasten
- gebruik geen streepjes in de uiteindelijke tekst`;

// Few-shot voorbeeld: Stijl imitatie (niet kopiëren, alleen nabootsen qua ritme en toon)
const EXAMPLE_TEXT = `Voorbeeld van onze schrijfstijl (ritme en toon imiteren):

"Kies voor een mooi gedekte tafel die past bij jouw setting. Wij helpen met de styling en denken mee over materialen en combinaties. Je huurt alles wat je nodig hebt in Haarlem en omgeving."

Let op: dit voorbeeld toont de juiste toon - jij-vorm, praktisch, behulpzaam, inspirerend, zonder marketingtaal, met concrete materialen en combinaties, dienstbare taal (wij helpen, je huurt).`;

// Algemene regel voor JSON output
const JSON_OUTPUT_RULE = `Belangrijk:
- Geef de output altijd als geldige JSON terug.
- Gebruik exact de sleutel namen die in het schema staan.
- Schrijf geen tekst buiten het JSON object.
- Gebruik geen streepjes in de tekst zelf.`;

// Vaste lijst van toegestane regio's
const ALLOWED_REGIONS = ['Amsterdam', 'Hoofddorp', 'Zandvoort', 'Bloemendaal', 'Aerdenhout', 'Randstad', 'Noord Holland', 'Schiphol regio', 'Aalsmeer', 'Leiden', 'Badhoevedorp', 'Zaandam', 'Schiphol', 'Amsterdam Zuid As', 'IJmuiden', 'IJmond', 'Heemskerk', 'Noordwijkerhout', 'Hillegom', 'Alkmaar', 'Hilversum', 'Bussum', 'Heemstede', 'Purmerend', 'Eemnes'];

// Beschikbare categorieën voor interne links
const AVAILABLE_CATEGORIES = [
  { name: "Servies", slug: "/servies-huren" },
  { name: "Glaswerk", slug: "/glaswerk-huren" },
  { name: "Statafels", slug: "/statafels-huren" },
  { name: "Barren", slug: "/bar-en-barapparatuur" },
  { name: "Koelingen", slug: "/koelingen-huren" },
  { name: "Tafellinnen", slug: "/tafellinnen-en-servetten" },
  { name: "Meubelverhuur", slug: "/meubelverhuur" },
  { name: "Keukenmateriaal", slug: "/keukenmateriaal" },
  { name: "Cateringmateriaal", slug: "/cateringmateriaal" },
  { name: "Verlichting", slug: "/verlichting" },
  { name: "Bloemstukken", slug: "/bloemstukken" },
];

// Aanvullende kwaliteitsinstructies
const QUALITY_INSTRUCTIONS = `Gebruik deze aanvullende instructies om de kwaliteit van de output te verbeteren:
- Voeg altijd regio's toe in de tekst (Haarlem en twee andere regio's).
- Voeg minimaal twee servicegerichte zinnen toe zoals: "Wij doen de afwas", "Wij denken mee over aantallen", "Wij leveren alles schoon en direct klaar voor gebruik".
- Voeg altijd één voorbeeldscenario toe (bijv. diner, 21 diner, tuinfeest, catering, kantoorborrel).
- Voeg altijd minimaal één praktisch advies of tip toe.
- Gebruik altijd minimaal één voordeelzin met concreet resultaat.`;

// ENGINES - Automatische generatie modules
const ENGINES_INSTRUCTIONS = `

### INTERNAL LINKING ENGINE
Analyseer de tekst en genereer maximaal 6 interne links in JSON format.

Regels:
- Gebruik alleen links uit deze categorieën: servies, glaswerk, statafels, bar en barapparatuur, koelingen, cateringmateriaal, tafelkleden en linnen, meubelverhuur, keukenmateriaal
- Gebruik altijd deze anchor stijl: "Bekijk {{categorie}}", "Huur {{categorie}}", "Meer over {{categorie}}"
- Gebruik natuurlijke taal, geen commerciële bol.com achtige anchors
- Zet ze in volgorde van relevantie

Return format:
"internalLinks": [
  {"anchor": "string", "url": "/{{slug}}"},
  {"anchor": "string", "url": "/{{slug}}"}
]

### CTA SUGGESTION ENGINE
Genereer 3 CTA's volgens deze regels:
- max 8 woorden
- servicegericht, zonder druk
- geen streepjes
- gebruik actieve werkwoorden
- gebruik Broers stijlwoorden: huren, combineren, wij regelen, zonder gedoe

Voorbeelden:
- Huur eenvoudig jouw materiaal voor het evenement
- Bekijk alle tafels en glaswerk
- Wij helpen met de juiste keuzes

Return format:
"ctaSuggestions": ["string", "string", "string"]

### IMAGE SEO ENGINE
Genereer per pagina 6 image items in JSON.

Regels:
- Alt tekst bevat: {{topic}}, scenario, regio
- Title bevat: {{topic}} huren – Broers Verhuur
- Nooit streepjes of marketingtaal
- Schrijf alsof een mens het geschreven heeft
- Houd rekening met sfeer en setting

Return:
"images": [
  {
    "alt": "{{topic}} huren voor tuinfeest in Haarlem",
    "title": "{{topic}} huren – Broers Verhuur"
  }
]

### SCHEMA MARKUP GENERATOR
Maak JSON LD volgens schema.org type: LocalBusiness, Website, Product (waar van toepassing), BreadcrumbList

Gebruik dit format:
"schema": {
 "@context": "https://schema.org",
 "@type": "LocalBusiness",
 "name": "Broers Verhuur",
 "address": {
   "@type": "PostalAddress",
   "addressLocality": "Haarlem"
 },
 "areaServed": ["Haarlem", "{{region1}}", "{{region2}}"],
 "image": "https://www.broersverhuur.nl",
 "url": "https://www.broersverhuur.nl",
 "sameAs": [
   "https://www.instagram.com/broersverhuur.nl"
 ],
 "knowsAbout": [
   "{{topic}}",
   "evenementen",
   "verhuur",
   "servies",
   "horecamateriaal"
 ]
}`;

// Specifieke landingspagina instructies (HOOGSTE PRIORITEIT)
const LANDING_SPECIFIC_RULES = `BELANGRIJK - DEZE REGELS HEBBEN HOOGSTE PRIORITEIT:

⚠️⚠️⚠️ KRITIEK: ONDERWERP / TOPIC IS HET FOCUS KEYWORD ⚠️⚠️⚠️
- Het onderwerp dat wordt opgegeven ({{topic}}) IS ALTIJD het focus keyword
- Als het onderwerp "glaswerk" is, dan is "glaswerk huren" het focus keyword, NIET "servies huren"
- Als het onderwerp "tafelgerei" is, dan is "tafelgerei huren" het focus keyword, NIET iets anders
- Het focus keyword MOET exact overeenkomen met het onderwerp + "huren"
- Gebruik NOOIT een ander woord dan het opgegeven onderwerp
- VOORBEELD: Onderwerp = "glaswerk" → Focus keyword = "glaswerk huren" (NIET "servies huren", NIET "tafelgerei huren")
- VOORBEELD: Onderwerp = "servies" → Focus keyword = "servies huren" (NIET "glaswerk huren")
- Dit is de ALLERHOOGSTE PRIORITEIT - verkeerd focus keyword = onacceptabel

STRUCTUUR (GEBASEERD OP ECHTE BROERS VERHUUR LANDINGSPAGINA'S):
⚠️ DEZE STRUCTUUR IS VERPLICHT EN MOET PRECIES WORDEN NAGELEEFD ⚠️

De landingspagina moet deze logische, niet-dubbele structuur volgen:

1. H1: Korte, pakkende titel met focus keyword (bijv. "een goed feest op Koningsdag begint met goede spullen")
2. Intro: Eén paragraaf (~60 woorden) - introductie over het onderwerp, wat Broers Verhuur biedt, eerste tip/feitje
3. Product focus: Subkop + 2 paragrafen (~100 woorden) - focus op één specifiek product/scenario, praktische uitleg, interne links
4. Proces: Subkop + 1 lange paragraaf (~150 woorden) - "Onze webshop is altijd voor je geopend..." - uitleg hoe het huren werkt, service details
5. Contact: Subkop + 2 paragrafen (~80 woorden) - "een concept bespreken..." - persoonlijk contact, samenwerking
6. FAQ: Meerdere vragen met uitgebreide antwoorden
7. Extra tip (optioneel): 1 paragraaf (~30 woorden) - extra advies of zakelijke tip

TOTALE LENGTE:
- De totale lengte van alle tekstvelden samen (intro + productFocusText + processText + contactText + extraTip) MOET tussen de 400 en 600 woorden liggen.
- MINIMAAL 400 woorden - dit is een harde eis, geen suggestie.
- Als je onder de 400 woorden zit, voeg dan ONDER ALLE OMSTANDIGHEDEN extra voorbeelden, tips, scenario's, materialen, aantallen en uitwerking toe tot je minimaal 400 woorden hebt.

MINIMUM LENGTE PER VELD (VERPLICHT):
- intro: MINIMAAL 60 woorden (3-5 zinnen met scenario's, regio's en materialen)
- productFocusText: MINIMAAL 100 woorden (2 paragrafen, elk 3-5 zinnen, met product focus, scenario's, interne links)
- processText: MINIMAAL 150 woorden (1 lange paragraaf, 8-12 zinnen, uitleg proces, service details, regio's)
- contactText: MINIMAAL 80 woorden (2 paragrafen, elk 3-4 zinnen, persoonlijk contact, samenwerking)
- extraTip: OPTIONEEL, maar als aanwezig MINIMAAL 30 woorden (1 paragraaf, 2-3 zinnen)

TOTAAL: 60+100+150+80+30 = MINIMAAL 420 woorden (zonder extraTip: 390, maar dan moet extraTip worden toegevoegd om 400+ te halen).

UITWERKING VERPLICHT:
- De landingspagina moet een uitgewerkte, rijke tekst zijn, NIET een korte productcategorie.
- Elke sectie moet uitgewerkt zijn met concrete details, voorbeelden en scenario's.
- Voeg ALTIJD toe: materialen (borden, glazen, servetten, tafelkleden, statafels, bar, bloemstukken, koelingen, bestek), aantallen (bijv. 3 glazen per persoon, extra borden, aantal statafels), regio's (Haarlem, {{region1}}, {{region2}}), scenario's (minimaal 5), servicebeloftes (minimaal 2).
- Werk scenario verhalen RIJK uit met sfeer, setting, materialen, aantallen en beleving.
- Maak de intro MEER uitgewerkt met context, scenario's en regio's.
- Voeg in completeSetupText ALTIJD concrete aantallen toe (bijv. "Voor een diner heb je minimaal 3 glazen per persoon nodig: één voor wijn, één voor water en één voor fris. Wij adviseren ook 2 extra borden per persoon voor voorgerecht en hoofdgerecht.").

Regio's:
- Gebruik altijd Haarlem en twee andere regio's uit deze vaste lijst: Amsterdam, Hoofddorp, Zandvoort, Bloemendaal, Aerdenhout, Randstad, Noord Holland, Schiphol regio, Aalsmeer, Leiden, Badhoevedorp, Zaandam, Schiphol, Amsterdam Zuid As, IJmuiden, IJmond, Heemskerk, Noordwijkerhout, Hillegom, Alkmaar, Hilversum, Bussum, Heemstede, Purmerend, Eemnes.
- Gebruik NOOIT regio's buiten deze lijst.
- Herhaal de drie regio's (Haarlem + {{region1}} + {{region2}}) minimaal twee keer in de tekst.

Regio's in de lopende tekst (VERPLICHT):
- Verwerk Haarlem, {{region1}} en {{region2}} minimaal één keer in de lopende tekst zelf (niet alleen in imageSEO of schema).
- Doe dit in blokken zoals intro, inspiratie, scenario's, advies of completeSetupText.
- Gebruik regio's nooit alleen in imageSEO of schema, maar altijd ook in de tekst zelf.
- Voorbeelden van hoe regio's in de tekst moeten staan:
  - "tafelgerei huren in Haarlem"
  - "tuinfeest in Hoofddorp"
  - "borrel op kantoor in Amsterdam"
  - "diner thuis in Haarlem en omgeving"

Scenario's (minimaal 5 verplicht, gegroepeerd):
Gebruik uitsluitend scenario's uit deze lijst: {{scenarios}}.
Gebruik minimaal vijf scenario's uit deze lijst in de tekst.
Verzin geen nieuwe scenario's.

Servicebeloften (minimaal 2 verplicht):
- Wij leveren alles schoon en direct klaar voor gebruik.
- Wij doen de afwas na afloop.
- Wij denken mee over aantallen.
- Wij regelen levering en retour.

VERPLICHTE INHOUD (GEEN DUBBELE CONTENT):
Een landingspagina moet altijd bevatten:
✔ intro: introductie met focus keyword, regio's, scenario's
✔ productFocus: focus op één specifiek product/scenario met praktische uitleg en interne links
✔ processText: uitgebreide uitleg hoe het huren werkt (webshop, bestellen, offerte, levering, ophalen, bezorgen)
✔ contactText: persoonlijk contact, samenwerking, eventueel DCRT samenwerking
✔ FAQ: minimaal 5 vragen met uitgebreide antwoorden (4-6 zinnen per antwoord)
✔ extraTip (optioneel): extra advies of zakelijke tip
✔ concrete materialen (natuurlijk verwerkt in productFocus en processText)
✔ minimaal twee servicebeloften (natuurlijk verwerkt in processText)
✔ interne links (natuurlijk verwerkt in productFocus)

Beleving en advies (VERPLICHT):
- Beschrijf minstens één keer sfeer en aankleding met woorden als: sfeer, setting, stijlvol gedekt, verzorgd, warm, elegant, mooi aangekleed, met zorg samengesteld.
- Voeg in minimaal één alinea een voorbeeld toe met aantallen, bijvoorbeeld: glazen per persoon, aantal borden, servetten per gast, aantal statafels.
- Gebruik "wij denken mee" taal en servicegerichte zinnen.
- Voeg concrete voorbeelden toe met aantallen en materialen.

UITWERKING VAN SECTIES (VERPLICHT - HOOGSTE PRIORITEIT - GEEN OPSOMMINGEN):
⚠️⚠️⚠️ KRITIEK: DE BENEFITS EN IDEALFOR SECTIES MOETEN ABSOLUUT GEEN OPSOMMINGEN ZIJN ⚠️⚠️⚠️

STRICT VERBOD OP OPSOMMINGEN:
- ❌ NIET TOEGESTAAN: Korte bullets zoals "Schoon en direct klaar voor gebruik." of "Diner met vrienden"
- ❌ NIET TOEGESTAAN: Lijsten met korte zinnen onder elkaar
- ❌ NIET TOEGESTAAN: Bullet points, ook niet als ze lang zijn
- ✅ WEL TOEGESTAAN: Alleen doorlopende paragrafen met vloeiende tekst

De benefits en idealFor secties moeten ALTIJD als DOORLOPENDE TEKST worden geschreven, NIET als korte bullets of opsommingen.

BENEFITS SECTIE (benefitsTitle + benefits):
- Schrijf benefits als DOORLOPENDE PARAGRAFEN, NIET als bullets.
- Elke benefit moet een MINI-PARAGRAAF zijn van minimaal 3 zinnen en maximaal 5 zinnen.
- Combineer meerdere benefits in één vloeiende tekst.
- Gebruik overgangszinnen zoals "Daarnaast", "Ook", "Bovendien", "Verder" om de benefits aan elkaar te verbinden.
- VOORBEELD VAN GOEDE BENEFITS TEKST (NIET als bullets):
  ✅ "Bij Broers Verhuur leveren wij alle materialen schoon, droog en direct klaar voor gebruik. Jij hoeft niets voor te bereiden en kunt direct beginnen met opbouwen in Haarlem, Hoofddorp of Amsterdam. Daarnaast zorgen wij voor de afwas na afloop, zodat jij zorgeloos kunt genieten van jouw evenement zonder zorgen over opruimen of schoonmaken. Ook denken wij mee over aantallen per persoon en helpen wij met het samenstellen van de juiste materialen voor jouw specifieke situatie."
- VOORBEELD VAN SLECHTE BENEFITS (NIET TOEGESTAAN):
  ❌ "Schoon en direct klaar voor gebruik."
  ❌ "Wij zorgen voor de afwas."
  ❌ "Wij denken mee over aantallen."

IDEAL FOR SECTIE (idealTitle + idealFor):
- Schrijf idealFor als DOORLOPENDE PARAGRAFEN, NIET als bullets of korte opsommingen.
- Beschrijf de verschillende gelegenheden in vloeiende tekst met overgangszinnen.
- Elke gelegenheid moet worden uitgewerkt met context, materialen en waarom het geschikt is.
- MINIMAAL 4-6 zinnen per gelegenheid, of combineer meerdere gelegenheden in één doorlopende tekst.
- VOORBEELD VAN GOEDE IDEAL FOR TEKST (NIET als bullets):
  ✅ "Tafelgerei huren is ideaal voor verschillende gelegenheden. Voor een diner met vrienden in Haarlem of Amsterdam kun je kiezen uit verschillende serviezen en glazen, zodat je de tafel stijlvol kunt dekken zonder eigen materiaal te hoeven verzamelen. Ook voor een tuinfeest met familie in Hoofddorp of de regio is het handig om tafelgerei te huren, omdat je dan geen zorgen hebt over afwas of beschadigde materialen. Daarnaast is het perfect voor een kantoorborrel of personeelsfeest, waarbij je snel een professionele uitstraling wilt zonder grote investeringen. Voor een bruiloft met een stijlvol diner kun je alles in één keer huren, inclusief tafelkleden, servetten en bestek, zodat de styling compleet is. Ook voor een verjaardagsfeest of 21 diner is tafelgerei huren een praktische oplossing, omdat wij alles schoon leveren en na afloop weer ophalen."
- VOORBEELD VAN SLECHTE IDEAL FOR (NIET TOEGESTAAN):
  ❌ "Diner met vrienden"
  ❌ "Tuinfeest met familie"
  ❌ "Kantoorborrel"
  ❌ "Bruiloft met een stijlvol diner"
  ❌ "Verjaardagsfeest"

COMPLETE SETUP SECTIE (completeSetupTitle + completeSetupText):
- Schrijf als DOORLOPENDE PARAGRAAF van minimaal 50 woorden (3-5 zinnen).
- Geef praktische uitleg met concrete aantallen, materialen en combinaties.
- Gebruik geen bullets, maar vloeiende tekst.

Gebruik altijd in deze secties:
- materialen (borden, glazen, servetten, tafelkleden, statafels, bar, bloemstukken, koelingen, bestek)
- servicebeloftes (wij leveren, wij regelen, wij denken mee, wij doen de afwas)
- scenario's (diner thuis, tuinfeest, borrel op kantoor, catering, feestdagen, 21 diner, bruiloft, etc.)
- regio's (Haarlem, {{region1}}, {{region2}})
- waarom het handig of makkelijk is
- concrete aantallen (bijv. "3 glazen per persoon", "2 extra borden")

COMPLETE SETUP BLOK (VERPLICHT):
- Maak het Complete Setup blok altijd een mini instructie of advies, geen samenvatting.
- Gebruik minimaal één concreet advies over aantallen, styling of materialen.
- Geef praktische uitleg over hoe je het compleet maakt, welke materialen je combineert, en hoeveel je nodig hebt.

JIJ-VORM EN WIJ-VORM (VERPLICHT):
In de benefits, ideal for en complete setup secties moet minimaal één zin staan in de jij-vorm en een zin in de wij-vorm.
- Jij-vorm voorbeelden: "jij huurt", "jij kiest", "jij regelt", "jij bepaalt"
- Wij-vorm voorbeelden: "wij leveren", "wij regelen", "wij denken mee", "wij zorgen dat"
- Combineer beide vormen in elke sectie voor een persoonlijke, servicegerichte toon.

MATERIAAL COMBINATIES (VERPLICHT):
Gebruik in benefits en ideal for minimaal één voorbeeld waarin materialen worden gecombineerd:
- borden, glazen, servetten, tafelkleden, statafels, bar, bloemstukken, koelingen, bestek
- Beschrijf hoe deze materialen samenwerken en waarom de combinatie handig is.

SEO-REGELS (Rank Math Pro + Google Best Practices - HOOGSTE PRIORITEIT):

FOCUS KEYWORD PLACEMENT (VERPLICHT - Rank Math test):
Focus keyword MOET voorkomen in:
- seoTitle (verplicht)
- metaDescription (verplicht)
- urlSlug (verplicht)
- h1 (verplicht)
- eerste zin van intro (verplicht)
- minimaal één subkop (H2) zoals benefitsTitle, idealTitle, completeSetupTitle, etc. (verplicht)
- ctaText (verplicht)
- minstens één imageSEO.alt tekst (verplicht)
- minimaal 5 keer in alle tekstvelden samen (keyword density)

KEYWORD DENSITY & VARIATIES:
- Bij een landingspagina van 350–600 woorden moet het focus keyword minimaal 6–8 keer voorkomen in alle tekstvelden samen (ongeveer 1–1,5% keyword density).
- Zorg dat het focus keyword verspreid is over intro, benefits, idealFor, completeSetupText, inspirationText, detailedScenario, storytellingScene, adviceText en ctaText.
- Minimaal 4 secondary keywords moeten terugkomen in de lopende tekst (natuurlijk, niet geforceerd).
- Gebruik variaties en synoniemen waar logisch.
- Geen keyword stuffing – zorg dat de tekst natuurlijk leesbaar blijft.

SECONDARY KEYWORDS (SEMANTISCH GERELATEERD):
- EXACT 9 secondary keywords die SEMANTISCH GERELATEERD zijn aan het focus keyword
- Keywords moeten synoniemen, long-tail varianten, subonderwerpen of gerelateerde termen zijn
- Elke keyword moet 2-4 woorden bevatten (long-tail varianten)
- Keywords moeten het topic, focus keyword of gerelateerde materialen bevatten
- Gebruik waar relevant: regio's (Haarlem, Amsterdam, etc.), acties (huren, verhuur), materialen (borden, glazen, bestek), use cases (diner, feest, bruiloft)
- Keywords moeten dezelfde zoekintentie hebben als het focus keyword
- VOORBEELDEN voor "tafelgerei huren": "tafelgerei verhuur Haarlem", "borden en bestek huren", "tafelsetting huren voor feest", "servies huren diner"
- NIET gebruiken: te generieke woorden zoals "horeca", "materiaal", "evenement" zonder context

HEADINGS STRUCTUUR (Rank Math test):
- Genereer een headings array met H2/H3 subkoppen.
- Minimaal twee H2's MOETEN het focus keyword bevatten of een heel nauw verwante variant (bijv. focus keyword + regio).
- Overige H2's zijn thematisch (styling, inspiratie, advies).
- Logische hiërarchie: H1 → H2 → H3.
- Structuur helpt crawler en gebruikers.

TOPICAL COVERAGE (Google semantische SEO):
- Behandel het onderwerp breed en diepgaand
- Gebruik synoniemen, verwante termen, subonderwerpen
- Variaties op keywords doen beter dan exact hetzelfde woord
- Context en semantiek zijn belangrijk

E-E-A-T SIGNALEN (Google vertrouwen):
- Minimaal één zin over ervaring/professionaliteit
- Voorbeeld: "Wij helpen dagelijks partijen in Haarlem, {{region1}} en {{region2}} met het compleet inrichten van events."
- Of: "Ons team denkt mee over materiaalkeuze, logistiek en styling, zodat jouw evenement soepel verloopt."
- Plaats in personalAdviceText of detailedScenario

LEESBAARHEID (Yoast + Rank Math):
- Zinnen bij voorkeur korter dan 20 woorden
- Zo min mogelijk passieve vorm ("er wordt", "wordt gedaan")
- Korte paragrafen van 2-4 zinnen
- Actieve zinnen voor duidelijkheid

Page Title (seoTitle):
- max 60 karakters.
- Bevat het topic + focus keyword.
- Bevat minimaal één power word (zoals huren, compleet, eenvoudig, snel, direct, zonder gedoe).
- Bevat bij voorkeur een getal (bijv. 3 tips, 5 voordelen, 7 ideeën) als dit natuurlijk past.
- Bevat altijd Haarlem.

Meta description (metaDescription):
- max 155 karakters.
- Bevat duidelijk voordeel + actie + regio's.
- Bevat het focus keyword expliciet (niet alleen varianten).
- Geen streepjes.

EXTERNE LINKS (outgoing links):
- Genereer minimaal één externe link in de links.externalLinks sectie naar een relevante bron (bijv. gemeente-informatie, richtlijnen voor evenementen, geluid, vergunningen).
- Anchor tekst moet natuurlijk en informatief zijn (bijv. "Lees meer over geluidsregels bij straatfeesten op de website van de gemeente").
- Leg in de reason kort uit waarom deze link nuttig is voor de bezoeker.
- Deze externe links helpen om E-E-A-T en Rank Math / SEO scores te verbeteren.

URL slug (urlSlug):
- alleen lowercase
- woorden gescheiden door verbindingsstreepjes
- bevat focus keyword
- geen speciale tekens
- voorbeeld: tafelgerei-huren-haarlem

Search Intent:
- Bepaal zoekintentie: transactional, commercial of informational
- Content moet aansluiten bij wat de zoeker wil bereiken

Tone of voice:
- vriendelijk, servicegericht, praktisch
- nooit verkoperig
- altijd oplossingsgericht
- korte, duidelijke zinnen
- geen streepjes gebruiken

Als een regel in deze instructies in conflict is met andere instructies, dan gelden deze instructies altijd als hoogste prioriteit.`;

// Templates per content type
const TEMPLATES: Record<string, string> = {
  product: `${JSON_OUTPUT_RULE}

PRODUCTPAGINA INSTRUCTIE:

Lengte:
- Producttekst moet tussen 220 en 350 woorden zijn.

Inhoudseisen:
Een productpagina moet altijd bevatten:
✔ duidelijke productintro
✔ verhuurvoordelen
✔ materialen en toepassingen
✔ minimaal vier scenario's uit de scenario-pool
✔ één praktisch adviesblok
✔ één styling of use-case tip
✔ minimaal één servicebelofte
✔ concrete product details (materiaal, formaat, gebruik, toepassing)

Voorbeeldregels:
- waar gebruik je dit voor
- in welke situaties werkt dit product goed
- hoe combineer je dit met ander materiaal
- hoe maak je een bestelling compleet

Product scenario's (minimaal 4 verplicht):
Gebruik uitsluitend scenario's uit deze lijst: {{scenarios}}.
Gebruik minimaal vier scenario's uit deze lijst in de tekst.
Verzin geen nieuwe scenario's.

SEO-regels (RankMath + Yoast):
Verplicht te genereren:
- Page title (max 60 chars)
- Meta description (max 155 chars)
- Focus keyword (exact 1)
- Secondary keywords (min 9)
- URL slug

Gebruik mijn vaste stijlregels en schrijf een productpagina tekst.

Product: {{productName}}
Categorie: {{category}}
Gebruik / situatie: {{useCase}}
Regio's: Haarlem, {{region1}}, {{region2}}

Geef de output uitsluitend als JSON in het volgende schema:
{
  "seoTitle": "string",
  "metaDescription": "string",
  "focusKeyword": "string",
  "secondaryKeywords": ["kw1", "kw2", "kw3", "kw4", "kw5", "kw6", "kw7", "kw8", "kw9"],
  "urlSlug": "string",
  "title": "string",
  "intro": "korte intro over het product",
  "benefitsTitle": "string",
  "benefits": ["voordeel 1", "voordeel 2", "voordeel 3"],
  "idealTitle": "string",
  "idealFor": ["situatie 1", "situatie 2", "situatie 3", "situatie 4"],
  "materialsTitle": "string",
  "materialsText": "concrete materialen, formaat, gebruik",
  "useCasesTitle": "string",
  "useCasesText": "praktische toepassing en voordelen",
  "adviceTitle": "string",
  "adviceText": "één praktisch styling of gebruiksadvies",
  "serviceTitle": "string",
  "serviceText": "servicebelofte",
  "ctaTitle": "string",
  "ctaText": "call to action",
  "imageSEO": [
    {
      "alt": "{{product}} huren in Haarlem voor een {{scenario}}",
      "title": "{{product}} huren – Broers Verhuur"
    },
    {
      "alt": "{{product}} huren in {{region1}} voor een {{scenario}}",
      "title": "{{product}} huren – Broers Verhuur"
    }
  ],
  "internalLinks": [
    {"anchor": "string", "url": "/{{slug}}"}
  ],
  "ctaSuggestions": ["string", "string", "string"],
  "schema": {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "{{productName}}",
    "brand": {
      "@type": "Brand",
      "name": "Broers Verhuur"
    },
    "offers": {
      "@type": "Offer",
      "availability": "https://schema.org/InStock"
    }
  }
}

Validatie:
- NOOIT tekst buiten JSON
- Altijd: 4 scenario's, minimaal één servicebelofte
- Focus keyword in title, meta en intro
- Regio's in tekst
- Alt text geen streepjes

${ENGINES_INSTRUCTIONS}

${QUALITY_INSTRUCTIONS}`,

  categorie: `${JSON_OUTPUT_RULE}

CATEGORIEPAGINA INSTRUCTIE:

Lengte:
- De pagina moet tussen 250 en 400 woorden zijn.

Scenario-eisen (minimaal 4 verplicht, gegroepeerd):
Gebruik uitsluitend scenario's uit deze lijst: {{scenarios}}.
Gebruik minimaal vier scenario's uit deze lijst in de tekst.
Verzin geen nieuwe scenario's.

Servicebeloften (minimaal 2 verplicht):
Gebruik altijd minimaal twee:
- Wij leveren alles schoon en direct klaar voor gebruik
- Wij doen de afwas
- Wij denken mee over aantallen
- Wij regelen levering en retour

Verplichte inhoudsblokken:
Een categoriepagina moet altijd bevatten:
✔ korte intro
✔ voordeelblok in bullets
✔ minimaal vier scenario's
✔ één inspiratieblok
✔ één praktisch adviesblok
✔ sector/gebruikerssituaties
✔ concrete materialen
✔ call to action
✔ min. 2 servicebeloftes

SEO-REGELS (RankMath + Yoast):
Verplicht te genereren:
- Page title (max 60 chars, topic + regio's)
- Meta description (max 155 chars, voordeel + CTA)
- Focus keyword (exact 1)
- Secondary keywords (min 9)
- URL slug

Gebruik mijn vaste stijlregels en schrijf een categoriepagina.

Categorie: {{category}}
Korte beschrijving / gebruik: {{useCase}}
Regio's: Haarlem, {{region1}}, {{region2}}

Geef de output uitsluitend als JSON in het volgende schema:
{
  "seoTitle": "string",
  "metaDescription": "string",
  "focusKeyword": "string",
  "secondaryKeywords": ["kw1", "kw2", "kw3", "kw4", "kw5", "kw6", "kw7", "kw8", "kw9"],
  "urlSlug": "string",
  "h1": "string",
  "intro": "korte introductietekst",
  "benefitsTitle": "string",
  "benefits": ["bullet 1", "bullet 2", "bullet 3"],
  "scenariosTitle": "string",
  "scenarios": ["situatie 1", "situatie 2", "situatie 3", "situatie 4"],
  "inspirationTitle": "string",
  "inspirationText": "inspiratie met praktijkvoorbeelden",
  "adviceTitle": "string",
  "adviceText": "praktisch advies of uitleg over combinatie",
  "ctaTitle": "string",
  "ctaText": "call to action",
  "imageSEO": [
    {
      "alt": "{{category}} huren in Haarlem voor een {{scenario}}",
      "title": "{{category}} huren – Broers Verhuur"
    },
    {
      "alt": "{{category}} huren in {{region1}} voor een {{scenario}}",
      "title": "{{category}} huren – Broers Verhuur"
    },
    {
      "alt": "{{category}} huren in {{region2}} voor een {{scenario}}",
      "title": "{{category}} huren – Broers Verhuur"
    },
    {
      "alt": "{{category}} huren voor evenement in Haarlem",
      "title": "{{category}} huren – Broers Verhuur"
    }
  ],
  "internalLinks": [
    {"anchor": "string", "url": "/{{slug}}"}
  ],
  "ctaSuggestions": ["string", "string", "string"],
  "schema": {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Broers Verhuur",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Haarlem"
    },
    "areaServed": ["Haarlem", "{{region1}}", "{{region2}}"],
    "image": "https://www.broersverhuur.nl",
    "url": "https://www.broersverhuur.nl",
    "sameAs": [
      "https://www.instagram.com/broersverhuur.nl"
    ],
    "knowsAbout": [
      "{{category}}",
      "evenementen",
      "verhuur",
      "servies",
      "horecamateriaal"
    ]
  }
}

Validatie:
- Output mag NOOIT tekst buiten het JSON object bevatten.
- Gebruik exact deze key-names.
- Alt text zonder streepjes.
- Must include: 4 scenario's, 2 servicebeloftes, regio's minimaal 2×
- Focus keyword in: h1, seoTitle, meta, intro

${ENGINES_INSTRUCTIONS}

${QUALITY_INSTRUCTIONS}`,

  landing: `${JSON_OUTPUT_RULE}

${LANDING_SPECIFIC_RULES}

FEW-SHOT EXAMPLE (gebruik dit als referentie voor stijl en structuur):
Hieronder staat een voorbeeld van een goede landingspagina volgens de Broers Verhuur stijl. Gebruik dit als referentie voor toon, lengte en structuur, maar kopieer niet letterlijk.

VOORBEELD LANDINGSPAGINA (Tafelgerei huren):
{
  "seo": {
    "seoTitle": "Tafelgerei huren in Haarlem eenvoudig geregeld",
    "metaDescription": "Huur tafelgerei voor jouw evenement in Haarlem Hoofddorp en Amsterdam. Wij leveren alles schoon en regelen levering en retour.",
    "focusKeyword": "tafelgerei huren",
    "secondaryKeywords": ["tafelgerei verhuur Haarlem", "borden en bestek huren", "tafelsetting huren voor feest", "servies huren diner", "tafelgerei huren Amsterdam", "complete tafelsetting huren", "tafelgerei verhuur evenement", "borden glazen bestek huren", "tafelgerei huren voor bruiloft"],
    "urlSlug": "tafelgerei-huren-haarlem",
    "searchIntent": "transactional",
    "searchIntentExplanation": "Bezoeker wil direct huren of opties bekijken voor het huren van tafelgerei voor een evenement."
  },
  "headings": [
    {"level": "h2", "text": "Waarom tafelgerei huren voor jouw evenement", "containsFocusKeyword": true},
    {"level": "h2", "text": "Maak jouw feest of diner compleet", "containsFocusKeyword": false}
  ],
  "content": {
    "h1": "Tafelgerei huren voor jouw evenement",
    "intro": "Wil jij tafelgerei huren voor een feest of diner in Haarlem? Dan maak je het jezelf gemakkelijk. Of je nu een tuinfeest of borrel op kantoor organiseert in Haarlem, Hoofddorp of Amsterdam, wij zorgen voor een complete tafelsetting en leveren alles schoon en direct klaar voor gebruik.",
    "benefitsTitle": "Waarom kiezen voor Broers Verhuur?",
    "benefits": [
      "Bij Broers Verhuur leveren wij alle materialen schoon, droog en direct klaar voor gebruik. Jij hoeft niets voor te bereiden en kunt direct beginnen met opbouwen in Haarlem, Hoofddorp of Amsterdam. Daarnaast zorgen wij voor de afwas na afloop, zodat jij zorgeloos kunt genieten van jouw evenement zonder zorgen over opruimen of schoonmaken. Ook denken wij mee over aantallen per persoon en helpen wij met het samenstellen van de juiste materialen voor jouw specifieke situatie, of het nu gaat om een diner thuis, tuinfeest of borrel op kantoor."
    ],
    "idealTitle": "Ideaal voor verschillende gelegenheden",
    "idealFor": [
      "Tafelgerei huren is ideaal voor verschillende gelegenheden. Voor een diner met vrienden in Haarlem of Amsterdam kun je kiezen uit verschillende serviezen en glazen, zodat je de tafel stijlvol kunt dekken zonder eigen materiaal te hoeven verzamelen. Ook voor een tuinfeest met familie in Hoofddorp of de regio is het handig om tafelgerei te huren, omdat je dan geen zorgen hebt over afwas of beschadigde materialen. Daarnaast is het perfect voor een kantoorborrel of personeelsfeest, waarbij je snel een professionele uitstraling wilt zonder grote investeringen. Voor een bruiloft met een stijlvol diner kun je alles in één keer huren, inclusief tafelkleden, servetten en bestek, zodat de styling compleet is. Ook voor een verjaardagsfeest of 21 diner is tafelgerei huren een praktische oplossing, omdat wij alles schoon leveren en na afloop weer ophalen."
    ],
    "completeSetupTitle": "Zo maak je jouw tafelsetting compleet",
    "completeSetupText": "Je maakt jouw evenement compleet door servies, glazen, bestek, tafelkleden en servetten te combineren. Voor een diner adviseren wij minimaal drie glazen per persoon voor wijn, water en fris. Kies statafels wanneer je een borrel organiseert en voeg een bar of koelingen toe voor drankjes. Wij leveren alles schoon aan en wij regelen levering en retour in Haarlem, Hoofddorp en Amsterdam. Jij kiest de materialen en wij denken mee over aantallen en styling."
  }
}

Dit voorbeeld toont:
- Nuchtere, praktische toon zonder marketingtaal
- Jij-vorm en wij-vorm gecombineerd
- Regio's natuurlijk verwerkt in de tekst
- Benefits en idealFor als DOORLOPENDE PARAGRAFEN, NIET als korte bullets
- Servicebeloftes geïntegreerd in vloeiende tekst
- Concrete materialen en aantallen genoemd
- Focus keyword op de juiste plekken
- Geen opsommingen, maar uitgewerkte tekst met overgangszinnen

Gebruik mijn vaste stijlregels en schrijf een landingspagina.

⚠️⚠️⚠️ KRITIEK: ONDERWERP IS HET FOCUS KEYWORD ⚠️⚠️⚠️
Onderwerp: {{topic}}
- Het focus keyword MOET zijn: "{{topic}} huren" (bijv. als onderwerp "glaswerk" is, dan focus keyword = "glaswerk huren")
- Gebruik NOOIT een ander woord dan het opgegeven onderwerp
- Als onderwerp "glaswerk" is, gebruik dan "glaswerk" in ALLE SEO velden, NIET "servies" of iets anders
- Als onderwerp "servies" is, gebruik dan "servies" in ALLE SEO velden, NIET "glaswerk" of iets anders

Doel: {{goal}}
Regio's: Haarlem, {{region1}}, {{region2}}

Geef de output uitsluitend als JSON in het volgende uitgebreide schema (Rank Math Pro + Google compliant):
{
  "seo": {
    "seoTitle": "string (max 60 tekens, focusKeyword + powerword + getal + Haarlem, focusKeyword MOET exact '{{topic}} huren' zijn, powerword verplicht, getal verplicht - bijv. als onderwerp 'glaswerk' is: 'Glaswerk huren in Haarlem – 3 tips eenvoudig geregeld')",
    "metaDescription": "string (max 155 tekens, voordeel + actie + regio's, bevat onderwerp + 'huren' op een natuurlijke manier (bijv. 'Huur glaswerk gemakkelijk ...'), geen streepjes)",
    "focusKeyword": "string (MOET exact '{{topic}} huren' zijn, NIET iets anders, komt terug in seoTitle, metaDescription, h1, intro, minstens één H2, ctaText, één image alt)",
    "secondaryKeywords": ["kw1", "kw2", "kw3", "kw4", "kw5", "kw6", "kw7", "kw8", "kw9"],
    "urlSlug": "string (kleine letters, verbindingsstreepjes, MOET exact '{{topic}}-huren-haarlem' zijn, bijv. als onderwerp 'glaswerk' is: 'glaswerk-huren-haarlem')",
    "searchIntent": "transactional | commercial | informational",
    "searchIntentExplanation": "korte uitleg wat de zoeker hier wil bereiken"
  },
  "headings": [
    {
      "level": "h2",
      "text": "string (subkop met duidelijke inhoud, minstens één H2 moet focusKeyword bevatten)",
      "containsFocusKeyword": true
    },
    {
      "level": "h2",
      "text": "string (andere thematische subkop)",
      "containsFocusKeyword": false
    }
  ],
  "content": {
    "h1": "string (bevat focusKeyword verplicht)",
    "intro": "korte introductie, eerste zin bevat focusKeyword verplicht, noemt Haarlem en minimaal één scenario",
    "benefitsTitle": "string (H2, mag scenario of materiaal bevatten)",
    "benefits": [
      "string (⚠️ ABSOLUUT GEEN OPSOMMING - ALLEEN DOORLOPENDE PARAGRAAF van minimaal 4-5 zinnen. Combineer ALLE benefits in ÉÉN vloeiende tekst met overgangszinnen zoals 'Daarnaast', 'Ook', 'Bovendien', 'Verder'. Beschrijf elke benefit in 2-3 zinnen met context. Jij-vorm én wij-vorm combineren, materialen + servicebeloftes + scenario's + regio's. GEEN bullets, GEEN korte zinnen onder elkaar, ALLEEN doorlopende tekst)"
    ],
    "idealTitle": "string (H2, bijvoorbeeld 'Voor welke momenten jij dit huurt')",
    "idealFor": [
      "string (⚠️ ABSOLUUT GEEN OPSOMMING - ALLEEN DOORLOPENDE PARAGRAAF van minimaal 6-8 zinnen. Beschrijf ALLE gelegenheden in ÉÉN vloeiende tekst met overgangszinnen. Elke gelegenheid uitgewerkt in 2-3 zinnen met context, materialen, regio's en waarom geschikt. Scenario's zoals diner thuis, tuinfeest, borrel op kantoor, personeelsfeest, bruiloft, verjaardagsfeest, 21 diner. GEEN bullets, GEEN korte zinnen onder elkaar, ALLEEN doorlopende tekst)"
    ],
    "completeSetupTitle": "string (H2, bijv. 'Zo maak je de tafelsetting compleet')",
    "completeSetupText": "mini instructie van 2–5 zinnen, uitleg hoe jij borden, glazen, servetten, tafelkleden, statafels, bar, bloemstukken en koelingen combineert. Minstens één concreet aantallen-advies (bijv. aantal glazen per persoon). Altijd jij-vorm én wij-vorm. Minstens één servicebelofte: wij leveren schoon, wij doen de afwas, wij regelen levering en retour, wij denken mee over aantallen.",
    "subcategoriesTitle": "string",
    "subcategoriesIntro": "korte uitleg (1–3 zinnen) waarom deze subcategorieën handig zijn voor de bezoeker.",
    "subcategories": [
      {
        "name": "string (bijv. Servies huren)",
        "description": "korte omschrijving (1–3 zinnen) met materialen en scenario's."
      }
    ],
    "inspirationTitle": "string (H2, bijv. 'Ideeën voor jouw diner of feest')",
    "inspirationText": "inspiratietekst met meerdere scenario's (diner thuis, tuinfeest, borrel op kantoor, 21 diner, feestdagen, bruiloft, personeelsfeest, dorpsfeest, straatfeest). Minimaal 3 scenario's noemen, telkens met sfeer, setting en materialen (servies, glazen, tafelkleden, servetten, statafels, bar, bloemstuk, verlichting, koelingen).",
    "situationsTitle": "string",
    "situations": [
      "string (scenario 1, minimaal 12 woorden, uit vaste lijst scenario's)",
      "string (scenario 2, idem)",
      "string (scenario 3, idem)",
      "string (scenario 4, idem)",
      "string (scenario 5, idem – minimaal 5 scenario's verplicht)"
    ],
    "detailedScenarioTitle": "string (H2, bijv. 'Voorbeeld: compleet tuinfeest in Haarlem')",
    "detailedScenario": "één uitgewerkt scenario van 5–8 zinnen: beschrijf sfeer, setting, gasten, wat er gehuurd wordt (borden, glazen, tafelkleden, servetten, statafels, bar, bloemstukken, koelingen, bestek), aantallen (bijv. aantal glazen per persoon, extra servetten, aantal statafels), regio's Haarlem, {{region1}} en {{region2}} en waarom het makkelijk is (wij leveren schoon, wij doen de afwas, wij regelen levering en retour, wij denken mee).",
    "storytellingSceneTitle": "string (H2, bijv. 'Een avond die je niet vergeet')",
    "storytellingScene": "warme storytelling scène van 4–6 zinnen in persoonlijke jij-vorm. Beschrijf een realistische situatie: tafelsetting, materialen, sfeerwoorden zoals sfeer, setting, stijlvol gedekt, verzorgd, warm, elegant, mooi aangekleed, met zorg samengesteld. Benoem gemak van huren: jij kiest, wij regelen, wij helpen mee. Gebruik regio's Haarlem, {{region1}} of {{region2}}.",
    "stylingTipsTitle": "string (H2)",
    "stylingTipsText": "praktische stylingtips in 3–6 zinnen: kleuren kiezen, materialen combineren (borden, glazen, tafelkleden, servetten, bloemstukken, verlichting), tafelhoogte, indeling, verschil tussen zakelijk en privé, tips voor feestdagen, 21 diner, bruiloft en tuinfeest.",
    "personalAdviceTitle": "string (H2, bijv. 'Persoonlijk advies voor jouw evenement')",
    "personalAdviceText": "persoonlijk advies in 3–6 zinnen. Gebruik actieve hulp-taal: wij helpen je, wij denken mee, jij kiest, wij regelen. Benoem dat je in Haarlem zit en levert in Haarlem, {{region1}} en {{region2}}. Vermeld dat jullie meedenken over aantallen, logistiek, tafelindeling en styling. Voeg E-E-A-T toe: ervaring, professionaliteit.",
    "adviceTitle": "string (H2, bijv. 'Praktische tips voor aantallen en materialen')",
    "adviceText": "praktisch adviesblok in 3–6 zinnen. Concrete tips over aantallen (bijvoorbeeld 3 glazen per persoon, extra borden, servetten per gast, aantal statafels per aantal gasten, hoeveel koelingen je nodig hebt). Altijd een zin met 'wij denken mee over aantallen' of vergelijkbaar.",
    "localBlock": {
      "title": "string (bijv. 'Verhuur in Haarlem en regio')",
      "text": "2–4 zinnen over Broers Verhuur in Haarlem, levering in Haarlem, {{region1}} en {{region2}}, lokaal werken, direct contact, zonder gedoe. Noem dat dit geldt voor evenementen zoals bedrijfsfeest, dorpsfeest, bruiloft, personeelsfeest."
    }
  },
  "faq": {
    "faqTitle": "string",
    "items": [
      { "question": "string", "answer": "string (minimaal 4–6 zinnen, uitgebreid, concreet en servicegericht met voorbeelden, materialen, aantallen en regio's)" },
      { "question": "string", "answer": "string (minimaal 4–6 zinnen, uitgebreid, concreet en servicegericht)" },
      { "question": "string", "answer": "string (minimaal 4–6 zinnen, uitgebreid, concreet en servicegericht)" },
      { "question": "string", "answer": "string (minimaal 4–6 zinnen, uitgebreid, concreet en servicegericht)" },
      { "question": "string", "answer": "string (minimaal 4–6 zinnen, uitgebreid, concreet en servicegericht)" }
    ],
    "schemaFAQType": "FAQPage"
  },
  "cta": {
    "ctaTitle": "string",
    "ctaText": "afsluitende call to action in tekstvorm (2–4 zinnen, servicegericht, zonder druk, focusKeyword erin verplicht)",
    "ctaSuggestions": [
      "string (max 8 woorden, bijv. 'Huur eenvoudig jouw materiaal voor het evenement')",
      "string (max 8 woorden)",
      "string (max 8 woorden)"
    ],
    "nextSteps": [
      "string (bijv. 'Bekijk het assortiment tafelgerei voor jouw diner')",
      "string ('Vraag direct een offerte aan voor jouw evenement')",
      "string ('Plan een kort adviesgesprek over styling en materiaal')"
    ]
  },
  "imageSEO": {
    "images": [
      {
        "alt": "string ({{topic}} + scenario + Haarlem, focusKeyword waar mogelijk, geen streepjes)",
        "title": "{{topic}} huren – Broers Verhuur"
      },
      {
        "alt": "string ({{topic}} + scenario + {{region1}})",
        "title": "{{topic}} huren – Broers Verhuur"
      },
      {
        "alt": "string ({{topic}} + scenario + {{region2}})",
        "title": "{{topic}} huren – Broers Verhuur"
      },
      {
        "alt": "string ({{topic}} huren voor evenement in Haarlem)",
        "title": "{{topic}} huren – Broers Verhuur"
      },
      {
        "alt": "optioneel extra afbeelding 1",
        "title": "{{topic}} huren – Broers Verhuur"
      },
      {
        "alt": "optioneel extra afbeelding 2",
        "title": "{{topic}} huren – Broers Verhuur"
      }
    ]
  },
  "links": {
    "internalLinks": [
      { "anchor": "Bekijk servies", "url": "/servies-huren" },
      { "anchor": "Huur glaswerk", "url": "/glaswerk-huren" },
      { "anchor": "Meer over tafelkleden", "url": "/tafellinnen-en-servetten" },
      { "anchor": "Bekijk statafels", "url": "/statafels-huren" },
      { "anchor": "Huur bar en barapparatuur", "url": "/bar-en-barapparatuur" },
      { "anchor": "Meer over cateringmateriaal", "url": "/cateringmateriaal" }
    ],
    "externalLinks": [
      {
        "anchor": "string (bijv. informatie over geluid bij straatfeest)",
        "suggestedType": "gemeente of overheid",
        "reason": "uitleg waarom dit nuttig is voor de bezoeker"
      }
    ]
  },
  "clusters": {
    "contentClusterIdeas": [
      "Blog: Hoeveel servies huur je voor een 21 diner in Haarlem",
      "Blog: Verschil tussen servies voor buffet en zittend diner",
      "Gids: Tafelsetting voor kerst in Haarlem, {{region1}} en {{region2}}",
      "Blog: Complete checklist voor tuinfeest met catering",
      "Gids: Event inrichting voor personeelsfeest of bedrijfsfeest"
    ]
  },
  "readabilityHints": {
    "maxSentenceLength": 20,
    "avoidPassiveVoice": true,
    "paragraphLengthHint": "korte alinea's van 2–4 zinnen",
    "toneReminder": "vriendelijk, servicegericht, praktisch, nooit schreeuwerig"
  },
  "schema": {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Broers Verhuur",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Haarlem"
    },
    "areaServed": ["Haarlem", "{{region1}}", "{{region2}}"],
    "image": "https://www.broersverhuur.nl",
    "url": "https://www.broersverhuur.nl",
    "sameAs": [
      "https://www.instagram.com/broersverhuur.nl"
    ],
    "knowsAbout": [
      "{{topic}}",
      "evenementen",
      "verhuur",
      "servies",
      "horecamateriaal"
    ]
  }
}

GENEREER OOK ALT-TEKSTEN EN IMAGE TITLES VOOR AFBEELDINGEN

Belangrijke regels voor image SEO:
- Omdat landingspagina's 4-6 afbeeldingen hebben, geldt:
  - Altijd minimaal 4 imageSEO items (je mag meer genereren, 5 of 6 is goed).
  - Alt text moet één scenario bevatten.
  - Geen streepjes in alt text.
  - Titles moeten dit format volgen: {{topic}} huren – Broers Verhuur
  - Altijd Haarlem + region1 + region2 in de image lijst.
  - Nooit regio's buiten de vaste lijst.

Validatie regels:
- Gebruik NOOIT tekst buiten het JSON object.
- Gebruik EXACT dezelfde sleutel namen.
- Altijd: 5 FAQ items (elke FAQ-answer minimaal 4–6 zinnen, uitgebreid en informatief), 5 scenario's, 2 servicebeloften.
- Haarlem + region1 + region2 minimaal 2 keer in de lopende tekst (niet alleen in imageSEO/schema).
- Regio's moeten voorkomen in tekstvelden zoals: intro, inspirationText, detailedScenario, completeSetupText, adviceText.
- ⚠️⚠️⚠️ KRITIEK: benefits en idealFor MOETEN doorlopende paragrafen zijn, GEEN opsommingen. Als je korte zinnen onder elkaar zet (zoals "Schoon en direct klaar." gevolgd door "Wij zorgen voor de afwas."), is het FOUT. Combineer alles in ÉÉN vloeiende tekst met overgangszinnen zoals "Daarnaast", "Ook", "Bovendien", "Verder".
- ⚠️ KRITIEK: Totale tekstlengte (intro + completeSetupText + inspirationText + detailedScenario + storytellingScene + stylingTipsText + personalAdviceText + adviceText) MOET tussen 350 en 550 woorden zijn. MINIMAAL 350 woorden - dit is verplicht.
- Minimum lengte per veld:
  * intro: minimaal 40 woorden
  * completeSetupText: minimaal 50 woorden
  * inspirationText: minimaal 60 woorden
  * detailedScenario: minimaal 80 woorden
  * storytellingScene: minimaal 50 woorden
  * stylingTipsText: minimaal 40 woorden
  * personalAdviceText: minimaal 40 woorden
  * adviceText: minimaal 40 woorden
- Minimaal één sfeerbeschrijving met woorden als: sfeer, setting, stijlvol gedekt, verzorgd, warm, elegant.
- Minimaal één voorbeeld met concrete aantallen (glazen per persoon, aantal borden, etc.).
- Alt text voor 4–6 afbeeldingen.
- ⚠️ FAQ-ANTWOORDEN MOETEN UITGEBREID ZIJN: Elke FAQ-answer moet minimaal 4–6 zinnen bevatten met concrete voorbeelden, materialen, aantallen, regio's en servicebeloftes. Geen summiere antwoorden van 1–2 zinnen.

VALIDATIE REGELS (Rank Math Pro + Google compliant):
- Output mag NOOIT tekst buiten het JSON object bevatten.
- Gebruik EXACT dezelfde sleutel namen als in het schema.
- Focus keyword verplicht in: seoTitle, metaDescription, urlSlug, h1, eerste zin intro, minstens één H2, ctaText, één image alt.
- Minimaal 5 keer focus keyword in alle tekstvelden samen.
- Minimaal 4 secondary keywords moeten terugkomen in de lopende tekst.
- Altijd 5 FAQ items (elke FAQ-answer minimaal 4–6 zinnen, uitgebreid en informatief met voorbeelden, materialen, aantallen en regio's).
- Minimaal 5 scenario's.
- Altijd 2 servicebeloften.
- Altijd regio's minimaal 2x in de tekst.
- Alt text voor 4–6 afbeeldingen (minimaal één met focus keyword).
- Headings array met minstens één H2 die focus keyword bevat.
- Local block aanwezig.
- Content cluster ideeën aanwezig.
- Externe links suggesties (optioneel maar aanbevolen).
- Alle specifieke regels voor landingspagina's staan hierboven in de LANDING_SPECIFIC_RULES sectie en hebben hoogste prioriteit.

${ENGINES_INSTRUCTIONS}`,

  blog: `${JSON_OUTPUT_RULE}

PROMPT – PREMIUM BLOG (1500–2200 woorden)

Jij schrijft blogs voor Broers Verhuur, een verhuurbedrijf voor evenementen en horeca. Gebruik ALTIJD de basisstijlregels en tone of voice van Broers Verhuur.

DOEL:
Schrijf een complete long-form blog met praktische uitleg, inspiratie en advies voor de doelgroep. Maak de blog concreet, bruikbaar en inspirerend.

STRUCTUUR EN REGELS (verplicht):

Lengte:
- Minimaal 1500 woorden. Maximaal 2200 woorden.
- Korte zinnen. Geen streepjes.

Tone-of-voice:
- vriendelijk, praktisch, servicegericht, inspirerend
- geen marketingtaal, geen superlatieven

Materialen zijn verplicht terug te laten komen:
servies, glazen, tafelkleden, statafels, bar, bloemstukken, koelingen, bestek

Regio's verplicht:
Gebruik altijd Haarlem en twee extra regio's uit de vastgestelde lijst: ${ALLOWED_REGIONS.join(', ')}.

Scenario's (minimaal 8):
Gebruik uitsluitend scenario's uit deze lijst: {{scenarios}}.
Gebruik minimaal acht scenario's uit deze lijst in de tekst.
Verzin geen nieuwe scenario's.

Blogs moeten waarde bieden via:
- advies blokken
- stappenplan
- veelgestelde fouten + oplossingen
- scenario storytelling
- realistische voorbeelden
- praktische tips
- materiaalkeuzes

SEO verplicht:
- Gebruik het focus keyword minimaal 12 keer verdeeld door de blog.
- Gebruik semantische keywords waar logisch.
- Maak Yoast en RankMath groen.

Schrijf een blogartikel.
Onderwerp: {{subject}}
Doelgroep: {{targetAudience}}
Regio's: Haarlem, {{region1}}, {{region2}}

Geef de output uitsluitend als JSON in het volgende schema:
{
  "seoTitle": "string",
  "metaDescription": "string",
  "keyword": "string",
  "h1": "string",
  "intro": "string",
  "sections": [
    {
      "title": "string",
      "text": "string"
    }
  ],
  "stepsTitle": "string",
  "steps": [
    "stap 1",
    "stap 2",
    "stap 3"
  ],
  "mistakesTitle": "string",
  "mistakes": [
    {
      "mistake": "string",
      "solution": "string"
    }
  ],
  "scenarioBlocksTitle": "string",
  "scenarioBlocks": [
    {
      "scenario": "diner thuis",
      "text": "string"
    }
  ],
  "practicalAdviceTitle": "string",
  "practicalAdvice": "string",
  "materialsTitle": "string",
  "materialsList": [
    "servies",
    "glazen",
    "..."
  ],
  "internalLinks": [
    {"anchor": "string", "url": "string"}
  ],
  "ctaTitle": "string",
  "ctaText": "string",
  "images": [
    {
      "alt": "string",
      "title": "string"
    }
  ],
  "schema": {}
}

Validatie:
- NOOIT tekst buiten JSON
- Minimaal 1500 woorden, maximaal 2200 woorden
- Minimaal 8 scenario's
- Focus keyword minimaal 12 keer in de tekst
- Alle materialen moeten voorkomen
- Regio's: Haarlem + region1 + region2

${ENGINES_INSTRUCTIONS}

${QUALITY_INSTRUCTIONS}`,

  social: `${JSON_OUTPUT_RULE}

SOCIAL MEDIA PROMPT

Je schrijft posts voor social media voor Broers Verhuur in dezelfde stijlregels als altijd.

Verplicht:
- korte, directe, vriendelijke zinnen
- servicegericht
- praktische tips of inspiratie
- scenario's gebruiken
- materialen benoemen
- geen streepjes

Gebruik de tone-of-voice van Broers Verhuur:
- geen marketingtaal
- geen superlatieven
- steeds oplossingsgericht

De doelgroep is:
- event planners
- horeca
- particulieren die een feest organiseren
- weddingplanners
- zakelijke evenementen

De content moet altijd waarde toevoegen:
- advies
- inspiratie
- idee
- scenario
- keuzehulp
- voorbeelden

STRUCTUUR VAN DE OUTPUT:
Je genereert per opdracht 4 varianten van een social post:
- Instagram carousel copy
- Instagram reel caption
- Single LinkedIn post
- Short teaser (voor stories)

### SOCIAL CATEGORY SYSTEM
Gebruik bij iedere post één van deze content types:
1. Product in beeld
2. Inspiratie post
3. Checklist
4. Tip of advies
5. Voorbeeld scenario
6. Behind the scenes
7. Review of klantcase
8. Event of seizoen inhaker
9. Materiaal combinatie ideeën
10. Veelgemaakte fout + oplossing
11. Styled setting voorbeeld
12. Storytelling moment

Onderwerp: {{subject}}
Regio's: Haarlem, {{region1}}, {{region2}} (alleen gebruiken in hashtags of als het logisch is; niet verplicht in de lopende tekst)

Geef de output uitsluitend als JSON in het volgende schema:
{
  "topic": "string",
  "region1": "string",
  "region2": "string",
  "contentType": "string (één van de 12 content types)",
  "carousel": {
    "hook": "string",
    "slides": [
      "slide 1",
      "slide 2",
      "slide 3",
      "slide 4"
    ],
    "cta": "string"
  },
  "reel": {
    "caption": "string",
    "hashtags": "string"
  },
  "linkedin": {
    "hook": "string (max 11 woorden)",
    "post": "string (max 7 korte alinea's van max 2 zinnen)",
    "valueBlock": "string (tip, advies, checklist of inzicht)",
    "scenario": "string",
    "advice": "string",
    "cta": "string",
    "hashtags": "string (max 8 hashtags)"
  },
  "story": {
    "text": "string"
  }
}

RULES DIE MOETEN WORDEN GEVOLGD:

COPY RULES:
- altijd regio's: Haarlem + {{region1}} + {{region2}}
- altijd minstens 1 scenario uit deze lijst: {{scenarios}}
- altijd één materiaal item: servies, glazen, statafels, tafelkleden, bloemstuk etc.
- geen streepjes
- geen marketingwoorden
- servicegerichte zinnen: wij helpen, wij regelen, jij huurt

CTA RULES:
Gebruik CTA's als:
- Huur direct
- Bekijk de mogelijkheden
- Wij helpen graag mee
- Stel je vraag

INSTAGRAM SLIDES:
- Max 12 woorden per slide

LINKEDIN STYLE:
- kort en deskundig
- geen emoji spam
- 1 CTA onderaan

HASHTAGS:
- Gebruik maximaal 8 hashtags
- nooit over-optimised
- geen random woorden
- altijd logisch: evenementen, feest, verhuur, servies, glaswerk, styling, Haarlem (regio's mogen in hashtags)

Validatie:
- NOOIT tekst buiten JSON
- Alle 4 varianten moeten gegenereerd worden
- Minimaal 1 scenario per variant
- Minimaal 1 materiaal per variant

${QUALITY_INSTRUCTIONS}`,
};

// Retry logica voor AI calls met exponential backoff
async function callAiWithRetry(
  prompt: string, 
  isImprovement = false, 
  maxRetries = 2,
  retryDelay = 1000
): Promise<string> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
        console.log(`Retry attempt ${attempt} na ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      return await callAi(prompt, isImprovement);
    } catch (error: any) {
      lastError = error;
      console.error(`AI call attempt ${attempt + 1} failed:`, error.message);
      
      // Als het een timeout of rate limit is, retry
      if (attempt < maxRetries && (
        error.message?.includes('timeout') || 
        error.message?.includes('rate limit') ||
        error.message?.includes('429') ||
        error.message?.includes('503')
      )) {
        continue;
      }
      
      // Als het een andere fout is, gooi direct door
      throw error;
    }
  }
  
  throw lastError || new Error('AI call failed after retries');
}

// Generieke AI call functie - ondersteunt meerdere providers
async function callAi(prompt: string, isImprovement = false): Promise<string> {
  console.log('Loading config...');
  // Laad configuratie (uit config.json of env vars)
  const config = await loadConfig();
  console.log('Config loaded, provider:', config.provider, 'model:', config.model);
  
  const override = requestOverrides;
  const apiKey = override?.apiKey || config.apiKey || process.env.OPENAI_API_KEY;
  const model = override?.model || config.model || process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const provider = override?.provider || config.provider || 'openai';
  
  if (!apiKey) {
    throw new Error('API key is niet geconfigureerd. Ga naar Instellingen om een API key in te voeren.');
  }
  
  console.log('Making AI call with provider:', provider);

  try {
    const systemMessage = isImprovement
      ? 'Je bent een expert tekstverbeteraar. Je verbetert teksten terwijl je de JSON structuur exact behoudt.'
      : 'Je bent een expert SEO tekstschrijver. Je levert altijd geldige JSON responses zoals gevraagd in de prompt.';

    // Ondersteuning voor verschillende providers
    if (provider === 'openai') {
      return await callOpenAI(apiKey, model, systemMessage, prompt);
    } else if (provider === 'anthropic') {
      return await callAnthropic(apiKey, model, systemMessage, prompt);
    } else if (provider === 'google') {
      return await callGoogle(apiKey, model, systemMessage, prompt);
    } else {
      throw new Error(`Provider ${provider} wordt nog niet ondersteund. Gebruik: openai, anthropic of google.`);
    }
  } catch (error: any) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Fout bij AI call: ${error.message || 'Onbekende fout'}`);
  }
}

// OpenAI API call
async function callOpenAI(apiKey: string, model: string, systemMessage: string, prompt: string): Promise<string> {
  // Timeout controller voor fetch
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minuten timeout

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: systemMessage,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `OpenAI API error: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`
      );
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Ongeldige response van OpenAI API');
    }

    return data.choices[0].message.content;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('API call timeout: De request duurde te lang (>2 minuten). Probeer het opnieuw.');
    }
    throw error;
  }
}

// Anthropic (Claude) API call
async function callAnthropic(apiKey: string, model: string, systemMessage: string, prompt: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system: systemMessage,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Anthropic API error: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`
    );
  }

  const data = await response.json();
  
  if (!data.content || !data.content[0] || !data.content[0].text) {
    throw new Error('Ongeldige response van Anthropic API');
  }

  // Parse JSON uit de response
  const text = data.content[0].text;
  return text;
}

// Google (Gemini) API call
async function callGoogle(apiKey: string, model: string, systemMessage: string, prompt: string): Promise<string> {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `${systemMessage}\n\n${prompt}`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Google API error: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`
    );
  }

  const data = await response.json();
  
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
    throw new Error('Ongeldige response van Google API');
  }

  return data.candidates[0].content.parts[0].text;
}

// Scenario Selector: kies automatisch de beste scenario's
async function selectScenarios(topic: string, contentType: string, description?: string): Promise<string[]> {
  const scenarioPrompt = `### SCENARIO SELECTOR

Jij bent een assistent voor Broers Verhuur. 

Je krijgt:
- een topic (bijv. tafelgerei, servies, statafels, bar)
- een contentType (landing, category, product, blog)
- optioneel een korte beschrijving

Je taak:
Kies de BEST passende scenario's uit deze vaste lijst.
Je mag GEEN scenario's bedenken die niet in deze lijst staan.

PARTICULIER:
- diner thuis
- tuinfeest
- feestdagen
- 21 diner
- bruiloft
- jubileum
- verjaardag
- private dining

ZAKELIJK:
- borrel op kantoor
- personeelsfeest
- zakelijke bijeenkomst
- congres
- live bijeenkomst
- receptie

PUBLIEK / BUURT:
- catering
- buurtfeest
- dorpsfeest
- straatfeest
- evenement op locatie

Regels:
- kies minimaal 4 en maximaal 8 scenario's
- kies scenario's die logisch passen bij het topic
- geef ze terug op volgorde van relevantie
- verzin geen nieuwe scenario's
- geef alleen JSON terug

INPUT:
topic: ${topic}
contentType: ${contentType}
description: ${description || 'geen beschrijving'}

OUTPUT FORMAAT (ALTIJD ZO):
{
  "scenarios": [
    "diner thuis",
    "tuinfeest",
    "borrel op kantoor",
    "feestdagen"
  ]
}`;

  try {
    const response = await callAiWithRetry(scenarioPrompt, false, 1, 1000);
    const result = parseJsonResponse(response);
    return result.scenarios || [];
  } catch (error) {
    console.error('Error in scenario selector:', error);
    // Fallback: return default scenarios (niet kritiek)
    return ['diner thuis', 'tuinfeest', 'borrel op kantoor', 'catering', 'feestdagen'];
  }
}

// Internal Link Selector: kies automatisch relevante interne links
async function selectInternalLinks(
  topic: string,
  contentType: string,
  scenarios: string[],
  description?: string
): Promise<Array<{ anchor: string; url: string }>> {
  const linkPrompt = `### INTERNAL LINK SELECTOR

Jij kiest interne links voor een pagina van Broers Verhuur.

Je krijgt:
- een topic
- een contentType (landing, category, product, blog)
- een lijst met beschikbare categorieën inclusief slug in JSON
- een lijst met scenario's
- een korte beschrijving van de pagina

Je taak:
Kies maximaal 6 interne links die logisch zijn voor deze pagina.
Gebruik alleen categorieën uit de aangeleverde lijst.

Regels:
- kies links die aansluiten op het topic en de scenario's
- gebruik per link een korte, natuurlijke anchor tekst
- anchors zijn in de jij-vorm, informatief of uitnodigend
- voorbeelden van anchors:
  - "Bekijk onze servies collectie"
  - "Huur glaswerk voor jouw borrel"
  - "Combineer met statafels"
- geen harde sales, geen hoofdletters schreeuwerig
- GEEN tekst buiten JSON

INPUT:
topic: ${topic}
contentType: ${contentType}
scenarios: ${JSON.stringify(scenarios)}
categories: ${JSON.stringify(AVAILABLE_CATEGORIES)}
description: ${description || 'geen beschrijving'}

OUTPUT-FORMAAT:
{
  "links": [
    {
      "anchor": "Bekijk ons servies",
      "url": "/servies-huren"
    },
    {
      "anchor": "Huur glaswerk voor jouw diner",
      "url": "/glaswerk-huren"
    }
  ]
}`;

  try {
    const response = await callAiWithRetry(linkPrompt, false, 1, 1000);
    const result = parseJsonResponse(response);
    return result.links || [];
  } catch (error) {
    console.error('Error in internal link selector:', error);
    // Fallback: return empty array (niet kritiek)
    return [];
  }
}

// Secondary Keywords Generator: genereer semantisch relevante secondary keywords
async function generateSecondaryKeywords(
  topic: string,
  focusKeyword: string,
  contentType: string,
  description?: string,
  scenarios?: string[]
): Promise<string[]> {
  const keywordPrompt = `### SECONDARY KEYWORDS GENERATOR

Jij genereert semantisch relevante secondary keywords voor SEO volgens Yoast, Rank Math Pro en Semrush best practices.

BELANGRIJKE REGELS (volgens Yoast, Rank Math Pro en Semrush):
1. Secondary keywords moeten SEMANTISCH GERELATEERD zijn aan het focus keyword
2. Ze moeten synoniemen, long-tail varianten, subonderwerpen of gerelateerde termen zijn
3. Ze moeten NATUURLIJK passen bij het topic en de content
4. Ze moeten dezelfde ZOEKINTENTIE hebben als het focus keyword
5. Ze moeten RELEVANT zijn voor de specifieke pagina, niet generiek
6. Gebruik LONG-TAIL varianten (2-4 woorden) waar mogelijk
7. Combineer het topic met acties, locaties, materialen of use cases

INPUT:
topic: ${topic}
focusKeyword: ${focusKeyword}
contentType: ${contentType}
description: ${description || 'geen beschrijving'}
scenarios: ${scenarios ? JSON.stringify(scenarios) : 'geen scenario\'s'}

VOORBEELDEN VAN GOEDE SECONDARY KEYWORDS:

Voor focus keyword "tafelgerei huren":
✅ "tafelgerei verhuur Haarlem"
✅ "borden en bestek huren"
✅ "tafelsetting huren voor feest"
✅ "servies huren diner"
✅ "tafelgerei huren Amsterdam"
✅ "complete tafelsetting huren"
✅ "tafelgerei verhuur evenement"
✅ "borden glazen bestek huren"
✅ "tafelgerei huren voor bruiloft"

VOORBEELDEN VAN SLECHTE SECONDARY KEYWORDS (NIET GEBRUIKEN):
❌ "horeca" (te generiek, niet specifiek)
❌ "materiaal" (te generiek)
❌ "evenement" (te breed, niet gerelateerd aan tafelgerei)
❌ "verhuur" (te algemeen zonder context)
❌ "styling" (niet gerelateerd aan tafelgerei huren)

REGELS:
- Genereer EXACT 9 secondary keywords
- Elke keyword moet 2-4 woorden bevatten (long-tail)
- Keywords moeten het topic, focus keyword of gerelateerde materialen bevatten
- Gebruik waar relevant: regio's (Haarlem, Amsterdam, etc.), acties (huren, verhuur), materialen (borden, glazen, bestek), use cases (diner, feest, bruiloft)
- Keywords moeten natuurlijk in de content kunnen worden gebruikt
- Geen keyword stuffing - keywords moeten betekenisvol zijn

OUTPUT FORMAAT (ALTIJD ZO):
{
  "secondaryKeywords": [
    "keyword 1 (2-4 woorden, semantisch gerelateerd)",
    "keyword 2",
    "keyword 3",
    "keyword 4",
    "keyword 5",
    "keyword 6",
    "keyword 7",
    "keyword 8",
    "keyword 9"
  ]
}`;

  try {
    const response = await callAiWithRetry(keywordPrompt, false, 1, 1000);
    const result = parseJsonResponse(response);
    return result.secondaryKeywords || [];
  } catch (error) {
    console.error('Error in secondary keywords generator:', error);
    // Fallback: return empty array (niet kritiek, kan later handmatig worden toegevoegd)
    return [];
  }
}

// Verbeter functie: tweede AI call om de tekst te verbeteren (gebruikt dezelfde refine prompt)
async function improveContent(draftJson: any, type: string): Promise<any> {
  // Gebruik dezelfde refine prompt als refineContent voor consistentie
  try {
    return await refineContent(draftJson);
  } catch (error: any) {
    console.error('Error in improveContent:', error);
    // Als refine faalt, gooi error door (caller handelt het af)
    throw error;
  }
}

// Refine functie: verbeter bestaande JSON (gebruikt door de "Verbeter deze tekst" knop)
async function refineContent(existingJson: any): Promise<any> {
  // Haal focus keyword uit input JSON
  const inputFocusKeyword = existingJson.seo?.focusKeyword || existingJson.focusKeyword || '';
  const inputTopic = inputFocusKeyword.replace(/\s+huren$/i, '').toLowerCase();
  
  const refinePrompt = `REFINE-PROMPT

⚠️⚠️⚠️ KRITIEK: BEHOUD HET FOCUS KEYWORD UIT DE INPUT JSON ⚠️⚠️⚠️
- Het focus keyword in de input JSON is: "${inputFocusKeyword}"
- Het onderwerp/topic is: "${inputTopic}"
- Je MOET dit exacte focus keyword gebruiken in ALLE SEO velden
- VERANDER HET FOCUS KEYWORD NOOIT - gebruik exact hetzelfde keyword als in de input
- Als input focus keyword "glaswerk huren" is, gebruik dan "glaswerk" in ALLE velden, NIET "servies" of iets anders
- Als input focus keyword "servies huren" is, gebruik dan "servies" in ALLE velden, NIET "glaswerk" of iets anders

Je gaat de gegenereerde tekst verbeteren op kwaliteit, stijl, SEO en leesbaarheid.

Pas de volgende stappen toe:

0. OPSOMMINGEN CONVERTEREN NAAR DOORLOPENDE TEKST (KRITIEK - ALLERHOOGSTE PRIORITEIT):
⚠️⚠️⚠️ VOOR ALLES ANDERS: Controleer benefits en idealFor secties. Als deze nog steeds als opsommingen of korte bullets zijn geschreven, MOET je ze converteren naar doorlopende paragrafen.

TEKENEN VAN OPSOMMINGEN (MOETEN WORDEN GECORRIGEERD):
- ❌ Korte zinnen onder elkaar zoals "Schoon en direct klaar voor gebruik." gevolgd door "Wij zorgen voor de afwas."
- ❌ Bullet points, ook niet als ze lang zijn
- ❌ Lijsten met korte items zoals "Diner met vrienden", "Tuinfeest met familie"
- ❌ Meerdere korte zinnen in een array zonder overgangszinnen

WAT JE MOET DOEN:
- ✅ Combineer ALLE benefits in ÉÉN doorlopende paragraaf (minimaal 4-5 zinnen)
- ✅ Combineer ALLE gelegenheden in ÉÉN doorlopende paragraaf (minimaal 6-8 zinnen)
- ✅ Gebruik overgangszinnen: "Daarnaast", "Ook", "Bovendien", "Verder", "Tevens"
- ✅ Beschrijf elke benefit/gelegenheid in 2-3 zinnen met context, materialen, regio's
- ✅ Maak het één vloeiend verhaal, geen lijst

VOORBEELD CONVERSIE:
❌ SLECHT (opsomming - NIET TOEGESTAAN):
  "Schoon en direct klaar voor gebruik."
  "Wij zorgen voor de afwas, zodat jij zorgeloos kunt genieten."
  "Persoonlijk advies voor de beste keuzes."

✅ GOED (doorlopende tekst - VERPLICHT):
  "Bij Broers Verhuur leveren wij alle materialen schoon, droog en direct klaar voor gebruik, zodat jij niets hoeft voor te bereiden en direct kunt beginnen met opbouwen in Haarlem, Hoofddorp of Amsterdam. Daarnaast zorgen wij voor de afwas na afloop, zodat jij zorgeloos kunt genieten van jouw evenement zonder zorgen over opruimen of schoonmaken. Ook bieden wij persoonlijk advies voor de beste keuzes, waarbij wij meedenken over aantallen, materialen en styling voor jouw specifieke situatie, of het nu gaat om een diner thuis, tuinfeest of borrel op kantoor."

0a. LENGTE CONTROLE (ALLEEN ALS TE KORT):
⚠️ Controleer de totale lengte van alle tekstvelden (intro, completeSetupText, inspirationText, detailedScenario, storytellingScene, stylingTipsText, personalAdviceText, adviceText).
- Als de totale lengte ONDER 350 woorden is, UITBREIDEN tot minimaal 350 woorden.
- Als de lengte AL BOVEN 350 woorden is, NIET verder uitbreiden - alleen kwaliteit verbeteren.
- Voeg toe: extra scenario's, concrete materialen, aantallen (bijv. "3 glazen per persoon", "2 extra borden"), regio's, servicebeloftes, praktische tips, sfeerbeschrijvingen.
- Elke sectie moet minimaal de vereiste lengte hebben (alleen als deze te kort is):
  * intro: minimaal 40 woorden
  * completeSetupText: minimaal 50 woorden
  * inspirationText: minimaal 60 woorden
  * detailedScenario: minimaal 80 woorden
  * storytellingScene: minimaal 50 woorden
  * stylingTipsText: minimaal 40 woorden
  * personalAdviceText: minimaal 40 woorden
  * adviceText: minimaal 40 woorden
- Gebruik concrete voorbeelden, aantallen, materialen en scenario's om lengte toe te voegen.
- NOOIT opvulzinnen of herhaling - alleen waardevolle, concrete content.
- BELANGRIJK: Als de tekst al lang genoeg is, focus op kwaliteit en structuur, NIET op uitbreiding.

1. Controleer schrijfstijl
Corrigeer indien nodig:
- toon altijd servicegericht, praktisch, vriendelijk
- korte zinnen
- geen opvulzinnen
- geen marketing buzzwords
- geen streepjes in de uiteindelijke tekst
- altijd concreet en helder

2. Verbeter de structuur
- voeg witregels toe waar dat scanbaarheid vergroot
- zorg dat bullets korte benefit-frases zijn
- voorkom dubbele inhoud
- versterk scenario-blokken

3. Verrijk de tekst inhoudelijk
Verbeter waar nodig:
- meer concreet materiaalgebruik
- betere scenario-uitwerking
- meer advies, tips, gebruik en combinatiemogelijkheden
- extra waarde in plaats van extra woorden
- servicebeloftes logisch verspreiden

3a. CONVERTEER OPSOMMINGEN NAAR DOORLOPENDE TEKST (KRITIEK):
⚠️ Als benefits of idealFor nog steeds als opsommingen of bullets zijn geschreven, MOET je ze converteren naar doorlopende paragrafen:
- Combineer alle bullets/items in één vloeiende paragraaf
- Gebruik overgangszinnen: "Daarnaast", "Ook", "Bovendien", "Verder", "Tevens", "Bovendien"
- Beschrijf elke benefit/gelegenheid in 2-3 zinnen met context
- Maak het één doorlopend verhaal, geen lijst
- VOORBEELD CONVERSIE:
  ❌ SLECHT (opsomming):
    "Schoon en direct klaar voor gebruik."
    "Wij zorgen voor de afwas."
    "Persoonlijk advies."
  ✅ GOED (doorlopende tekst):
    "Bij Broers Verhuur leveren wij alle materialen schoon, droog en direct klaar voor gebruik, zodat jij niets hoeft voor te bereiden. Daarnaast zorgen wij voor de afwas na afloop, zodat jij zorgeloos kunt genieten van jouw evenement zonder zorgen over opruimen. Ook bieden wij persoonlijk advies voor de beste keuzes, waarbij wij meedenken over aantallen, materialen en styling voor jouw specifieke situatie."

4. SEO-optimalisatie (Yoast + RankMath Pro)
⚠️⚠️⚠️ KRITIEK: BEHOUD HET FOCUS KEYWORD ⚠️⚠️⚠️
- Het focus keyword MOET EXACT hetzelfde blijven als in de input JSON
- Als het focus keyword "glaswerk huren" is, gebruik dan "glaswerk" in ALLE velden, NIET "servies" of iets anders
- Als het focus keyword "servies huren" is, gebruik dan "servies" in ALLE velden, NIET "glaswerk" of iets anders
- VERANDER HET FOCUS KEYWORD NOOIT - gebruik exact hetzelfde keyword als in de input
- focus keyword MOET voorkomen in: H1, intro, seoTitle en metaDescription
- seoTitle MOET bevatten: focus keyword + power word (bijv. "eenvoudig", "compleet", "snel") + getal (bijv. "3 tips", "5 stappen") + regio
- seoTitle maximaal 60 karakters (RankMath/Google limiet)
- gebruik secundaire keywords waar logisch in de tekst (natuurlijk, niet geforceerd)
- zorg dat meta description klikwaarde heeft
- CTA is duidelijk en actiegericht
- geen keyword stuffing
- BEHOUD de secondary keywords array zoals die is (verander ze niet, ze zijn al semantisch geoptimaliseerd)
- VOORBEELD: Als focus keyword "glaswerk huren" is → seoTitle: "Glaswerk huren in Haarlem – 3 tips eenvoudig geregeld" (NIET "Servies huren...")

5. Regio's en scenario's
Valideer:
- Haarlem + region1 + region2 aanwezig
- scenario's goed verdeeld in de tekst
- scenario's logisch en puur (geen generieke events)

6. Remove weak patterns
Verwijder:
- herhaling van dezelfde zinstructuur
- middelmatige generieke zinnen
- fluff ("het zorgt voor een unieke ervaring")
- containerzinnen

7. Verbeter waar mogelijk
- meer ritme
- meer afwisseling in zinslengte
- meer menselijkheid en warmte in scene-blokken
- CTA concreter: huur, bekijk, vraag offerte aan
- servicebelofte sterker formuleren

8. FAQ-antwoorden uitbreiden (KRITIEK)
⚠️ FAQ-antwoorden moeten uitgebreid en informatief zijn:
- Elke FAQ-answer moet minimaal 4–6 zinnen bevatten (niet summier)
- Voeg concrete voorbeelden toe: materialen, aantallen, regio's
- Beschrijf servicebeloftes: "wij regelen", "wij leveren", "wij zorgen voor"
- Noem specifieke scenario's: diner, tuinfeest, borrel, bruiloft
- Beantwoord de vraag volledig met praktische informatie
- Gebruik natuurlijke taal, geen korte bullet points
- VOORBEELD GOEDE FAQ-ANSWER (4–6 zinnen):
  "Bij Broers Verhuur leveren wij alle materialen schoon, droog en direct klaar voor gebruik in Haarlem, Hoofddorp en Amsterdam. Wij denken mee over de juiste aantallen, bijvoorbeeld 3 glazen per persoon voor een diner of extra borden voor een buffet. Daarnaast zorgen wij voor de afwas na afloop, zodat jij zorgeloos kunt genieten van jouw evenement zonder zorgen over opruimen. Ons team helpt je graag met persoonlijk advies over styling, materialen en aantallen voor jouw specifieke situatie, of het nu gaat om een diner thuis, tuinfeest of borrel op kantoor."

Output-eis:
DE OUTPUT MAG NIETS ANDERS BEVATTEN DAN HET VERBETERDE JSON OBJECT.
Er mogen dus GEEN: uitlegzinnen, instructie, commentaar, extra tekst.
Alleen refinete JSON.`;

  try {
    // Voeg een harde timeout toe zodat de UI niet "blijft hangen" als de AI-call vastloopt
    const refineResponse = await Promise.race<string>([
      callAiWithRetry(
        refinePrompt + '\n\nJSON om te verbeteren:\n' + JSON.stringify(existingJson, null, 2),
        true,
        1,
        2000
      ),
      new Promise<string>((_, reject) =>
        setTimeout(
          () => reject(new Error('Timeout bij verbeteren van content. Probeer het opnieuw of maak de tekst iets korter.')),
          60000
        )
      ),
    ]);

    return parseJsonResponse(refineResponse);
  } catch (error: any) {
    console.error('Error in refineContent:', error);
    throw new Error(`Fout bij het verbeteren van content: ${error.message}`);
  }
}

// Tel woorden in tekst
function countWords(text: string): number {
  if (!text || typeof text !== 'string') return 0;
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

// Valideer content lengte voor landingspagina's
function validateContentLength(json: any, type: string): { valid: boolean; wordCount: number; minWords: number; maxWords: number; message?: string } {
  if (type !== 'landing') {
    return { valid: true, wordCount: 0, minWords: 0, maxWords: 0 };
  }

  const content = json.content || json;
  const textFields = [
    content.intro || '',
    content.completeSetupText || '',
    content.inspirationText || '',
    content.detailedScenario || '',
    content.storytellingScene || '',
    content.stylingTipsText || '',
    content.personalAdviceText || '',
    content.adviceText || ''
  ];

  const totalWords = textFields.reduce((sum, text) => sum + countWords(text), 0);
  const minWords = 400;
  const maxWords = 600;

  return {
    valid: totalWords >= minWords && totalWords <= maxWords,
    wordCount: totalWords,
    minWords,
    maxWords,
    message: totalWords < minWords 
      ? `Tekst is te kort: ${totalWords} woorden (minimaal ${minWords} vereist)`
      : totalWords > maxWords
      ? `Tekst is te lang: ${totalWords} woorden (maximaal ${maxWords} toegestaan)`
      : undefined
  };
}

// Escape helper voor regex
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Zorg dat keyword density minimaal op gewenst niveau zit voor landingspagina's
function enforceKeywordDensity(json: any, type: string) {
  if (type !== 'landing') return;

  const seo = json.seo || {};
  const fk: string = seo.focusKeyword || '';
  if (!fk) return;

  const content = json.content || {};
  const cta = json.cta || {};

  // Verzamel alle relevante tekstvelden
  const parts: string[] = [];
  if (content.intro) parts.push(content.intro);
  if (Array.isArray(content.benefits)) parts.push(content.benefits.join(' '));
  if (Array.isArray(content.idealFor)) parts.push(content.idealFor.join(' '));
  if (content.completeSetupText) parts.push(content.completeSetupText);
  if (content.inspirationText) parts.push(content.inspirationText);
  if (content.detailedScenario) parts.push(content.detailedScenario);
  if (content.storytellingScene) parts.push(content.storytellingScene);
  if (content.stylingTipsText) parts.push(content.stylingTipsText);
  if (content.personalAdviceText) parts.push(content.personalAdviceText);
  if (content.adviceText) parts.push(content.adviceText);
  if (cta.ctaText) parts.push(cta.ctaText);

  const fullText = parts.join(' ').toLowerCase();
  if (!fullText) return;

  const pattern = new RegExp(`\\b${escapeRegExp(fk.toLowerCase())}\\b`, 'g');
  const matches = fullText.match(pattern);
  const currentCount = matches ? matches.length : 0;

  // Streef naar minimaal 6 vermeldingen van het focus keyword
  const minOccurrences = 6;
  if (currentCount >= minOccurrences) return;

  const missing = minOccurrences - currentCount;
  const boosterSentences: string[] = [];

  for (let i = 0; i < missing; i++) {
    boosterSentences.push(
      `Dit advies helpt je bij ${fk} in Haarlem en de regio, zodat jij zonder gedoe alles goed regelt.`
    );
  }

  content.adviceText = `${content.adviceText || ''} ${boosterSentences.join(' ')}`.trim();
  json.content = content;
}

// Zorg dat er altijd minimaal één externe uitgaande link is (voor E-E-A-T / Rank Math)
function ensureExternalLinks(json: any, type: string) {
  if (type !== 'landing') return;

  json.links = json.links || {};
  if (!Array.isArray(json.links.externalLinks) || json.links.externalLinks.length === 0) {
    json.links.externalLinks = [
      {
        anchor:
          'Lees meer over geluidsregels, vergunningen en richtlijnen voor evenementen op de website van de gemeente.',
        suggestedType: 'gemeente of overheid',
        reason:
          'Bezoekers kunnen hiermee zelf controleren welke regels gelden voor bijvoorbeeld straatfeesten, muziek en vergunningen in hun regio.'
      }
    ];
  }
}

// Controleer of string een cijfer bevat
function hasDigit(str: string): boolean {
  return /\d/.test(str);
}

// Voeg power word en getal toe aan de SEO titel (RankMath SEO vereisten)
// IDEMPOTENT: Deze functie kan meerdere keren worden aangeroepen zonder dat de titel blijft groeien
// STRUCTUUR: [Focus keyword] [regio] [krachtterm] [getal]
function enhanceSeoTitle(seo: any) {
  if (!seo || !seo.seoTitle) return;
  
  const focusKeyword = (seo.focusKeyword || '').trim();
  if (!focusKeyword) {
    // Geen focus keyword beschikbaar, gebruik oude logica als fallback
    return;
  }
  
  let title: string = seo.seoTitle.trim();
  const titleLower = title.toLowerCase();
  const focusKeywordLower = focusKeyword.toLowerCase();

  // Uitgebreide power words lijst (exclusief "huren" want dat zit al in focus keyword)
  const powerWords = ['compleet', 'eenvoudig', 'snel', 'direct', 'zonder gedoe', 'gratis', 'beste', 'checklist', 'gids', 'voorbeeld', 'inspiratie'];
  
  // Check of er al een power word is (exclusief "huren")
  const hasPower = powerWords.some((pw) => titleLower.includes(pw));
  const hasNumber = hasDigit(title);
  
  // Check of focus keyword aan het BEGIN staat
  const startsWithFocusKeyword = titleLower.startsWith(focusKeywordLower);
  
  // Als alles al correct is: focus keyword aan begin, power word aanwezig, getal aanwezig
  if (startsWithFocusKeyword && hasPower && hasNumber) {
    // Alleen lengte check en trim indien nodig
    if (title.length > 60) {
      const parts = title.split(' – ').map((p) => p.trim());
      if (parts.length > 2) {
        const firstPart = parts[0]; // Focus keyword + regio
        const lastParts = parts.slice(-2); // Power word + getal
        const candidate = `${firstPart} – ${lastParts.join(' – ')}`;
        title = candidate.length <= 60 ? candidate : `${firstPart.slice(0, 57 - lastParts.join(' – ').length)}… – ${lastParts.join(' – ')}`;
      } else {
        title = title.slice(0, 57) + '…';
      }
    }
    seo.seoTitle = title;
    return; // Stop hier - alles is al correct
  }

  // HERSTRUCTUREREN: Zorg dat focus keyword aan het BEGIN staat
  let newTitle = '';
  
  // Begin altijd met focus keyword
  if (!startsWithFocusKeyword) {
    // Verwijder focus keyword uit de titel als het ergens anders staat
    const titleWithoutFocus = titleLower.replace(new RegExp(`\\b${escapeRegExp(focusKeywordLower)}\\b`, 'gi'), '').trim();
    // Start met focus keyword
    newTitle = focusKeyword;
  } else {
    // Focus keyword staat al aan het begin, gebruik huidige titel als basis
    newTitle = title;
  }

  // Voeg regio toe (Haarlem) als die nog niet in de titel staat
  if (!newTitle.toLowerCase().includes('haarlem')) {
    newTitle = `${newTitle} in Haarlem`;
  }

  // Voeg power word toe als die ontbreekt
  if (!hasPower) {
    // Korte power word opties die goed passen
    const shortPowerOptions = ['eenvoudig', 'compleet', 'snel'];
    const bestFit = shortPowerOptions.find(pw => newTitle.length + pw.length + 10 <= 60) || 'eenvoudig';
    
    // Voeg toe na regio, voor het getal
    if (newTitle.length + bestFit.length + 15 <= 60) {
      newTitle = `${newTitle} – ${bestFit}`;
    }
  }

  // Voeg getal toe als dat nog ontbreekt (RankMath vereiste)
  if (!hasNumber) {
    // Korte getal opties
    const numberOptions = ['3 tips', '5 stappen', '100%'];
    const bestNumber = numberOptions.find(opt => newTitle.length + opt.length + 5 <= 60) || '3 tips';
    
    if (newTitle.length + bestNumber.length + 5 <= 60) {
      // Voeg getal toe aan het einde
      newTitle = `${newTitle} – ${bestNumber}`;
    } else {
      // Te lang: probeer een kortere variant
      const shorterNumber = '3 tips';
      if (newTitle.length + shorterNumber.length + 5 <= 60) {
        newTitle = `${newTitle} – ${shorterNumber}`;
      }
    }
  }

  // Bewaak maximale lengte van 60 karakters (RankMath/Google limiet)
  if (newTitle.length > 60) {
    // Strategie: behoud focus keyword + regio + power word + getal, verwijder rest
    const parts = newTitle.split(' – ').map((p) => p.trim());
    
    // Eerste deel moet focus keyword + regio bevatten
    const firstPart = parts[0]; // Focus keyword + regio
    const lastParts = parts.slice(-2); // Power word + getal
    
    if (lastParts.length === 2) {
      const candidate = `${firstPart} – ${lastParts.join(' – ')}`;
      if (candidate.length <= 60) {
        newTitle = candidate;
      } else {
        // Nog te lang: verkort eerste deel (focus keyword + regio)
        const maxFirstLength = 60 - lastParts.join(' – ').length - 3; // 3 voor ' – '
        newTitle = `${firstPart.slice(0, maxFirstLength)}… – ${lastParts.join(' – ')}`;
      }
    } else {
      // Minder delen: hard afkappen
      newTitle = newTitle.slice(0, 57) + '…';
    }
    
    // Finale check: als nog steeds te lang, hard afkappen
    if (newTitle.length > 60) {
      newTitle = newTitle.slice(0, 57) + '…';
    }
  }

  seo.seoTitle = newTitle;
}

// Vervang placeholders in template
function replacePlaceholders(template: string, data: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return result;
}

// Valideer en parse JSON response
function parseJsonResponse(text: string): any {
  // Probeer JSON te extraheren als er extra tekst omheen staat
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      throw new Error('Ongeldige JSON in AI response');
    }
  }
  throw new Error('Geen JSON gevonden in AI response');
}

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Ongeldige JSON in request body' },
        { status: 400 }
      );
    }

    const { mode, type, content, apiKeyOverride, modelOverride, providerOverride, organizationId, ...fields } = body;

    // Haal tenant credential indien aanwezig
    const tenantConfig = await loadTenantCredential(typeof organizationId === 'string' ? organizationId.trim() : undefined);

    // Stel request-level overrides in (alleen voor deze request)
    requestOverrides = {
      apiKey: typeof apiKeyOverride === 'string' && apiKeyOverride.trim() ? apiKeyOverride.trim() : tenantConfig?.apiKey,
      model: typeof modelOverride === 'string' && modelOverride.trim() ? modelOverride.trim() : tenantConfig?.model,
      provider: typeof providerOverride === 'string' && providerOverride.trim() ? providerOverride.trim() : tenantConfig?.provider,
      organizationId: typeof organizationId === 'string' ? organizationId.trim() : tenantConfig?.organizationId,
    };

    // Refine mode: verbeter bestaande content
    if (mode === 'refine') {
      if (!content) {
        return NextResponse.json(
          { error: 'Content is verplicht voor refine mode' },
          { status: 400 }
        );
      }

      try {
        // Bewaar het originele focus keyword VOOR refine
        const originalFocusKeyword = content.seo?.focusKeyword || content.focusKeyword || '';
        const originalTopic = originalFocusKeyword.replace(/\s+huren$/i, '').toLowerCase();
        
        const refinedJson = await refineContent(content);
        
        // KRITIEK: Valideer en corrigeer focus keyword na refine
        if (originalFocusKeyword && refinedJson.seo?.focusKeyword) {
          const refinedFocusKeyword = refinedJson.seo.focusKeyword.toLowerCase();
          const expectedKeyword = originalFocusKeyword.toLowerCase();
          
          // Als focus keyword is veranderd, corrigeer het
          if (!refinedFocusKeyword.includes(originalTopic)) {
            console.warn(`Focus keyword changed during refine! Original: "${originalFocusKeyword}", Refined: "${refinedJson.seo.focusKeyword}". Correcting...`);
            
            // Herstel originele focus keyword
            refinedJson.seo.focusKeyword = originalFocusKeyword;
            
            // Corrigeer seoTitle, metaDescription, urlSlug, H1 als ze verkeerd keyword bevatten
            if (refinedJson.seo.seoTitle && !refinedJson.seo.seoTitle.toLowerCase().includes(originalTopic)) {
              const titleLower = refinedJson.seo.seoTitle.toLowerCase();
              const wrongKeywords = ['servies', 'tafelgerei', 'glaswerk', 'meubilair', 'bestek'];
              
              for (const wrong of wrongKeywords) {
                if (wrong !== originalTopic && titleLower.includes(wrong)) {
                  refinedJson.seo.seoTitle = refinedJson.seo.seoTitle.replace(new RegExp(wrong, 'gi'), originalTopic);
                  break;
                }
              }
            }
            
            if (refinedJson.seo.metaDescription && !refinedJson.seo.metaDescription.toLowerCase().includes(originalTopic)) {
              const metaLower = refinedJson.seo.metaDescription.toLowerCase();
              const wrongKeywords = ['servies', 'tafelgerei', 'glaswerk', 'meubilair', 'bestek'];
              
              for (const wrong of wrongKeywords) {
                if (wrong !== originalTopic && metaLower.includes(wrong)) {
                  refinedJson.seo.metaDescription = refinedJson.seo.metaDescription.replace(new RegExp(wrong, 'gi'), originalTopic);
                  break;
                }
              }
            }
            
            if (refinedJson.content?.h1 && !refinedJson.content.h1.toLowerCase().includes(originalTopic)) {
              const h1Lower = refinedJson.content.h1.toLowerCase();
              const wrongKeywords = ['servies', 'tafelgerei', 'glaswerk', 'meubilair', 'bestek'];
              
              for (const wrong of wrongKeywords) {
                if (wrong !== originalTopic && h1Lower.includes(wrong)) {
                  refinedJson.content.h1 = refinedJson.content.h1.replace(new RegExp(wrong, 'gi'), originalTopic);
                  break;
                }
              }
            }
          }
        }
        
        // Pas RankMath SEO regels toe (power word + getal in Page Title) - alleen als deze nog niet correct zijn
        // BELANGRIJK: Dit moet idempotent zijn - als de titel al correct is, niets doen
        if (refinedJson.seo && refinedJson.seo.seoTitle) {
          const title = refinedJson.seo.seoTitle.trim();
          const titleLower = title.toLowerCase();
          
          // Check of er al een power word is (exclusief "huren" want dat is altijd al in het focus keyword)
          const powerWords = ['eenvoudig', 'compleet', 'snel', 'direct', 'zonder gedoe', 'checklist', 'gids', 'voorbeeld', 'inspiratie'];
          const hasPower = powerWords.some(pw => titleLower.includes(pw));
          const hasNumber = hasDigit(title);
          
          // Alleen enhanceSeoTitle aanroepen als power word OF getal ontbreekt
          // En alleen als de titel niet al te lang is (anders kan het een loop veroorzaken)
          if ((!hasPower || !hasNumber) && title.length < 65) {
            enhanceSeoTitle(refinedJson.seo);
          } else if (title.length > 60) {
            // Alleen lengte trimmen als te lang, maar geen nieuwe elementen toevoegen
            const parts = title.split(' – ').map((p: string) => p.trim());
            if (parts.length > 2) {
              const firstPart = parts[0];
              const lastParts = parts.slice(-2);
              const candidate = `${firstPart} – ${lastParts.join(' – ')}`;
              refinedJson.seo.seoTitle = candidate.length <= 60 ? candidate : `${firstPart.slice(0, 57 - lastParts.join(' – ').length)}… – ${lastParts.join(' – ')}`;
            } else {
              refinedJson.seo.seoTitle = title.slice(0, 57) + '…';
            }
          }
        }
        
        // BELANGRIJK: Bij refine NIET enforceKeywordDensity aanroepen
        // Dit voorkomt dat er bij elke refine extra zinnen worden toegevoegd (loop voorkomen)
        // De AI heeft tijdens refine al de kans gehad om keyword density te verbeteren
        
        // Alleen externe links checken (niet toevoegen als ze er al zijn)
        if (refinedJson.links && (!Array.isArray(refinedJson.links.externalLinks) || refinedJson.links.externalLinks.length === 0)) {
          ensureExternalLinks(refinedJson, 'landing');
        }
        
        return NextResponse.json(refinedJson);
      } catch (error: any) {
        console.error('Error in refine:', error);
        throw error;
      }
    }

    // Generate mode: maak nieuwe content
    if (!type || !TEMPLATES[type]) {
      return NextResponse.json(
        { error: 'Ongeldig content type' },
        { status: 400 }
      );
    }

    // Valideer verplichte velden
    if (!fields.region1 || !fields.region2) {
      return NextResponse.json(
        { error: 'region1 en region2 zijn verplicht' },
        { status: 400 }
      );
    }

    // Valideer regio's voor landingspagina's (moeten uit toegestane lijst komen)
    // Haarlem is altijd toegestaan (vaste regio), alleen region1 en region2 worden gevalideerd
    if (type === 'landing') {
      const normalizedRegions = ALLOWED_REGIONS.map(r => r.toLowerCase());
      const region1Lower = fields.region1?.toString().toLowerCase();
      const region2Lower = fields.region2?.toString().toLowerCase();
      
      // Haarlem is altijd toegestaan, controleer alleen region1 en region2
      const invalidRegions: string[] = [];
      if (region1Lower && region1Lower !== 'haarlem' && !normalizedRegions.includes(region1Lower)) {
        invalidRegions.push(fields.region1?.toString() || 'region1');
      }
      if (region2Lower && region2Lower !== 'haarlem' && !normalizedRegions.includes(region2Lower)) {
        invalidRegions.push(fields.region2?.toString() || 'region2');
      }
      
      if (invalidRegions.length > 0) {
        return NextResponse.json(
          { 
            error: `De volgende regio's zijn niet toegestaan: ${invalidRegions.join(', ')}. Toegestane regio's: Haarlem (altijd toegestaan), ${ALLOWED_REGIONS.join(', ')}`
          },
          { status: 400 }
        );
      }
    }

    // Stap 1: Scenario Selector - kies automatisch scenario's
    console.log('Starting scenario selection...');
    const topic = fields.topic || fields.productName || fields.category || fields.subject || '';
    const description = fields.useCase || fields.goal || fields.targetAudience || '';
    const scenarios = await selectScenarios(topic, type, description);
    console.log('Scenarios selected:', scenarios);
    
    // Stap 2: Internal Link Selector - kies automatisch interne links
    console.log('Starting internal link selection...');
    const internalLinks = await selectInternalLinks(topic, type, scenarios, description);
    console.log('Internal links selected:', internalLinks.length);
    
    // Voeg scenarios en links toe aan fields voor template
    const enrichedFields = {
      ...fields,
      scenarios: scenarios.join(', '),
      scenariosJson: JSON.stringify(scenarios),
    };

    // Laad custom prompts als ze bestaan
    const customPrompts = await loadCustomPrompts();
    const baseInstruction = customPrompts?.base || BASE_INSTRUCTION;
    
    // Gebruik custom template als beschikbaar, anders default
    let template = TEMPLATES[type];
    if (customPrompts && customPrompts[type]) {
      template = customPrompts[type];
    }
    
    // Bouw prompt op met enriched fields (inclusief scenarios)
    const filledTemplate = replacePlaceholders(template, enrichedFields);
    const fullPrompt = `${baseInstruction}\n\n${filledTemplate}`;

    // Eerste call: maak draft (met retry logica)
    console.log('Starting main content generation...');
    let draftResponse: string;
    try {
      draftResponse = await callAiWithRetry(fullPrompt, false, 2, 2000);
    } catch (error: any) {
      console.error('Error in content generation after retries:', error);
      return NextResponse.json(
        { 
          error: 'Fout bij het genereren van content. Probeer het opnieuw of controleer je AI configuratie.',
          details: error.message,
          retry: true
        },
        { status: 500 }
      );
    }
    
    console.log('Draft generated, parsing JSON...');
    let draftJson: any;
    try {
      draftJson = parseJsonResponse(draftResponse);
    } catch (error: any) {
      console.error('Error parsing JSON:', error);
      return NextResponse.json(
        { 
          error: 'Fout bij het verwerken van AI response. De AI heeft geen geldige JSON teruggegeven.',
          details: error.message,
          rawResponse: draftResponse.substring(0, 500) // Eerste 500 karakters voor debugging
        },
        { status: 500 }
      );
    }
    
    // Valideer content lengte
    const lengthValidation = validateContentLength(draftJson, type);
    if (!lengthValidation.valid && type === 'landing') {
      console.warn(`Content length warning: ${lengthValidation.message}`);
      // Voeg waarschuwing toe aan response, maar blokkeer niet
      draftJson._warnings = draftJson._warnings || [];
      draftJson._warnings.push({
        type: 'content_length',
        message: lengthValidation.message,
        wordCount: lengthValidation.wordCount,
        minWords: lengthValidation.minWords,
        maxWords: lengthValidation.maxWords
      });
    }

    // Normaliseer JSON structuur alleen voor landingspagina's.
    // Voor andere types (product, categorie, blog, social) gebruiken we de JSON
    // zoals die uit de AI komt, zodat de specifieke velden behouden blijven.
    let normalizedJson: any;
    if (type === 'landing') {
      // Nieuwe structuur heeft seo, content, faq, cta, etc. objecten
      // Oude structuur heeft alles op root niveau
      normalizedJson = draftJson.seo ? draftJson : {
        seo: {
          seoTitle: draftJson.seoTitle || '',
          metaDescription: draftJson.metaDescription || '',
          focusKeyword: draftJson.focusKeyword || draftJson.keyword || '',
          secondaryKeywords: draftJson.secondaryKeywords || [],
          urlSlug: draftJson.urlSlug || '',
          searchIntent: draftJson.searchIntent || 'transactional',
          searchIntentExplanation: draftJson.searchIntentExplanation || ''
        },
        headings: draftJson.headings || [],
        content: {
          h1: draftJson.h1 || '',
          intro: draftJson.intro || '',
          benefitsTitle: draftJson.benefitsTitle || '',
          benefits: draftJson.benefits || [],
          idealTitle: draftJson.idealTitle || '',
          idealFor: draftJson.idealFor || [],
          completeSetupTitle: draftJson.completeSetupTitle || '',
          completeSetupText: draftJson.completeSetupText || '',
          subcategoriesTitle: draftJson.subcategoriesTitle || '',
          subcategoriesIntro: draftJson.subcategoriesIntro || '',
          subcategories: draftJson.subcategories || [],
          inspirationTitle: draftJson.inspirationTitle || '',
          inspirationText: draftJson.inspirationText || '',
          situationsTitle: draftJson.situationsTitle || '',
          situations: draftJson.situations || [],
          detailedScenarioTitle: draftJson.detailedScenarioTitle || '',
          detailedScenario: draftJson.detailedScenario || '',
          storytellingSceneTitle: draftJson.storytellingSceneTitle || '',
          storytellingScene: draftJson.storytellingScene || '',
          stylingTipsTitle: draftJson.stylingTipsTitle || '',
          stylingTipsText: draftJson.stylingTipsText || '',
          personalAdviceTitle: draftJson.personalAdviceTitle || '',
          personalAdviceText: draftJson.personalAdviceText || '',
          adviceTitle: draftJson.adviceTitle || '',
          adviceText: draftJson.adviceText || '',
          localBlock: draftJson.localBlock || { title: '', text: '' }
        },
        faq: {
          faqTitle: draftJson.faqTitle || '',
          items: draftJson.faq || [],
          schemaFAQType: draftJson.schemaFAQType || 'FAQPage'
        },
        cta: {
          ctaTitle: draftJson.ctaTitle || '',
          ctaText: draftJson.ctaText || '',
          ctaSuggestions: draftJson.ctaSuggestions || [],
          nextSteps: draftJson.nextSteps || []
        },
        imageSEO: {
          images: draftJson.imageSEO || []
        },
        links: {
          internalLinks: draftJson.internalLinks || [],
          externalLinks: draftJson.externalLinks || []
        },
        clusters: {
          contentClusterIdeas: draftJson.contentClusterIdeas || []
        },
        readabilityHints: draftJson.readabilityHints || {},
        schema: draftJson.schema || {}
      };
    } else {
      normalizedJson = draftJson;
    }

    // KRITIEK: Valideer en corrigeer focus keyword voor landingspagina's
    if (type === 'landing' && topic) {
      const expectedFocusKeyword = `${topic.toLowerCase()} huren`;
      const currentFocusKeyword = normalizedJson.seo?.focusKeyword?.toLowerCase() || '';
      
      // Als focus keyword niet overeenkomt met topic, CORRIGEER het
      if (!currentFocusKeyword.includes(topic.toLowerCase()) || !currentFocusKeyword.includes('huren')) {
        console.warn(`Focus keyword mismatch! Expected: "${expectedFocusKeyword}", Got: "${currentFocusKeyword}". Correcting...`);
        
        // Corrigeer focus keyword
        normalizedJson.seo = normalizedJson.seo || {};
        normalizedJson.seo.focusKeyword = expectedFocusKeyword;
        
        // Corrigeer ook seoTitle als die niet het juiste keyword bevat
        if (normalizedJson.seo.seoTitle && !normalizedJson.seo.seoTitle.toLowerCase().includes(topic.toLowerCase())) {
          // Vervang verkeerd keyword in seoTitle
          const titleLower = normalizedJson.seo.seoTitle.toLowerCase();
          const wrongKeywords = ['servies', 'tafelgerei', 'glaswerk', 'meubilair', 'bestek'];
          let correctedTitle = normalizedJson.seo.seoTitle;
          
          for (const wrong of wrongKeywords) {
            if (wrong !== topic.toLowerCase() && titleLower.includes(wrong)) {
              correctedTitle = correctedTitle.replace(new RegExp(wrong, 'gi'), topic);
              break;
            }
          }
          
          normalizedJson.seo.seoTitle = correctedTitle;
        }
        
        // Corrigeer metaDescription als die niet het juiste keyword bevat
        if (normalizedJson.seo.metaDescription && !normalizedJson.seo.metaDescription.toLowerCase().includes(topic.toLowerCase())) {
          const metaLower = normalizedJson.seo.metaDescription.toLowerCase();
          const wrongKeywords = ['servies', 'tafelgerei', 'glaswerk', 'meubilair', 'bestek'];
          let correctedMeta = normalizedJson.seo.metaDescription;
          
          for (const wrong of wrongKeywords) {
            if (wrong !== topic.toLowerCase() && metaLower.includes(wrong)) {
              correctedMeta = correctedMeta.replace(new RegExp(wrong, 'gi'), topic);
              break;
            }
          }
          
          normalizedJson.seo.metaDescription = correctedMeta;
        }
        
        // Corrigeer urlSlug
        if (normalizedJson.seo.urlSlug) {
          const slugLower = normalizedJson.seo.urlSlug.toLowerCase();
          const wrongKeywords = ['servies', 'tafelgerei', 'glaswerk', 'meubilair', 'bestek'];
          
          for (const wrong of wrongKeywords) {
            if (wrong !== topic.toLowerCase() && slugLower.includes(wrong)) {
              normalizedJson.seo.urlSlug = normalizedJson.seo.urlSlug.replace(new RegExp(wrong, 'gi'), topic.toLowerCase());
              break;
            }
          }
          
          // Zorg dat urlSlug het juiste format heeft
          if (!normalizedJson.seo.urlSlug.includes(topic.toLowerCase())) {
            normalizedJson.seo.urlSlug = `${topic.toLowerCase()}-huren-haarlem`;
          }
        } else {
          normalizedJson.seo.urlSlug = `${topic.toLowerCase()}-huren-haarlem`;
        }
        
        // Corrigeer H1 als die niet het juiste keyword bevat
        if (normalizedJson.content?.h1) {
          const h1Lower = normalizedJson.content.h1.toLowerCase();
          const wrongKeywords = ['servies', 'tafelgerei', 'glaswerk', 'meubilair', 'bestek'];
          
          for (const wrong of wrongKeywords) {
            if (wrong !== topic.toLowerCase() && h1Lower.includes(wrong)) {
              normalizedJson.content.h1 = normalizedJson.content.h1.replace(new RegExp(wrong, 'gi'), topic);
              break;
            }
          }
        }
      }
    }

    // Stap 3: Genereer semantisch relevante secondary keywords op basis van focus keyword
    console.log('Generating secondary keywords...');
    const focusKeyword = normalizedJson.seo?.focusKeyword || '';
    if (focusKeyword) {
      const secondaryKeywords = await generateSecondaryKeywords(
        topic,
        focusKeyword,
        type,
        description,
        scenarios
      );
      console.log('Secondary keywords generated:', secondaryKeywords);
      
      // Vervang de gegenereerde secondary keywords met de semantisch relevante versie
      if (secondaryKeywords.length >= 9) {
        normalizedJson.seo.secondaryKeywords = secondaryKeywords.slice(0, 9);
      } else if (secondaryKeywords.length > 0) {
        normalizedJson.seo.secondaryKeywords = secondaryKeywords;
      }
    }

    // Voeg internal links toe aan de draft JSON (als ze nog niet in zitten)
    normalizedJson.links = normalizedJson.links || {};
    if (
      !Array.isArray(normalizedJson.links.internalLinks) ||
      normalizedJson.links.internalLinks.length === 0
    ) {
      if (internalLinks.length > 0) {
        normalizedJson.links.internalLinks = internalLinks;
      } else if (!Array.isArray(normalizedJson.links.internalLinks)) {
        normalizedJson.links.internalLinks = [];
      }
    }

    // Pas ALLE SEO-regels toe op de draft (VOOR improve)
    if (type === 'landing') {
      const seo = normalizedJson.seo || normalizedJson;
      const fk: string = seo.focusKeyword || '';

      // Zorg dat focus keyword in seoTitle en metaDescription staat
      if (fk && seo.seoTitle && !seo.seoTitle.toLowerCase().includes(fk.toLowerCase())) {
        const newTitle = `${fk} – ${seo.seoTitle}`;
        seo.seoTitle = newTitle.length > 60 ? newTitle.slice(0, 57) + '…' : newTitle;
      }

      // Meta description: zorg dat onderwerp + huren er op een natuurlijke manier in zitten
      // Gebruik een korte, natuurlijke zin zoals: "Huur glaswerk gemakkelijk voor jouw evenement in Haarlem en omgeving."
      if (fk && seo.metaDescription) {
        const baseMetaRaw = seo.metaDescription.trim();
        const baseMetaLower = baseMetaRaw.toLowerCase();
        const topicLower = topic?.toLowerCase() || fk.toLowerCase();

        // Als de meta description al het onderwerp bevat, laat hem staan
        if (!baseMetaLower.includes(topicLower)) {
          const needsDot = baseMetaRaw.length > 0 && !/[.!?]$/.test(baseMetaRaw);
          const cleanedMeta = `${baseMetaRaw}${needsDot ? '.' : ''}`.trim();

          // Bouw een natuurlijke eerste zin met onderwerp + huren
          const topicOnly = topicLower;
          const firstSentence =
            topicOnly && topicOnly.length > 0
              ? `Huur ${topicOnly} gemakkelijk voor jouw evenement in Haarlem en omgeving.`
              : `${fk.charAt(0).toUpperCase()}${fk.slice(1)}.`;

          let newMeta = cleanedMeta
            ? `${firstSentence} ${cleanedMeta}`
            : firstSentence;

          if (newMeta.length > 155) {
            newMeta = newMeta.slice(0, 152) + '…';
          }
          seo.metaDescription = newMeta;
        }
      }

      // Pas RankMath SEO-regels toe (power word + getal in Page Title)
      enhanceSeoTitle(seo);

      // Zorg dat keyword density minimaal op gewenst niveau zit
      enforceKeywordDensity(normalizedJson, type);

      // Zorg dat er altijd minimaal één externe uitgaande link is
      ensureExternalLinks(normalizedJson, type);
    }

    // Tweede call: verbeter de tekst (met retry logica)
    console.log('Starting content improvement...');
    let improvedJson: any;
    try {
      improvedJson = await improveContent(normalizedJson, type);
    } catch (error: any) {
      console.error('Error in content improvement:', error);
      // Als improve faalt, gebruik de draft (beter dan niets)
      console.log('Using draft version instead of improved version');
      improvedJson = normalizedJson;
      improvedJson._warnings = improvedJson._warnings || [];
      improvedJson._warnings.push({
        type: 'improvement_failed',
        message: 'Content verbetering is mislukt, originele versie wordt gebruikt.'
      });
    }
    
    // Herhaal ALLE SEO-regels na improve (omdat improve dingen kan veranderen)
    if (type === 'landing') {
      // Valideer content lengte
      const finalLengthValidation = validateContentLength(improvedJson, type);
      if (!finalLengthValidation.valid) {
        improvedJson._warnings = improvedJson._warnings || [];
        improvedJson._warnings.push({
          type: 'content_length',
          message: finalLengthValidation.message,
          wordCount: finalLengthValidation.wordCount,
          minWords: finalLengthValidation.minWords,
          maxWords: finalLengthValidation.maxWords
        });
      }

      // Valideer en corrigeer focus keyword (als improve het heeft veranderd)
      if (topic) {
        const expectedFocusKeyword = `${topic.toLowerCase()} huren`;
        const currentFocusKeyword = improvedJson.seo?.focusKeyword?.toLowerCase() || '';
        
        if (!currentFocusKeyword.includes(topic.toLowerCase()) || !currentFocusKeyword.includes('huren')) {
          console.warn(`Focus keyword changed during improve! Expected: "${expectedFocusKeyword}", Got: "${currentFocusKeyword}". Correcting...`);
          improvedJson.seo = improvedJson.seo || {};
          improvedJson.seo.focusKeyword = expectedFocusKeyword;
        }
      }

      // Zorg dat het focus keyword altijd in de SEO title en meta description
      const seo = improvedJson.seo || improvedJson;
      const fk: string = seo.focusKeyword || '';

      if (fk && seo.seoTitle && !seo.seoTitle.toLowerCase().includes(fk.toLowerCase())) {
        // Prepend focus keyword op een natuurlijke manier, truncate op ~60 chars
        const newTitle = `${fk} – ${seo.seoTitle}`;
        seo.seoTitle = newTitle.length > 60 ? newTitle.slice(0, 57) + '…' : newTitle;
      }

      if (fk && seo.metaDescription) {
        const baseMetaRaw = seo.metaDescription.trim();
        const baseMetaLower = baseMetaRaw.toLowerCase();
        const topicLower = topic?.toLowerCase() || fk.toLowerCase();

        // Alleen ingrijpen als onderwerp nog niet duidelijk aanwezig is
        if (!baseMetaLower.includes(topicLower)) {
          const needsDot = baseMetaRaw.length > 0 && !/[.!?]$/.test(baseMetaRaw);
          const cleanedMeta = `${baseMetaRaw}${needsDot ? '.' : ''}`.trim();

          const topicOnly = topicLower;
          const firstSentence =
            topicOnly && topicOnly.length > 0
              ? `Huur ${topicOnly} gemakkelijk voor jouw evenement in Haarlem en omgeving.`
              : `${fk.charAt(0).toUpperCase()}${fk.slice(1)}.`;

          let newMeta = cleanedMeta
            ? `${firstSentence} ${cleanedMeta}`
            : firstSentence;

          // Truncate rond 155 karakters om Rank Math / SERP limieten te respecteren
          if (newMeta.length > 155) {
            newMeta = newMeta.slice(0, 152) + '…';
          }
          seo.metaDescription = newMeta;
        }
      }

      // Pas RankMath SEO-regels toe (power word + getal in Page Title) - ALTIJD
      enhanceSeoTitle(seo);

      // Zorg dat keyword density minimaal op gewenst niveau zit
      enforceKeywordDensity(improvedJson, type);

      // Zorg dat er altijd minimaal één externe uitgaande link is
      ensureExternalLinks(improvedJson, type);
    }
    
    console.log('Content generation complete!');
    return NextResponse.json(improvedJson);
  } catch (error: any) {
    console.error('Error in generate API:', error);
    
    // Zorg ervoor dat we altijd JSON teruggeven, geen HTML
    const errorMessage = error?.message || error?.toString() || 'Er is een fout opgetreden bij het genereren van content';
    
    return NextResponse.json(
      { error: errorMessage },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  } finally {
    // Reset overrides na afronden request
    requestOverrides = null;
  }
}

