import { apiClient } from "../apiClient";

export interface Bookmark {
  id: string;
  newsId: string;
  userId: string;
  createdAt: string;
  news: {
    id: string;
    title: string;
    slug: string;
    mainImage?: string;
    summary?: string;
    createdAt: string;
    category: {
      id: string;
      nameEn: string;
      nameIt: string;
      slug: string;
    };
  };
}

export interface BookmarksResponse {
  data: {
    bookmarks: Bookmark[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message: string;
}

export interface BookmarkCheckResponse {
  data: {
    isBookmarked: boolean;
  };
  message: string;
}

export const bookmarksApi = {
  // Save a bookmark
  create: (newsId: string) => {
    return apiClient.post<{ data: Bookmark; message: string }>("/bookmarks", { newsId });
  },

  // Get user's bookmarks
  getAll: (params?: { page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const url = `/bookmarks${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    return apiClient.get<BookmarksResponse>(url);
  },

  // Remove a bookmark
  delete: (bookmarkId: string) => {
    return apiClient.delete<{ message: string }>(`/bookmarks/${bookmarkId}`);
  },

  // Check if news is bookmarked
  check: (newsId: string) => {
    return apiClient.get<BookmarkCheckResponse>(`/bookmarks/check/${newsId}`);
  },
};

