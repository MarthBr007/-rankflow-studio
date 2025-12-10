import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { encryptSecret, decryptSecret } from '@/app/lib/crypto';

function maskKey(key: string) {
  if (!key) return '';
  const visible = key.slice(-4);
  return `${'*'.repeat(Math.max(0, key.length - 4))}${visible}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId') || searchParams.get('organizationId') || '';
    const provider = searchParams.get('provider') || 'openai';

    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId of organizationId is verplicht' }, { status: 400 });
    }

    const cred = await prisma.tenantCredential.findUnique({
      where: { tenantId_provider: { tenantId, provider } },
    });

    if (!cred) {
      return NextResponse.json({ exists: false });
    }

    // decrypt for masked length only
    let apiKey = '';
    try {
      apiKey = decryptSecret(cred.apiKeyEncrypted);
    } catch (e) {
      apiKey = '';
    }

    return NextResponse.json({
      exists: true,
      tenantId: cred.tenantId,
      provider: cred.provider,
      model: cred.model,
      apiKeyMasked: maskKey(apiKey),
      apiKeyLength: apiKey.length,
      updatedAt: cred.updatedAt,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tenantId = (body.tenantId || '').trim();
    const provider = (body.provider || 'openai').trim();
    const model = (body.model || 'gpt-4o-mini').trim();
    const apiKey = (body.apiKey || '').trim();

    if (!tenantId || !apiKey) {
      return NextResponse.json(
        { error: 'tenantId en apiKey zijn verplicht' },
        { status: 400 }
      );
    }

    const encrypted = encryptSecret(apiKey);

    const saved = await prisma.tenantCredential.upsert({
      where: { tenantId_provider: { tenantId, provider } },
      update: { apiKeyEncrypted: encrypted, model, provider },
      create: { tenantId, provider, model, apiKeyEncrypted: encrypted },
    });

    return NextResponse.json({
      success: true,
      tenantId: saved.tenantId,
      provider: saved.provider,
      model: saved.model,
      apiKeyMasked: maskKey(apiKey),
      updatedAt: saved.updatedAt,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId') || '';
    const provider = searchParams.get('provider') || 'openai';

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId is verplicht' },
        { status: 400 }
      );
    }

    await prisma.tenantCredential.deleteMany({
      where: { tenantId, provider },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

