"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/providers/LanguageProvider";
import { formatDate } from "@/lib/helpers/formatDate";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { WeatherWidget } from "@/components/weather/weather-widget";
import { UtilityLinksDropdown } from "./utility-links-dropdown";

export function UtilityBar() {
  const { language } = useLanguage();
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Update date periodically on client side only to avoid hydration mismatch
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Handle scroll behavior - only show when at very top (scrollY === 0)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Only show utility bar when at the very top of the page
      if (currentScrollY === 0) {
        setIsVisible(true);
      } else {
        // Hide when scrolling down
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    // Check initial scroll position
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <div
      className={`bg-gray-50 border-b border-gray-200 text-xs transition-transform duration-300 ${
        isVisible
          ? "translate-y-0 opacity-100"
          : "-translate-y-full opacity-0 pointer-events-none"
      }`}
      style={{
        position: "sticky",
        top: 0,
        zIndex: 51, // Below navbar (z-40) but above content
      }}
    >
      <div className="container mx-auto px-2 sm:px-4 lg:px-8 xl:px-12 max-w-7xl" style={{ overflow: "visible" }}>
        <div className="flex items-center justify-between min-h-[32px] sm:h-8 py-1 sm:py-0 flex-wrap gap-1 sm:gap-0">
          {/* Left: Utility Links - appear before date */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <UtilityLinksDropdown />
          </div>

          {/* Right: Date, Language Switcher & Weather */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0 flex-wrap">
            {/* Date - shorter format on mobile */}
            <div className="text-gray-600 text-[10px] sm:text-xs whitespace-nowrap" suppressHydrationWarning>
              <span className="hidden sm:inline">
                {formatDate(
                  currentDate || new Date(),
                  language === "it" ? "EEEE, d MMMM yyyy" : "EEEE, MMMM d, yyyy"
                )}
              </span>
              <span className="sm:hidden">
                {formatDate(
                  currentDate || new Date(),
                  language === "it" ? "d MMM yyyy" : "MMM d, yyyy"
                )}
              </span>
            </div>
            <LanguageSwitcher compact />
            <WeatherWidget />
          </div>
        </div>
      </div>
    </div>
  );
}
