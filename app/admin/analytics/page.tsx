"use client";

import { useState } from "react";
import { useDashboard } from "@/lib/hooks/useStats";
import { DashboardResponse } from "@/types/stats.types";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import { OverviewStats } from "@/components/admin/analytics/overview-stats";
import { TrendsSection } from "@/components/admin/analytics/trends-section";
import { NewsPopularitySection } from "@/components/admin/analytics/news-popularity-section";
import { UserEngagementSection } from "@/components/admin/analytics/user-engagement-section";
import { CategoryPerformanceSection } from "@/components/admin/analytics/category-performance-section";
import { ConversionMetricsSection } from "@/components/admin/analytics/conversion-metrics-section";
import { TopPerformersSection } from "@/components/admin/analytics/top-performers-section";
import { ActivityTimelineSection } from "@/components/admin/analytics/activity-timeline-section";
import { HourlyPatternsSection } from "@/components/admin/analytics/hourly-patterns-section";
import { ExportModal } from "@/components/admin/analytics/export-modal";
import { useLanguage } from "@/providers/LanguageProvider";
import { cn } from "@/lib/helpers/cn";

type AnalyticsTab = 
  | "trends" 
  | "popularity" 
  | "engagement" 
  | "category" 
  | "conversion" 
  | "performers" 
  | "activity" 
  | "hourly";

export default function AnalyticsPage() {
  const { data, isLoading, error } = useDashboard();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AnalyticsTab>("trends");
  const { t, language } = useLanguage();

  if (isLoading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6 text-gray-900">{t("admin.analyticsDashboard")}</h1>
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6 text-gray-900">{t("admin.analyticsDashboard")}</h1>
        <ErrorMessage error={error} />
      </div>
    );
  }

  const dashboardData = (data as DashboardResponse | undefined)?.data;
  if (!dashboardData) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6 text-gray-900">{t("admin.analyticsDashboard")}</h1>
        <p className="text-gray-600">No analytics data available.</p>
      </div>
    );
  }

  const tabs: { id: AnalyticsTab; labelKey: string }[] = [
    { id: "trends", labelKey: "admin.timeBasedTrends" },
    { id: "popularity", labelKey: "admin.newsPopularity" },
    { id: "engagement", labelKey: "admin.userEngagement" },
    { id: "category", labelKey: "admin.categoryPerformance" },
    { id: "conversion", labelKey: "admin.conversionMetrics" },
    { id: "performers", labelKey: "admin.topPerformers" },
    { id: "activity", labelKey: "admin.recentActivity" },
    { id: "hourly", labelKey: "admin.hourlyActivity" },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t("admin.analyticsDashboard")}</h1>
        <button
          onClick={() => setIsExportModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm sm:text-base"
        >
          {t("admin.exportData")}
        </button>
      </div>

      {/* Overview Stats - Always visible */}
      <div className="mb-6">
        <OverviewStats data={dashboardData.overview} />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2 sm:border-b-0 sm:pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition",
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              {t(tab.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === "trends" && <TrendsSection trends={dashboardData.trends} />}
        {activeTab === "popularity" && <NewsPopularitySection data={dashboardData.newsPopularity} />}
        {activeTab === "engagement" && <UserEngagementSection data={dashboardData.userEngagement} />}
        {activeTab === "category" && <CategoryPerformanceSection data={dashboardData.categoryPerformance} />}
        {activeTab === "conversion" && <ConversionMetricsSection data={dashboardData.conversionMetrics} />}
        {activeTab === "performers" && (
          <TopPerformersSection
            news={dashboardData.topPerformers.news}
            categories={dashboardData.topPerformers.categories}
          />
        )}
        {activeTab === "activity" && <ActivityTimelineSection activities={dashboardData.activity.recent as Array<{ id: string; type: string; description: string; timestamp: string; user?: { name: string; email: string } }>} />}
        {activeTab === "hourly" && <HourlyPatternsSection data={dashboardData.activity.hourly} />}
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
}

