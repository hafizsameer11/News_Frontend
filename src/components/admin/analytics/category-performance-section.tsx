"use client";

import { CategoryPerformanceItem } from "@/types/stats.types";
import { CategoryDistributionChart } from "@/components/admin/charts/category-distribution-chart";
import { useLanguage } from "@/providers/LanguageProvider";

interface CategoryPerformanceSectionProps {
  data: CategoryPerformanceItem[] | any[];
}

export function CategoryPerformanceSection({
  data,
}: CategoryPerformanceSectionProps) {
  const { language, t, formatNumber } = useLanguage();

  // Handle both array format and ensure data is valid
  const categories = Array.isArray(data) ? data : [];

  // Transform data to handle different backend formats
  const transformedCategories = categories.map((item: any) => {
    // Use language-specific name if available, otherwise fallback
    const name =
      language === "it"
        ? item.nameIt || item.nameEn || item.name || "Unknown Category"
        : item.nameEn || item.name || item.nameIt || "Unknown Category";

    return {
      id: item.id,
      name,
      newsCount: item.newsCount || item.news_count || 0,
      views: item.views || item.totalViews || item.total_views || 0,
    };
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-6 text-gray-900">
        Category Performance
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="text-lg font-semibold mb-4 text-gray-900">
            Top Categories
          </h4>
          <div className="space-y-3">
            {transformedCategories.slice(0, 8).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {item.newsCount} articles
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatNumber(item.views || 0)}
                  </p>
                  <p className="text-xs text-gray-600">{t("admin.views")}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-lg font-semibold mb-4 text-gray-900">
            Distribution Chart
          </h4>
          <CategoryDistributionChart data={transformedCategories} />
        </div>
      </div>
    </div>
  );
}
