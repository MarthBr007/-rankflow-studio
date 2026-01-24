import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { encryptSecret } from '@/app/lib/crypto';

export const dynamic = 'force-dynamic';

// Handle LinkedIn OAuth callback
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (error) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?error=linkedin_auth_failed&message=${encodeURIComponent(errorDescription || error)}`
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?error=linkedin_auth_missing_params`
      );
    }

    // Decode state
    let stateData: { userId: string; organizationId: string | null; timestamp: number; nonce: string };
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString());
    } catch (e) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?error=linkedin_auth_invalid_state`
      );
    }

    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/social-auth/linkedin/callback`;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?error=linkedin_auth_config_missing`
      );
    }

    // Step 1: Exchange code for access token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}));
      console.error('Token exchange failed:', errorData);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?error=linkedin_token_exchange_failed`
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    const expiresIn = tokenData.expires_in || 5184000; // Default 60 days
    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);

    // Step 2: Get user profile info
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!profileResponse.ok) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?error=linkedin_profile_fetch_failed`
      );
    }

    const profileData = await profileResponse.json();
    const accountId = profileData.sub; // LinkedIn user ID
    const accountName = profileData.name || 'LinkedIn Account';
    const username = profileData.preferred_username || profileData.email;

    // Step 3: Get user's organization pages (if any)
    // This requires additional API call with organization permissions
    let organizationPages: any[] = [];
    try {
      const orgsResponse = await fetch(
        'https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee&role=ADMINISTRATOR',
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (orgsResponse.ok) {
        const orgsData = await orgsResponse.json();
        organizationPages = orgsData.elements || [];
      }
    } catch (e) {
      // Ignore errors for organization pages
      console.log('Could not fetch organization pages:', e);
    }

    // Step 4: Save account to database
    const encryptedToken = encryptSecret(accessToken);
    const encryptedRefreshToken = refreshToken ? encryptSecret(refreshToken) : null;

    // Check if account already exists
    const existingAccount = await prisma.socialMediaAccount.findFirst({
      where: {
        userId: stateData.userId,
        platform: 'linkedin',
        accountId,
        organizationId: stateData.organizationId,
      },
    });

    if (existingAccount) {
      // Update existing account
      await prisma.socialMediaAccount.update({
        where: { id: existingAccount.id },
        data: {
          accessToken: encryptedToken,
          refreshToken: encryptedRefreshToken,
          tokenExpiresAt,
          isActive: true,
          accountName,
          username,
          metadata: {
            profileData,
            organizationPages,
          },
        },
      });
    } else {
      // Create new account
      await prisma.socialMediaAccount.create({
        data: {
          userId: stateData.userId,
          organizationId: stateData.organizationId,
          platform: 'linkedin',
          accountType: 'personal',
          accountId,
          accountName,
          username,
          accessToken: encryptedToken,
          refreshToken: encryptedRefreshToken,
          tokenExpiresAt,
          isActive: true,
          isDefault: false,
          metadata: {
            profileData,
            organizationPages,
          },
        },
      });

      // Set as default if no other default exists for this platform
      const hasDefault = await prisma.socialMediaAccount.findFirst({
        where: {
          userId: stateData.userId,
          platform: 'linkedin',
          isDefault: true,
          isActive: true,
          organizationId: stateData.organizationId,
        },
      });

      if (!hasDefault) {
        await prisma.socialMediaAccount.updateMany({
          where: {
            userId: stateData.userId,
            platform: 'linkedin',
            accountId,
            organizationId: stateData.organizationId,
          },
          data: { isDefault: true },
        });
      }
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?success=linkedin_connected&account=${encodeURIComponent(accountName)}`
    );
  } catch (error: any) {
    console.error('Error in LinkedIn callback:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?error=linkedin_callback_error&message=${encodeURIComponent(error.message || 'Onbekende fout')}`
    );
  }
}

