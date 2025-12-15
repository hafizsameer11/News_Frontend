"use client";

import Link from "next/link";
import { News } from "@/types/news.types";
import { useLanguage } from "@/providers/LanguageProvider";
import { formatDate } from "@/lib/helpers/formatDate";

interface CNNHeadlinesSectionProps {
  headlines?: News[];
}

export function CNNHeadlinesSection({ headlines = [] }: CNNHeadlinesSectionProps) {
  const { language } = useLanguage();

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* CNN Headlines Header */}
      <div className="bg-red-600 p-4 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-center mb-2">
            <div className="text-white">
              <div className="text-2xl font-bold">NEWS NEXT</div>
              <div className="text-xs uppercase tracking-wider">Headlines</div>
            </div>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-700 rounded-full -mr-16 -mt-16 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-red-700 rounded-full -ml-12 -mb-12 opacity-30"></div>
      </div>

      {/* Headlines Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {language === "it" 
            ? "Resta aggiornato con le notizie di oggi" 
            : "Catch up on today's global news"}
        </h3>
        
        {headlines.length > 0 ? (
          <div className="space-y-4">
            {headlines.slice(0, 5).map((news, index) => (
              <div key={news.id}>
                <Link
                  href={`/news/${news.slug || news.id}`}
                  className="block group hover:text-red-600 transition"
                >
                  <h4 className="text-sm font-semibold text-gray-900 group-hover:text-red-600 line-clamp-2 mb-1">
                    {news.title}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {formatDate(news.publishedAt || news.createdAt, "MMM dd")}
                  </p>
                </Link>
                {index < headlines.length - 1 && index < 4 && (
                  <div className="border-b border-gray-200 mt-4"></div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500">
            {language === "it" 
              ? "Nessuna notizia disponibile" 
              : "No headlines available"}
          </div>
        )}
      </div>
    </div>
  );
}

