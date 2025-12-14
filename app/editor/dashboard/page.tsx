"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useGetMe } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useNews } from "@/lib/hooks/useNews";
import { useCategories } from "@/lib/hooks/useCategories";
import { StatsCard } from "@/components/admin/stats-card";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import { formatDate } from "@/lib/helpers/formatDate";
import { useLanguage } from "@/providers/LanguageProvider";
import Link from "next/link";

export default function EditorDashboard() {
  const router = useRouter();
  const { user: authUser, isAuthenticated } = useAuth();
  const { data: userData, isLoading: userLoading } = useGetMe(isAuthenticated);
  const { language } = useLanguage();

  // Get current user with allowed categories
  const currentUser = userData?.data?.user || authUser;

  // Only show editor's allowed categories
  const allowedCategoryIds = currentUser?.allowedCategories?.map((cat) => cat.id) || [];

  // Fetch news - will filter client-side to show only from allowed categories
  const { data: newsData, isLoading: newsLoading } = useNews({
    limit: 100,
  });

  // Fetch all categories but filter to show only allowed ones
  const { data: categoriesData } = useCategories(true);
  const allowedCategories =
    categoriesData?.data?.filter((cat) => allowedCategoryIds.includes(cat.id)) || [];

  // Redirect if not authenticated or not editor
  useEffect(() => {
    if (!userLoading && (!isAuthenticated || (currentUser && currentUser.role !== "EDITOR"))) {
      router.push("/admin-login");
    }
  }, [isAuthenticated, currentUser, userLoading, router]);

  if (userLoading || newsLoading) {
    return <Loading />;
  }

  if (!isAuthenticated || currentUser?.role !== "EDITOR") {
    return null; // Will redirect
  }

  // Filter news to show only those in allowed categories and created by this editor
  const userNews =
    newsData?.data?.news?.filter(
      (news) =>
        allowedCategoryIds.includes(news.categoryId) && news.authorId === currentUser?.id
    ) || [];

  // Calculate statistics
  const totalNews = userNews.length;
  const publishedNews = userNews.filter((n) => n.status === "PUBLISHED").length;
  const pendingNews = userNews.filter((n) => n.status === "PENDING_REVIEW").length;
  const draftNews = userNews.filter((n) => n.status === "DRAFT").length;
  const rejectedNews = userNews.filter((n) => n.status === "REJECTED").length;

  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  // Get recent news (last 5)
  const recentNews = userNews
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900">
        {language === "it" ? "Dashboard" : "Dashboard"}
      </h1>

      {/* Allowed Categories Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h2 className="font-semibold text-blue-900 mb-2">
          {language === "it" ? "Le Tue Categorie Consentite:" : "Your Allowed Categories:"}
        </h2>
        {allowedCategories.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {allowedCategories.map((cat) => (
              <span
                key={cat.id}
                className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm"
              >
                {language === "it" ? cat.nameIt : cat.nameEn}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-blue-700">
            {language === "it"
              ? "Non hai categorie assegnate. Contatta un amministratore."
              : "You don't have any assigned categories. Contact an administrator."}
          </p>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title={language === "it" ? "Totale Notizie" : "Total News"}
          value={formatNumber(totalNews)}
          icon="📰"
        />
        <StatsCard
          title={language === "it" ? "Pubblicate" : "Published"}
          value={formatNumber(publishedNews)}
          icon="✅"
        />
        <StatsCard
          title={language === "it" ? "In Revisione" : "Pending Review"}
          value={formatNumber(pendingNews)}
          icon="⏳"
        />
        <StatsCard
          title={language === "it" ? "Bozze" : "Drafts"}
          value={formatNumber(draftNews)}
          icon="📝"
        />
        {rejectedNews > 0 && (
          <StatsCard
            title={language === "it" ? "Rifiutate" : "Rejected"}
            value={formatNumber(rejectedNews)}
            icon="❌"
          />
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          {language === "it" ? "Azioni Rapide" : "Quick Actions"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/editor/news"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition transform hover:scale-105 shadow-sm"
          >
            <span className="text-3xl">📰</span>
            <span className="text-sm font-medium text-center">
              {language === "it" ? "Le Mie Notizie" : "My News"}
            </span>
          </Link>
          {allowedCategories.length === 0 ? (
            <div className="bg-gray-400 text-white rounded-lg p-4 flex flex-col items-center justify-center gap-2 cursor-not-allowed opacity-50 shadow-sm">
              <span className="text-3xl">➕</span>
              <span className="text-sm font-medium text-center">
                {language === "it" ? "Crea Notizia" : "Create News"}
              </span>
            </div>
          ) : (
            <Link
              href="/editor/news?create=true"
              className="bg-green-600 hover:bg-green-700 text-white rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition transform hover:scale-105 shadow-sm"
            >
              <span className="text-3xl">➕</span>
              <span className="text-sm font-medium text-center">
                {language === "it" ? "Crea Notizia" : "Create News"}
              </span>
            </Link>
          )}
          <Link
            href="/editor/media"
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition transform hover:scale-105 shadow-sm"
          >
            <span className="text-3xl">🖼️</span>
            <span className="text-sm font-medium text-center">
              {language === "it" ? "Libreria Media" : "Media Library"}
            </span>
          </Link>
        </div>
      </div>

      {/* Recent News */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          {language === "it" ? "Notizie Recenti" : "Recent News"}
        </h2>
        {recentNews.length > 0 ? (
          <div className="space-y-4">
            {recentNews.map((news) => (
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
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>
                        {language === "it" ? "Categoria" : "Category"}:{" "}
                        {language === "it" ? news.category?.nameIt : news.category?.nameEn}
                      </span>
                      <span>•</span>
                      <span>{formatDate(news.createdAt, "MMM dd, yyyy")}</span>
                      <span>•</span>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          news.status === "PUBLISHED"
                            ? "bg-green-100 text-green-800"
                            : news.status === "PENDING_REVIEW"
                              ? "bg-yellow-100 text-yellow-800"
                              : news.status === "REJECTED"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {news.status === "PUBLISHED"
                          ? language === "it"
                            ? "Pubblicato"
                            : "Published"
                          : news.status === "PENDING_REVIEW"
                            ? language === "it"
                              ? "In Revisione"
                              : "Pending Review"
                            : news.status === "REJECTED"
                              ? language === "it"
                                ? "Rifiutato"
                                : "Rejected"
                              : news.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">
            {language === "it"
              ? "Nessuna notizia disponibile. Crea la tua prima notizia!"
              : "No news available. Create your first article!"}
          </p>
        )}
      </div>
    </div>
  );
}

