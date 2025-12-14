"use client";

import Link from "next/link";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { useNewsPopularity } from "@/lib/hooks/useStats";
import { useLanguage } from "@/providers/LanguageProvider";
import { Loading } from "@/components/ui/loading";
import { NewsPopularityItem } from "@/types/stats.types";

interface TrendingArticlesProps {
  excludeId?: string;
  limit?: number;
  className?: string;
}

export function TrendingArticles({ excludeId, limit = 5, className = "" }: TrendingArticlesProps) {
  const { language } = useLanguage();
  const { data, isLoading } = useNewsPopularity(limit + (excludeId ? 1 : 0));

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <h3 className="text-xl font-bold mb-4 text-gray-900">
          {language === "it" ? "In Tendenza" : "Trending"}
        </h3>
        <Loading />
      </div>
    );
  }

  // Handle the API response structure: { success, message, data: { mostViewed, trending, recentPopular } }
  const popularityData = data?.data;
  const newsArray = Array.isArray(popularityData) 
    ? popularityData 
    : popularityData?.trending || popularityData?.mostViewed || popularityData?.recentPopular || [];

  if (!newsArray || newsArray.length === 0) {
    return null;
  }

  const trendingNews = excludeId
    ? newsArray.filter((item) => item.id !== excludeId).slice(0, limit)
    : newsArray.slice(0, limit);

  if (trendingNews.length === 0) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h3 className="text-xl font-bold mb-4 text-gray-900">
        {language === "it" ? "In Tendenza" : "Trending"}
      </h3>
      <div className="space-y-4">
        {trendingNews.map((item, index) => (
          <Link
            key={item.id}
            href={`/news/${item.slug || item.id}`}
            className="flex gap-3 group cursor-pointer"
          >
            <div className="flex-shrink-0 w-20 h-20 relative overflow-hidden rounded">
              {(() => {
                const mainImage = (item as NewsPopularityItem & { mainImage?: string }).mainImage;
                return mainImage && mainImage.trim() !== "" ? (
                  <OptimizedImage
                    src={mainImage}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200"></div>
                );
              })()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-red-600">#{index + 1}</span>
                <span className="text-xs text-gray-500">{item.views} {language === "it" ? "visualizzazioni" : "views"}</span>
              </div>
              <h4 className="text-sm font-bold text-gray-900 group-hover:text-red-600 transition line-clamp-2">
                {item.title}
              </h4>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

