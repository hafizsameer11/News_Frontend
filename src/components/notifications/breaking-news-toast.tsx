"use client";

import { useEffect } from "react";
import { News } from "@/types/news.types";
import { useToast } from "@/components/ui/toast";

interface BreakingNewsToastProps {
  news: News;
}

export function BreakingNewsToast({ news }: BreakingNewsToastProps) {
  const { showToast } = useToast();

  useEffect(() => {
    showToast(
      `BREAKING: ${news.title}`,
      "info",
      8000 // Show for 8 seconds
    );
  }, [news, showToast]);

  // Note: The toast component handles the display
  // This component just triggers the toast notification
  return null;
}

