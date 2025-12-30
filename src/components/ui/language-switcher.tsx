"use client";

import { useLanguage } from "@/providers/LanguageProvider";

interface LanguageSwitcherProps {
  compact?: boolean;
}

export function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();

  if (compact) {
    return (
      <div className="flex items-center gap-0.5 sm:gap-1 border border-gray-200 rounded flex-shrink-0">
        <button
          onClick={() => setLanguage("en")}
          className={`px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-red-500 ${
            language === "en"
              ? "bg-red-600 text-white"
              : "bg-transparent text-gray-700 hover:bg-gray-100"
          }`}
          aria-label="Switch to English"
          aria-pressed={language === "en"}
        >
          EN
        </button>
        <button
          onClick={() => setLanguage("it")}
          className={`px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-red-500 ${
            language === "it"
              ? "bg-red-600 text-white"
              : "bg-transparent text-gray-700 hover:bg-gray-100"
          }`}
          aria-label="Switch to Italian"
          aria-pressed={language === "it"}
        >
          IT
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setLanguage("en")}
        className={`px-3 py-1 rounded text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-red-500 ${
          language === "en"
            ? "bg-red-600 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
        aria-label="Switch to English"
        aria-pressed={language === "en"}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage("it")}
        className={`px-3 py-1 rounded text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-red-500 ${
          language === "it"
            ? "bg-red-600 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
        aria-label="Switch to Italian"
        aria-pressed={language === "it"}
      >
        IT
      </button>
    </div>
  );
}

