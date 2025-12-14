"use client";

import { useState } from "react";
import { useTrends } from "@/lib/hooks/useStats";
import { ViewsChart } from "@/components/admin/charts/views-chart";
import { EngagementChart } from "@/components/admin/charts/engagement-chart";
import { useLanguage } from "@/providers/LanguageProvider";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";

interface TrendsSectionProps {
  trends: {
    period: "daily" | "weekly" | "monthly";
    data: any[];
  };
}

export function TrendsSection({ trends: initialTrends }: TrendsSectionProps) {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">(initialTrends.period || "daily");
  const { data: trendsData, isLoading, error } = useTrends(period);
  const { t } = useLanguage();

  const trends = trendsData?.data?.data || [];

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <ErrorMessage error={error} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">{t("admin.timeBasedTrends")}</h3>
        <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setPeriod("daily")}
            className={`px-4 py-2 rounded-md text-sm transition ${
              period === "daily"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {t("admin.daily")}
          </button>
          <button
            onClick={() => setPeriod("weekly")}
            className={`px-4 py-2 rounded-md text-sm transition ${
              period === "weekly"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {t("admin.weekly")}
          </button>
          <button
            onClick={() => setPeriod("monthly")}
            className={`px-4 py-2 rounded-md text-sm transition ${
              period === "monthly"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {t("admin.monthly")}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="text-lg font-semibold mb-4 text-gray-900">{t("admin.newsViewsOverTime")}</h4>
          <ViewsChart data={trends} period={period} />
        </div>
        <div>
          <h4 className="text-lg font-semibold mb-4 text-gray-900">{t("admin.userEngagement")}</h4>
          <EngagementChart data={trends} period={period} />
        </div>
      </div>
    </div>
  );
}

