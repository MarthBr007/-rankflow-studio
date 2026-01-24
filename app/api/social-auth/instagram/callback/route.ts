import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { encryptSecret } from '@/app/lib/crypto';

export const dynamic = 'force-dynamic';

// Handle Instagram OAuth callback
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?error=instagram_auth_failed&message=${encodeURIComponent(error)}`
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?error=instagram_auth_missing_params`
      );
    }

    // Decode state
    let stateData: { userId: string; organizationId: string | null; timestamp: number };
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString());
    } catch (e) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?error=instagram_auth_invalid_state`
      );
    }

    const appId = process.env.META_APP_ID;
    const appSecret = process.env.META_APP_SECRET;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/social-auth/instagram/callback`;

    if (!appId || !appSecret) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?error=instagram_auth_config_missing`
      );
    }

    // Step 1: Exchange code for short-lived access token
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
      `client_id=${appId}` +
      `&client_secret=${appSecret}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&code=${code}`,
      { method: 'GET' }
    );

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}));
      console.error('Token exchange failed:', errorData);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?error=instagram_token_exchange_failed`
      );
    }

    const tokenData = await tokenResponse.json();
    const shortLivedToken = tokenData.access_token;

    // Step 2: Exchange short-lived token for long-lived token (60 days)
    const longLivedResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
      `grant_type=fb_exchange_token` +
      `&client_id=${appId}` +
      `&client_secret=${appSecret}` +
      `&fb_exchange_token=${shortLivedToken}`,
      { method: 'GET' }
    );

    if (!longLivedResponse.ok) {
      console.error('Long-lived token exchange failed');
      // Continue with short-lived token if long-lived fails
    }

    const longLivedData = await longLivedResponse.json().catch(() => ({ access_token: shortLivedToken }));
    const accessToken = longLivedData.access_token;
    const expiresIn = longLivedData.expires_in || 5184000; // Default 60 days
    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);

    // Step 3: Get user's Facebook pages (needed for Instagram Business Account)
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`,
      { method: 'GET' }
    );

    if (!pagesResponse.ok) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?error=instagram_pages_fetch_failed`
      );
    }

    const pagesData = await pagesResponse.json();
    const pages = pagesData.data || [];

    if (pages.length === 0) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?error=instagram_no_pages&message=${encodeURIComponent('Geen Facebook Pages gevonden. Je moet een Facebook Page hebben die gekoppeld is aan je Instagram Business account.')}`
      );
    }

    // Step 4: Get Instagram Business Account for first page
    const page = pages[0];
    const igAccountResponse = await fetch(
      `https://graph.facebook.com/v18.0/${page.id}?` +
      `fields=instagram_business_account&` +
      `access_token=${accessToken}`,
      { method: 'GET' }
    );

    if (!igAccountResponse.ok) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?error=instagram_account_fetch_failed`
      );
    }

    const igAccountData = await igAccountResponse.json();
    const igBusinessAccountId = igAccountData.instagram_business_account?.id;

    if (!igBusinessAccountId) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?error=instagram_no_business_account&message=${encodeURIComponent('Geen Instagram Business Account gevonden. Zorg ervoor dat je Instagram account een Business of Creator account is en gekoppeld is aan je Facebook Page.')}`
      );
    }

    // Step 5: Get Instagram account info
    const igInfoResponse = await fetch(
      `https://graph.facebook.com/v18.0/${igBusinessAccountId}?` +
      `fields=username,name&` +
      `access_token=${accessToken}`,
      { method: 'GET' }
    );

    const igInfo = await igInfoResponse.json().catch(() => ({
      username: 'unknown',
      name: 'Instagram Account',
    }));

    // Step 6: Save account to database
    const encryptedToken = encryptSecret(accessToken);

    // Check if account already exists
    const existingAccount = await prisma.socialMediaAccount.findFirst({
      where: {
        userId: stateData.userId,
        platform: 'instagram',
        accountId: igBusinessAccountId,
        organizationId: stateData.organizationId,
      },
    });

    if (existingAccount) {
      // Update existing account
      await prisma.socialMediaAccount.update({
        where: { id: existingAccount.id },
        data: {
          accessToken: encryptedToken,
          tokenExpiresAt,
          isActive: true,
          accountName: igInfo.name || 'Instagram Account',
          username: igInfo.username,
          metadata: {
            pageId: page.id,
            pageName: page.name,
            facebookToken: accessToken, // For page access
          },
        },
      });
    } else {
      // Create new account
      await prisma.socialMediaAccount.create({
        data: {
          userId: stateData.userId,
          organizationId: stateData.organizationId,
          platform: 'instagram',
          accountType: 'business',
          accountId: igBusinessAccountId,
          accountName: igInfo.name || 'Instagram Account',
          username: igInfo.username,
          accessToken: encryptedToken,
          tokenExpiresAt,
          isActive: true,
          isDefault: false, // Will be set if no other default exists
          metadata: {
            pageId: page.id,
            pageName: page.name,
            facebookToken: accessToken,
          },
        },
      });

      // Set as default if no other default exists for this platform
      const hasDefault = await prisma.socialMediaAccount.findFirst({
        where: {
          userId: stateData.userId,
          platform: 'instagram',
          isDefault: true,
          isActive: true,
          organizationId: stateData.organizationId,
        },
      });

      if (!hasDefault) {
        await prisma.socialMediaAccount.updateMany({
          where: {
            userId: stateData.userId,
            platform: 'instagram',
            accountId: igBusinessAccountId,
            organizationId: stateData.organizationId,
          },
          data: { isDefault: true },
        });
      }
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?success=instagram_connected&account=${encodeURIComponent(igInfo.name || 'Instagram Account')}`
    );
  } catch (error: any) {
    console.error('Error in Instagram callback:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?error=instagram_callback_error&message=${encodeURIComponent(error.message || 'Onbekende fout')}`
    );
  }
}

