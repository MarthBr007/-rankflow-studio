import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getCurrentUser } from '@/app/lib/auth';
import { checkUserAccess } from '@/app/lib/access-control';

// Laad configuratie voor AI calls
async function loadConfig() {
  if (process.env.OPENAI_API_KEY) {
    return {
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-5',
      provider: process.env.OPENAI_PROVIDER || 'openai',
    };
  }
  try {
    const { readFile } = await import('fs/promises');
    const { join } = await import('path');
    const data = await readFile(join(process.cwd(), 'config.json'), 'utf-8');
    return JSON.parse(data);
  } catch {
    return {
      apiKey: '',
      model: 'gpt-5',
      provider: 'openai',
    };
  }
}

// AI call functie
async function callOpenAI(apiKey: string, model: string, systemMessage: string, prompt: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minuten voor prompt generatie

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('AI call timeout: De request duurde te lang (>2 minuten)');
    }
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check user is logged in
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Je moet ingelogd zijn om prompts te genereren' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      tenantId,
      companyName,
      industry,
      toneOfVoice,
      regions,
      products,
      targetAudience,
      brandValues,
      avoidWords,
      emphasizeWords,
      servicePromises,
      scenarios,
      website,
      socialMedia,
    } = body;

    if (!tenantId || !companyName) {
      return NextResponse.json(
        { error: 'tenantId en companyName zijn verplicht' },
        { status: 400 }
      );
    }

    // Check toegang tot tenant (tenzij gebruiker globale admin is)
    if (user.role !== 'admin') {
      // Check of gebruiker toegang heeft tot deze tenant
      const access = await checkUserAccess(tenantId, user.email);
      if (!access.canEdit && !access.canAdmin) {
        return NextResponse.json(
          { error: 'Je hebt geen toegang tot deze tenant of geen rechten om prompts te bewerken' },
          { status: 403 }
        );
      }
    }

    // Laad AI configuratie
    const config = await loadConfig();
    if (!config.apiKey) {
      return NextResponse.json(
        { error: 'AI API key is niet geconfigureerd. Ga naar Settings → AI Configuratie' },
        { status: 400 }
      );
    }

    // Bouw intake samenvatting
    const intakeSummary = `
BEDRIJFSINFORMATIE:
- Bedrijfsnaam: ${companyName}
- Branche: ${industry || 'Niet opgegeven'}
- Website: ${website || 'Niet opgegeven'}
- Social media: ${socialMedia || 'Niet opgegeven'}

TONE OF VOICE:
${toneOfVoice || 'Niet opgegeven'}

REGIO'S:
${regions ? regions.join(', ') : 'Niet opgegeven'}

PRODUCTEN/DIENSTEN:
${products || 'Niet opgegeven'}

DOELGROEP:
${targetAudience || 'Niet opgegeven'}

MERKWAARDEN:
${brandValues || 'Niet opgegeven'}

TE VERMIJDEN WOORDEN:
${avoidWords || 'Geen specifieke woorden om te vermijden'}

TE BENADRUKKEN WOORDEN:
${emphasizeWords || 'Geen specifieke woorden om te benadrukken'}

SERVICEBELOFTES:
${servicePromises || 'Niet opgegeven'}

SCENARIO'S/GEBRUIKSSITUATIES:
${scenarios || 'Niet opgegeven'}
`;

    // System message voor prompt generatie
    const systemMessage = `Je bent een expert in het schrijven van uitgebreide, professionele AI prompts voor content generatie. Je genereert prompts die:
1. Exact dezelfde structuur en kwaliteit hebben als de Broers Verhuur prompts
2. Volledig zijn aangepast aan de bedrijfsinformatie die wordt gegeven
3. Alle SEO 2025 best practices bevatten
4. Specifieke tone of voice, regio's, producten en merkwaarden verwerken
5. Uitgebreid en gedetailleerd zijn (zoals de Broers Verhuur prompts)

Je genereert prompts in JSON format met deze structuur:
{
  "base": "Uitgebreide base instruction met bedrijfsnaam, tone of voice, schrijfstijl, SEO regels",
  "landing": "Uitgebreide landing template met alle regels en validatie",
  "product": "Uitgebreide product template",
  "categorie": "Uitgebreide categorie template",
  "blog": "Uitgebreide blog template",
  "social": "Uitgebreide social media template"
}

De prompts moeten:
- De bedrijfsnaam gebruiken in plaats van "Broers Verhuur"
- De opgegeven regio's gebruiken in plaats van "Haarlem"
- De tone of voice volgen die is opgegeven
- De producten/diensten verwerken
- De servicebeloftes verwerken
- De scenario's verwerken
- Alle SEO 2025 regels bevatten (zoals in de Broers Verhuur prompts)
- Even uitgebreid en gedetailleerd zijn als de Broers Verhuur prompts`;

    // User prompt
    const userPrompt = `Genereer uitgebreide, professionele prompts voor content generatie op basis van deze bedrijfsinformatie:

${intakeSummary}

Gebruik als referentie de structuur en kwaliteit van de Broers Verhuur prompts, maar pas alles aan naar dit bedrijf.

Belangrijk:
- De prompts moeten even uitgebreid zijn als de Broers Verhuur prompts
- Alle SEO 2025 regels moeten erin zitten
- Alle validatie regels moeten erin zitten
- De tone of voice moet exact worden gevolgd
- Regio's moeten worden aangepast
- Producten/diensten moeten worden verwerkt
- Servicebeloftes moeten worden verwerkt
- Scenario's moeten worden verwerkt

Genereer de prompts als JSON met deze structuur:
{
  "base": "...",
  "landing": "...",
  "product": "...",
  "categorie": "...",
  "blog": "...",
  "social": "..."
}

Zorg dat de prompts minimaal 2000 woorden per template bevatten en alle details bevatten die nodig zijn voor professionele content generatie.`;

    // Genereer prompts via AI
    console.log('Generating prompts for tenant:', tenantId);
    const generatedPromptsJson = await callOpenAI(config.apiKey, config.model, systemMessage, userPrompt);

    // Parse JSON response
    let generatedPrompts;
    try {
      // Probeer JSON te extraheren als het in markdown code blocks staat
      const jsonMatch = generatedPromptsJson.match(/```json\s*([\s\S]*?)\s*```/) || generatedPromptsJson.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        generatedPrompts = JSON.parse(jsonMatch[1]);
      } else {
        generatedPrompts = JSON.parse(generatedPromptsJson);
      }
    } catch (parseError) {
      console.error('Error parsing generated prompts:', parseError);
      console.error('Raw response:', generatedPromptsJson.substring(0, 500));
      return NextResponse.json(
        { error: 'Fout bij het parsen van gegenereerde prompts. Probeer het opnieuw.' },
        { status: 500 }
      );
    }

    // Valideer dat alle vereiste velden aanwezig zijn
    const requiredFields = ['base', 'landing', 'product', 'categorie', 'blog', 'social'];
    for (const field of requiredFields) {
      if (!generatedPrompts[field]) {
        return NextResponse.json(
          { error: `Gegenereerde prompts missen vereist veld: ${field}` },
          { status: 500 }
        );
      }
    }

    // Sla prompts op in database
    const latestVersion = await prisma.promptVersion.findFirst({
      where: { tenantId },
      orderBy: { version: 'desc' },
    });

    const newVersion = (latestVersion?.version || 0) + 1;

    await prisma.promptVersion.create({
      data: {
        tenantId,
        version: newVersion,
        data: generatedPrompts,
      },
    });

    return NextResponse.json({
      success: true,
      prompts: generatedPrompts,
      version: newVersion,
      message: 'Prompts succesvol gegenereerd en opgeslagen!',
    });
  } catch (error: any) {
    console.error('Error generating prompts:', error);
    return NextResponse.json(
      { error: error.message || 'Fout bij het genereren van prompts' },
      { status: 500 }
    );
  }
}

