"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { useGetMe } from "@/lib/hooks/useAuth";
import { useLanguage } from "@/providers/LanguageProvider";
import { useAds } from "@/lib/hooks/useAds";
import { AdResponse, Ad } from "@/types/ads.types";
import { AuthResponse } from "@/types/user.types";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import { tokenStorage } from "@/lib/helpers/storage";
import Link from "next/link";
import { formatDate } from "@/lib/helpers/formatDate";
import { DashboardCharts } from "@/components/advertiser/dashboard-charts";
import { RecentTransactions } from "@/components/advertiser/recent-transactions";

export default function AdvertiserDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: authUser, isAuthenticated, login } = useAuth();
  const { language, t, formatNumber } = useLanguage();
  const { data: adsData, isLoading: adsLoading, error: adsError } = useAds({});
  const { data: userData, isLoading: userLoading } = useGetMe(isAuthenticated);
  const [showSuccess, setShowSuccess] = useState(false);

  // Get current user (from API or auth context)
  const user = (userData as AuthResponse | undefined)?.data?.user || authUser;

  // Update auth context when user is fetched (if not already set)
  useEffect(() => {
    const userFromData = (userData as AuthResponse | undefined)?.data?.user;
    if (userFromData && !authUser) {
      // Get token from storage since getMe doesn't return token
      const storedToken = tokenStorage.get();
      if (storedToken) {
        login(storedToken, userFromData);
      }
    }
  }, [userData, authUser, login]);

  useEffect(() => {
    // Wait for user to load before checking auth
    if (userLoading) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user && user.role !== "ADVERTISER") {
      // Redirect based on role
      if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
        router.push("/admin/dashboard");
      } else if (user.role === "EDITOR") {
        router.push("/editor");
      } else {
        router.push("/dashboard");
      }
      return;
    }

    // Check for payment success
    const paymentSuccess = searchParams?.get("payment") === "success";
    if (paymentSuccess && !showSuccess) {
      // Use setTimeout to defer state updates
      const timer = setTimeout(() => {
        setShowSuccess(true);
        // Remove query param from URL
        router.replace("/advertiser/dashboard");
        // Hide success message after 5 seconds
        setTimeout(() => {
          setShowSuccess(false);
        }, 5000);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, router, searchParams, userLoading, showSuccess]);

  // Show loading while checking authentication or loading user
  if (userLoading || !isAuthenticated || !user || user.role !== "ADVERTISER") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading />
      </div>
    );
  }

  const ads = (adsData as AdResponse | undefined)?.data?.ads || [];
  const userAds = ads.filter((ad: Ad) => ad.advertiserId === user.id);
  const activeAds = userAds.filter((ad: Ad) => ad.status === "ACTIVE").length;
  const totalImpressions = userAds.reduce(
    (sum, ad) => sum + (ad.impressions || 0),
    0
  );
  const totalClicks = userAds.reduce((sum, ad) => sum + (ad.clicks || 0), 0);

  return (
    <div className="space-y-6">
      {/* Payment Success Message */}
      {showSuccess && (
        <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">
                {t("advertiser.paymentCompleted")}
              </p>
              <p className="text-sm mt-1">{t("advertiser.planActivated")}</p>
            </div>
            <button
              onClick={() => setShowSuccess(false)}
              className="text-green-700 hover:text-green-900"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          {t("advertiser.quickActions")}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <Link
            href="/advertiser/ads/create"
            className="bg-red-600 hover:bg-red-700 text-white rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition transform hover:scale-105 shadow-sm"
          >
            <span className="text-3xl">➕</span>
            <span className="text-sm font-medium text-center">
              {t("advertiser.createAd")}
            </span>
          </Link>
          <Link
            href="/advertiser/ads"
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition transform hover:scale-105 shadow-sm"
          >
            <span className="text-3xl">📢</span>
            <span className="text-sm font-medium text-center">
              {t("advertiser.myAds")}
            </span>
          </Link>
          <Link
            href="/advertiser/analytics"
            className="bg-green-500 hover:bg-green-600 text-white rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition transform hover:scale-105 shadow-sm"
          >
            <span className="text-3xl">📈</span>
            <span className="text-sm font-medium text-center">
              {t("advertiser.analytics")}
            </span>
          </Link>
          <Link
            href="/advertiser/transactions"
            className="bg-purple-500 hover:bg-purple-600 text-white rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition transform hover:scale-105 shadow-sm"
          >
            <span className="text-3xl">💳</span>
            <span className="text-sm font-medium text-center">
              {t("advertiser.transactions")}
            </span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                {t("advertiser.totalAds")}
              </h3>
              <p className="text-3xl font-bold text-gray-900">
                {formatNumber(userAds.length)}
              </p>
            </div>
            <div className="text-4xl opacity-20">📊</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                {t("advertiser.activeAds")}
              </h3>
              <p className="text-3xl font-bold text-green-600">{activeAds}</p>
            </div>
            <div className="text-4xl opacity-20">✅</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                {t("advertiser.totalImpressions")}
              </h3>
              <p className="text-3xl font-bold text-purple-600">
                {formatNumber(totalImpressions)}
              </p>
            </div>
            <div className="text-4xl opacity-20">👁️</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                {t("advertiser.totalClicks")}
              </h3>
              <p className="text-3xl font-bold text-orange-600">
                {formatNumber(totalClicks)}
              </p>
            </div>
            <div className="text-4xl opacity-20">🖱️</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {t("advertiser.analyticsStatistics")}
          </h2>
          <Link
            href="/advertiser/analytics"
            className="text-sm text-red-600 hover:text-red-800 font-medium"
          >
            {t("advertiser.viewDetails")}
          </Link>
        </div>
        <DashboardCharts />
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <RecentTransactions />
      </div>

      {/* Ads List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">
              {t("advertiser.myAds")}
            </h2>
            <Link
              href="/advertiser/ads"
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              {t("advertiser.viewAll")}
            </Link>
          </div>
        </div>

        {adsLoading ? (
          <div className="p-8">
            <Loading />
          </div>
        ) : adsError ? (
          <div className="p-8">
            <ErrorMessage error={adsError} />
          </div>
        ) : userAds.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📢</div>
            <p className="text-lg font-medium text-gray-900 mb-2">
              {t("advertiser.noAdsYet")}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              {t("advertiser.startCreatingAd")}
            </p>
            <Link
              href="/advertiser/ads/create"
              className="inline-block px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
            >
              {t("advertiser.createFirstAd")}
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    {t("admin.title")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    {t("admin.type")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    {t("admin.status")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    {t("advertiser.impressions")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    {t("advertiser.clicks")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    {t("admin.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userAds.slice(0, 10).map((ad) => (
                  <tr key={ad.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {ad.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{ad.type}</span>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatNumber(ad.impressions || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatNumber(ad.clicks || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/advertiser/ads/${ad.id}`}
                        className="text-red-600 hover:text-red-900 hover:underline"
                      >
                        {t("advertiser.view")}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {userAds.length > 10 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 text-center">
                <Link
                  href="/advertiser/ads"
                  className="text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  {language === "it"
                    ? "Vedi tutti gli annunci"
                    : "View all ads"}{" "}
                  ({userAds.length})
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
