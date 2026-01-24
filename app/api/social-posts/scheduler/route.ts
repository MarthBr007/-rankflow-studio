import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { postToInstagram, postCarouselToInstagram } from '@/app/lib/social-media/instagram';
import { postToLinkedIn } from '@/app/lib/social-media/linkedin';
import { decryptSecret } from '@/app/lib/crypto';

export const dynamic = 'force-dynamic';

/**
 * Scheduler endpoint - wordt aangeroepen door cron job of queue
 * Checkt voor scheduled posts en publiceert ze
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const schedulerSecret = process.env.SCHEDULER_SECRET;

    // Basic auth check (optioneel, maar aanbevolen)
    if (schedulerSecret && authHeader !== `Bearer ${schedulerSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000); // 5 minuten buffer

    // Haal alle posts op die gepland zijn voor publicatie
    const scheduledPosts = await prisma.socialPost.findMany({
      where: {
        status: 'scheduled',
        scheduledDate: {
          lte: fiveMinutesFromNow, // Posts die binnen 5 minuten gepland zijn
        },
        socialMediaAccountId: {
          not: null, // Moet een gekoppeld account hebben
        },
      },
      include: {
        image: true,
      },
      take: 50, // Max 50 posts per run
    });

    const results = {
      processed: 0,
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const post of scheduledPosts) {
      results.processed++;

      try {
        // Haal account op
        const account = await prisma.socialMediaAccount.findUnique({
          where: { id: post.socialMediaAccountId! },
        });

        if (!account || !account.isActive) {
          throw new Error('Account niet gevonden of niet actief');
        }

        // Check of token nog geldig is (optioneel, kan later uitgebreid worden met refresh)
        if (account.tokenExpiresAt && new Date(account.tokenExpiresAt) < now) {
          throw new Error('Access token is verlopen. Koppel het account opnieuw.');
        }

        // Publiceer post
        let publishedPostId: string;
        let permalink: string | undefined;

        const content = post.content as any;
        const caption = content.caption || content.post || content.text || '';
        const imageUrl = post.imageUrl || (post.image ? `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${post.image.url}` : undefined);

        if (post.platform === 'instagram') {
          if (post.contentType === 'carousel' && content.slides && Array.isArray(content.slides)) {
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
          throw new Error(`Platform ${post.platform} wordt nog niet ondersteund`);
        }

        // Update post status
        await prisma.socialPost.update({
          where: { id: post.id },
          data: {
            status: 'published',
            publishedPostId,
            publishedDate: new Date(),
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

        results.success++;
      } catch (error: any) {
        results.failed++;
        const errorMessage = error.message || 'Onbekende fout';

        // Update post met error
        await prisma.socialPost.update({
          where: { id: post.id },
          data: {
            status: 'failed',
            publishError: errorMessage,
            publishAttempts: (post.publishAttempts || 0) + 1,
            lastPublishAttempt: new Date(),
          },
        });

        results.errors.push(`Post ${post.id}: ${errorMessage}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Verwerkt: ${results.processed}, Succes: ${results.success}, Gefaald: ${results.failed}`,
      results,
    });
  } catch (error: any) {
    console.error('Error in scheduler:', error);
    return NextResponse.json(
      { error: error.message || 'Fout bij scheduler' },
      { status: 500 }
    );
  }
}

