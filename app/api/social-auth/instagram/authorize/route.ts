import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/lib/auth';

export const dynamic = 'force-dynamic';

// Redirect naar Instagram OAuth
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
    const redirectUri = searchParams.get('redirectUri') || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/social-auth/instagram/callback`;

    // Meta/Instagram OAuth configuratie
    const appId = process.env.META_APP_ID;
    const clientSecret = process.env.META_APP_SECRET;

    if (!appId || !clientSecret) {
      return NextResponse.json(
        { error: 'Meta App configuratie ontbreekt. Contacteer de beheerder.' },
        { status: 500 }
      );
    }

    // OAuth scopes voor Instagram
    const scopes = [
      'instagram_basic',
      'instagram_content_publish',
      'pages_read_engagement',
      'pages_show_list',
    ].join(',');

    // State parameter voor security (include user ID and org ID)
    const state = Buffer.from(JSON.stringify({
      userId: user.id,
      organizationId: organizationId || null,
      timestamp: Date.now(),
    })).toString('base64');

    // Redirect naar Meta OAuth
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
      `client_id=${appId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=${encodeURIComponent(scopes)}` +
      `&response_type=code` +
      `&state=${encodeURIComponent(state)}`;

    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    console.error('Error in Instagram authorize:', error);
    return NextResponse.json(
      { error: error.message || 'Fout bij Instagram autorisatie' },
      { status: 500 }
    );
  }
}

