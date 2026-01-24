import { cookies } from 'next/headers';
import { randomBytes } from 'crypto';

const CSRF_TOKEN_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Generate CSRF token
 */
export async function generateCsrfToken(): Promise<string> {
  const token = randomBytes(32).toString('hex');
  const cookieStore = await cookies();
  
  cookieStore.set(CSRF_TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 uur
    path: '/',
  });

  return token;
}

/**
 * Get CSRF token from cookie
 */
export async function getCsrfToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(CSRF_TOKEN_NAME);
  return token?.value || null;
}

/**
 * Verify CSRF token
 */
export async function verifyCsrfToken(request: Request): Promise<boolean> {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_TOKEN_NAME)?.value;
  const headerToken = request.headers.get(CSRF_HEADER_NAME);

  if (!cookieToken || !headerToken) {
    return false;
  }

  // Constant-time comparison (prevent timing attacks)
  if (cookieToken.length !== headerToken.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < cookieToken.length; i++) {
    result |= cookieToken.charCodeAt(i) ^ headerToken.charCodeAt(i);
  }

  return result === 0;
}

/**
 * CSRF protection middleware
 * Gebruik dit in API routes die state-changing operations doen
 */
export async function requireCsrfToken(request: Request): Promise<{ valid: boolean; error?: string }> {
  // Skip CSRF voor GET requests
  if (request.method === 'GET' || request.method === 'HEAD') {
    return { valid: true };
  }

  const isValid = await verifyCsrfToken(request);
  
  if (!isValid) {
    return {
      valid: false,
      error: 'CSRF token verification failed',
    };
  }

  return { valid: true };
}
