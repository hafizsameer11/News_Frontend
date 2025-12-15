"use client";

import { useBookmarks } from "@/lib/hooks/useBookmarks";
import { useConversations } from "@/lib/hooks/useChat";
import { BookmarksResponse } from "@/lib/api/modules/bookmarks.api";
import { ConversationsResponse } from "@/types/chat.types";
import { useAuth } from "@/providers/AuthProvider";
import { useLanguage } from "@/providers/LanguageProvider";
import { StatsCard } from "@/components/admin/stats-card";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import Link from "next/link";
import { formatDate } from "@/lib/helpers/formatDate";
import { OptimizedImage } from "@/components/ui/optimized-image";

export default function UserDashboard() {
  const { user } = useAuth();
  const { t, formatNumber, language } = useLanguage();

  // Fetch user data
  const { data: bookmarksData, isLoading: bookmarksLoading } = useBookmarks({
    page: 1,
    limit: 100,
  });
  const { data: conversationsData, isLoading: conversationsLoading } =
    useConversations();

  const bookmarksDataInner = (bookmarksData as BookmarksResponse | undefined)?.data;
  const bookmarks = bookmarksDataInner?.bookmarks || [];
  const conversations = (conversationsData as ConversationsResponse | undefined)?.data || [];

  // Calculate stats
  const totalBookmarks =
    bookmarksDataInner?.pagination?.total || bookmarks.length;
  const activeConversations = conversations.length;
  const recentBookmarks = bookmarks.slice(0, 5);
  const recentConversations = conversations.slice(0, 3);

  // Get account creation date
  const memberSince = user?.createdAt
    ? formatDate(user.createdAt, "MMM dd, yyyy")
    : null;

  const isLoading = bookmarksLoading || conversationsLoading;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-2xl">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {t("dashboard.myDashboard")}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {t("dashboard.welcome")}, {user?.name}
              </p>
              {memberSince && (
                <p className="text-xs text-gray-500 mt-1">
                  {t("dashboard.memberSince")} {memberSince}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title={t("dashboard.stats.totalBookmarks")}
          value={formatNumber(totalBookmarks)}
          icon="🔖"
        />
        <StatsCard
          title={t("dashboard.stats.activeConversations")}
          value={formatNumber(activeConversations)}
          icon="💬"
        />
        <StatsCard
          title={t("dashboard.stats.recentBookmarks")}
          value={formatNumber(recentBookmarks.length)}
          icon="⭐"
        />
        <StatsCard
          title={t("dashboard.stats.accountStatus")}
          value={t("dashboard.stats.active")}
          icon="✅"
        />
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900">
          {t("dashboard.quickActions")}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <Link
            href="/"
            className="bg-red-600 hover:bg-red-700 text-white rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition transform hover:scale-105 shadow-sm"
          >
            <span className="text-3xl">📰</span>
            <span className="text-xs sm:text-sm font-medium text-center">
              {t("dashboard.exploreNews")}
            </span>
          </Link>
          <Link
            href="/dashboard/chat"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition transform hover:scale-105 shadow-sm"
          >
            <span className="text-3xl">💬</span>
            <span className="text-xs sm:text-sm font-medium text-center">
              {t("dashboard.chatWithAdmin")}
            </span>
          </Link>
          <Link
            href="/bookmarks"
            className="bg-green-600 hover:bg-green-700 text-white rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition transform hover:scale-105 shadow-sm"
          >
            <span className="text-3xl">🔖</span>
            <span className="text-xs sm:text-sm font-medium text-center">
              {t("nav.bookmarks")}
            </span>
          </Link>
          <Link
            href="/report"
            className="bg-orange-600 hover:bg-orange-700 text-white rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition transform hover:scale-105 shadow-sm"
          >
            <span className="text-3xl">⚠️</span>
            <span className="text-xs sm:text-sm font-medium text-center">
              {t("report.reportContent")}
            </span>
          </Link>
          <Link
            href="/register"
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition transform hover:scale-105 shadow-sm"
          >
            <span className="text-3xl">📢</span>
            <span className="text-xs sm:text-sm font-medium text-center">
              {t("dashboard.becomeAdvertiser")}
            </span>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookmarks */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {t("dashboard.recentActivity.recentBookmarks")}
              </h2>
              <Link
                href="/bookmarks"
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                {t("common.viewAll")}
              </Link>
            </div>
          </div>
          <div className="p-6">
            {isLoading ? (
              <Loading />
            ) : recentBookmarks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="mb-2">
                  {t("dashboard.recentActivity.noBookmarks")}
                </p>
                <Link
                  href="/"
                  className="text-red-600 hover:text-red-800 font-medium text-sm"
                >
                  {t("dashboard.exploreNews")}
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentBookmarks.map((bookmark) => (
                  <Link
                    key={bookmark.id}
                    href={`/news/${bookmark.news.slug || bookmark.news.id}`}
                    className="flex gap-4 p-3 rounded-lg hover:bg-gray-50 transition group"
                  >
                    {bookmark.news.mainImage && (
                      <div className="relative w-20 h-20 flex-shrink-0 rounded overflow-hidden">
                        <OptimizedImage
                          src={bookmark.news.mainImage}
                          alt={bookmark.news.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-red-600 transition">
                        {bookmark.news.title}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {formatDate(bookmark.createdAt, "MMM dd, yyyy")}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Conversations */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {t("dashboard.recentActivity.recentConversations")}
              </h2>
              <Link
                href="/dashboard/chat"
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                {t("common.viewAll")}
              </Link>
            </div>
          </div>
          <div className="p-6">
            {isLoading ? (
              <Loading />
            ) : recentConversations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="mb-2">
                  {t("dashboard.recentActivity.noConversations")}
                </p>
                <Link
                  href="/dashboard/chat"
                  className="text-red-600 hover:text-red-800 font-medium text-sm"
                >
                  {t("dashboard.chatWithAdmin")}
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentConversations.map((conv) => (
                  <Link
                    key={conv.partner.id}
                    href="/dashboard/chat"
                    className="flex gap-4 p-3 rounded-lg hover:bg-gray-50 transition group"
                  >
                    {conv.partner.avatar ? (
                      <img
                        src={conv.partner.avatar}
                        alt={conv.partner.name}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {conv.partner.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 group-hover:text-red-600 transition">
                          {conv.partner.name}
                        </h3>
                        {conv.unreadCount > 0 && (
                          <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {conv.lastMessage.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(
                          conv.lastMessage.createdAt,
                          "MMM dd, HH:mm"
                        )}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
