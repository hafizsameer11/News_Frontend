"use client";

import { News } from "@/types/news.types";
import { HeroCard, CompactCard, HeadlineCard } from "@/components/news/cnn-news-card";
import { AdSlot } from "@/components/ads/ad-slot";

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
  return (
    <div className="container mx-auto px-4 py-4 md:py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        {/* Left Column - 3-4 Smaller Stories */}
        <div className="lg:col-span-3 space-y-4">
          {leftColumnStories.map((story) => (
            <CompactCard key={story.id} news={story} />
          ))}
        </div>

        {/* Center Column - Main Hero Story */}
        <div className="lg:col-span-6">
          {heroStory && <HeroCard news={heroStory} />}
        </div>

        {/* Right Column - Headlines + Sidebar Ad */}
        <div className="lg:col-span-3 space-y-6">
          {/* Sidebar Ad Slot */}
          <div className="hidden lg:block">
            <AdSlot slot="SIDEBAR" />
          </div>
          
          {/* Headlines Section */}
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-900">Headlines</h2>
            <div className="space-y-3">
              {rightColumnStories.map((story) => (
                <HeadlineCard key={story.id} news={story} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

