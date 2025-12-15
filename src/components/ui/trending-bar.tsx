"use client";

import Link from "next/link";
import { useLanguage } from "@/providers/LanguageProvider";
import { News } from "@/types/news.types";
import { useNews } from "@/lib/hooks/useNews";

interface TrendingBarProps {
  trendingNews?: News[];
}

export function TrendingBar({ trendingNews: initialTrendingNews = [] }: TrendingBarProps) {
  const { language } = useLanguage();

  // Fetch breaking news with auto-refresh every 60 seconds
  const { data: breakingNewsData } = useNews({
    status: "PUBLISHED",
    limit: 10,
    refetchInterval: 60000, // 60 seconds
  });

  // Get breaking news from API or use initial prop
  const allBreakingNews = breakingNewsData?.data?.news?.filter((n) => n.isBreaking) || [];
  const trendingNews = initialTrendingNews.length > 0 
    ? initialTrendingNews 
    : allBreakingNews.length > 0
    ? allBreakingNews
    : breakingNewsData?.data?.news?.slice(0, 7) || [];

  // Use actual trending news from backend, or show most recent breaking news
  // Limit to 5 items for better mobile experience
  const items = trendingNews.length > 0 
    ? trendingNews.slice(0, 5).map((news) => ({
        id: news.id,
        title: news.title,
        slug: news.slug || news.id,
      }))
    : [];

  if (items.length === 0) return null;

  return (
    <div className="bg-gray-50 border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 max-w-7xl">
        <div className="flex items-center gap-4 py-2 overflow-x-auto">
          <span className="text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">
            {language === "it" ? "In Tendenza" : "Trending"}
          </span>
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {items.map((item, index) => (
              <div key={item.id} className="flex items-center gap-4 min-w-0 flex-shrink-0">
                <Link
                  href={`/news/${item.slug || item.id}`}
                  className="text-sm font-medium text-gray-700 hover:text-red-600 transition max-w-[200px] truncate block"
                  title={item.title}
                >
                  {item.title}
                </Link>
                {index < items.length - 1 && (
                  <span className="text-gray-300 flex-shrink-0">|</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
