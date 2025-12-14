"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { News } from "@/types/news.types";
import { useLanguage } from "@/providers/LanguageProvider";

interface BreakingNewsAlertProps {
  news: News;
  onDismiss: () => void;
  autoDismiss?: boolean;
  dismissAfter?: number; // milliseconds
}

export function BreakingNewsAlert({
  news,
  onDismiss,
  autoDismiss = true,
  dismissAfter = 10000,
}: BreakingNewsAlertProps) {
  const { language } = useLanguage();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoDismiss && dismissAfter > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onDismiss, 300); // Wait for animation
      }, dismissAfter);

      return () => clearTimeout(timer);
    }
  }, [autoDismiss, dismissAfter, onDismiss]);

  if (!isVisible) return null;

  return (
    <div
      className="bg-red-600 text-white px-4 py-3 shadow-lg animate-in slide-in-from-top"
      role="alert"
      aria-live="polite"
    >
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0">
            <span className="font-bold text-sm uppercase tracking-wider">
              {language === "it" ? "ULTIM'ORA" : "BREAKING"}
            </span>
          </div>
          <Link
            href={`/news/${news.slug || news.id}`}
            className="flex-1 min-w-0 hover:underline"
            onClick={onDismiss}
          >
            <span className="font-semibold truncate">{news.title}</span>
          </Link>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onDismiss, 300);
          }}
          className="flex-shrink-0 text-white hover:text-gray-200 transition p-1"
          aria-label={language === "it" ? "Chiudi" : "Close"}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

