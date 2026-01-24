import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const CONFIG_FILE = join(process.cwd(), 'config.json');

// Laad configuratie
async function loadConfig() {
  // Probeer eerst config.json te laden
  try {
    const data = await readFile(CONFIG_FILE, 'utf-8');
    const config = JSON.parse(data);
    // Gebruik environment variables alleen als fallback voor API key (als config.json geen key heeft)
    if (!config.apiKey && process.env.OPENAI_API_KEY) {
      config.apiKey = process.env.OPENAI_API_KEY;
    }
    return config;
  } catch (error) {
    // Als bestand niet bestaat, gebruik environment variables of defaults
    if (process.env.OPENAI_API_KEY) {
      return {
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_MODEL || 'gpt-5',
        provider: process.env.OPENAI_PROVIDER || 'openai',
      };
    }
    // Default config
    return {
      apiKey: '',
      model: 'gpt-5',
      provider: 'openai',
    };
  }
}

// GET: Haal configuratie op
export async function GET() {
  try {
    const config = await loadConfig();
    // Verberg API key voor veiligheid (toon alleen laatste 4 karakters)
    const safeConfig = {
      ...config,
      apiKey: config.apiKey ? `${'*'.repeat(Math.max(0, config.apiKey.length - 4))}${config.apiKey.slice(-4)}` : '',
      apiKeyLength: config.apiKey ? config.apiKey.length : 0,
    };
    return NextResponse.json(safeConfig);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Fout bij het laden van configuratie' },
      { status: 500 }
    );
  }
}

// POST: Sla configuratie op
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, model, provider } = body;

    // Valideer
    if (!model || !provider) {
      return NextResponse.json(
        { error: 'Model en provider zijn verplicht' },
        { status: 400 }
      );
    }

    // Valideer provider
    const validProviders = ['openai', 'anthropic', 'google'];
    if (!validProviders.includes(provider)) {
      return NextResponse.json(
        { error: `Provider moet één van deze zijn: ${validProviders.join(', ')}` },
        { status: 400 }
      );
    }

    // Valideer model op basis van provider
    const validModels: Record<string, string[]> = {
      openai: ['gpt-5', 'gpt-5-turbo', 'gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
      anthropic: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
      google: ['gemini-pro', 'gemini-pro-vision'],
    };

    if (!validModels[provider]?.includes(model)) {
      return NextResponse.json(
        { error: `Model ${model} is niet geldig voor provider ${provider}. Geldige modellen: ${validModels[provider]?.join(', ')}` },
        { status: 400 }
      );
    }

    // Laad bestaande config
    const existingConfig = await loadConfig();
    
    // Update config (behoud apiKey als deze leeg is of niet wordt meegegeven)
    const updatedConfig = {
      ...existingConfig,
      model: model.trim(),
      provider: provider.trim(),
      // Update API key alleen als deze wordt meegegeven EN niet leeg is
      apiKey: (apiKey !== undefined && apiKey.trim() !== '') ? apiKey.trim() : existingConfig.apiKey,
    };

    console.log('Saving config to file:', { model: updatedConfig.model, provider: updatedConfig.provider, hasApiKey: !!updatedConfig.apiKey });

    // Sla op (alleen lokaal; in Vercel raden we env vars aan)
    try {
      await writeFile(CONFIG_FILE, JSON.stringify(updatedConfig, null, 2), 'utf-8');
      console.log('Config file written successfully');
    } catch (writeError: any) {
      console.error('Error writing config file:', writeError);
      throw new Error(`Fout bij schrijven config bestand: ${writeError.message}`);
    }

    return NextResponse.json({ 
      success: true,
      message: 'Configuratie opgeslagen',
      // Verberg API key in response
      config: {
        ...updatedConfig,
        apiKey: updatedConfig.apiKey ? `${'*'.repeat(Math.max(0, updatedConfig.apiKey.length - 4))}${updatedConfig.apiKey.slice(-4)}` : '',
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Fout bij het opslaan van configuratie' },
      { status: 500 }
    );
  }
}

