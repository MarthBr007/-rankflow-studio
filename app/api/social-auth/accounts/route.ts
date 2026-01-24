import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getCurrentUser } from '@/app/lib/auth';
import { decryptSecret, encryptSecret } from '@/app/lib/crypto';

export const dynamic = 'force-dynamic';

// GET: Haal gekoppelde social media accounts op
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Je moet ingelogd zijn' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    const organizationId = searchParams.get('organizationId');

    const where: any = {
      userId: user.id,
      isActive: true,
    };

    if (platform) {
      where.platform = platform;
    }

    if (organizationId) {
      where.organizationId = organizationId;
    }

    const accounts = await prisma.socialMediaAccount.findMany({
      where,
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    // Decrypt tokens voor client (alleen voor display, niet voor API calls)
    const safeAccounts = accounts.map(account => ({
      id: account.id,
      organizationId: account.organizationId,
      platform: account.platform,
      accountType: account.accountType,
      accountId: account.accountId,
      accountName: account.accountName,
      username: account.username,
      isActive: account.isActive,
      isDefault: account.isDefault,
      metadata: account.metadata,
      tokenExpiresAt: account.tokenExpiresAt,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
      // Don't send tokens to client
    }));

    return NextResponse.json({ accounts: safeAccounts });
  } catch (error: any) {
    console.error('Error fetching social accounts:', error);
    return NextResponse.json(
      { error: error.message || 'Fout bij ophalen social accounts' },
      { status: 500 }
    );
  }
}

// DELETE: Ontkoppel social media account
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Je moet ingelogd zijn' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'id is verplicht' },
        { status: 400 }
      );
    }

    // Verify ownership
    const account = await prisma.socialMediaAccount.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Account niet gevonden of geen toegang' },
        { status: 404 }
      );
    }

    // Soft delete (set isActive to false)
    await prisma.socialMediaAccount.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error disconnecting social account:', error);
    return NextResponse.json(
      { error: error.message || 'Fout bij ontkoppelen account' },
      { status: 500 }
    );
  }
}

