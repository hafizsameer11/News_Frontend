"use client";

import { useState, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useAdBySlot } from "@/lib/hooks/useAds";
import { AdDisplay } from "./ad-display";
import { AdContainer } from "./ad-container";
import { Loading } from "@/components/ui/loading";
import {
  selectAdForRotation,
  getCachedAd,
  cacheSelectedAd,
} from "@/lib/helpers/ad-rotation";
import { Ad } from "@/types/ads.types";

interface AdSlotProps {
  slot:
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

export function AdSlot({ slot, className = "" }: AdSlotProps) {
  const pathname = usePathname();
  // Fetch up to 2 ads for inline display when space allows
  const { data, isLoading, error } = useAdBySlot(slot, 2);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [allAds, setAllAds] = useState<Ad[]>([]);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768;
    }
    return false;
  });
  const [isMounted] = useState(() => typeof window !== "undefined");

  // Don't show ads in admin panel, advertiser panel, or editor pages
  // Advertisers CAN see ads on public pages (to see competitors), but NOT in their panel
  const isAdminRoute =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/advertiser") ||
    pathname?.startsWith("/editor") ||
    pathname?.startsWith("/admin-login");

  // Handle mobile detection on client side only to avoid hydration mismatch
  useEffect(() => {
    const checkMobile = () => {
      if (typeof window !== "undefined") {
        setIsMobile(window.innerWidth < 768);
      }
    };
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Compute filtered ads
  const filteredAds = useMemo(() => {
    if (data?.data?.ads && data.data.ads.length > 0) {
      let ads = data.data.ads;

      // Filter out BANNER_TOP ads from non-TOP_BANNER slots
      // BANNER_TOP ads should only appear in TOP_BANNER slot
      if (slot !== "TOP_BANNER" && slot !== "HEADER") {
        ads = ads.filter((ad) => ad.type !== "BANNER_TOP");
      }

      return ads;
    }
    return [];
  }, [data, slot]);

  // Update ads when filtered ads change
  useEffect(() => {
    // Use setTimeout to defer state updates
    const timer = setTimeout(() => {
      if (filteredAds.length > 0) {
        setAllAds(filteredAds);

        // For single ad display (backward compatibility), use rotation
        if (filteredAds.length === 1) {
          setSelectedAd(filteredAds[0]);
        } else {
          // Check if we have a cached ad for this slot
          const cachedAdId = getCachedAd(slot);
          const cachedAd = cachedAdId
            ? filteredAds.find((ad) => ad.id === cachedAdId)
            : null;

          if (cachedAd) {
            setSelectedAd(cachedAd);
          } else {
            // Select a new ad and cache it (for single ad fallback)
            const ad = selectAdForRotation(filteredAds);
            if (ad) {
              setSelectedAd(ad);
              cacheSelectedAd(slot, ad.id);
            }
          }
        }
      } else {
        setAllAds([]);
        setSelectedAd(null);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [filteredAds, slot]);

  // Handle mobile-specific slots - only check after mount
  const shouldShowMobile = slot !== "MOBILE" || (isMounted && isMobile);

  // Don't show ads in admin routes only (advertisers can see ads on public pages)
  if (isAdminRoute || !shouldShowMobile) {
    return null;
  }

  if (isLoading) {
    // Remove duplicate classes from className prop
    const loadingClasses = className.includes("flex justify-center")
      ? className.replace("flex justify-center", "").trim()
      : className;
    return (
      <div
        className={`flex items-center justify-center min-h-[100px] ${loadingClasses}`.trim()}
      >
        <Loading />
      </div>
    );
  }

  if (error || !data?.data?.ads || data.data.ads.length === 0) {
    return null; // Don't show anything if no ads
  }

  // Use AdContainer for multiple ads, single AdDisplay for single ad
  const isSidebar = slot === "SIDEBAR" || slot === "MOBILE";
  const wrapperClasses = isSidebar
    ? className
    : `flex justify-center w-full ${className}`.trim();

  // If we have multiple ads, use AdContainer for inline/stacked layout
  if (allAds.length > 1) {
    return (
      <div className={wrapperClasses}>
        <AdContainer ads={allAds} slot={slot} />
      </div>
    );
  }

  // Single ad display (backward compatibility)
  if (selectedAd) {
    return (
      <div className={wrapperClasses}>
        <AdDisplay ad={selectedAd} className="" slot={slot} />
      </div>
    );
  }

  return null;
}
