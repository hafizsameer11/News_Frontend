import { apiClient } from "../apiClient";

export interface SearchResult {
  news: Array<{
    id: string;
    title: string;
    slug: string;
    summary: string;
    mainImage: string | null;
    publishedAt: string | null;
    category: {
      nameEn: string;
      nameIt: string;
    };
  }>;
  categories: Array<{
    id: string;
    nameEn: string;
    nameIt: string;
    slug: string;
  }>;
  transports: Array<{
    id: string;
    type: string;
    name: string;
    description: string | null;
    contactInfo: string | null;
    city: string | null;
  }>;
}

export interface SearchFilters {
  categoryIds?: string[];
  startDate?: string;
  endDate?: string;
  sortBy?: "relevance" | "date" | "views";
  page?: number;
  limit?: number;
}

export const searchApi = {
  search: async (query: string, filters?: SearchFilters) => {
    const params = new URLSearchParams();
    params.append("q", query);
    
    if (filters?.categoryIds && filters.categoryIds.length > 0) {
      filters.categoryIds.forEach((id) => params.append("categoryId", id));
    }
    if (filters?.startDate) {
      // Convert YYYY-MM-DD to ISO datetime (start of day)
      const dateFrom = new Date(filters.startDate + "T00:00:00.000Z").toISOString();
      params.append("dateFrom", dateFrom);
    }
    if (filters?.endDate) {
      // Convert YYYY-MM-DD to ISO datetime (end of day)
      const dateTo = new Date(filters.endDate + "T23:59:59.999Z").toISOString();
      params.append("dateTo", dateTo);
    }
    if (filters?.sortBy) {
      params.append("sort", filters.sortBy);
    }
    if (filters?.page) {
      params.append("page", filters.page.toString());
    }
    if (filters?.limit) {
      params.append("limit", filters.limit.toString());
    }
    
    return apiClient.get<{ data: SearchResult }>(`/search?${params.toString()}`);
  },
};

