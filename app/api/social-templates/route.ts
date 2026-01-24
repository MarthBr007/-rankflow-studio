import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/app/lib/auth';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

// GET: List templates
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const platform = searchParams.get('platform');
    const contentType = searchParams.get('contentType');

    const where: any = {};
    if (organizationId) {
      where.organizationId = organizationId;
    }
    if (platform) {
      where.platform = platform;
    }
    if (contentType) {
      where.contentType = contentType;
    }

    const templates = await prisma.socialPostTemplate.findMany({
      where,
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ],
    });

    return NextResponse.json({ templates });
  } catch (error: any) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: error.message || 'Fout bij ophalen templates' },
      { status: 500 }
    );
  }
}

// POST: Create template
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, platform, contentType, content, hashtags, organizationId, isDefault } = body;

    if (!name || !platform || !contentType || !content) {
      return NextResponse.json(
        { error: 'Naam, platform, content type en content zijn verplicht' },
        { status: 400 }
      );
    }

    // If setting as default, unset other defaults for this platform
    if (isDefault && organizationId) {
      await prisma.socialPostTemplate.updateMany({
        where: {
          organizationId,
          platform,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const template = await prisma.socialPostTemplate.create({
      data: {
        name,
        description,
        platform,
        contentType,
        content,
        hashtags: hashtags || [],
        organizationId: organizationId || null,
        isDefault: isDefault || false,
        createdBy: user.email || null,
      },
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: error.message || 'Fout bij aanmaken template' },
      { status: 500 }
    );
  }
}

// PATCH: Update template
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, description, platform, contentType, content, hashtags, isDefault, organizationId } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is verplicht' }, { status: 400 });
    }

    // If setting as default, unset other defaults for this platform
    if (isDefault && organizationId) {
      await prisma.socialPostTemplate.updateMany({
        where: {
          organizationId,
          platform: platform || undefined,
          isDefault: true,
          NOT: { id },
        },
        data: {
          isDefault: false,
        },
      });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (platform !== undefined) updateData.platform = platform;
    if (contentType !== undefined) updateData.contentType = contentType;
    if (content !== undefined) updateData.content = content;
    if (hashtags !== undefined) updateData.hashtags = hashtags;
    if (isDefault !== undefined) updateData.isDefault = isDefault;

    const template = await prisma.socialPostTemplate.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ template });
  } catch (error: any) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { error: error.message || 'Fout bij bijwerken template' },
      { status: 500 }
    );
  }
}

// DELETE: Delete template
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is verplicht' }, { status: 400 });
    }

    await prisma.socialPostTemplate.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: error.message || 'Fout bij verwijderen template' },
      { status: 500 }
    );
  }
}

