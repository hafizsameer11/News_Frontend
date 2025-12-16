"use client";

import Link from "next/link";
import { News } from "@/types/news.types";
import { formatRelativeTime } from "@/lib/helpers/formatDate";
import { useLanguage } from "@/providers/LanguageProvider";
import { cn } from "@/lib/helpers/cn";
import { OptimizedImage } from "./optimized-image";
import { BookmarkButton } from "@/components/bookmarks/bookmark-button";
import { getImageUrl } from "@/lib/helpers/imageUrl";

interface NewsCardProps {
  news: News;
  featured?: boolean;
  className?: string;
}

export function NewsCard({ news, featured = false, className }: NewsCardProps) {
  const { language, t } = useLanguage();
  
  return (
    <Link
      href={`/news/${news.slug || news.id}`}
      prefetch={true}
      className={cn(
        "block group hover:opacity-90 transition",
        featured && "md:col-span-2",
        className
      )}
    >
      <div className="bg-white rounded-lg shadow-md overflow-hidden h-full">
        {news.mainImage && (
          <div className={cn("relative w-full", featured ? "h-64" : "h-48")}>
            <OptimizedImage
              src={getImageUrl(news.mainImage)}
              alt={news.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              quality={75}
              loading="lazy"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {news.isBreaking && (
              <span className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 text-xs font-bold">
                {t("news.breaking")}
              </span>
            )}
            <div className="absolute top-2 right-2">
              <BookmarkButton newsId={news.id} className="bg-white/80 backdrop-blur-sm rounded-full p-2" />
            </div>
          </div>
        )}
        <div className="p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span className="text-red-600 font-semibold">
              {language === "it" ? news.category?.nameIt : news.category?.nameEn}
            </span>
            <span>•</span>
            <span>{formatRelativeTime(news.createdAt)}</span>
          </div>
          <h3
            className={cn(
              "font-bold mb-2 line-clamp-2 group-hover:text-red-600 transition text-gray-900",
              featured ? "text-xl" : "text-lg"
            )}
          >
            {news.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-3">{news.summary}</p>
        </div>
      </div>
    </Link>
  );
}

