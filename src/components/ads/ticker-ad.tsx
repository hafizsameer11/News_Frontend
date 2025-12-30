"use client";

import { useEffect, useRef, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useAdByType } from "@/lib/hooks/useAds";
import { Ad } from "@/types/ads.types";
import { adsApi } from "@/lib/api/modules/ads.api";
import Link from "next/link";
import Image from "next/image";
import { getImageUrl } from "@/lib/helpers/imageUrl";

export function TickerAd() {
  const pathname = usePathname();
  const [isMounted] = useState(() => typeof window !== "undefined");
  
  // Fetch both TICKER and SLIDER_TOP ads for the ticker section
  const { data: tickerData, isLoading: tickerLoading, error: tickerError } = useAdByType("TICKER", 5);
  const { data: sliderTopData, isLoading: sliderTopLoading, error: sliderTopError } = useAdByType("SLIDER_TOP", 5);
  const tickerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  // Don't show ads in admin panel, advertiser panel, or editor pages
  // Advertisers CAN see ads on public pages (to see competitors), but NOT in their panel
  const isAdminRoute =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/advertiser") ||
    pathname?.startsWith("/editor") ||
    pathname?.startsWith("/admin-login");

  // Derive selected ads from data - combine TICKER and SLIDER_TOP ads
  const selectedAds = useMemo(() => {
    const ads: Ad[] = [];
    
    // Add SLIDER_TOP ads first (prioritize them)
    if (sliderTopData?.data?.ads && sliderTopData.data.ads.length > 0) {
      const sliderTopAds = sliderTopData.data.ads.filter((ad) => ad.type === "SLIDER_TOP");
      ads.push(...sliderTopAds);
    }
    
    // Add TICKER ads
    if (tickerData?.data?.ads && tickerData.data.ads.length > 0) {
      const tickerAds = tickerData.data.ads.filter((ad) => ad.type === "TICKER");
      ads.push(...tickerAds);
    }
    
    return ads;
  }, [tickerData, sliderTopData]);

  const isLoading = tickerLoading || sliderTopLoading;
  const error = tickerError || sliderTopError;

  // Create continuous scrolling animation
  useEffect(() => {
    if (!tickerRef.current || selectedAds.length === 0) return;

    const ticker = tickerRef.current;
    const content = ticker.querySelector(".ticker-content") as HTMLElement;
    if (!content) return;

    let position = 0;
    const speed = 1; // pixels per frame

    const animate = () => {
      position -= speed;

      // Reset position when content has scrolled completely
      if (Math.abs(position) >= content.offsetWidth) {
        position = 0;
      }

      content.style.transform = `translateX(${position}px)`;
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [selectedAds]);

  const handleClick = (ad: Ad) => {
    // Track click
    adsApi.trackClick(ad.id).catch((err) => {
      console.error("Failed to track ad click:", err);
    });
  };

  // Don't render until mounted to prevent hydration mismatch
  if (!isMounted) {
    return null;
  }

  // Don't show in admin routes only (advertisers can see ads on public pages)
  if (isAdminRoute || isLoading || error || selectedAds.length === 0) {
    return null;
  }

  // Duplicate ads for seamless loop
  const duplicatedAds = [...selectedAds, ...selectedAds];

  return (
    <div className="w-full bg-gray-100 text-gray-900 overflow-hidden">
      <div
        ref={tickerRef}
        className="relative h-[60px] sm:h-[90px] flex items-center"
      >
        <div className="ticker-content flex items-center gap-4 sm:gap-8 whitespace-nowrap">
          {duplicatedAds.map((ad, index) => {
            const adContent = (
              <div className="relative w-[300px] h-[60px] sm:w-[728px] sm:h-[90px] flex-shrink-0 overflow-hidden bg-gray-50">
                {ad.imageUrl && ad.imageUrl.trim() !== "" ? (
                  <Image
                    src={getImageUrl(ad.imageUrl)}
                    alt={ad.title}
                    width={728}
                    height={90}
                    className="object-cover w-full h-full"
                    quality={85}
                    loading="lazy"
                    unoptimized={
                      getImageUrl(ad.imageUrl).includes("localhost") ||
                      getImageUrl(ad.imageUrl).includes("127.0.0.1") ||
                      getImageUrl(ad.imageUrl).includes("api.tgcalabriareport.com")
                    }
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <p className="text-xs text-gray-500">No image</p>
                  </div>
                )}
              </div>
            );

            // Only wrap in Link if targetLink exists
            if (ad.targetLink && ad.targetLink.trim() !== "") {
              return (
                <Link
                  key={`${ad.id}-${index}`}
                  href={ad.targetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleClick(ad)}
                  className="flex items-center gap-2 sm:gap-4 px-4 sm:px-8 hover:opacity-90 active:opacity-75 transition-opacity flex-shrink-0 touch-manipulation text-gray-900"
                >
                  {adContent}
                </Link>
              );
            }

            // Render without link if no targetLink
            return (
              <div
                key={`${ad.id}-${index}`}
                className="flex items-center gap-2 sm:gap-4 px-4 sm:px-8 flex-shrink-0"
              >
                {adContent}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
