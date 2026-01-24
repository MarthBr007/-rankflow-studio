import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getCurrentUser } from '@/app/lib/auth';
import { unlink } from 'fs/promises';
import { join } from 'path';

export const dynamic = 'force-dynamic';

// GET: Haal images op
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const tags = searchParams.get('tags'); // Comma-separated tags

    const where: any = {};
    if (organizationId) where.organizationId = organizationId;
    if (tags) {
      const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
      where.tags = { hasSome: tagArray };
    }

    const images = await prisma.uploadedImage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ images });
  } catch (error: any) {
    console.error('Error fetching images:', error);
    return NextResponse.json(
      { error: error.message || 'Fout bij ophalen afbeeldingen' },
      { status: 500 }
    );
  }
}

// DELETE: Verwijder image
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

    // Get image record
    const image = await prisma.uploadedImage.findUnique({
      where: { id },
    });

    if (!image) {
      return NextResponse.json(
        { error: 'Afbeelding niet gevonden' },
        { status: 404 }
      );
    }

    // Delete file from filesystem
    try {
      const filepath = join(process.cwd(), 'public', image.url);
      await unlink(filepath);
    } catch (error) {
      console.error('Error deleting file:', error);
      // Continue even if file deletion fails
    }

    // Delete database record
    await prisma.uploadedImage.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { error: error.message || 'Fout bij verwijderen afbeelding' },
      { status: 500 }
    );
  }
}

// PATCH: Update image metadata
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Je moet ingelogd zijn' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, alt, tags } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'id is verplicht' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (alt !== undefined) updateData.alt = alt;
    if (tags !== undefined) {
      updateData.tags = Array.isArray(tags) ? tags : tags.split(',').map((t: string) => t.trim()).filter(Boolean);
    }

    const image = await prisma.uploadedImage.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ image });
  } catch (error: any) {
    console.error('Error updating image:', error);
    return NextResponse.json(
      { error: error.message || 'Fout bij updaten afbeelding' },
      { status: 500 }
    );
  }
}

