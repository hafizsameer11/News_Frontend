"use client";

import { useState, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useAdByType } from "@/lib/hooks/useAds";
import { AdDisplay } from "./ad-display";

export function PopupAd() {
  const pathname = usePathname();
  const { data, isLoading, error } = useAdByType("POPUP", 1);
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

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
      return data.data.ads.find((ad) => ad.type === "POPUP") || null;
    }
    return null;
  }, [data]);

  // Check if popup has been shown today or in this session
  useEffect(() => {
    if (!selectedAd || hasShown) return;

    const checkIfShown = () => {
      if (typeof window === "undefined") return false;

      // Check session storage (once per session)
      const sessionKey = `popup_ad_shown_${selectedAd.id}`;
      if (sessionStorage.getItem(sessionKey)) {
        return true;
      }

      // Check localStorage (once per day)
      const today = new Date().toDateString();
      const lastShownKey = `popup_ad_last_shown_${selectedAd.id}`;
      const lastShown = localStorage.getItem(lastShownKey);

      if (lastShown === today) {
        return true;
      }

      return false;
    };

    const wasShown = checkIfShown();
    if (wasShown) {
      // Use setTimeout to avoid synchronous setState
      setTimeout(() => {
        setHasShown(true);
      }, 0);
      return;
    }

    // Show popup after 3 seconds delay
    const timer = setTimeout(() => {
      setIsVisible(true);
      setHasShown(true);

      // Mark as shown in session storage
      if (typeof window !== "undefined") {
        sessionStorage.setItem(`popup_ad_shown_${selectedAd.id}`, "true");
        localStorage.setItem(
          `popup_ad_last_shown_${selectedAd.id}`,
          new Date().toDateString()
        );
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [selectedAd, hasShown]);

  const handleClose = () => {
    setIsVisible(false);
  };

  // Don't show in admin routes only (advertisers can see ads on public pages)
  if (isAdminRoute || isLoading || error || !selectedAd || !isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="relative bg-white rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto mx-2 sm:mx-0">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 bg-gray-800 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-900 transition-colors z-10"
          aria-label="Close ad"
        >
          <svg
            className="w-5 h-5"
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

        <div className="p-6">
          <AdDisplay ad={selectedAd} slot="INLINE" />
        </div>
      </div>
    </div>
  );
}
