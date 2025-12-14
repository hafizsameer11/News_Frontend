"use client";

import { useState, useRef, useEffect } from "react";
import { useTGVideos } from "@/lib/hooks/useTG";
import { VideoCard } from "./video-card";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";

export function LatestVideosCarousel() {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, error } = useTGVideos({
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const videos = data?.data?.videos || [];

  // Update canScrollRight when scroll position or container size changes
  useEffect(() => {
    const updateScrollState = () => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const maxScroll = container.scrollWidth - container.clientWidth;
        setCanScrollRight(scrollPosition < maxScroll);
      }
    };

    updateScrollState();
    // Also update on window resize
    window.addEventListener("resize", updateScrollState);
    return () => window.removeEventListener("resize", updateScrollState);
  }, [scrollPosition, videos.length]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const scrollAmount = 400;
    const newPosition =
      direction === "left"
        ? scrollPosition - scrollAmount
        : scrollPosition + scrollAmount;

    container.scrollTo({
      left: Math.max(0, newPosition),
      behavior: "smooth",
    });
    setScrollPosition(Math.max(0, newPosition));
  };

  if (isLoading) {
    return (
      <div className="mb-8">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8">
        <ErrorMessage error={error} />
      </div>
    );
  }

  if (videos.length === 0) {
    return null;
  }

  const canScrollLeft = scrollPosition > 0;

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Latest Videos</h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
            aria-label="Scroll left"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
            aria-label="Scroll right"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onScroll={(e) => {
          setScrollPosition(e.currentTarget.scrollLeft);
        }}
      >
        {videos.map((video) => (
          <div key={video.id} className="flex-shrink-0 w-80">
            <VideoCard video={video} />
          </div>
        ))}
      </div>
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

