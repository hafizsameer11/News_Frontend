"use client";

import { useState } from "react";
import { useDashboard, useTrends, useCategoryPerformance } from "@/lib/hooks/useStats";
import { ViewsChart } from "./charts/views-chart";
import { RevenueChart } from "./charts/revenue-chart";
import { CategoryDistributionChart } from "./charts/category-distribution-chart";
import { EngagementChart } from "./charts/engagement-chart";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import { useLanguage } from "@/providers/LanguageProvider";

export function DashboardCharts() {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const [activeTab, setActiveTab] = useState<"views" | "revenue" | "categories" | "engagement">("views");
  const { data: dashboardData, isLoading: isDashboardLoading, error: dashboardError } = useDashboard();
  const { data: trendsData, isLoading: isTrendsLoading, error: trendsError } = useTrends(period);
  const { data: categoryData, isLoading: isCategoryLoading, error: categoryError } = useCategoryPerformance();
  const { t } = useLanguage();

  const isLoading = isDashboardLoading || isTrendsLoading || isCategoryLoading;
  const error = dashboardError || trendsError || categoryError;

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  if (!dashboardData?.data) {
    return null;
  }

  const trends = trendsData?.data?.data || [];
  const categoryPerformance = categoryData?.data || [];

  return (
    <div className="space-y-6">
      {/* Tabs and Period Selector */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2 sm:border-b-0 sm:pb-0">
            <button
              onClick={() => setActiveTab("views")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                activeTab === "views"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t("admin.newsViewsOverTime")}
            </button>
            <button
              onClick={() => setActiveTab("revenue")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                activeTab === "revenue"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t("admin.adRevenue")}
            </button>
            <button
              onClick={() => setActiveTab("categories")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                activeTab === "categories"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t("admin.categoryDistribution")}
            </button>
            <button
              onClick={() => setActiveTab("engagement")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                activeTab === "engagement"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t("admin.userEngagement")}
            </button>
          </div>

          {/* Period Selector */}
          <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setPeriod("daily")}
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm transition ${
                period === "daily"
                  ? "bg-white text-blue-600 shadow-sm font-medium"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {t("admin.daily")}
            </button>
            <button
              onClick={() => setPeriod("weekly")}
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm transition ${
                period === "weekly"
                  ? "bg-white text-blue-600 shadow-sm font-medium"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {t("admin.weekly")}
            </button>
            <button
              onClick={() => setPeriod("monthly")}
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm transition ${
                period === "monthly"
                  ? "bg-white text-blue-600 shadow-sm font-medium"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {t("admin.monthly")}
            </button>
          </div>
        </div>
      </div>

      {/* Chart Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {activeTab === "views" && (
          <>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">{t("admin.newsViewsOverTime")}</h3>
            <ViewsChart data={trends} period={period} />
          </>
        )}
        {activeTab === "revenue" && (
          <>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">{t("admin.adRevenue")}</h3>
            <RevenueChart data={trends} period={period} />
          </>
        )}
        {activeTab === "categories" && (
          <>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">{t("admin.categoryDistribution")}</h3>
            <CategoryDistributionChart data={categoryPerformance} />
          </>
        )}
        {activeTab === "engagement" && (
          <>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">{t("admin.userEngagement")}</h3>
            <EngagementChart data={trends} period={period} />
          </>
        )}
      </div>
    </div>
  );
}

