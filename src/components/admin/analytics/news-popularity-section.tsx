"use client";

import Link from "next/link";
import { NewsPopularityItem } from "@/types/stats.types";
import { NewsPopularityChart } from "@/components/admin/charts/news-popularity-chart";

interface NewsPopularitySectionProps {
  data: NewsPopularityItem[] | { mostViewed?: any[]; trending?: any[]; recentPopular?: any[] };
}

export function NewsPopularitySection({ data }: NewsPopularitySectionProps) {
  // Handle both array format and object format from backend
  let mostViewed: NewsPopularityItem[] = [];
  
  if (Array.isArray(data)) {
    mostViewed = data;
  } else if (data && typeof data === 'object' && 'mostViewed' in data) {
    // Transform backend object format to array
    const backendData = data as { mostViewed?: any[]; trending?: any[]; recentPopular?: any[] };
    mostViewed = (backendData.mostViewed || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      views: item.views || 0,
      slug: item.slug || item.id,
    }));
  } else if (!data) {
    mostViewed = [];
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-6 text-gray-900">News Popularity</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="text-lg font-semibold mb-4 text-gray-900">Most Viewed Articles</h4>
          <div className="space-y-3">
            {mostViewed.slice(0, 5).map((item, index) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </span>
                  <Link
                    href={`/news/${item.slug || item.id}`}
                    className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate"
                  >
                    {item.title}
                  </Link>
                </div>
                <span className="flex-shrink-0 text-sm font-semibold text-gray-600 ml-4">
                  {item.views.toLocaleString()} views
                </span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-lg font-semibold mb-4 text-gray-900">Views Chart</h4>
          <NewsPopularityChart data={mostViewed} limit={10} />
        </div>
      </div>
    </div>
  );
}

