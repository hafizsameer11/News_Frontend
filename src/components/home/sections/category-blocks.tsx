"use client";

import Link from "next/link";
import { News } from "@/types/news.types";
import { SmallVerticalCard } from "@/components/news/cnn-news-card";
import { Category } from "@/types/category.types";

interface CategoryBlocksProps {
  categoryStories: Record<string, { category: Category; news: News[] }>;
  maxPerCategory?: number;
}

export function CategoryBlocks({
  categoryStories,
  maxPerCategory = 4,
}: CategoryBlocksProps) {
  const categories = Object.values(categoryStories);

  if (categories.length === 0) return null;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 max-w-7xl py-4 md:py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {categories.map(({ category, news }) => (
          <div key={category.id} className="space-y-4">
            <Link
              href={`/category/${category.slug}`}
              className="block group"
            >
              <h2 className="text-xl font-bold text-gray-900 group-hover:text-red-600 transition mb-4">
                {category.nameEn}
              </h2>
            </Link>
            <div className="space-y-4">
              {news.slice(0, maxPerCategory).map((story) => (
                <SmallVerticalCard key={story.id} news={story} />
              ))}
            </div>
            {news.length > maxPerCategory && (
              <Link
                href={`/category/${category.slug}`}
                className="text-sm text-red-600 hover:text-red-700 font-semibold inline-block mt-2"
              >
                More from {category.nameEn} →
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

