"use client";

import Link from "next/link";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { useNewsPopularity } from "@/lib/hooks/useStats";
import { useLanguage } from "@/providers/LanguageProvider";
import { Loading } from "@/components/ui/loading";

export function MostReadSidebar() {
  const { language } = useLanguage();
  const { data, isLoading } = useNewsPopularity(10);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-900">
          {language === "it" ? "Più Letti" : "Most Read"}
        </h3>
        <Loading />
      </div>
    );
  }

  // Handle the API response structure: { success, message, data: { mostViewed, trending, recentPopular } }
  const popularityData = data?.data;
  const popularNews = Array.isArray(popularityData) 
    ? popularityData 
    : popularityData?.mostViewed || popularityData?.trending || popularityData?.recentPopular || [];

  if (!popularNews || popularNews.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-4 text-gray-900">
        {language === "it" ? "Più Letti" : "Most Read"}
      </h3>
      <div className="space-y-4">
        {popularNews.map((item, index) => (
          <Link
            key={item.id}
            href={`/news/${item.slug || item.id}`}
            className="flex gap-3 group cursor-pointer"
          >
            <div className="flex-shrink-0 w-16 h-16 relative overflow-hidden rounded">
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
                <span className="text-lg font-bold text-red-600">#{index + 1}</span>
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

