/**
 * Ad Rotation Utility
 * Handles weighted random selection of ads for rotation
 */

import { Ad } from "@/types/ads.types";

/**
 * Select a random ad from an array of ads
 * If ads have weights, use weighted random selection
 * Otherwise, use simple random selection
 * @param ads - Array of ads to select from
 * @returns Selected ad or null if no ads available
 */
export function selectAdForRotation(ads: Ad[]): Ad | null {
  if (ads.length === 0) {
    return null;
  }

  if (ads.length === 1) {
    return ads[0];
  }

  // Simple random selection for now
  // In the future, we could implement weighted selection based on ad performance
  const randomIndex = Math.floor(Math.random() * ads.length);
  return ads[randomIndex];
}

/**
 * Cache selected ad in session storage to avoid flickering
 * @param slot - Ad slot identifier
 * @param adId - Selected ad ID
 */
export function cacheSelectedAd(slot: string, adId: string): void {
  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem(`ad_${slot}`, adId);
    } catch (error) {
      // Session storage might not be available
      console.warn("Failed to cache ad selection:", error);
    }
  }
}

/**
 * Get cached ad ID for a slot
 * @param slot - Ad slot identifier
 * @returns Cached ad ID or null
 */
export function getCachedAd(slot: string): string | null {
  if (typeof window !== "undefined") {
    try {
      return sessionStorage.getItem(`ad_${slot}`);
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Clear cached ad for a slot
 * @param slot - Ad slot identifier
 */
export function clearCachedAd(slot: string): void {
  if (typeof window !== "undefined") {
    try {
      sessionStorage.removeItem(`ad_${slot}`);
    } catch {
      // Ignore errors
    }
  }
}

/**
 * Get slot dimensions based on slot type
 * @param slot - Ad slot type
 * @returns Object with width and height
 */
export function getSlotDimensions(slot: string): { width: number; height: number } {
  const dimensions: Record<string, { width: number; height: number }> = {
    HEADER: { width: 728, height: 90 },
    SIDEBAR: { width: 300, height: 250 },
    INLINE: { width: 728, height: 90 },
    FOOTER: { width: 728, height: 90 },
    MOBILE: { width: 300, height: 250 },
    TOP_BANNER: { width: 728, height: 90 },
    MID_PAGE: { width: 728, height: 90 },
    BETWEEN_SECTIONS: { width: 728, height: 90 },
  };

  return dimensions[slot] || { width: 300, height: 250 };
}

/**
 * Check if current device is mobile
 * @returns True if mobile device
 */
export function isMobileDevice(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return window.innerWidth < 768;
}

