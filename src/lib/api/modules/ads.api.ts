import { apiClient } from "../apiClient";
import { Ad, AdResponse, CreateAdInput, UpdateAdInput } from "@/types/ads.types";

export const adsApi = {
  // Get all ads
  getAll: (params?: { page?: number; limit?: number; status?: string; type?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.status) queryParams.append("status", params.status);
    if (params?.type) queryParams.append("type", params.type);
    // Add timestamp to prevent caching
    queryParams.append("_t", Date.now().toString());

    const url = `/ads${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    return apiClient.get<AdResponse>(url);
  },

  // Create ad
  create: (data: CreateAdInput) => {
    return apiClient.post<{ data: Ad }>("/ads", data);
  },

  // Update ad
  update: (id: string, data: UpdateAdInput) => {
    return apiClient.patch<{ data: Ad }>(`/ads/${id}`, data);
  },

  // Delete ad
  delete: (id: string) => {
    return apiClient.delete<{ message: string }>(`/ads/${id}`);
  },

  // Create payment intent
  createPayment: (id: string) => {
    return apiClient.post<{ data: { clientSecret: string; amount: number } }>(
      `/ads/${id}/pay`
    );
  },

  // Track impression
  trackImpression: (id: string) => {
    return apiClient.post(`/ads/${id}/impression`);
  },

  // Track click
  trackClick: (id: string) => {
    return apiClient.post(`/ads/${id}/click`);
  },

  // Get ad by slot (supports multiple ads for inline display)
  getBySlot: (slot: string, limit: number = 2) => {
    return apiClient.get<AdResponse>(`/ads?slot=${slot}&status=ACTIVE&limit=${limit}`);
  },

  // Get ad by type (for TICKER, SLIDER, POPUP, STICKY ad types)
  getByType: (type: string, limit: number = 2) => {
    return apiClient.get<AdResponse>(`/ads?type=${type}&status=ACTIVE&limit=${limit}`);
  },

  // Get ad analytics
  getAnalytics: (id: string) => {
    return apiClient.get<import("@/types/ads.types").AdAnalyticsResponse>(`/ads/${id}/analytics`);
  },

  // Get advertiser analytics
  getAdvertiserAnalytics: () => {
    return apiClient.get<import("@/types/ads.types").AdvertiserAnalyticsResponse>("/ads/analytics/me");
  },
};

