"use client";

import { usePathname } from "next/navigation";
import { useAdBySlot } from "@/lib/hooks/useAds";
import { AdDisplay } from "./ad-display";
import { selectAdForRotation, getCachedAd, cacheSelectedAd } from "@/lib/helpers/ad-rotation";
import { Ad } from "@/types/ads.types";
import { useMemo, useEffect } from "react";

export function StickyHeaderAd() {
  const pathname = usePathname();
  const { data, isLoading, error } = useAdBySlot("TOP_BANNER");

  // Don't show ads in admin panel, advertiser panel, or editor pages
  const isAdminRoute = pathname?.startsWith("/admin") || 
                       pathname?.startsWith("/advertiser") || 
                       pathname?.startsWith("/editor") ||
                       pathname?.startsWith("/admin-login");

  // Derive selected ad from data instead of using effect
  const selectedAd = useMemo(() => {
    if (data?.data?.ads && data.data.ads.length > 0) {
      const ads = data.data.ads;
      
      // Check if we have a cached ad for this slot
      const cachedAdId = getCachedAd("TOP_BANNER");
      const cachedAd = cachedAdId ? ads.find((ad) => ad.id === cachedAdId) : null;

      if (cachedAd) {
        return cachedAd;
      } else {
        // Select a new ad and cache it
        const ad = selectAdForRotation(ads);
        if (ad) {
          // Cache in effect to avoid side effects in render
          setTimeout(() => {
            cacheSelectedAd("TOP_BANNER", ad.id);
          }, 0);
          return ad;
        }
      }
    }
    return null;
  }, [data]);

  // Cache the selected ad when it changes
  useEffect(() => {
    if (selectedAd) {
      cacheSelectedAd("TOP_BANNER", selectedAd.id);
    }
  }, [selectedAd]);

  // Don't show in admin routes
  if (isAdminRoute) {
    return null;
  }

  // Don't render if no ad available
  if (isLoading) {
    return null; // Don't show loading state for sticky header
  }

  if (error || !data?.data?.ads || data.data.ads.length === 0 || !selectedAd) {
    return null; // Don't show anything if no ads
  }

  return (
    <div
      className="relative w-full bg-white border-b border-gray-200"
      aria-label="Top banner advertisement"
    >
      <div className="container mx-auto px-4 py-2 flex justify-center">
        <AdDisplay ad={selectedAd} className="w-full max-w-[728px]" slot="TOP_BANNER" />
      </div>
    </div>
  );
}


