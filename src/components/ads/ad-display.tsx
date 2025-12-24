"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Ad } from "@/types/ads.types";
import { adsApi } from "@/lib/api/modules/ads.api";
import { getSlotDimensions } from "@/lib/helpers/ad-rotation";
import { getImageUrl } from "@/lib/helpers/imageUrl";

interface AdDisplayProps {
  ad: Ad;
  className?: string;
  slot?:
    | "HEADER"
    | "SIDEBAR"
    | "INLINE"
    | "FOOTER"
    | "MOBILE"
    | "TOP_BANNER"
    | "MID_PAGE"
    | "BETWEEN_SECTIONS";
}

export function AdDisplay({ ad, className = "", slot }: AdDisplayProps) {
  // TOP_BANNER ads are above the fold and might be LCP, so use eager loading
  const isAboveFold = slot === "TOP_BANNER" || slot === "HEADER";
  const adRef = useRef<HTMLDivElement>(null);
  const impressionTracked = useRef(false);
  const [isMounted] = useState(() => typeof window !== "undefined");
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768;
    }
    return false;
  });

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

  // Track impression when ad comes into view
  useEffect(() => {
    if (impressionTracked.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !impressionTracked.current) {
            impressionTracked.current = true;
            // Track impression
            adsApi.trackImpression(ad.id).catch((err) => {
              console.error("Failed to track ad impression:", err);
            });
          }
        });
      },
      { threshold: 0.5 } // Track when 50% visible
    );

    if (adRef.current) {
      observer.observe(adRef.current);
    }

    return () => {
      if (adRef.current) {
        observer.unobserve(adRef.current);
      }
    };
  }, [ad.id]);

  const handleClick = () => {
    // Track click
    adsApi.trackClick(ad.id).catch((err) => {
      console.error("Failed to track ad click:", err);
    });
  };

  // Determine ad dimensions based on slot type or ad type
  const getAdDimensions = () => {
    if (slot) {
      return getSlotDimensions(slot);
    }

    // Fallback to ad type
    switch (ad.type) {
      case "BANNER_TOP":
        return { width: 728, height: 90 };
      case "BANNER_SIDE":
        return { width: 300, height: 250 };
      case "INLINE":
        return { width: 728, height: 90 };
      case "FOOTER":
        return { width: 728, height: 90 };
      default:
        return { width: 300, height: 250 };
    }
  };

  const dimensions = getAdDimensions();

  // Get normalized image URL
  const imageUrl = useMemo(() => {
    return getImageUrl(ad.imageUrl);
  }, [ad.imageUrl]);

  // Track if image optimization fails
  const [imageOptimizationFailed, setImageOptimizationFailed] = useState(false);

  // Check if image is from localhost to disable optimization
  const isLocalhost = useMemo(() => {
    if (typeof imageUrl === "string") {
      return (
        imageUrl.includes("localhost") || imageUrl.includes("127.0.0.1")
      );
    }
    return false;
  }, [imageUrl]);

  // Check if image is from API domain - use unoptimized if Next.js optimization fails
  const isApiDomain = useMemo(() => {
    if (typeof imageUrl === "string") {
      return imageUrl.includes("api.tgcalabriareport.com");
    }
    return false;
  }, [imageUrl]);

  // In development, disable optimization for localhost URLs to avoid fetch issues
  // For API domain, use unoptimized to avoid Next.js Image optimization failures
  // (Next.js server might not be able to fetch from API domain)
  const shouldUnoptimize =
    imageOptimizationFailed ||
    isApiDomain ||
    (process.env.NODE_ENV === "development" && isLocalhost);

  // Responsive classes - only apply after mount to avoid hydration mismatch
  // Sidebar ads should not be centered, all others should be centered by default
  const isSidebar = slot === "SIDEBAR" || slot === "MOBILE";

  const responsiveClasses = !isMounted
    ? "w-full"
    : isMobile
    ? "w-full max-w-full min-w-[300px] mx-auto"
    : isSidebar
    ? "w-full min-w-[250px] max-w-[250px]"
    : slot === "TOP_BANNER" ||
      slot === "MID_PAGE" ||
      slot === "BETWEEN_SECTIONS" ||
      slot === "HEADER" ||
      slot === "INLINE" ||
      slot === "FOOTER"
    ? "w-full max-w-[728px] min-w-[300px] mx-auto"
    : "w-full max-w-full mx-auto";

  // Merge className properly - ensure centering for non-sidebar ads
  const mergedClassName = isSidebar
    ? `ad-slot ${className} ${responsiveClasses}`.trim()
    : `ad-slot ${responsiveClasses} ${className}`.trim();

  return (
    <div ref={adRef} className={mergedClassName}>
      <Link
        href={ad.targetLink}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="block hover:opacity-90 transition-opacity w-full"
      >
        <div
          className="relative overflow-hidden rounded bg-gray-100 w-full"
          style={{ aspectRatio: `${dimensions.width} / ${dimensions.height}` }}
        >
          {imageUrl && imageUrl.trim() !== "" ? (
            <Image
              src={imageUrl}
              alt={ad.title}
              fill
              className="object-cover w-full h-full"
              quality={85}
              loading={isAboveFold ? "eager" : "lazy"}
              priority={isAboveFold}
              unoptimized={shouldUnoptimize}
              sizes="(max-width: 768px) 100vw, 728px"
              style={{ transition: "none" }}
              onError={(e) => {
                // If optimization failed, try unoptimized version
                if (!imageOptimizationFailed && !shouldUnoptimize) {
                  setImageOptimizationFailed(true);
                  return;
                }
                // Handle broken images
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
          ) : (
            <div className="w-full h-32 bg-gray-200 flex items-center justify-center">
              <p className="text-xs text-gray-500">No image</p>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1 text-center">Advertisement</p>
      </Link>
    </div>
  );
}
