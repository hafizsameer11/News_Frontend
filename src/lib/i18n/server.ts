import { cookies, headers } from "next/headers";
import { translations, type Language } from "./translations";



const LANGUAGE_COOKIE_NAME = "news_next_language";

/**
 * Get language from cookies (server-side)
 */
export async function getServerLanguage(
  cookieStore?: Promise<import("next/dist/server/web/spec-extension/adapters/request-cookies").ReadonlyRequestCookies> | import("next/dist/server/web/spec-extension/adapters/request-cookies").ReadonlyRequestCookies
): Promise<Language> {
  try {
    // Try to get from cookies first
    let languageCookie;
    try {
      const cookieStoreInstance = cookieStore ? await Promise.resolve(cookieStore) : await cookies();
      languageCookie = cookieStoreInstance.get(LANGUAGE_COOKIE_NAME);
    } catch {
      // If cookies() fails, continue to header check
      languageCookie = undefined;
    }

    if (languageCookie?.value && (languageCookie.value === "en" || languageCookie.value === "it")) {
      return languageCookie.value as Language;
    }

    // Try to get from Accept-Language header
    try {
      const headersList = await headers();
      const acceptLanguage = headersList.get("accept-language");

      if (acceptLanguage) {
        // Check if Italian is preferred
        if (acceptLanguage.toLowerCase().includes("it")) {
          return "it";
        }
      }
    } catch {
      // If headers() fails, continue to default
    }

    // Default to English
    return "en";
  } catch {
    // Fallback to English on any error
    return "en";
  }
}

/**
 * Get translations object for a given language (server-side)
 */
export function getServerTranslations(language: Language) {
  return translations[language];
}

/**
 * Server-side translation function
 */
export function tServer(
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

/**
 * Create a translation function for server components
 */
export function createServerTranslator(
  language: Language
): (key: string, params?: Record<string, string | number>) => string {
  return (key: string, params?: Record<string, string | number>) =>
    tServer(key, language, params);
}
