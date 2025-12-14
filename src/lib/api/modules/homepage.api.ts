import { apiClient } from "../apiClient";

export interface HomepageSection {
  id: string;
  type: "HERO_SLIDER" | "BREAKING_TICKER" | "FEATURED_SECTION" | "CATEGORY_BLOCK" | "MANUAL_LIST";
  order: number;
  isActive: boolean;
  title?: string | null;
  dataSource?: string | null;
  config?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  data?: Array<Record<string, unknown>>; // News data for active layout
}

export interface HomepageSectionsResponse {
  data: HomepageSection[];
  message: string;
}

export interface HomepageLayoutResponse {
  data: HomepageSection[];
  message: string;
}

export interface CreateHomepageSectionInput {
  type: HomepageSection["type"];
  title?: string;
  dataSource?: string;
  config?: Record<string, unknown>;
  order?: number;
  isActive?: boolean;
}

export interface UpdateHomepageSectionInput {
  title?: string;
  dataSource?: string;
  config?: Record<string, unknown>;
  order?: number;
  isActive?: boolean;
}

export const homepageApi = {
  // Get all sections (admin)
  getAll: () => {
    return apiClient.get<HomepageSectionsResponse>("/homepage/sections");
  },

  // Get active layout (public)
  getActiveLayout: () => {
    return apiClient.get<HomepageLayoutResponse>("/homepage/layout");
  },

  // Get section by ID
  getById: (id: string) => {
    return apiClient.get<{ data: HomepageSection; message: string }>(`/homepage/sections/${id}`);
  },

  // Create section
  create: (data: CreateHomepageSectionInput) => {
    return apiClient.post<{ data: HomepageSection; message: string }>("/homepage/sections", data);
  },

  // Update section
  update: (id: string, data: UpdateHomepageSectionInput) => {
    return apiClient.patch<{ data: HomepageSection; message: string }>(`/homepage/sections/${id}`, data);
  },

  // Delete section
  delete: (id: string) => {
    return apiClient.delete<{ message: string }>(`/homepage/sections/${id}`);
  },

  // Reorder sections
  reorder: (sectionIds: string[]) => {
    return apiClient.patch<{ message: string }>("/homepage/sections/reorder", { sectionIds });
  },
};

