import { apiClient } from "../apiClient";
import { MediaResponse, MediaListResponse, UploadMediaInput } from "@/types/media.types";
import { API_CONFIG } from "../apiConfig";
import { getImageUrl } from "@/lib/helpers/imageUrl";

export const mediaApi = {
  // Upload media
  upload: async (input: UploadMediaInput) => {
    const formData = new FormData();
    formData.append("file", input.file);
    if (input.caption) {
      formData.append("caption", input.caption);
    }
    if (input.newsId) {
      formData.append("newsId", input.newsId);
    }

    // Use axios directly for multipart/form-data
    const axios = (await import("axios")).default;
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const response = await axios.post<MediaResponse>(
      `${API_CONFIG.BASE_URL}/media/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );

    // Normalize URLs in the response to use production backend domain
    const data = response.data;
    if (data?.data) {
      // Convert localhost URLs to production backend URLs
      if (data.data.url) {
        data.data.url = getImageUrl(data.data.url);
      }
      if (data.data.thumbnailUrl) {
        data.data.thumbnailUrl = getImageUrl(data.data.thumbnailUrl);
      }
    }

    return data;
  },

  // Get all media
  getAll: (params?: { page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const url = `/media${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    return apiClient.get<MediaListResponse>(url);
  },

  // Update processing status
  updateStatus: (id: string, status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED") => {
    return apiClient.patch<MediaResponse>(`/media/${id}/status`, { status });
  },

  // Delete media
  delete: (id: string) => {
    return apiClient.delete<{ success: boolean; message: string }>(`/media/${id}`);
  },

  // Check media status by URL
  checkStatus: (url: string) => {
    return apiClient.get<{ 
      success: boolean; 
      message: string; 
      data: { 
        url: string; 
        status: string | null; 
        exists: boolean;
        type?: string;
      } 
    }>(`/media/check-status?url=${encodeURIComponent(url)}`);
  },
};

