"use client";

import { News, CreateNewsInput } from "@/types/news.types";
import { Category } from "@/types/category.types";
import { formatDate } from "@/lib/helpers/formatDate";
import Image from "next/image";
import Link from "next/link";

interface NewsPreviewModalProps {
  news?: News | CreateNewsInput | null;
  categories?: Category[];
  onClose: () => void;
  onOpenInNewTab?: () => void;
}

// Type guard to check if news is News type (has full properties)
const isNews = (item: News | CreateNewsInput): item is News => {
  return "id" in item && "views" in item && "author" in item;
};

export function NewsPreviewModal({
  news,
  categories,
  onClose,
  onOpenInNewTab,
}: NewsPreviewModalProps) {
  if (!news) return null;

  const categoryId = "categoryId" in news ? news.categoryId : news.category?.id;
  const category = categories?.find((cat) => cat.id === categoryId);
  const categoryName = category?.nameEn || "Uncategorized";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Preview</h2>
          <div className="flex items-center gap-2">
            {onOpenInNewTab && (
              <button
                onClick={onOpenInNewTab}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                Open in New Tab
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          <article>
            {/* Category and Date */}
            <div className="mb-4">
              {category && (
                <span className="inline-block text-red-600 font-semibold mr-3">
                  {categoryName}
                </span>
              )}
              <span className="text-gray-600">
                {formatDate(
                  (isNews(news) ? news.publishedAt : undefined) || news.createdAt || new Date().toISOString(),
                  "MMMM dd, yyyy"
                )}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              {news.title || "Untitled"}
            </h1>

            {/* Summary */}
            {news.summary && (
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">{news.summary}</p>
            )}

            {/* Breaking Badge */}
            {news.isBreaking && (
              <div className="mb-6">
                <span className="inline-block bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold">
                  BREAKING
                </span>
              </div>
            )}

            {/* Main Image */}
            {news.mainImage && (
              <div className="relative w-full h-96 md:h-[500px] mb-8 rounded-lg overflow-hidden">
                <Image
                  src={news.mainImage}
                  alt={news.title || "News image"}
                  fill
                  className="object-cover"
                  quality={85}
                />
              </div>
            )}

            {/* Content */}
            <div
              className="prose prose-lg max-w-none mb-8 text-gray-900"
              dangerouslySetInnerHTML={{ __html: news.content || "" }}
            />

            {/* Author and Metadata */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Written by</p>
                  <p className="font-semibold text-gray-900">
                    {(isNews(news) && news.author?.name) || "Editor"}
                  </p>
                </div>
                {isNews(news) && news.views !== undefined && (
                  <div className="text-sm text-gray-500">
                    {news.views} views
                  </div>
                )}
              </div>
            </div>

            {/* Tags (if available) */}
            {news.tags && (
              <div className="mt-6 flex flex-wrap gap-2">
                {news.tags.split(",").map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
            )}

            {/* Scheduled Info */}
            {news.scheduledFor && (
              <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center gap-2 text-purple-700">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="font-medium">
                    Scheduled for: {formatDate(news.scheduledFor, "MMMM dd, yyyy HH:mm")}
                  </span>
                </div>
              </div>
            )}
          </article>
        </div>
      </div>
    </div>
  );
}

