"use client";

import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { Language, translations } from "@/lib/i18n/translations";
import { storage } from "@/lib/helpers/storage";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = "news_next_language";

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Initialize with a function to avoid hydration mismatch
  // On server, always use "en", on client, check localStorage
  const [language, setLanguageState] = useState<Language>(() => {
    // Only access localStorage on client side
    if (typeof window !== "undefined") {
      const savedLanguage = storage.get(LANGUAGE_STORAGE_KEY) as Language;
      if (savedLanguage && (savedLanguage === "en" || savedLanguage === "it")) {
        return savedLanguage;
      }
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

  // Set HTML lang attribute on mount and language change
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
    }
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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

