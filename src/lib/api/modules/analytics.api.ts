import { apiClient } from "../apiClient";
import { AdAnalyticsResponse, AdvertiserAnalyticsResponse } from "@/types/ads.types";
import { TrackBehaviorRequest, TrackBehaviorResponse } from "@/types/analytics.types";

export const analyticsApi = {
  // Get ad analytics
  getAdAnalytics: (id: string) => {
    return apiClient.get<AdAnalyticsResponse>(`/ads/${id}/analytics`);
  },

  // Get advertiser analytics
  getAdvertiserAnalytics: () => {
    return apiClient.get<AdvertiserAnalyticsResponse>("/ads/analytics/me");
  },

  // Track user behavior event
  trackEvent: (data: TrackBehaviorRequest) => {
    // Final validation before sending
    if (!data || !data.eventType || typeof data.eventType !== "string" || data.eventType.trim().length === 0) {
      return Promise.reject(new Error("Invalid tracking data: eventType is required"));
    }

    // Ensure eventData is an object
    const payload: TrackBehaviorRequest = {
      eventType: data.eventType.trim(),
      eventData: data.eventData && typeof data.eventData === "object" ? data.eventData : {},
    };

    return apiClient.post<TrackBehaviorResponse>("/analytics/track", payload);
  },
};

