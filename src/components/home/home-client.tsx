"use client";

import { useEffect, useRef, useMemo } from "react";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { TrendingBar } from "@/components/ui/trending-bar";
import { useLanguage } from "@/providers/LanguageProvider";
import { News } from "@/types/news.types";
import { StructuredData } from "@/components/seo/StructuredData";
import { StructuredData as StructuredDataType } from "@/types/seo.types";
import { AdSlot } from "@/components/ads/ad-slot";
import { SliderAd } from "@/components/ads/slider-ad";
import { TickerAd } from "@/components/ads/ticker-ad";
import { MostReadSidebar } from "@/components/news/most-read-sidebar";
import { useNewsInfinite } from "@/lib/hooks/useNews";
import { Loading } from "@/components/ui/loading";
import { HomepageSection } from "@/lib/api/modules/homepage.api";
import { HomepageSections } from "./homepage-sections";
import { HeroSection } from "./sections/hero-section";
import { FeaturedGrid } from "./sections/featured-grid";
import { CategoryBlocks } from "./sections/category-blocks";
import { HorizontalCard, GridCard } from "@/components/news/cnn-news-card";

interface HomeClientProps {
  allNews: News[];
  structuredData: StructuredDataType;
  sections?: HomepageSection[];
}

export function HomeClient({
  allNews: initialNews,
  structuredData,
  sections = [],
}: HomeClientProps) {
  const { language, t } = useLanguage();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Use infinite query for loading more news
  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useNewsInfinite({
    status: "PUBLISHED",
    limit: 12,
  });

  // Combine initial news with infinite query data
  const allNews = infiniteData?.pages
    ? infiniteData.pages.flatMap((page) => page.data?.news || [])
    : initialNews;

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Organize news data for CNN-style layout
  const newsData = useMemo(() => {
    // Get trending news - prioritize breaking news, then featured, then most recent
    const breakingNews = allNews.filter((n) => n.isBreaking);
    const featuredNews = allNews.filter((n) => n.isFeatured && !n.isBreaking);
    const trendingNews = [
      ...breakingNews.slice(0, 7),
      ...featuredNews.slice(0, 7 - breakingNews.length),
      ...allNews
        .filter((n) => !n.isBreaking && !n.isFeatured)
        .slice(0, 7 - breakingNews.length - featuredNews.length),
    ].slice(0, 7);

    // Main featured story (center)
    const heroStory = allNews.find((n) => n.isFeatured) || allNews[0];

    // Left column stories (3-4 stories)
    const leftColumnStories = allNews
      .filter((n) => n.id !== heroStory?.id)
      .slice(0, 4);

    // Right column stories (for headlines section)
    const rightColumnStories = allNews
      .filter(
        (n) =>
          n.id !== heroStory?.id &&
          !leftColumnStories.some((l) => l.id === n.id)
      )
      .slice(0, 8);

    // Featured grid stories (6-9 stories)
    const featuredGrid = allNews
      .filter(
        (n) =>
          n.id !== heroStory?.id &&
          !leftColumnStories.some((l) => l.id === n.id) &&
          !rightColumnStories.slice(0, 3).some((r) => r.id === n.id)
      )
      .slice(0, 9);

    // Category-based stories
    const categoryStories: Record<
      string,
      { category: NonNullable<News["category"]>; news: News[] }
    > = {};
    allNews.forEach((news) => {
      if (news.category) {
        const catId = news.category.id;
        if (!categoryStories[catId]) {
          categoryStories[catId] = {
            category: news.category,
            news: [],
          };
        }
        if (categoryStories[catId].news.length < 4) {
          categoryStories[catId].news.push(news);
        }
      }
    });

    // More stories for horizontal cards
    const moreStories = allNews
      .filter(
        (n) =>
          n.id !== heroStory?.id &&
          !leftColumnStories.some((l) => l.id === n.id) &&
          !rightColumnStories.some((r) => r.id === n.id) &&
          !featuredGrid.some((f) => f.id === n.id)
      )
      .slice(0, 6);

    return {
      trendingNews,
      heroStory,
      leftColumnStories,
      rightColumnStories,
      featuredGrid,
      categoryStories,
      moreStories,
    };
  }, [allNews]);

  return (
    <>
      {structuredData && <StructuredData data={structuredData} />}
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <TickerAd />
        <TrendingBar news={newsData.trendingNews} />

        {/* Slider Ad - Hero section replacement */}
        <div className="w-full">
          <SliderAd />
        </div>

        <main className="grow">
          {/* Render homepage sections if available, otherwise use default layout */}
          {sections && sections.length > 0 ? (
            <>
              <HomepageSections sections={sections} />
              {/* Infinite Scroll Trigger */}
              <div ref={loadMoreRef} className="container mx-auto px-4 mt-8">
                {isFetchingNextPage && (
                  <div className="flex justify-center py-8">
                    <Loading />
                  </div>
                )}
                {!hasNextPage && allNews.length > 20 && (
                  <div className="text-center py-8 text-gray-500">
                    {language === "it"
                      ? "Hai visto tutti gli articoli"
                      : "You've seen all articles"}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* CNN-Style Default Layout */
            <>
              {/* Hero Section */}
              <HeroSection
                heroStory={newsData.heroStory || null}
                leftColumnStories={newsData.leftColumnStories}
                rightColumnStories={newsData.rightColumnStories}
              />

              {/* Mid-Page Ad */}
              <div className="container mx-auto px-4 py-3">
                <AdSlot slot="MID_PAGE" />
              </div>

              {/* Featured Grid Section */}
              {newsData.featuredGrid.length > 0 && (
                <>
                  <FeaturedGrid
                    news={newsData.featuredGrid}
                    title={language === "it" ? "In Evidenza" : "Featured"}
                    columns={3}
                  />

                  {/* Between Sections Ad */}
                  <div className="container mx-auto px-4 py-3">
                    <AdSlot slot="BETWEEN_SECTIONS" />
                  </div>
                </>
              )}

              {/* Category Blocks */}
              {Object.keys(newsData.categoryStories).length > 0 && (
                <>
                  <CategoryBlocks
                    categoryStories={newsData.categoryStories}
                    maxPerCategory={4}
                  />

                  {/* Between Sections Ad */}
                  <div className="container mx-auto px-4 py-3">
                    <AdSlot slot="BETWEEN_SECTIONS" />
                  </div>
                </>
              )}

              {/* More Stories - Horizontal Cards */}
              {newsData.moreStories.length > 0 && (
                <div className="container mx-auto px-4 py-6">
                  <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900">
                    {language === "it" ? "Altre Notizie" : "More News"}
                  </h2>
                  <div className="space-y-0">
                    {newsData.moreStories.map((story) => (
                      <HorizontalCard key={story.id} news={story} />
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Featured Grid */}
              {allNews.length > 20 && (
                <>
                  <div className="container mx-auto px-4 py-6">
                    <AdSlot slot="BETWEEN_SECTIONS" />
                  </div>
                  <FeaturedGrid
                    news={allNews
                      .filter(
                        (n) =>
                          !newsData.heroStory || n.id !== newsData.heroStory.id
                      )
                      .slice(15, 24)}
                    title={
                      language === "it"
                        ? "Continua a Leggere"
                        : "Continue Reading"
                    }
                    columns={4}
                  />
                </>
              )}

              {/* Infinite Scroll Trigger */}
              <div ref={loadMoreRef} className="mt-8">
                {isFetchingNextPage && (
                  <div className="flex justify-center py-8">
                    <Loading />
                  </div>
                )}
                {!hasNextPage && allNews.length > 20 && (
                  <div className="text-center py-8 text-gray-500">
                    {language === "it"
                      ? "Hai visto tutti gli articoli"
                      : "You've seen all articles"}
                  </div>
                )}
              </div>
            </>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
}
