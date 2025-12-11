export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// GET: Haal alle versies van een content item op
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('id');

    if (!contentId) {
      return NextResponse.json(
        { error: 'id is verplicht' },
        { status: 400 }
      );
    }

    const versions = await prisma.libraryVersion.findMany({
      where: { libraryContentId: contentId },
      orderBy: { version: 'desc' },
      include: {
        libraryContent: {
          select: {
            title: true,
            contentType: true,
          },
        },
      },
    });

    return NextResponse.json(versions.map((v) => ({
      id: v.id,
      version: v.version,
      data: v.data,
      preview: v.preview,
      metadata: v.metadata,
      createdAt: v.createdAt.toISOString(),
      title: v.libraryContent.title,
      type: v.libraryContent.contentType,
    })));
  } catch (error: any) {
    console.error('Error loading versions:', error);
    return NextResponse.json(
      { error: error.message || 'Fout bij het laden van versies' },
      { status: 500 }
    );
  }
}

