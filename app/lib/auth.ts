import { prisma } from './prisma';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const SESSION_COOKIE_NAME = 'rf_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const SESSION_SECRET = process.env.SESSION_SECRET || process.env.NEXTAUTH_SECRET;

// Only check during runtime, not during build
if (!SESSION_SECRET && process.env.NODE_ENV === 'production' && !process.env.NEXT_PHASE) {
  throw new Error('SESSION_SECRET or NEXTAUTH_SECRET must be set in production');
}

export interface SessionUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
  organizationId?: string;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Create session
export async function createSession(userId: string): Promise<string> {
  const sessionId = `sess_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
  
  // In production, you might want to store sessions in a database
  // For now, we'll use a signed cookie with user info
  return sessionId;
}

// Get current user from session
export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    
    if (!sessionCookie?.value) {
      return null;
    }

    // Verify and decode JWT token
    if (!SESSION_SECRET) {
      console.error('SESSION_SECRET not configured');
      return null;
    }

    let decoded: any;
    try {
      decoded = jwt.verify(sessionCookie.value, SESSION_SECRET);
    } catch (error) {
      // Invalid token - clear cookie
      cookieStore.delete(SESSION_COOKIE_NAME);
      return null;
    }
    
    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        organizationId: true,
      },
    });

    if (!user) {
      // User deleted - clear cookie
      cookieStore.delete(SESSION_COOKIE_NAME);
      return null;
    }

    // Verify email hasn't changed (security check)
    if (user.email !== decoded.email) {
      cookieStore.delete(SESSION_COOKIE_NAME);
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name || undefined,
      role: user.role || undefined,
      organizationId: user.organizationId || undefined,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Set session cookie
export async function setSessionCookie(user: SessionUser) {
  const cookieStore = await cookies();
  
  if (!SESSION_SECRET) {
    throw new Error('SESSION_SECRET not configured');
  }

  // Create signed JWT token
  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organizationId: user.organizationId,
    },
    SESSION_SECRET,
    {
      expiresIn: SESSION_MAX_AGE,
      issuer: 'rankflow-studio',
      audience: 'rankflow-studio',
    }
  );

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
}

// Clear session cookie
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

