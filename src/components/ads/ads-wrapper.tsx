"use client";

import dynamic from "next/dynamic";

// Dynamically import ad components to avoid SSR issues and chunk loading errors
const StickyHeaderAd = dynamic(() => import("./sticky-header-ad").then(mod => ({ default: mod.StickyHeaderAd })), { ssr: false });
const StickyAd = dynamic(() => import("./sticky-ad").then(mod => ({ default: mod.StickyAd })), { ssr: false });
const PopupAd = dynamic(() => import("./popup-ad").then(mod => ({ default: mod.PopupAd })), { ssr: false });

export function AdsWrapper() {
  return (
    <>
      <StickyHeaderAd />
      <StickyAd />
      <PopupAd />
    </>
  );
}

