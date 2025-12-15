import { apiClient } from "../apiClient";
import { NewsResponse, NewsDetail, CreateNewsInput, UpdateNewsInput } from "@/types/news.types";
import { normalizeImageUrl } from "@/lib/helpers/imageUrl";

export const newsApi = {
  // Get all news
  getAll: (params?: {
    page?: number;
    limit?: number;
    categoryId?: string;
    search?: string;
    status?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.categoryId) queryParams.append("categoryId", params.categoryId);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.status) queryParams.append("status", params.status);

    const url = `/news${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    return apiClient.get<NewsResponse>(url);
  },

  // Get news by ID or slug
  getByIdOrSlug: (idOrSlug: string) => {
    return apiClient.get<{ data: NewsDetail }>(`/news/${idOrSlug}`);
  },

  // Create news
  create: (data: CreateNewsInput) => {
    // Normalize mainImage URL before sending to prevent duplicates
    const normalizedData = {
      ...data,
      mainImage: data.mainImage ? normalizeImageUrl(data.mainImage) : data.mainImage,
    };
    return apiClient.post<{ data: NewsDetail }>("/news", normalizedData);
  },

  // Update news
  update: (id: string, data: UpdateNewsInput) => {
    // Normalize mainImage URL before sending to prevent duplicates
    const normalizedData = {
      ...data,
      mainImage: data.mainImage ? normalizeImageUrl(data.mainImage) : data.mainImage,
    };
    return apiClient.patch<{ data: NewsDetail }>(`/news/${id}`, normalizedData);
  },

  // Delete news
  delete: (id: string) => {
    return apiClient.delete<{ message: string }>(`/news/${id}`);
  },
};

