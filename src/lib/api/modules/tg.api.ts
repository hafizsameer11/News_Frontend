import { apiClient } from "../apiClient";

export interface TGVideo {
  id: string;
  url: string;
  type: "VIDEO";
  thumbnailUrl?: string;
  duration?: number;
  width?: number;
  height?: number;
  fileSize?: number;
  news: {
    id: string;
    title: string;
    slug: string;
    summary: string;
    category: {
      id: string;
      nameEn: string;
      nameIt: string;
      slug: string;
    };
    author: {
      id: string;
      name: string;
    };
    createdAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TGVideosResponse {
  success: boolean;
  message: string;
  data: {
    videos: TGVideo[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface TGVideoDetailResponse {
  success: boolean;
  message: string;
  data: TGVideo;
}

export const tgApi = {
  // Get all TG videos
  getVideos: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    sortBy?: "createdAt" | "duration";
    sortOrder?: "asc" | "desc";
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.category) queryParams.append("category", params.category);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const url = `/tg/videos${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    return apiClient.get<TGVideosResponse>(url);
  },

  // Get single TG video
  getVideoById: (id: string) => {
    return apiClient.get<TGVideoDetailResponse>(`/tg/videos/${id}`);
  },

  // Get related videos
  getRelatedVideos: (id: string, limit: number = 6) => {
    return apiClient.get<TGVideosResponse>(`/tg/videos/related/${id}?limit=${limit}`);
  },

  // Get popular videos
  getPopularVideos: (limit: number = 10) => {
    return apiClient.get<TGVideosResponse>(`/tg/videos/popular?limit=${limit}`);
  },
};

