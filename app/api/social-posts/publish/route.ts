import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getCurrentUser } from '@/app/lib/auth';
import { postToInstagram, postCarouselToInstagram } from '@/app/lib/social-media/instagram';
import { postToLinkedIn } from '@/app/lib/social-media/linkedin';

export const dynamic = 'force-dynamic';

// POST: Publiceer een social media post
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
    const { postId, accountId, publishNow } = body;

    if (!postId) {
      return NextResponse.json(
        { error: 'postId is verplicht' },
        { status: 400 }
      );
    }

    // Haal post op
    const post = await prisma.socialPost.findFirst({
      where: {
        id: postId,
        createdBy: user.email,
      },
      include: {
        image: true,
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post niet gevonden' },
        { status: 404 }
      );
    }

    // Bepaal welke account te gebruiken
    let account;
    if (accountId) {
      account = await prisma.socialMediaAccount.findFirst({
        where: {
          id: accountId,
          userId: user.id,
          platform: post.platform,
          isActive: true,
        },
      });
    } else {
      // Gebruik default account
      account = await prisma.socialMediaAccount.findFirst({
        where: {
          userId: user.id,
          platform: post.platform,
          isActive: true,
          isDefault: true,
        },
      });
    }

    if (!account) {
      return NextResponse.json(
        { error: `Geen ${post.platform} account gekoppeld. Koppel eerst een account in Settings.` },
        { status: 400 }
      );
    }

    // Check of post al gepubliceerd is
    if (post.status === 'published' && post.publishedPostId) {
      return NextResponse.json(
        { error: 'Post is al gepubliceerd', postId: post.publishedPostId },
        { status: 400 }
      );
    }

    // Bepaal wanneer te posten
    const shouldPublishNow = publishNow === true || !post.scheduledDate || new Date(post.scheduledDate) <= new Date();

    if (!shouldPublishNow && post.scheduledDate) {
      // Update status naar scheduled
      await prisma.socialPost.update({
        where: { id: postId },
        data: {
          status: 'scheduled',
          socialMediaAccountId: account.id,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Post gepland voor publicatie',
        scheduledDate: post.scheduledDate,
      });
    }

    // Publiceer nu
    let publishedPostId: string;
    let permalink: string | undefined;

    try {
      // Bereid content voor
      const content = post.content as any;
      const caption = content.caption || content.post || content.text || '';
      const imageUrl = post.imageUrl || (post.image ? `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${post.image.url}` : undefined);

      if (post.platform === 'instagram') {
        if (post.contentType === 'carousel' && content.slides && Array.isArray(content.slides)) {
          // Carousel post
          const imageUrls = content.slides
            .map((slide: any) => slide.imageUrl || imageUrl)
            .filter(Boolean);

          if (imageUrls.length === 0 && imageUrl) {
            imageUrls.push(imageUrl);
          }

          if (imageUrls.length === 0) {
            throw new Error('Geen afbeeldingen gevonden voor carousel');
          }

          const result = await postCarouselToInstagram(
            {
              id: account.id,
              accountId: account.accountId,
              accessToken: account.accessToken,
              metadata: account.metadata,
            },
            caption,
            imageUrls
          );

          publishedPostId = result.postId;
          permalink = result.permalink;
        } else {
          // Single image post
          if (!imageUrl) {
            throw new Error('Geen afbeelding gevonden voor Instagram post');
          }

          const result = await postToInstagram(
            {
              id: account.id,
              accountId: account.accountId,
              accessToken: account.accessToken,
              metadata: account.metadata,
            },
            caption,
            imageUrl
          );

          publishedPostId = result.postId;
          permalink = result.permalink;
        }
      } else if (post.platform === 'linkedin') {
        const linkedInText = content.post || content.text || caption;
        const result = await postToLinkedIn(
          {
            id: account.id,
            accountId: account.accountId,
            accountType: account.accountType,
            accessToken: account.accessToken,
            refreshToken: account.refreshToken || undefined,
            metadata: account.metadata,
          },
          linkedInText,
          imageUrl
        );

        publishedPostId = result.postId;
        permalink = result.permalink;
      } else {
        throw new Error(`Platform ${post.platform} wordt nog niet ondersteund voor direct posten`);
      }

      // Update post status
      await prisma.socialPost.update({
        where: { id: postId },
        data: {
          status: 'published',
          publishedPostId,
          publishedDate: new Date(),
          socialMediaAccountId: account.id,
          publishError: null,
          publishAttempts: (post.publishAttempts || 0) + 1,
          lastPublishAttempt: new Date(),
          metadata: {
            ...(post.metadata as any || {}),
            permalink,
            publishedAt: new Date().toISOString(),
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Post succesvol gepubliceerd',
        postId: publishedPostId,
        permalink,
      });
    } catch (error: any) {
      console.error('Error publishing post:', error);

      // Update post met error
      await prisma.socialPost.update({
        where: { id: postId },
        data: {
          status: 'failed',
          publishError: error.message || 'Onbekende fout bij publiceren',
          publishAttempts: (post.publishAttempts || 0) + 1,
          lastPublishAttempt: new Date(),
        },
      });

      return NextResponse.json(
        {
          error: 'Fout bij publiceren',
          details: error.message || 'Onbekende fout',
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error in publish route:', error);
    return NextResponse.json(
      { error: error.message || 'Fout bij publiceren' },
      { status: 500 }
    );
  }
}

