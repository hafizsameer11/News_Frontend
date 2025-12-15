"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { Language, translations } from "@/lib/i18n/translations";
import { storage } from "@/lib/helpers/storage";
import {
  formatDate as formatDateUtil,
  formatRelativeTime as formatRelativeTimeUtil,
  formatNumber as formatNumberUtil,
  formatCurrency as formatCurrencyUtil,
  formatDateTime as formatDateTimeUtil,
  formatTime as formatTimeUtil,
} from "@/lib/i18n/formatting";
// Map language codes to locale codes
const localeMap: Record<Language, string> = {
  en: "en-US",
  it: "it-IT",
};

interface LanguageContextType {
  language: Language;
  locale: string; // e.g., "en-US", "it-IT"
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  formatDate: (date: string | Date, format?: string) => string;
  formatRelativeTime: (date: string | Date) => string;
  formatNumber: (number: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (
    amount: number,
    currency?: string,
    options?: Intl.NumberFormatOptions
  ) => string;
  formatDateTime: (
    date: string | Date,
    options?: { dateFormat?: string; timeFormat?: string; separator?: string }
  ) => string;
  formatTime: (date: string | Date, format?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

const LANGUAGE_STORAGE_KEY = "news_next_language";

/**
 * Detect browser language
 */
function detectBrowserLanguage(): Language {
  if (typeof window === "undefined") return "en";

  try {
    const browserLang = navigator.language || (navigator as Navigator & { userLanguage?: string }).userLanguage;
    if (browserLang && browserLang.toLowerCase().startsWith("it")) {
      return "it";
    }
  } catch {
    // Ignore errors
  }

  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Initialize with a function to avoid hydration mismatch
  // On server, always use "en", on client, check localStorage, then browser
  const [language, setLanguageState] = useState<Language>(() => {
    // Only access localStorage on client side
    if (typeof window !== "undefined") {
      const savedLanguage = storage.get(LANGUAGE_STORAGE_KEY) as Language;
      if (savedLanguage && (savedLanguage === "en" || savedLanguage === "it")) {
        return savedLanguage;
      }
      // If no saved language, detect from browser
      return detectBrowserLanguage();
    }
    return "en";
  });

  // Update HTML lang attribute on mount (after hydration)
  // Note: Language is already initialized from localStorage in useState initializer
  // This effect only updates the HTML lang attribute

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    storage.set(LANGUAGE_STORAGE_KEY, lang);
    // Update HTML lang attribute
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
    // Update cookie for server-side access
    if (typeof document !== "undefined") {
      document.cookie = `news_next_language=${lang}; path=/; max-age=31536000; SameSite=Lax`;
    }
  };

  // Translation function - simple key path lookup
  const t = (key: string): string => {
    const keys = key.split(".");
    let value: unknown = translations[language];

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        value = undefined;
        break;
      }
    }

    if (value === undefined) {
      // Fallback to English if translation not found
      let fallback: unknown = translations.en;
      for (const fk of keys) {
        if (fallback && typeof fallback === "object" && fk in fallback) {
          fallback = (fallback as Record<string, unknown>)[fk];
        } else {
          fallback = undefined;
          break;
        }
      }
      return typeof fallback === "string" ? fallback : key;
    }

    return typeof value === "string" ? value : key;
  };

  // Formatting helpers
  const formatDate = (date: string | Date, format?: string) =>
    formatDateUtil(date, format, language);

  const formatRelativeTime = (date: string | Date) =>
    formatRelativeTimeUtil(date, language);

  const formatNumber = (number: number, options?: Intl.NumberFormatOptions) =>
    formatNumberUtil(number, language, options);

  const formatCurrency = (
    amount: number,
    currency: string = "EUR",
    options?: Intl.NumberFormatOptions
  ) => formatCurrencyUtil(amount, language, currency, options);

  const formatDateTime = (
    date: string | Date,
    options?: { dateFormat?: string; timeFormat?: string; separator?: string }
  ) => formatDateTimeUtil(date, language, options);

  const formatTime = (date: string | Date, format?: string) =>
    formatTimeUtil(date, language, format);

  // Get locale code
  const locale = localeMap[language];

  // Set HTML lang attribute on mount and language change
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
      // Also set cookie for server-side access
      document.cookie = `news_next_language=${language}; path=/; max-age=31536000; SameSite=Lax`;
    }
  }, [language]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        locale,
        setLanguage,
        t,
        formatDate,
        formatRelativeTime,
        formatNumber,
        formatCurrency,
        formatDateTime,
        formatTime,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
