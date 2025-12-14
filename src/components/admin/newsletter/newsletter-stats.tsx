"use client";

import { useNewsletterSubscribers } from "@/lib/hooks/useNewsletterAdmin";
import { StatsCard } from "../stats-card";
import { useMemo } from "react";
import { useLanguage } from "@/providers/LanguageProvider";

export function NewsletterStats() {
  // Fetch a larger page to get more accurate counts
  // Note: Backend API currently only returns active subscribers
  // For accurate inactive count, backend would need to return all subscribers or provide a stats endpoint
  const { data, isLoading } = useNewsletterSubscribers(1, 1000); // Fetch up to 1000 to get accurate counts
  const { t, language } = useLanguage();

  const stats = useMemo(() => {
    // apiClient interceptor returns response.data, so data is { success, message, data: {...} }
    // Then data.data is { subscribers: [...], meta: {...} }
    if (!data?.data) {
      return { total: 0, active: 0, inactive: 0 };
    }

    const subscribers = data.data.subscribers || [];
    const meta = data.data.meta;
    const total = meta?.total || 0;
    
    // Count active and inactive from fetched subscribers
    // Since backend may only return active, we count what we have
    const activeCount = subscribers.filter((s) => s.isActive).length;
    const inactiveCount = subscribers.filter((s) => !s.isActive).length;
    
    // If we fetched all subscribers (total <= limit), use exact counts
    // Otherwise, if backend only returns active subscribers, show what we have
    // Note: Backend service currently filters by isActive: true, so inactive count may be 0
    const active = total <= 1000 ? activeCount : activeCount; // If we got all, use exact
    const inactive = total <= 1000 ? inactiveCount : 0; // If backend filters, we can't know inactive total
    
    return {
      total,
      active,
      inactive,
    };
  }, [data]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
      <StatsCard
        title={language === "it" ? "Totale Iscritti" : "Total Subscribers"}
        value={stats.total}
        icon="📧"
      />
      <StatsCard
        title={language === "it" ? "Iscritti Attivi" : "Active Subscribers"}
        value={stats.active}
        icon="✅"
      />
      <StatsCard
        title={language === "it" ? "Iscritti Inattivi" : "Inactive Subscribers"}
        value={stats.inactive}
        icon="❌"
      />
    </div>
  );
}

