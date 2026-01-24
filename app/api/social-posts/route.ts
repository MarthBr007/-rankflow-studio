import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getCurrentUser } from '@/app/lib/auth';

export const dynamic = 'force-dynamic';

// GET: Haal social posts op (met filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const platform = searchParams.get('platform');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = {};
    // If organizationId is provided, filter by it
    // If not provided, show posts with null organizationId (for users without organizationId)
    if (organizationId) {
      where.organizationId = organizationId;
    } else {
      // Show only posts without organizationId when user has no organizationId
      where.organizationId = null;
    }
    if (platform) where.platform = platform;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.scheduledDate = {};
      if (startDate) where.scheduledDate.gte = new Date(startDate);
      if (endDate) where.scheduledDate.lte = new Date(endDate);
    }

    const posts = await prisma.socialPost.findMany({
      where,
      orderBy: [
        { scheduledDate: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({ posts });
  } catch (error: any) {
    console.error('Error fetching social posts:', error);
    return NextResponse.json(
      { error: error.message || 'Fout bij ophalen social posts' },
      { status: 500 }
    );
  }
}

// POST: Maak nieuwe social post
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Je moet ingelogd zijn' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      organizationId,
      platform,
      contentType,
      title,
      content,
      imageUrl,
      scheduledDate,
      hashtags,
      metadata,
    } = body;

    if (!platform || !contentType || !content) {
      return NextResponse.json(
        { error: 'platform, contentType en content zijn verplicht' },
        { status: 400 }
      );
    }

    const post = await prisma.socialPost.create({
      data: {
        organizationId: organizationId || null,
        platform,
        contentType,
        title: title || null,
        content,
        imageUrl: imageUrl || null,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        status: scheduledDate ? 'scheduled' : 'draft',
        hashtags: hashtags || [],
        metadata: metadata || null,
        createdBy: user.email,
      },
    });

    return NextResponse.json({ post });
  } catch (error: any) {
    console.error('Error creating social post:', error);
    return NextResponse.json(
      { error: error.message || 'Fout bij aanmaken social post' },
      { status: 500 }
    );
  }
}

// PATCH: Update social post
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
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'id is verplicht' },
        { status: 400 }
      );
    }

    // Convert date strings to Date objects if present
    if (updateData.scheduledDate) {
      updateData.scheduledDate = new Date(updateData.scheduledDate);
    }
    if (updateData.publishedDate) {
      updateData.publishedDate = new Date(updateData.publishedDate);
    }

    const post = await prisma.socialPost.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ post });
  } catch (error: any) {
    console.error('Error updating social post:', error);
    return NextResponse.json(
      { error: error.message || 'Fout bij updaten social post' },
      { status: 500 }
    );
  }
}

// DELETE: Verwijder social post
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

    await prisma.socialPost.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting social post:', error);
    return NextResponse.json(
      { error: error.message || 'Fout bij verwijderen social post' },
      { status: 500 }
    );
  }
}

