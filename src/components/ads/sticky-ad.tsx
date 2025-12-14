"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useAdByType } from "@/lib/hooks/useAds";
import { AdDisplay } from "./ad-display";
import { Ad } from "@/types/ads.types";

export function StickyAd() {
  const pathname = usePathname();
  const { data, isLoading, error } = useAdByType("STICKY", 1);
  const [isVisible, setIsVisible] = useState(true);
  const [isClosed, setIsClosed] = useState(false);
  const lastScrollY = useRef(0);

  // Don't show ads in admin panel, advertiser panel, or editor pages
  // Advertisers CAN see ads on public pages (to see competitors), but NOT in their panel
  const isAdminRoute =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/advertiser") ||
    pathname?.startsWith("/editor") ||
    pathname?.startsWith("/admin-login");

  // Derive selected ad from data instead of using effect
  const selectedAd = useMemo(() => {
    if (data?.data?.ads && data.data.ads.length > 0) {
      return data.data.ads.find((ad) => ad.type === "STICKY") || null;
    }
    return null;
  }, [data]);

  // Handle scroll behavior: hide on scroll down, show on scroll up
  useEffect(() => {
    if (isClosed || !selectedAd) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        // Scrolling down
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY.current) {
        // Scrolling up
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isClosed, selectedAd]);

  // Check if user has closed this ad in session storage
  useEffect(() => {
    if (typeof window !== "undefined" && selectedAd) {
      const closedAds = sessionStorage.getItem("closed_sticky_ads");
      if (closedAds) {
        const closedIds = JSON.parse(closedAds);
        if (closedIds.includes(selectedAd.id)) {
          // Use setTimeout to avoid synchronous setState
          setTimeout(() => {
            setIsClosed(true);
          }, 0);
        }
      }
    }
  }, [selectedAd]);

  const handleClose = () => {
    setIsClosed(true);
    setIsVisible(false);

    // Store in session storage
    if (selectedAd && typeof window !== "undefined") {
      const closedAds = sessionStorage.getItem("closed_sticky_ads");
      const closedIds = closedAds ? JSON.parse(closedAds) : [];
      if (!closedIds.includes(selectedAd.id)) {
        closedIds.push(selectedAd.id);
        sessionStorage.setItem("closed_sticky_ads", JSON.stringify(closedIds));
      }
    }
  };

  // Don't show in admin routes only (advertisers can see ads on public pages)
  if (isAdminRoute || isLoading || error || !selectedAd || isClosed) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none"
      } max-w-[300px] w-[calc(100vw-2rem)] sm:w-auto`}
    >
      <div className="relative bg-white rounded-lg shadow-2xl border border-gray-200">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-gray-900 transition-colors z-10"
          aria-label="Close ad"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <AdDisplay ad={selectedAd} slot="SIDEBAR" />
      </div>
    </div>
  );
}
