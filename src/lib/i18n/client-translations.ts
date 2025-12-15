/**
 * Client-safe translation utilities
 * These functions can be used in client components without importing server-only code
 */

import { translations, type Language } from "./translations";

/**
 * Client-side translation function (doesn't require server context)
 * This is a simplified version that can be used in client components
 */
export function tClient(
  key: string,
  language: Language,
  params?: Record<string, string | number>
): string {
  const keys = key.split(".");
  let value: unknown = translations[language];

  // Navigate through the translation object
  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      value = undefined;
      break;
    }
  }

  // If translation not found, try English fallback
  if (value === undefined) {
    let fallback: unknown = translations.en;
    for (const fk of keys) {
      if (fallback && typeof fallback === "object" && fk in fallback) {
        fallback = (fallback as Record<string, unknown>)[fk];
      } else {
        fallback = undefined;
        break;
      }
    }
    value = fallback;
  }

  // If still undefined, return the key
  if (value === undefined) {
    return key;
  }

  // Replace params if provided
  let result = String(value);
  if (params) {
    Object.entries(params).forEach(([paramKey, paramValue]) => {
      result = result.replace(new RegExp(`\\{\\{${paramKey}\\}\\}`, "g"), String(paramValue));
      result = result.replace(new RegExp(`\\{${paramKey}\\}`, "g"), String(paramValue));
    });
  }

  return result;
}
