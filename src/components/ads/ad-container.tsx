"use client";

import { useState, useEffect } from "react";
import { Ad } from "@/types/ads.types";
import { AdDisplay } from "./ad-display";

interface AdContainerProps {
  ads: Ad[];
  slot?:
    | "HEADER"
    | "SIDEBAR"
    | "INLINE"
    | "FOOTER"
    | "MOBILE"
    | "TOP_BANNER"
    | "MID_PAGE"
    | "BETWEEN_SECTIONS";
  className?: string;
}

export function AdContainer({ ads, slot, className = "" }: AdContainerProps) {
  const [windowWidth, setWindowWidth] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth;
    }
    return 0;
  });
  const [isMounted] = useState(
    () => typeof window !== "undefined"
  );

  // Handle window width tracking on client side only to avoid hydration mismatch
  useEffect(() => {
    const updateWidth = () => {
      if (typeof window !== "undefined") {
        setWindowWidth(window.innerWidth);
      }
    };
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  if (!isMounted || ads.length === 0) {
    return null;
  }

  // Sidebar ads should not use container layout
  const isSidebar = slot === "SIDEBAR" || slot === "MOBILE";
  const isFooter = slot === "FOOTER";
  const isMobile = windowWidth < 768;
  const isDesktop = windowWidth > 1024;

  // For footer ads with 2+ ads, always show side-by-side on desktop, stacked on mobile
  // For other slots, use the existing logic
  if (isFooter && ads.length >= 2) {
    const adsToShow = ads.slice(0, 2);
    if (isMobile) {
      // Mobile: stack vertically with proper spacing, ensure full width
      // Reduce gap to minimize empty space
      return (
        <div
          className={`flex flex-col items-center gap-3 w-full ${className}`.trim()}
        >
          {adsToShow.map((ad) => (
            <div key={ad.id} className="w-full flex justify-center">
              <AdDisplay ad={ad} slot={slot} />
            </div>
          ))}
        </div>
      );
    } else {
      // Desktop: show side-by-side with proper spacing and sizing
      // Ensure ads maintain their full size and don't shrink
      // Reduce gap to minimize empty space
      return (
        <div
          className={`flex flex-nowrap justify-center items-start gap-3 w-full ${className}`.trim()}
        >
          {adsToShow.map((ad) => (
            <div
              key={ad.id}
              className="flex-shrink-0"
              style={{ minWidth: "300px", maxWidth: "728px", flex: "1 1 0" }}
            >
              <AdDisplay ad={ad} slot={slot} />
            </div>
          ))}
        </div>
      );
    }
  }

  // On desktop (>1024px) and if we have 2+ ads for non-footer slots, show inline
  // Otherwise, center and stack vertically
  // Mobile always stacks
  const shouldShowInline =
    !isMobile && !isSidebar && !isFooter && ads.length >= 2 && isDesktop;

  if (shouldShowInline) {
    // Show 2 ads side by side (max 2)
    // Reduce gap to minimize empty space
    const adsToShow = ads.slice(0, 2);
    return (
      <div
        className={`flex flex-wrap justify-center gap-3 ${className}`.trim()}
      >
        {adsToShow.map((ad) => (
          <div
            key={ad.id}
            className="flex-shrink-0"
            style={{ minWidth: "300px", maxWidth: "728px", width: "100%" }}
          >
            <AdDisplay ad={ad} slot={slot} />
          </div>
        ))}
      </div>
    );
  }

  // Single ad or mobile: center and stack
  // Reduce gap to minimize empty space
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`.trim()}>
      {ads.map((ad) => (
        <div key={ad.id} className="w-full flex justify-center max-w-[728px]">
          <AdDisplay ad={ad} slot={slot} />
        </div>
      ))}
    </div>
  );
}
