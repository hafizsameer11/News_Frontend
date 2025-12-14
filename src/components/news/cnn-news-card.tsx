"use client";

import { memo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { News } from "@/types/news.types";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { formatDate, formatRelativeTime } from "@/lib/helpers/formatDate";
import { cn } from "@/lib/helpers/cn";

interface BaseCardProps {
  news: News;
  className?: string;
}

// Hero Card - Large featured story with image, title, summary
export const HeroCard = memo(function HeroCard({ news, className }: BaseCardProps) {
  const router = useRouter();
  
  const handleCategoryClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (news.category) {
      router.push(`/category/${news.category.slug}`);
    }
  };

  return (
    <Link href={`/news/${news.slug || news.id}`} className={cn("block group", className)}>
      <div className="cursor-pointer">
        <div className="relative h-64 sm:h-80 md:h-96 lg:h-[500px] mb-3 md:mb-4 overflow-hidden rounded-lg">
          {news.mainImage && news.mainImage.trim() !== "" ? (
            <OptimizedImage
              src={news.mainImage}
              alt={news.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              priority
              loading="eager"
            />
          ) : (
            <div className="w-full h-full bg-gray-200"></div>
          )}
          {news.isBreaking && (
            <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded text-sm font-bold">
              BREAKING
            </div>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition line-clamp-2">
          {news.title}
        </h1>
        {news.summary && (
          <p className="text-gray-600 mb-3 line-clamp-3 text-lg">
            {news.summary}
          </p>
        )}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>{formatDate(news.createdAt, "MMM dd, yyyy")}</span>
          {news.category && (
            <span
              onClick={handleCategoryClick}
              className="hover:text-red-600 transition cursor-pointer"
            >
              {news.category.nameEn}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
});

// Compact Card - Small thumbnail + title (left column style)
export const CompactCard = memo(function CompactCard({ news, className }: BaseCardProps) {
  return (
    <Link
      href={`/news/${news.slug || news.id}`}
      className={cn("block group cursor-pointer", className)}
    >
      <div className="flex gap-3">
        <div className="relative w-24 h-24 shrink-0 overflow-hidden rounded">
          {news.mainImage && news.mainImage.trim() !== "" ? (
            <OptimizedImage
              src={news.mainImage}
              alt={news.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gray-200"></div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-gray-900 group-hover:text-red-600 transition line-clamp-2 mb-1">
            {news.title}
          </h3>
          <p className="text-xs text-gray-500">
            {formatRelativeTime(news.createdAt)}
          </p>
        </div>
      </div>
    </Link>
  );
});

// Headline Card - Text-only with border accent (right column)
export const HeadlineCard = memo(function HeadlineCard({ news, className }: BaseCardProps) {
  return (
    <Link
      href={`/news/${news.slug || news.id}`}
      className={cn("block group cursor-pointer", className)}
    >
      <div className="border-l-4 border-red-600 pl-3 py-2">
        <h3 className="text-sm font-bold text-gray-900 group-hover:text-red-600 transition line-clamp-2">
          {news.title}
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          {formatRelativeTime(news.createdAt)}
        </p>
      </div>
    </Link>
  );
});

// Grid Card - Medium size for grid layouts
export const GridCard = memo(function GridCard({ news, className }: BaseCardProps) {
  return (
    <Link
      href={`/news/${news.slug || news.id}`}
      className={cn("block group cursor-pointer", className)}
    >
      <div className="relative h-48 mb-3 overflow-hidden rounded">
        {news.mainImage && news.mainImage.trim() !== "" ? (
          <OptimizedImage
            src={news.mainImage}
            alt={news.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gray-200"></div>
        )}
        {news.isBreaking && (
          <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
            BREAKING
          </div>
        )}
      </div>
      <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2 group-hover:text-red-600 transition line-clamp-2">
        {news.title}
      </h3>
      {news.summary && (
        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
          {news.summary}
        </p>
      )}
      <p className="text-xs text-gray-500">
        {formatRelativeTime(news.createdAt)}
      </p>
    </Link>
  );
});

// Horizontal Card - Image + text side-by-side
export const HorizontalCard = memo(function HorizontalCard({ news, className }: BaseCardProps) {
  return (
    <Link
      href={`/news/${news.slug || news.id}`}
      className={cn("block group cursor-pointer", className)}
    >
      <div className="flex gap-4 border-b border-gray-200 pb-4 hover:bg-gray-50 p-2 rounded transition">
        <div className="relative w-32 h-32 shrink-0 overflow-hidden rounded">
          {news.mainImage && news.mainImage.trim() !== "" ? (
            <OptimizedImage
              src={news.mainImage}
              alt={news.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gray-200"></div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base md:text-lg font-bold text-gray-900 group-hover:text-red-600 transition line-clamp-2 mb-2">
            {news.title}
          </h3>
          {news.summary && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
              {news.summary}
            </p>
          )}
          <p className="text-xs text-gray-500">
            {formatRelativeTime(news.createdAt)}
          </p>
        </div>
      </div>
    </Link>
  );
});

// Small Vertical Card - For tight spaces
export const SmallVerticalCard = memo(function SmallVerticalCard({ news, className }: BaseCardProps) {
  return (
    <Link
      href={`/news/${news.slug || news.id}`}
      className={cn("block group cursor-pointer", className)}
    >
      <div className="relative h-32 mb-2 overflow-hidden rounded">
        {news.mainImage && news.mainImage.trim() !== "" ? (
          <OptimizedImage
            src={news.mainImage}
            alt={news.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gray-200"></div>
        )}
      </div>
      <h3 className="text-sm font-bold text-gray-900 group-hover:text-red-600 transition line-clamp-2">
        {news.title}
      </h3>
      <p className="text-xs text-gray-500 mt-1">
        {formatRelativeTime(news.createdAt)}
      </p>
    </Link>
  );
});

