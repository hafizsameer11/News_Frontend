"use client";

import { News } from "@/types/news.types";
import { GridCard } from "@/components/news/cnn-news-card";

interface FeaturedGridProps {
  news: News[];
  title?: string;
  columns?: 3 | 4;
}

export function FeaturedGrid({
  news,
  title = "Featured",
  columns = 3,
}: FeaturedGridProps) {
  if (!news || news.length === 0) return null;

  const gridCols =
    columns === 4
      ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-4 md:py-6 max-w-7xl">
      {title && (
        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4 md:mb-6 text-gray-900">
          {title}
        </h2>
      )}
      <div className={`grid ${gridCols} gap-4 md:gap-6`}>
        {news.map((story) => (
          <GridCard key={story.id} news={story} />
        ))}
      </div>
    </div>
  );
}

