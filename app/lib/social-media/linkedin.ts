import { decryptSecret } from '@/app/lib/crypto';

interface LinkedInAccount {
  id: string;
  accountId: string; // LinkedIn user ID or organization URN
  accountType: string; // 'personal' | 'organization'
  accessToken: string; // Encrypted
  refreshToken?: string; // Encrypted
  metadata?: any;
}

/**
 * Upload een afbeelding naar LinkedIn
 */
async function uploadImageToLinkedIn(
  accessToken: string,
  imageUrl: string
): Promise<string> {
  // Download image first
  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error('Kon afbeelding niet downloaden');
  }

  const imageBuffer = await imageResponse.arrayBuffer();
  const imageBlob = Buffer.from(imageBuffer);

  // Step 1: Register upload
  const registerResponse = await fetch(
    'https://api.linkedin.com/v2/assets?action=registerUpload',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify({
        registerUploadRequest: {
          recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
          owner: `urn:li:person:${accessToken.split('.')[0]}`, // Simplified, should use actual user ID
          serviceRelationships: [{
            relationshipType: 'OWNER',
            identifier: 'urn:li:userGeneratedContent',
          }],
        },
      }),
    }
  );

  if (!registerResponse.ok) {
    // Fallback: use image URL directly if upload fails
    console.warn('LinkedIn image upload registration failed, using URL directly');
    return imageUrl;
  }

  const registerData = await registerResponse.json();
  const uploadUrl = registerData.value?.uploadMechanism?.['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest']?.uploadUrl;
  const asset = registerData.value?.asset;

  if (!uploadUrl || !asset) {
    // Fallback to URL
    return imageUrl;
  }

  // Step 2: Upload image
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'image/jpeg', // Adjust based on image type
    },
    body: imageBlob,
  });

  if (!uploadResponse.ok) {
    // Fallback to URL
    return imageUrl;
  }

  return asset;
}

/**
 * Post naar LinkedIn (persoonlijk profiel of bedrijfspagina)
 */
export async function postToLinkedIn(
  account: LinkedInAccount,
  text: string,
  imageUrl?: string
): Promise<{ postId: string; permalink?: string }> {
  const accessToken = decryptSecret(account.accessToken);
  const accountId = account.accountId;
  const accountType = account.accountType;

  // Determine author URN
  let authorUrn: string;
  if (accountType === 'organization') {
    authorUrn = `urn:li:organization:${accountId}`;
  } else {
    authorUrn = `urn:li:person:${accountId}`;
  }

  // Upload image if provided
  let imageUrn: string | undefined;
  if (imageUrl) {
    try {
      imageUrn = await uploadImageToLinkedIn(accessToken, imageUrl);
    } catch (error) {
      console.warn('Image upload failed, posting without image:', error);
    }
  }

  // Build post content
  const shareContent: any = {
    'com.linkedin.ugc.ShareContent': {
      shareCommentary: {
        text: text,
      },
      shareMediaCategory: imageUrn ? 'IMAGE' : 'NONE',
    },
  };

  if (imageUrn && imageUrn.startsWith('urn:li:')) {
    // URN format (uploaded asset)
    shareContent['com.linkedin.ugc.ShareContent'].media = [{
      status: 'READY',
      media: imageUrn,
    }];
  } else if (imageUrl) {
    // URL format (fallback)
    shareContent['com.linkedin.ugc.ShareContent'].media = [{
      status: 'READY',
      originalUrl: imageUrl,
    }];
  }

  // Create UGC post
  const postResponse = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
      author: authorUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: shareContent,
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    }),
  });

  if (!postResponse.ok) {
    const errorData = await postResponse.json().catch(() => ({}));
    throw new Error(
      `LinkedIn post failed: ${errorData.message || postResponse.statusText}`
    );
  }

  const postData = await postResponse.json();
  const postId = postData.id;

  // LinkedIn doesn't provide permalink in response, but we can construct it
  const permalink = `https://www.linkedin.com/feed/update/${postId}`;

  return { postId, permalink };
}

/**
 * Refresh LinkedIn access token
 */
export async function refreshLinkedInToken(
  refreshToken: string
): Promise<{ accessToken: string; expiresIn: number }> {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('LinkedIn client credentials niet geconfigureerd');
  }

  const decryptedRefreshToken = decryptSecret(refreshToken);

  const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: decryptedRefreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) {
    throw new Error('LinkedIn token refresh failed');
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in || 5184000,
  };
}

/**
 * Check of access token nog geldig is
 */
export async function validateLinkedInToken(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.linkedin.com/v2/userinfo', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

