"use client";

import Link from "next/link";
import {
  NewsPopularityItem,
  CategoryPerformanceItem,
} from "@/types/stats.types";
import { useLanguage } from "@/providers/LanguageProvider";

interface TopPerformersSectionProps {
  news: NewsPopularityItem[];
  categories: CategoryPerformanceItem[];
}

export function TopPerformersSection({
  news,
  categories,
}: TopPerformersSectionProps) {
  const { t, formatNumber } = useLanguage();
  // Handle undefined/null arrays and ensure they're arrays
  const newsArray = Array.isArray(news) ? news : [];
  const categoriesArray = Array.isArray(categories) ? categories : [];

  // Transform news items to handle different backend formats
  const transformedNews = newsArray.map((item: any) => ({
    id: item.id,
    title: item.title || "Untitled",
    slug: item.slug || item.id,
    views: item.views || 0,
  }));

  // Transform categories to handle different backend formats
  const transformedCategories = categoriesArray.map((item: any) => ({
    id: item.id,
    name: item.name || item.nameEn || item.nameIt || "Unknown Category",
    newsCount: item.newsCount || item.news_count || 0,
    views: item.views || item.totalViews || item.total_views || 0,
  }));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-6 text-gray-900">
        Top Performers
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="text-lg font-semibold mb-4 text-gray-900">
            Top News Articles
          </h4>
          <div className="space-y-3">
            {transformedNews.length === 0 ? (
              <p className="text-gray-600 text-sm">
                No news articles available
              </p>
            ) : (
              transformedNews.slice(0, 5).map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <span className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/news/${item.slug || item.id}`}
                      className="text-sm font-medium text-gray-900 hover:text-red-600 line-clamp-2"
                    >
                      {item.title}
                    </Link>
                    <p className="text-xs text-gray-600 mt-1">
                      {formatNumber(item.views || 0)} {t("admin.views")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div>
          <h4 className="text-lg font-semibold mb-4 text-gray-900">
            Top Categories
          </h4>
          <div className="space-y-3">
            {transformedCategories.length === 0 ? (
              <p className="text-gray-600 text-sm">
                {t("categories.noCategories")}
              </p>
            ) : (
              transformedCategories.slice(0, 5).map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {formatNumber(item.newsCount)} {t("admin.articles")} •{" "}
                      {formatNumber(item.views || 0)} {t("admin.views")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
