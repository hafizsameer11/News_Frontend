"use client";

import { useEffect, useState } from "react";
import { useBreakingNews } from "@/lib/hooks/useBreakingNews";
import { BreakingNewsAlert } from "./breaking-news-alert";
import { BreakingNewsToast } from "./breaking-news-toast";
import { PushNotificationService } from "@/lib/services/push-notifications";

export function BreakingNewsManager() {
  const { newBreakingNews, clearNewBreakingNews } = useBreakingNews(true);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  // Request notification permission on first load (if not already requested)
  useEffect(() => {
    if (
      PushNotificationService.isSupported() &&
      !PushNotificationService.hasRequestedPermission() &&
      PushNotificationService.getPermission() === "default"
    ) {
      // Auto-request permission (optional - can be moved to user action)
      // PushNotificationService.requestPermission();
    }
  }, []);

  // Show toast and push notification for each new breaking news
  useEffect(() => {
    newBreakingNews.forEach((news) => {
      // Only show if not already dismissed
      if (!dismissedAlerts.has(news.id)) {
        // Show browser push notification if permission granted
        if (PushNotificationService.getPermission() === "granted") {
          PushNotificationService.showBreakingNewsNotification(
            news.title,
            news.summary || "",
            `/news/${news.slug || news.id}`
          );
        }
      }
    });
  }, [newBreakingNews, dismissedAlerts]);

  const handleDismiss = (newsId: string) => {
    setDismissedAlerts((prev) => new Set([...prev, newsId]));
    clearNewBreakingNews();
  };

  // Show alert banner for the most recent breaking news (if not dismissed)
  const latestBreakingNews = newBreakingNews
    .filter((news) => !dismissedAlerts.has(news.id))
    .sort((a, b) => {
      const dateA = new Date(a.publishedAt || a.createdAt).getTime();
      const dateB = new Date(b.publishedAt || b.createdAt).getTime();
      return dateB - dateA;
    })[0];

  return (
    <>
      {/* Show toast notifications for all new breaking news */}
      {newBreakingNews.map((news) => (
        <BreakingNewsToast key={news.id} news={news} />
      ))}

      {/* Show alert banner for latest breaking news */}
      {latestBreakingNews && (
        <BreakingNewsAlert
          news={latestBreakingNews}
          onDismiss={() => handleDismiss(latestBreakingNews.id)}
          autoDismiss={true}
          dismissAfter={10000}
        />
      )}
    </>
  );
}

