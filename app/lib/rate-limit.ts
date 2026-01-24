import { NextRequest, NextResponse } from 'next/server';

// In-memory rate limiter (voor productie: gebruik Redis zoals Upstash)
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetAt: number;
  };
}

const store: RateLimitStore = {};

// Cleanup oude entries elke 5 minuten
if (typeof global !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    Object.keys(store).forEach((key) => {
      if (store[key].resetAt < now) {
        delete store[key];
      }
    });
  }, 5 * 60 * 1000);
}

export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string;
  identifier?: (request: NextRequest) => string;
}

/**
 * Rate limiting middleware
 * @param options Rate limit configuration
 * @returns Middleware function
 */
export function rateLimit(options: RateLimitOptions) {
  const {
    windowMs,
    maxRequests,
    message = 'Te veel requests. Probeer het later opnieuw.',
    identifier = (req) => {
      // Default: gebruik IP address
      const forwarded = req.headers.get('x-forwarded-for');
      const ip = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || 'unknown';
      return ip;
    },
  } = options;

  return async (request: NextRequest): Promise<NextResponse | null> => {
    const key = identifier(request);
    const now = Date.now();
    const windowStart = now - windowMs;

    // Cleanup oude entry
    if (store[key] && store[key].resetAt < now) {
      delete store[key];
    }

    // Initialize of update counter
    if (!store[key]) {
      store[key] = {
        count: 1,
        resetAt: now + windowMs,
      };
    } else {
      store[key].count += 1;
    }

    // Check if limit exceeded
    if (store[key].count > maxRequests) {
      return NextResponse.json(
        {
          error: message,
          retryAfter: Math.ceil((store[key].resetAt - now) / 1000),
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((store[key].resetAt - now) / 1000)),
            'X-RateLimit-Limit': String(maxRequests),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(store[key].resetAt / 1000)),
          },
        }
      );
    }

    // Return null to continue (Next.js convention)
    return null;
  };
}

// Pre-configured rate limiters
export const rateLimiters = {
  // Strikte limiet voor login/register (prevent brute force)
  auth: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minuten
    maxRequests: 5, // 5 pogingen per 15 minuten
    message: 'Te veel inlogpogingen. Probeer het over 15 minuten opnieuw.',
  }),

  // Limiet voor content generatie (duur en kostbaar)
  generate: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 uur
    maxRequests: 20, // 20 generaties per uur
    message: 'Te veel content generaties. Probeer het later opnieuw.',
  }),

  // Limiet voor API calls in het algemeen
  api: rateLimit({
    windowMs: 60 * 1000, // 1 minuut
    maxRequests: 60, // 60 requests per minuut
    message: 'Rate limit bereikt. Probeer het over een minuut opnieuw.',
  }),

  // Limiet voor image uploads
  upload: rateLimit({
    windowMs: 60 * 1000, // 1 minuut
    maxRequests: 10, // 10 uploads per minuut
    message: 'Te veel uploads. Probeer het over een minuut opnieuw.',
  }),
};
