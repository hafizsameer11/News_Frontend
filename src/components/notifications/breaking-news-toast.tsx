"use client";

import { useEffect } from "react";
import { News } from "@/types/news.types";
import { useToast } from "@/components/ui/toast";
import { useLanguage } from "@/providers/LanguageProvider";

interface BreakingNewsToastProps {
  news: News;
}

export function BreakingNewsToast({ news }: BreakingNewsToastProps) {
  const { showToast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    showToast(
      `${t("news.breaking")}: ${news.title}`,
      "info",
      8000 // Show for 8 seconds
    );
  }, [news, showToast, t]);

  // Note: The toast component handles the display
  // This component just triggers the toast notification
  return null;
}
