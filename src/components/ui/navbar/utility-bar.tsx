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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 max-w-7xl">
        <div className="flex items-center justify-between h-8">
          {/* Left: Date */}
          <div className="text-gray-600" suppressHydrationWarning>
            {formatDate(
              currentDate || new Date(),
              language === "it" ? "EEEE, d MMMM yyyy" : "EEEE, MMMM d, yyyy"
            )}
          </div>

          {/* Right: Utility Links, Language Switcher & Weather */}
          <div className="flex items-center gap-3">
            <UtilityLinksDropdown />
            <LanguageSwitcher compact />
            <WeatherWidget />
          </div>
        </div>
      </div>
    </div>
  );
}
