import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

interface ContentItem {
  id: string;
  type: string;
  title: string;
  createdAt: string;
  data: any;
  preview?: string;
}

// GET: Haal alle opgeslagen content op (met optionele versie parameter)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('id');
    const version = searchParams.get('version');
    const organizationId = searchParams.get('organizationId');

    // Haal specifieke versie op
    if (contentId && version) {
      const versionNum = parseInt(version, 10);
      const libraryVersion = await prisma.libraryVersion.findUnique({
        where: {
          libraryContentId_version: {
            libraryContentId: contentId,
            version: versionNum,
          },
        },
        include: {
          libraryContent: true,
        },
      });

      if (!libraryVersion) {
        return NextResponse.json({ error: 'Versie niet gevonden' }, { status: 404 });
      }

      return NextResponse.json({
        id: libraryVersion.libraryContentId,
        version: libraryVersion.version,
        data: libraryVersion.data,
        preview: libraryVersion.preview,
        metadata: libraryVersion.metadata,
        createdAt: libraryVersion.createdAt,
        title: libraryVersion.libraryContent.title,
        type: libraryVersion.libraryContent.contentType,
      });
    }

    // Haal alle content items op (laatste versie)
    const where: any = {};
    if (organizationId) {
      where.organizationId = organizationId;
    }

    const libraryItems = await prisma.libraryContent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        versions: {
          orderBy: { version: 'desc' },
          take: 1, // Alleen laatste versie
        },
      },
    });

    const result = libraryItems.map((item) => ({
      id: item.id,
      type: item.contentType,
      title: item.title,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      currentVersion: item.currentVersion,
      data: item.versions[0]?.data || null,
      preview: item.versions[0]?.preview || null,
      versionCount: item.versions.length,
    }));

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error loading library:', error);
    return NextResponse.json(
      { error: error.message || 'Fout bij het laden van library' },
      { status: 500 }
    );
  }
}

// POST: Sla nieuwe content op of update bestaande (nieuwe versie)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, type, title, data, metadata, organizationId } = body;

    if (!type || !title || !data) {
      return NextResponse.json(
        { error: 'type, title en data zijn verplicht' },
        { status: 400 }
      );
    }

    const preview = generatePreview(data, type);

    // Als id is opgegeven, voeg nieuwe versie toe aan bestaand item
    if (id) {
      const existing = await prisma.libraryContent.findUnique({
        where: { id },
        include: { versions: { orderBy: { version: 'desc' }, take: 1 } },
      });

      if (!existing) {
        return NextResponse.json({ error: 'Content niet gevonden' }, { status: 404 });
      }

      const newVersion = existing.currentVersion + 1;

      await prisma.libraryVersion.create({
        data: {
          libraryContentId: id,
          version: newVersion,
          data,
          preview,
          metadata: metadata || null,
        },
      });

      await prisma.libraryContent.update({
        where: { id },
        data: {
          currentVersion: newVersion,
          title, // Update title als die is veranderd
        },
      });

      return NextResponse.json({
        success: true,
        id,
        version: newVersion,
        message: 'Nieuwe versie opgeslagen',
      });
    }

    // Nieuwe content item aanmaken
    const newContent = await prisma.libraryContent.create({
      data: {
        organizationId: organizationId || null,
        contentType: type,
        title,
        currentVersion: 1,
        versions: {
          create: {
            version: 1,
            data,
            preview,
            metadata: metadata || null,
          },
        },
      },
      include: {
        versions: true,
      },
    });

    return NextResponse.json({
      success: true,
      item: {
        id: newContent.id,
        type: newContent.contentType,
        title: newContent.title,
        createdAt: newContent.createdAt.toISOString(),
        data: newContent.versions[0].data,
        preview: newContent.versions[0].preview,
        version: 1,
      },
    });
  } catch (error: any) {
    console.error('Error saving library content:', error);
    return NextResponse.json(
      { error: error.message || 'Fout bij het opslaan van content' },
      { status: 500 }
    );
  }
}

// DELETE: Verwijder content item (verwijdert alle versies)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'id is verplicht' },
        { status: 400 }
      );
    }

    await prisma.libraryContent.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting library content:', error);
    return NextResponse.json(
      { error: error.message || 'Fout bij het verwijderen van content' },
      { status: 500 }
    );
  }
}

// Genereer preview tekst
function generatePreview(data: any, type: string): string {
  if (type === 'landing') {
    return data.h1 || data.seoTitle || 'Landingspagina';
  } else if (type === 'product') {
    return data.title || data.seoTitle || 'Productpagina';
  } else if (type === 'categorie') {
    return data.h1 || data.seoTitle || 'Categoriepagina';
  } else if (type === 'blog') {
    return data.h1 || data.title || 'Blog artikel';
  } else if (type === 'social') {
    return data.topic || 'Social Media Post';
  }
  return 'Content';
}

