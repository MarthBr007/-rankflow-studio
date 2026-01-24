import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/lib/auth';
import { randomBytes } from 'crypto';

export const dynamic = 'force-dynamic';

// Redirect naar LinkedIn OAuth
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Je moet ingelogd zijn' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const redirectUri = searchParams.get('redirectUri') || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/social-auth/linkedin/callback`;

    // LinkedIn OAuth configuratie
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'LinkedIn App configuratie ontbreekt. Contacteer de beheerder.' },
        { status: 500 }
      );
    }

    // OAuth scopes voor LinkedIn
    const scopes = [
      'openid',
      'profile',
      'email',
      'w_member_social', // Post to personal profile
      'w_organization_social', // Post to organization pages
    ].join(' ');

    // State parameter voor security
    const state = Buffer.from(JSON.stringify({
      userId: user.id,
      organizationId: organizationId || null,
      timestamp: Date.now(),
      nonce: randomBytes(16).toString('hex'),
    })).toString('base64');

    // Store state in session/cookie for verification (optional, but recommended)
    // For now, we'll verify it in the callback

    // Redirect naar LinkedIn OAuth
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
      `response_type=code` +
      `&client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&state=${encodeURIComponent(state)}` +
      `&scope=${encodeURIComponent(scopes)}`;

    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    console.error('Error in LinkedIn authorize:', error);
    return NextResponse.json(
      { error: error.message || 'Fout bij LinkedIn autorisatie' },
      { status: 500 }
    );
  }
}

