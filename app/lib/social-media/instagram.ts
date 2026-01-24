import { decryptSecret } from '@/app/lib/crypto';

interface InstagramAccount {
  id: string;
  accountId: string; // Instagram Business Account ID
  accessToken: string; // Encrypted
  metadata?: any;
}

/**
 * Post een afbeelding naar Instagram
 */
export async function postToInstagram(
  account: InstagramAccount,
  caption: string,
  imageUrl: string
): Promise<{ postId: string; permalink?: string }> {
  const accessToken = decryptSecret(account.accessToken);
  const igUserId = account.accountId;

  // Step 1: Upload image container
  // Note: imageUrl moet publiek toegankelijk zijn (HTTPS)
  const mediaResponse = await fetch(
    `https://graph.facebook.com/v18.0/${igUserId}/media`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: imageUrl,
        caption: caption,
        access_token: accessToken,
      }),
    }
  );

  if (!mediaResponse.ok) {
    const errorData = await mediaResponse.json().catch(() => ({}));
    throw new Error(
      `Instagram media upload failed: ${errorData.error?.message || mediaResponse.statusText}`
    );
  }

  const mediaData = await mediaResponse.json();
  const containerId = mediaData.id;

  if (!containerId) {
    throw new Error('Geen container ID ontvangen van Instagram');
  }

  // Step 2: Wait a bit for Instagram to process the image (optional but recommended)
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Step 3: Publish the post
  const publishResponse = await fetch(
    `https://graph.facebook.com/v18.0/${igUserId}/media_publish`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        creation_id: containerId,
        access_token: accessToken,
      }),
    }
  );

  if (!publishResponse.ok) {
    const errorData = await publishResponse.json().catch(() => ({}));
    throw new Error(
      `Instagram publish failed: ${errorData.error?.message || publishResponse.statusText}`
    );
  }

  const publishData = await publishResponse.json();
  const postId = publishData.id;

  // Step 4: Get post permalink (optional)
  let permalink: string | undefined;
  try {
    const postInfoResponse = await fetch(
      `https://graph.facebook.com/v18.0/${postId}?fields=permalink&access_token=${accessToken}`,
      { method: 'GET' }
    );

    if (postInfoResponse.ok) {
      const postInfo = await postInfoResponse.json();
      permalink = postInfo.permalink;
    }
  } catch (e) {
    // Ignore errors for permalink
    console.log('Could not fetch permalink:', e);
  }

  return { postId, permalink };
}

/**
 * Post een carousel (meerdere afbeeldingen) naar Instagram
 */
export async function postCarouselToInstagram(
  account: InstagramAccount,
  caption: string,
  imageUrls: string[] // Max 10 images
): Promise<{ postId: string; permalink?: string }> {
  if (imageUrls.length < 2 || imageUrls.length > 10) {
    throw new Error('Carousel moet 2-10 afbeeldingen bevatten');
  }

  const accessToken = decryptSecret(account.accessToken);
  const igUserId = account.accountId;

  // Step 1: Upload all images as containers
  const containerIds: string[] = [];

  for (const imageUrl of imageUrls) {
    const mediaResponse = await fetch(
      `https://graph.facebook.com/v18.0/${igUserId}/media`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: imageUrl,
          is_carousel_item: true,
          access_token: accessToken,
        }),
      }
    );

    if (!mediaResponse.ok) {
      const errorData = await mediaResponse.json().catch(() => ({}));
      throw new Error(
        `Instagram carousel item upload failed: ${errorData.error?.message || mediaResponse.statusText}`
      );
    }

    const mediaData = await mediaResponse.json();
    containerIds.push(mediaData.id);
  }

  // Step 2: Wait for processing
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Step 3: Create carousel container
  const carouselResponse = await fetch(
    `https://graph.facebook.com/v18.0/${igUserId}/media`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        media_type: 'CAROUSEL',
        children: containerIds.join(','),
        caption: caption,
        access_token: accessToken,
      }),
    }
  );

  if (!carouselResponse.ok) {
    const errorData = await carouselResponse.json().catch(() => ({}));
    throw new Error(
      `Instagram carousel creation failed: ${errorData.error?.message || carouselResponse.statusText}`
    );
  }

  const carouselData = await carouselResponse.json();
  const containerId = carouselData.id;

  // Step 4: Publish carousel
  const publishResponse = await fetch(
    `https://graph.facebook.com/v18.0/${igUserId}/media_publish`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        creation_id: containerId,
        access_token: accessToken,
      }),
    }
  );

  if (!publishResponse.ok) {
    const errorData = await publishResponse.json().catch(() => ({}));
    throw new Error(
      `Instagram carousel publish failed: ${errorData.error?.message || publishResponse.statusText}`
    );
  }

  const publishData = await publishResponse.json();
  const postId = publishData.id;

  // Get permalink
  let permalink: string | undefined;
  try {
    const postInfoResponse = await fetch(
      `https://graph.facebook.com/v18.0/${postId}?fields=permalink&access_token=${accessToken}`,
      { method: 'GET' }
    );

    if (postInfoResponse.ok) {
      const postInfo = await postInfoResponse.json();
      permalink = postInfo.permalink;
    }
  } catch (e) {
    // Ignore
  }

  return { postId, permalink };
}

/**
 * Check of access token nog geldig is
 */
export async function validateInstagramToken(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/me?access_token=${accessToken}`,
      { method: 'GET' }
    );
    return response.ok;
  } catch {
    return false;
  }
}

