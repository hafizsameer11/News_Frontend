/**
 * Shared form validation utilities
 */

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
}

export interface ValidationErrors {
  [key: string]: string;
}

/**
 * Validate a single field value
 */
export function validateField(
  name: string,
  value: string,
  rules: ValidationRule
): string | null {
  if (rules.required && !value.trim()) {
    return `${name} is required`;
  }

  if (value.trim()) {
    if (rules.minLength && value.length < rules.minLength) {
      return `${name} must be at least ${rules.minLength} characters`;
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return `${name} must be no more than ${rules.maxLength} characters`;
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      return `${name} format is invalid`;
    }

    if (rules.custom) {
      return rules.custom(value);
    }
  }

  return null;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): string | null {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return "Please enter a valid email address";
  }
  return null;
}

/**
 * Validate slug format
 */
export function validateSlug(slug: string): string | null {
  const slugPattern = /^[a-z0-9-]+$/;
  if (!slugPattern.test(slug)) {
    return "Slug must be lowercase with hyphens only";
  }
  return null;
}

/**
 * Validate password strength
 */
export function validatePassword(password: string, minLength: number = 6): string | null {
  if (password.length < minLength) {
    return `Password must be at least ${minLength} characters`;
  }
  return null;
}

/**
 * Validate URL format
 */
export function validateUrl(url: string): string | null {
  try {
    new URL(url);
    return null;
  } catch {
    return "Please enter a valid URL";
  }
}

