/**
 * Environment variables validation
 * Controleert of alle benodigde environment variables aanwezig zijn
 */

interface EnvConfig {
  required: string[];
  optional: string[];
  defaults?: Record<string, string>;
}

const envConfig: EnvConfig = {
  required: [
    'DATABASE_URL',
    'ENCRYPTION_KEY',
  ],
  optional: [
    'SESSION_SECRET',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY',
    'GOOGLE_API_KEY',
    'META_APP_ID',
    'META_APP_SECRET',
    'LINKEDIN_CLIENT_ID',
    'LINKEDIN_CLIENT_SECRET',
    'SLACK_WEBHOOK_URL',
    'PUSHER_APP_ID',
    'PUSHER_KEY',
    'PUSHER_SECRET',
    'PUSHER_CLUSTER',
  ],
  defaults: {
    NODE_ENV: 'development',
  },
};

/**
 * Validate environment variables
 * @throws Error if required variables are missing
 */
export function validateEnv(): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  for (const key of envConfig.required) {
    if (!process.env[key]) {
      errors.push(`Required environment variable missing: ${key}`);
    }
  }

  // Check encryption key length
  if (process.env.ENCRYPTION_KEY) {
    const key = process.env.ENCRYPTION_KEY;
    const keyLength = key.length === 32 ? 32 : Buffer.from(key, 'base64').length;
    if (keyLength !== 32) {
      errors.push('ENCRYPTION_KEY must be exactly 32 bytes (plain or base64)');
    }
  }

  // Check session secret in production
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.SESSION_SECRET && !process.env.NEXTAUTH_SECRET) {
      errors.push('SESSION_SECRET or NEXTAUTH_SECRET must be set in production');
    }
  }

  // Warnings voor development
  if (process.env.NODE_ENV === 'development') {
    if (!process.env.SESSION_SECRET && !process.env.NEXTAUTH_SECRET) {
      warnings.push('SESSION_SECRET not set - using default (not secure for production)');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get environment variable with validation
 */
export function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  
  if (!value && envConfig.required.includes(key)) {
    throw new Error(`Required environment variable ${key} is not set`);
  }

  return value || '';
}

/**
 * Initialize and validate environment on startup
 * Call this in your app initialization
 */
export function initEnv(): void {
  const validation = validateEnv();
  
  if (validation.warnings.length > 0) {
    console.warn('Environment warnings:');
    validation.warnings.forEach(warning => console.warn(`  ⚠️  ${warning}`));
  }

  if (!validation.valid) {
    console.error('Environment validation failed:');
    validation.errors.forEach(error => console.error(`  ❌ ${error}`));
    throw new Error('Environment validation failed. Please check your .env file.');
  }

  console.log('✅ Environment variables validated');
}
