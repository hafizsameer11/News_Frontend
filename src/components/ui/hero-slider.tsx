"use client";

import { News } from "@/types/news.types";
import { NewsCard } from "./news-card";

interface HeroSliderProps {
  featuredNews: News[];
}

export function HeroSlider({ featuredNews }: HeroSliderProps) {
  if (!featuredNews || featuredNews.length === 0) return null;

  const mainNews = featuredNews[0];
  const subNews = featuredNews.slice(1, 4);

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Featured */}
        <div className="md:col-span-2">
          <NewsCard news={mainNews} featured />
        </div>

        {/* Sub Featured */}
        <div className="space-y-4">
          {subNews.map((news) => (
            <NewsCard key={news.id} news={news} />
          ))}
        </div>
      </div>
    </section>
  );
}

