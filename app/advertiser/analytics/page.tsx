"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { useGetMe } from "@/lib/hooks/useAuth";
import { useAdvertiserAnalytics } from "@/lib/hooks/useAnalytics";
import { AdvertiserAnalyticsResponse, AdResponse } from "@/types/ads.types";
import { useAds } from "@/lib/hooks/useAds";
import { AuthResponse } from "@/types/user.types";
import { useLanguage } from "@/providers/LanguageProvider";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import { DateRangeFilter } from "@/components/advertiser/date-range-filter";
import { ExportModal } from "@/components/admin/analytics/export-modal";
import Link from "next/link";

// Lazy load heavy analytics charts component
const AnalyticsCharts = dynamic(
  () =>
    import("@/components/advertiser/analytics-charts").then((mod) => ({
      default: mod.AnalyticsCharts,
    })),
  {
    loading: () => (
      <div className="bg-white rounded-lg shadow-md p-6">
        <Loading />
      </div>
    ),
    ssr: false,
  }
);

export default function AnalyticsPage() {
  const router = useRouter();
  const { user: authUser, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const { data: userData, isLoading: userLoading } = useGetMe(isAuthenticated);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const user = (userData as AuthResponse | undefined)?.data?.user || authUser;

  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    error: analyticsError,
  } = useAdvertiserAnalytics();
  const { data: adsData } = useAds({});

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "ADVERTISER") {
      router.push("/login");
    }
  }, [isAuthenticated, user, router]);

  const handleDateRangeChange = (start: Date | null, end: Date | null) => {
    setStartDate(start);
    setEndDate(end);
  };

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  if (userLoading || !isAuthenticated || !user || user.role !== "ADVERTISER") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading />
      </div>
    );
  }

  const analytics = (analyticsData as AdvertiserAnalyticsResponse | undefined)?.data;
  const adsList = (adsData as AdResponse | undefined)?.data?.ads || [];
  const userAds = adsList.filter((ad) => ad.advertiserId === user.id);

  // Calculate summary metrics
  const totalImpressions = analytics?.totalImpressions || 0;
  const totalClicks = analytics?.totalClicks || 0;
  const averageCTR = analytics?.averageCTR || 0;
  const totalAds = userAds.length;
  const activeAds = userAds.filter((ad) => ad.status === "ACTIVE").length;
  const totalRevenue = userAds
    .filter((ad) => ad.isPaid && ad.status === "ACTIVE")
    .reduce((sum, ad) => sum + (Number(ad.price) || 0), 0);

  // Top performing ads
  const topPerformingAds = [...userAds]
    .sort((a, b) => {
      const aCTR = a.impressions > 0 ? (a.clicks / a.impressions) * 100 : 0;
      const bCTR = b.impressions > 0 ? (b.clicks / b.impressions) * 100 : 0;
      return bCTR - aCTR;
    })
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {language === "it" ? "Analisi Annunci" : "Ad Analytics"}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {language === "it"
              ? "Visualizza le statistiche dettagliate e le performance dei tuoi annunci"
              : "View detailed statistics and performance metrics for your ads"}
          </p>
        </div>
        <button
          onClick={() => setIsExportModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          {language === "it" ? "📊 Esporta Dati" : "📊 Export Data"}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                {language === "it"
                  ? "Visualizzazioni Totali"
                  : "Total Impressions"}
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                {totalImpressions.toLocaleString()}
              </p>
            </div>
            <div className="text-4xl opacity-20">👁️</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                {language === "it" ? "Clic Totali" : "Total Clicks"}
              </h3>
              <p className="text-3xl font-bold text-green-600">
                {totalClicks.toLocaleString()}
              </p>
            </div>
            <div className="text-4xl opacity-20">🖱️</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                {language === "it" ? "CTR Medio" : "Average CTR"}
              </h3>
              <p className="text-3xl font-bold text-red-600">
                {averageCTR.toFixed(2)}%
              </p>
            </div>
            <div className="text-4xl opacity-20">📈</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                {language === "it" ? "Annunci Attivi" : "Active Ads"}
              </h3>
              <p className="text-3xl font-bold text-purple-600">
                {activeAds} / {totalAds}
              </p>
            </div>
            <div className="text-4xl opacity-20">📢</div>
          </div>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {language === "it" ? "Filtra per Periodo" : "Filter by Period"}
        </h2>
        <DateRangeFilter onRangeChange={handleDateRangeChange} />
      </div>

      {/* Analytics Charts */}
      {analyticsLoading ? (
        <div className="bg-white rounded-lg shadow-md p-12">
          <Loading />
        </div>
      ) : analyticsError ? (
        <div className="bg-white rounded-lg shadow-md p-8">
          <ErrorMessage error={analyticsError} />
        </div>
      ) : (
        <AnalyticsCharts startDate={startDate} endDate={endDate} />
      )}

      {/* Top Performing Ads */}
      {topPerformingAds.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-bold text-gray-900">
              {language === "it"
                ? "Annunci con Migliori Performance"
                : "Top Performing Ads"}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {language === "it"
                ? "I tuoi annunci ordinati per tasso di click-through (CTR)"
                : "Your ads ranked by click-through rate (CTR)"}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    {language === "it" ? "Titolo" : "Title"}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    {language === "it" ? "Visualizzazioni" : "Impressions"}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    {language === "it" ? "Clic" : "Clicks"}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    CTR
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    {language === "it" ? "Stato" : "Status"}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    {language === "it" ? "Azioni" : "Actions"}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topPerformingAds.map((ad) => {
                  const ctr =
                    ad.impressions > 0
                      ? ((ad.clicks / ad.impressions) * 100).toFixed(2)
                      : "0.00";
                  return (
                    <tr key={ad.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {ad.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {(ad.impressions || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {(ad.clicks || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-red-600">
                          {ctr}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            ad.status === "ACTIVE"
                              ? "bg-green-100 text-green-800"
                              : ad.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {ad.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/advertiser/ads/${ad.id}`}
                          className="text-red-600 hover:text-red-900 hover:underline"
                        >
                          {language === "it" ? "Visualizza" : "View"}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
}
