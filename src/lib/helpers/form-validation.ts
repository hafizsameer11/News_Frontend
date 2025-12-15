/**
 * Shared form validation utilities
 */

import type { Language } from "@/lib/i18n/translations";
import { tClient } from "@/lib/i18n/client-translations";

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string, t: (key: string) => string) => string | null;
}

export interface ValidationErrors {
  [key: string]: string;
}

type TranslationFunction = (key: string) => string;

/**
 * Validate a single field value with translation support
 */
export function validateField(
  name: string,
  value: string,
  rules: ValidationRule,
  t: TranslationFunction = (key: string) => key
): string | null {
  if (rules.required && !value.trim()) {
    return t("validation.required");
  }

  if (value.trim()) {
    if (rules.minLength && value.length < rules.minLength) {
      return t("validation.tooShort");
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return t("validation.tooLong");
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      return t("validation.invalidFormat");
    }

    if (rules.custom) {
      return rules.custom(value, t);
    }
  }

  return null;
}

/**
 * Validate email format with translation support
 */
export function validateEmail(
  email: string,
  language: Language = "en"
): string | null {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return tClient("validation.emailInvalid", language);
  }
  return null;
}

/**
 * Validate slug format with translation support
 */
export function validateSlug(
  slug: string,
  language: Language = "en"
): string | null {
  const slugPattern = /^[a-z0-9-]+$/;
  if (!slugPattern.test(slug)) {
    return tClient("validation.invalidFormat", language);
  }
  return null;
}

/**
 * Validate password strength with translation support
 */
export function validatePassword(
  password: string,
  minLength: number = 6,
  language: Language = "en"
): string | null {
  if (password.length < minLength) {
    return tClient("validation.passwordMinLength", language);
  }
  return null;
}

/**
 * Validate URL format with translation support
 */
export function validateUrl(
  url: string,
  language: Language = "en"
): string | null {
  try {
    new URL(url);
    return null;
  } catch {
    return tClient("validation.invalidFormat", language);
  }
}

/**
 * Get validation error message for a specific field
 */
export function getValidationError(
  field: string,
  language: Language = "en"
): string {
  const key = `validation.${field}`;
  return tClient(key, language);
}

