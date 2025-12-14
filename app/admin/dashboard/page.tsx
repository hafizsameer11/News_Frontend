"use client";

import dynamic from "next/dynamic";
import { StatsCard } from "@/components/admin/stats-card";
import { QuickActionsPanel } from "@/components/admin/quick-actions-panel";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import { useAdminStats } from "@/lib/hooks/useStats";
import { StatsResponse } from "@/types/stats.types";
import { formatDate } from "@/lib/helpers/formatDate";
import { useLanguage } from "@/providers/LanguageProvider";
import Link from "next/link";

// Lazy load heavy chart component
const DashboardCharts = dynamic(() => import("@/components/admin/dashboard-charts").then((mod) => ({ default: mod.DashboardCharts })), {
  loading: () => <div className="bg-white rounded-lg shadow-md p-6"><Loading /></div>,
  ssr: false,
});

export default function AdminDashboard() {
  const { data, isLoading, error } = useAdminStats();
  const { t } = useLanguage();

  const stats = (data as StatsResponse | undefined)?.data;

  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900">{t("admin.dashboard")}</h1>

      {isLoading ? (
        <Loading />
      ) : error ? (
        <ErrorMessage error={error} />
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title={t("admin.totalNews")}
              value={formatNumber(stats?.counts.news.total || 0)}
              icon="📰"
            />
            <StatsCard
              title={t("admin.pendingNews")}
              value={formatNumber(stats?.counts.news.pending || 0)}
              icon="⏳"
            />
            <StatsCard
              title={t("admin.totalUsers")}
              value={formatNumber(stats?.counts.users || 0)}
              icon="👥"
            />
            <StatsCard
              title={t("admin.activeAds")}
              value={formatNumber(stats?.counts.ads.active || 0)}
              icon="📢"
            />
            <StatsCard
              title={t("admin.totalAds")}
              value={formatNumber(stats?.counts.ads.total || 0)}
              icon="📊"
            />
            <StatsCard
              title={t("admin.pendingReports")}
              value={formatNumber(stats?.counts.reports.pending || 0)}
              icon="⚠️"
            />
            <StatsCard
              title={t("admin.totalReports")}
              value={formatNumber(stats?.counts.reports.total || 0)}
              icon="📋"
            />
          </div>

          {/* Quick Actions Panel */}
          <QuickActionsPanel />

          {/* Dashboard Charts */}
          <DashboardCharts />

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900">
              {t("admin.recentNews")}
            </h2>
            {stats?.recentNews && stats.recentNews.length > 0 ? (
              <div className="space-y-4">
                {stats.recentNews.map((news: { id: string; title: string; slug: string; summary: string; status: string; createdAt: string; updatedAt: string; author: { name: string } }) => (
                  <div
                    key={news.id}
                    className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Link
                          href={`/news/${news.slug || news.id}`}
                          className="text-lg font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {news.title}
                        </Link>
                        <p className="text-gray-600 text-sm mt-1 line-clamp-2">{news.summary}</p>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-sm text-gray-500">
                          <span>{t("admin.author")}: {news.author.name}</span>
                          <span>•</span>
                          <span>{formatDate(news.createdAt, "MMM dd, yyyy")}</span>
                          <span>•</span>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              news.status === "PUBLISHED"
                                ? "bg-green-100 text-green-800"
                                : news.status === "PENDING_REVIEW"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {news.status === "PUBLISHED" 
                              ? t("admin.published")
                              : news.status === "PENDING_REVIEW"
                                ? t("admin.pendingReview")
                                : t("admin.draft")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">{t("news.noNews")}</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

