import zxcvbn from 'zxcvbn';

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
  strength: {
    score: number; // 0-4
    feedback: string[];
  };
}

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;

/**
 * Valideer wachtwoord met strength checking
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  const feedback: string[] = [];

  // Basis validatie
  if (!password) {
    return {
      valid: false,
      errors: ['Wachtwoord is verplicht'],
      strength: { score: 0, feedback: [] },
    };
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`Wachtwoord moet minimaal ${PASSWORD_MIN_LENGTH} tekens lang zijn`);
  }

  if (password.length > PASSWORD_MAX_LENGTH) {
    errors.push(`Wachtwoord mag maximaal ${PASSWORD_MAX_LENGTH} tekens lang zijn`);
  }

  // Check op basisvereisten
  if (!/[a-z]/.test(password)) {
    errors.push('Wachtwoord moet minimaal één kleine letter bevatten');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Wachtwoord moet minimaal één hoofdletter bevatten');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Wachtwoord moet minimaal één cijfer bevatten');
  }

  // Zxcvbn strength check
  const result = zxcvbn(password);

  // Vertaal strength score naar feedback
  const strengthMessages = [
    'Zeer zwak',
    'Zwak',
    'Redelijk',
    'Goed',
    'Zeer sterk',
  ];

  // Voeg zxcvbn feedback toe
  if (result.feedback.warning) {
    feedback.push(result.feedback.warning);
  }

  if (result.feedback.suggestions && result.feedback.suggestions.length > 0) {
    feedback.push(...result.feedback.suggestions);
  }

  // Minimum strength score van 2 (redelijk)
  if (result.score < 2) {
    errors.push('Wachtwoord is te zwak. Gebruik een sterker wachtwoord.');
  }

  return {
    valid: errors.length === 0,
    errors,
    strength: {
      score: result.score,
      feedback: feedback.length > 0 ? feedback : [strengthMessages[result.score]],
    },
  };
}

/**
 * Get password strength label
 */
export function getPasswordStrengthLabel(score: number): string {
  const labels = ['Zeer zwak', 'Zwak', 'Redelijk', 'Goed', 'Zeer sterk'];
  return labels[score] || 'Onbekend';
}

/**
 * Get password strength color (voor UI)
 */
export function getPasswordStrengthColor(score: number): string {
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a'];
  return colors[score] || '#6b7280';
}
