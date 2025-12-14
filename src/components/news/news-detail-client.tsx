"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { NewsCard } from "@/components/ui/news-card";
import { useNewsDetail, useNews } from "@/lib/hooks/useNews";
import { useLanguage } from "@/providers/LanguageProvider";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { formatDate, formatRelativeTime } from "@/lib/helpers/formatDate";
import Link from "next/link";
import { seoApi } from "@/lib/api/modules/seo.api";
import { StructuredData } from "@/components/seo/StructuredData";
import { newsApi } from "@/lib/api/modules/news.api";
import { SocialShareButtons } from "@/components/news/social-share-buttons";
import { ImageGallery } from "@/components/news/image-gallery";
import { AdSlot } from "@/components/ads/ad-slot";
import { TrendingArticles } from "@/components/news/trending-articles";
import { BookmarkButton } from "@/components/bookmarks/bookmark-button";
import { useMediaStatus } from "@/lib/hooks/useMediaStatus";
import { API_CONFIG } from "@/lib/api/apiConfig";
import { News, NewsDetail } from "@/types/news.types";
import { StructuredData as StructuredDataType } from "@/types/seo.types";

interface NewsDetailClientProps {
  initialNews: News | NewsDetail | null;
  initialStructuredData?: StructuredDataType | null;
  initialRelatedNews?: News[];
}

