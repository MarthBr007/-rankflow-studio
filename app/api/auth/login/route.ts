import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { verifyPassword, setSessionCookie } from '@/app/lib/auth';
import { rateLimiters } from '@/app/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting (prevent brute force)
    const rateLimitResponse = await rateLimiters.auth(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    let email, password;
    try {
      const body = await request.json();
      email = body.email;
      password = body.password;
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Ongeldige request data' },
        { status: 400 }
      );
    }

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email en wachtwoord zijn verplicht' },
        { status: 400 }
      );
    }

    // Find user
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
    } catch (dbError: any) {
      console.error('Database error during login:', dbError);
      // Check if it's a connection error
      if (dbError.message?.includes('DATABASE_URL') || dbError.message?.includes('connection')) {
        return NextResponse.json(
          { error: 'Database verbinding mislukt. Controleer DATABASE_URL configuratie.' },
          { status: 503 }
        );
      }
      throw dbError;
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Ongeldig emailadres of wachtwoord' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Ongeldig emailadres of wachtwoord' },
        { status: 401 }
      );
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Create session
    await setSessionCookie({
      id: user.id,
      email: user.email,
      name: user.name || undefined,
      role: user.role || undefined,
      organizationId: user.organizationId || undefined,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    // Ensure we always return valid JSON
    const errorMessage = error?.message || 'Fout bij inloggen';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

