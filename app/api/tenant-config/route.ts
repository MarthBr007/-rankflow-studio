import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { encryptSecret, decryptSecret } from '@/app/lib/crypto';
import { getCurrentUser } from '@/app/lib/auth';

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
    const listAll = searchParams.get('list') === 'true';

    // Als list=true, return alle tenants (voor tenant selector)
    if (listAll) {
      // Check of gebruiker is ingelogd
      const user = await getCurrentUser();
      
      // Haal alle tenants op
      const allTenants = await prisma.tenantCredential.findMany({
        select: {
          tenantId: true,
          provider: true,
          model: true,
          updatedAt: true,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });

      // Filter tenants op basis van toegang (als gebruiker is ingelogd)
      let accessibleTenants = allTenants;
      if (user) {
        // Als gebruiker globale admin is, toon alle tenants
        if (user.role === 'admin') {
          // Alle tenants zijn toegankelijk
        } else {
          // Filter: alleen tenants waar gebruiker toegang toe heeft
          const userTenants = await prisma.tenantUser.findMany({
            where: { email: user.email },
            select: { organizationId: true },
          });
          const accessibleTenantIds = new Set(userTenants.map(ut => ut.organizationId));
          accessibleTenants = allTenants.filter(t => accessibleTenantIds.has(t.tenantId));
        }
      }

      // Group by tenantId (een tenant kan meerdere providers hebben)
      const tenantMap = new Map<string, { tenantId: string; providers: Array<{ provider: string; model: string; updatedAt: Date }> }>();
      
      for (const tenant of accessibleTenants) {
        if (!tenantMap.has(tenant.tenantId)) {
          tenantMap.set(tenant.tenantId, {
            tenantId: tenant.tenantId,
            providers: [],
          });
        }
        tenantMap.get(tenant.tenantId)!.providers.push({
          provider: tenant.provider,
          model: tenant.model,
          updatedAt: tenant.updatedAt,
        });
      }

      return NextResponse.json({
        tenants: Array.from(tenantMap.values()),
      });
    }

    // Anders: specifieke tenant ophalen
    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId of organizationId is verplicht, of gebruik ?list=true' }, { status: 400 });
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
    const model = (body.model || 'gpt-5').trim();
    const apiKey = (body.apiKey || '').trim();

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId is verplicht' },
        { status: 400 }
      );
    }

    // Check if tenant config already exists
    const existing = await prisma.tenantCredential.findUnique({
      where: { tenantId_provider: { tenantId, provider } },
    });

    // If updating existing config without apiKey, keep existing apiKey
    if (existing && !apiKey) {
      const saved = await prisma.tenantCredential.update({
        where: { tenantId_provider: { tenantId, provider } },
        data: { model, provider },
      });

      // Decrypt existing key for masking
      let existingApiKey = '';
      try {
        existingApiKey = decryptSecret(existing.apiKeyEncrypted);
      } catch (e) {
        existingApiKey = '';
      }

      return NextResponse.json({
        success: true,
        tenantId: saved.tenantId,
        provider: saved.provider,
        model: saved.model,
        apiKeyMasked: maskKey(existingApiKey),
        updatedAt: saved.updatedAt,
      });
    }

    // If creating new or updating with apiKey, apiKey is required
    if (!apiKey) {
      return NextResponse.json(
        { error: 'apiKey is verplicht voor nieuwe configuraties' },
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

