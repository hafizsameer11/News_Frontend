"use client";

import { News } from "@/types/news.types";
import { HeroCard, CompactCard, HeadlineCard } from "@/components/news/cnn-news-card";
import { AdSlot } from "@/components/ads/ad-slot";
import { useLanguage } from "@/providers/LanguageProvider";

interface HeroSectionProps {
  heroStory: News | null;
  leftColumnStories: News[];
  rightColumnStories: News[];
}

export function HeroSection({
  heroStory,
  leftColumnStories,
  rightColumnStories,
}: HeroSectionProps) {
  const { language, t } = useLanguage();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 max-w-7xl py-4 md:py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        {/* Left Column - 3-4 Smaller Stories */}
        <div className="lg:col-span-3 space-y-4">
          {leftColumnStories.length > 0 ? (
            leftColumnStories.map((story) => (
              <CompactCard key={story.id} news={story} />
            ))
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                {language === "it" 
                  ? "Nessuna notizia disponibile" 
                  : "No news available"}
              </p>
            </div>
          )}
        </div>

        {/* Center Column - Main Hero Story */}
        <div className="lg:col-span-6">
          {heroStory ? (
            <HeroCard news={heroStory} />
          ) : (
            <div className="p-8 bg-gray-50 rounded-lg border border-gray-200 text-center">
              <p className="text-gray-600">
                {t("news.noNews")}
              </p>
            </div>
          )}
        </div>

        {/* Right Column - Headlines + Sidebar Ad */}
        <div className="lg:col-span-3 space-y-6">
          {/* Sidebar Ad Slot */}
          <div className="hidden lg:block">
            <AdSlot slot="SIDEBAR" />
          </div>
          
          {/* Headlines Section */}
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              {language === "it" ? "Titoli" : "Headlines"}
            </h2>
            <div className="space-y-3">
              {rightColumnStories.length > 0 ? (
                rightColumnStories.slice(0, 5).map((story) => (
                  <HeadlineCard key={story.id} news={story} />
                ))
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                  <p className="text-sm text-gray-600">
                    {language === "it" 
                      ? "Nessun titolo disponibile" 
                      : "No headlines available"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

