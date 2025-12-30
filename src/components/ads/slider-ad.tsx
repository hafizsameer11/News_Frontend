"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useAdByType } from "@/lib/hooks/useAds";
import { AdDisplay } from "./ad-display";

export function SliderAd() {
  const pathname = usePathname();
  // Fetch both SLIDER and SLIDER_TOP ads for the homepage hero section
  const { data: sliderData, isLoading: sliderLoading, error: sliderError } = useAdByType("SLIDER", 5);
  const { data: sliderTopData, isLoading: sliderTopLoading, error: sliderTopError } = useAdByType("SLIDER_TOP", 5);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Don't show ads in admin panel, advertiser panel, or editor pages
  // Advertisers CAN see ads on public pages (to see competitors), but NOT in their panel
  const isAdminRoute =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/advertiser") ||
    pathname?.startsWith("/editor") ||
    pathname?.startsWith("/admin-login");

  // Derive selected ads from data - prioritize SLIDER_TOP, fallback to SLIDER
  const selectedAds = useMemo(() => {
    // First, try to get SLIDER_TOP ads (homepage hero slider)
    if (sliderTopData?.data?.ads && sliderTopData.data.ads.length > 0) {
      const sliderTopAds = sliderTopData.data.ads.filter((ad) => ad.type === "SLIDER_TOP");
      if (sliderTopAds.length > 0) {
        return sliderTopAds;
      }
    }
    // Fallback to regular SLIDER ads
    if (sliderData?.data?.ads && sliderData.data.ads.length > 0) {
      return sliderData.data.ads.filter((ad) => ad.type === "SLIDER");
    }
    return [];
  }, [sliderTopData, sliderData]);

  const isLoading = sliderLoading || sliderTopLoading;
  const error = sliderError || sliderTopError;

  // Auto-rotate ads every 5 seconds
  useEffect(() => {
    if (selectedAds.length <= 1 || isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % selectedAds.length);
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [selectedAds.length, isPaused]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + selectedAds.length) % selectedAds.length
    );
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % selectedAds.length);
  };

  // Don't show in admin routes only (advertisers can see ads on public pages)
  if (isAdminRoute || isLoading || error || selectedAds.length === 0) {
    return null;
  }

  const currentAd = selectedAds[currentIndex];

  return (
    <div
      className="relative w-full max-w-[1920px] mx-auto overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div className="relative overflow-hidden rounded-lg bg-gray-100">
        <AdDisplay ad={currentAd} slot="TOP_BANNER" />
      </div>

      {/* Navigation arrows */}
      {selectedAds.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-1.5 sm:p-2 hover:bg-opacity-75 active:bg-opacity-90 transition-all z-10 touch-manipulation"
            aria-label="Previous ad"
          >
            <svg
              className="w-4 h-4 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-1.5 sm:p-2 hover:bg-opacity-75 active:bg-opacity-90 transition-all z-10 touch-manipulation"
            aria-label="Next ad"
          >
            <svg
              className="w-4 h-4 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}

      {/* Navigation dots */}
      {selectedAds.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {selectedAds.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "bg-white w-8"
                  : "bg-white bg-opacity-50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