export function NewsDetailClient({
  initialNews,
  initialStructuredData,
  initialRelatedNews = [],
}: NewsDetailClientProps) {
  const params = useParams();
  const idOrSlug = params?.id as string;
  const { language, t } = useLanguage();

  // Use initial data or fetch if needed
  const { data: newsData, isLoading, error } = useNewsDetail(idOrSlug);
  const news = newsData?.data || initialNews;

  // Fetch structured data for news article
  const [structuredData, setStructuredData] = useState<StructuredDataType | null>(initialStructuredData || null);

  useEffect(() => {
    const fetchStructuredData = async () => {
      if (news?.slug && !initialStructuredData) {
        try {
          const response = await seoApi.getNewsStructuredData(news.slug);
          if (response.success && response.data) {
            setStructuredData(response.data);
          }
        } catch (error) {
          console.error("Failed to fetch news structured data:", error);
        }
      }
    };

    fetchStructuredData();
  }, [news?.slug, initialStructuredData]);

  // Note: Page view tracking is handled by BehaviorTracker component
  // No need to track here to avoid duplicate tracking

  // Fetch related news from the same category
  const { data: relatedNewsData } = useNews({
    categoryId: news?.category?.id,
    status: "PUBLISHED",
    limit: 4,
  });

  const relatedNews =
    relatedNewsData?.data?.news?.filter((n) => n.id !== news?.id).slice(0, 3) ||
    initialRelatedNews;

  // Check media status for main image
  const mainImageUrl = news?.mainImage;
  const isMediaLibraryUrl = mainImageUrl?.startsWith("/uploads/") || mainImageUrl?.includes("/uploads/");
  const { data: mediaStatusData } = useMediaStatus(
    isMediaLibraryUrl ? mainImageUrl : null
  );
  const mediaStatus = mediaStatusData?.data?.data?.status;
  const shouldShowFallback = mediaStatus === "FAILED" || mediaStatus === "PENDING";

  // Fetch related news by same author
  const { data: authorNewsData } = useNews({
    status: "PUBLISHED",
    limit: 10,
  });

  const relatedByAuthor = news?.author?.id
    ? authorNewsData?.data?.news?.filter(
        (n) => n.id !== news?.id && n.author?.id === news.author.id
      ).slice(0, 4) || []
    : [];

  if (isLoading && !initialNews) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow container mx-auto px-4 py-8">
          <Loading />
        </main>
      </div>
    );
  }

  if ((error || !news) && !initialNews) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow container mx-auto px-4 py-8 text-center">
          {error && <ErrorMessage error={error} className="mb-4" />}
          <h1 className="text-4xl font-bold mb-4 text-gray-900">
            {language === "it" ? "Articolo Non Trovato" : "News Not Found"}
          </h1>
          <p className="text-gray-600 mb-6">
            {language === "it"
              ? "L'articolo che stai cercando non esiste o è stato rimosso."
              : "The news article you're looking for doesn't exist or has been removed."}
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            {t("nav.home")}
          </Link>
        </main>
      </div>
    );
  }

  const categoryName = language === "it" ? news.category?.nameIt : news.category?.nameEn;
  const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";

  return (
    <>
      {structuredData && <StructuredData data={structuredData} id="news-structured-data" />}
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <article className="lg:col-span-8">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                <Link href="/" className="hover:text-red-600 transition">
                  {t("nav.home")}
                </Link>
                <span>/</span>
                {news.category && (
                  <>
                    <Link
                      href={`/category/${news.category.slug}`}
                      className="hover:text-red-600 transition"
                    >
                      {categoryName}
                    </Link>
                    <span>/</span>
                  </>
                )}
                <span className="text-gray-900 font-medium line-clamp-1">{news.title}</span>
              </div>

              {/* Category and Date */}
              <div className="mb-4">
                {news.category && (
                  <Link
                    href={`/category/${news.category.slug}`}
                    className="inline-block text-red-600 font-semibold hover:underline mr-3"
                  >
                    {categoryName}
                  </Link>
                )}
                <span className="text-gray-600">
                  {formatDate(news.publishedAt || news.createdAt, "MMMM dd, yyyy")} •{" "}
                  {formatRelativeTime(news.publishedAt || news.createdAt)}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">{news.title}</h1>

              {/* Social Share Buttons and Bookmark */}
              <div className="mb-6 flex items-center gap-4">
                <SocialShareButtons
                  url={`${frontendUrl}/news/${news.slug || news.id}`}
                  title={news.title}
                  description={news.summary || ""}
                />
                <BookmarkButton newsId={news.id} />
              </div>

              {/* Summary */}
              {news.summary && (
                <p className="text-xl text-gray-600 mb-6 leading-relaxed">{news.summary}</p>
              )}

              {/* Breaking Badge */}
              {news.isBreaking && (
                <div className="mb-6">
                  <span className="inline-block bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold">
                    {t("news.breaking")}
                  </span>
                </div>
              )}

              {/* Main Image */}
              {news.mainImage && news.mainImage.trim() !== "" && !shouldShowFallback && (
                <div className="relative w-full h-96 md:h-[500px] mb-8 rounded-lg overflow-hidden">
                  <OptimizedImage
                    src={news.mainImage}
                    alt={news.title}
                    fill
                    className="object-cover"
                    priority
                    loading="eager"
                    quality={90}
                  />
                </div>
              )}
              {/* Fallback for rejected/pending media */}
              {news.mainImage && shouldShowFallback && (
                <div className="relative w-full h-96 md:h-[500px] mb-8 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                  <div className="text-center p-8">
                    <svg
                      className="w-16 h-16 text-gray-400 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-gray-600 font-medium">
                      {mediaStatus === "FAILED"
                        ? language === "it"
                          ? "Immagine non disponibile (rifiutata)"
                          : "Image not available (rejected)"
                        : language === "it"
                          ? "Immagine in attesa di approvazione"
                          : "Image pending approval"}
                    </p>
                  </div>
                </div>
              )}

              {/* Image Gallery */}
              <ImageGallery content={news.content} mainImage={news.mainImage} className="mb-8" />

              {/* Content */}
              <div
                className="prose prose-lg max-w-none mb-8 text-gray-900"
                dangerouslySetInnerHTML={{ __html: news.content }}
              />

              {/* Inline Ad Slot */}
              <div className="my-8">
                <AdSlot slot="INLINE" />
              </div>

              {/* Author and Metadata */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">
                      {language === "it" ? "Scritto da" : "Written by"}
                    </p>
                    <p className="font-semibold text-gray-900">{news.author?.name || "Editor"}</p>
                  </div>
                  {news.views !== undefined && (
                    <div className="text-sm text-gray-500">
                      {news.views} {language === "it" ? "visualizzazioni" : "views"}
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
            </article>

            {/* Sidebar */}
            <aside className="lg:col-span-4 space-y-6">
              {/* Sidebar Ad Slot */}
              <div className="hidden lg:block">
                <AdSlot slot="SIDEBAR" />
              </div>
              {/* Trending Articles */}
              <div className="hidden lg:block">
                <TrendingArticles excludeId={news.id} limit={5} />
              </div>
            </aside>
          </div>

          {/* Related News by Category */}
          {relatedNews.length > 0 && (
            <section className="mt-12 pt-12 border-t border-gray-200">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">
                {language === "it" ? "Articoli Correlati" : "Related Articles"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedNews.map((related) => (
                  <NewsCard key={related.id} news={related} />
                ))}
              </div>
            </section>
          )}

          {/* Related News by Same Author */}
          {relatedByAuthor.length > 0 && (
            <section className="mt-12 pt-12 border-t border-gray-200">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">
                {language === "it"
                  ? `Altri Articoli di ${news.author?.name || "Questo Autore"}`
                  : `More from ${news.author?.name || "This Author"}`}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {relatedByAuthor.map((related) => (
                  <NewsCard key={related.id} news={related} />
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </>
  );
}

