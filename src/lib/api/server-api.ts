// Server-side API client (for SSR/SSG)
// Uses native fetch instead of axios to avoid client-side dependencies

import { API_CONFIG } from "./apiConfig";
import { NewsResponse } from "@/types/news.types";
import { CategoryResponse, Category } from "@/types/category.types";
import { normalizeImageUrl } from "@/lib/helpers/imageUrl";

export async function fetchNews(params?: {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
  status?: string;
}): Promise<NewsResponse> {
  try {
    if (!API_CONFIG?.BASE_URL) {
      throw new Error("API base URL is not configured");
    }

    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.categoryId) queryParams.append("categoryId", params.categoryId);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.status) queryParams.append("status", params.status);

    const url = `${API_CONFIG.BASE_URL}/news${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    
    const isDev = process.env.NODE_ENV === "development";
    const response = await fetch(url, {
      next: { revalidate: isDev ? 0 : 60 }, // No cache in dev, 60s in production (ISR)
      // No CORS restrictions - allow requests from anywhere
      mode: "cors",
      credentials: "include", // Include credentials (cookies) if needed
      // Add cache control for development
      ...(isDev && { cache: "no-store" }),
    });

    if (!response.ok) {
      // Don't throw for 404 or other client errors - return empty result
      if (response.status === 404) {
        return { success: true, data: { news: [], meta: { total: 0, page: 1, limit: 12, totalPages: 0 } }, message: "No news found" };
      }
      throw new Error(`Failed to fetch news: ${response.status} ${response.statusText}`);
    }

    const data: NewsResponse = await response.json();
    
    // Normalize image URLs in the response to prevent duplicates
    if (data?.data?.news && Array.isArray(data.data.news)) {
      data.data.news = data.data.news.map((news) => ({
        ...news,
        mainImage: news.mainImage ? normalizeImageUrl(news.mainImage) : news.mainImage,
      }));
    }
    
    return data;
  } catch (error) {
    console.error("Error in fetchNews:", error);
    // Return empty result instead of throwing
    return { 
      success: false, 
      data: { news: [], meta: { total: 0, page: params?.page || 1, limit: params?.limit || 12, totalPages: 0 } }, 
      message: error instanceof Error ? error.message : "Failed to fetch news" 
    };
  }
}

export async function fetchCategories(flat?: boolean): Promise<CategoryResponse> {
  try {
    if (!API_CONFIG?.BASE_URL) {
      throw new Error("API base URL is not configured");
    }

    const url = `${API_CONFIG.BASE_URL}/categories${flat ? "?flat=true" : ""}`;
    
    const isDev = process.env.NODE_ENV === "development";
    const response = await fetch(url, {
      next: { revalidate: isDev ? 0 : 3600 }, // No cache in dev, 1h in production
      // No CORS restrictions - allow requests from anywhere
      mode: "cors",
      credentials: "include", // Include credentials (cookies) if needed
      ...(isDev && { cache: "no-store" }),
    });

    if (!response.ok) {
      // Don't throw for client errors - return empty result
      if (response.status === 404) {
        return { success: true, data: [], message: "No categories found" };
      }
      throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error in fetchCategories:", error);
    // Return empty result instead of throwing
    return { 
      success: false, 
      data: [], 
      message: error instanceof Error ? error.message : "Failed to fetch categories" 
    };
  }
}

export async function fetchCategoryBySlug(slug: string): Promise<{ data: Category } | null> {
  try {
    if (!API_CONFIG?.BASE_URL) {
      console.warn("API base URL is not configured");
      return null;
    }

    if (!slug || typeof slug !== "string" || slug.trim() === "") {
      console.warn("Invalid slug provided to fetchCategoryBySlug");
      return null;
    }

    // Try direct API endpoint first (more efficient)
    try {
      const isDev = process.env.NODE_ENV === "development";
      const response = await fetch(`${API_CONFIG.BASE_URL}/categories/slug/${slug}`, {
        next: { revalidate: isDev ? 0 : 3600 }, // No cache in dev, 1h in production
        // No CORS restrictions - allow requests from anywhere
        mode: "cors",
        credentials: "include", // Include credentials (cookies) if needed
        ...(isDev && { cache: "no-store" }),
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result?.success && result?.data) {
          return { data: result.data };
        }
      } else if (response.status === 404) {
        // Category not found - return null instead of throwing
        return null;
      }
    } catch (directError) {
      // Fall back to fetching all categories if direct endpoint fails
      console.warn("Direct category by slug endpoint failed, falling back to fetching all categories:", directError);
    }
    
    // Fallback: Fetch all categories and search
    try {
      const categories = await fetchCategories(true);
      const allCategories = categories?.data || [];
      
      if (!Array.isArray(allCategories) || allCategories.length === 0) {
        console.warn(`No categories found in API response`);
        return null;
      }
      
      // When flat=true, Prisma returns a flat array without children property
      // However, some API responses might include children: [] even when flat
      // So we handle both cases
      
      // First, try direct search (for truly flat responses)
      let category = allCategories.find((c: Category) => c.slug?.toLowerCase() === slug.toLowerCase());
      
      // If not found and categories have children property, flatten recursively
      if (!category) {
        const flattenCategories = (cats: Category[]): Category[] => {
          const result: Category[] = [];
          for (const cat of cats) {
            // Add the category itself (without children for the result)
            const { children, ...categoryWithoutChildren } = cat;
            result.push(categoryWithoutChildren as Category);
            
            // If it has children, recursively flatten them
            if (children && Array.isArray(children) && children.length > 0) {
              result.push(...flattenCategories(children));
            }
          }
          return result;
        };
        
        const flatCategories = flattenCategories(allCategories);
        category = flatCategories.find((c: Category) => c.slug?.toLowerCase() === slug.toLowerCase());
      }
      
      if (!category) {
        console.warn(`Category with slug "${slug}" not found. Available slugs:`, allCategories.map((c: Category) => c.slug).filter(Boolean));
        return null;
      }
      
      return { data: category };
    } catch (fallbackError) {
      console.error("Failed to fetch categories in fallback:", fallbackError);
      return null;
    }
  } catch (error) {
    console.error("Failed to fetch category by slug:", error);
    return null;
  }
}

export async function fetchHomepageLayout(): Promise<{ success: boolean; data: Array<Record<string, unknown>>; message: string } | null> {
  try {
    const url = `${API_CONFIG.BASE_URL}/homepage/layout`;
    
    const isDev = process.env.NODE_ENV === "development";
    const response = await fetch(url, {
      next: { revalidate: isDev ? 0 : 60 }, // No cache in dev, 60s in production
      // No CORS restrictions - allow requests from anywhere
      mode: "cors",
      credentials: "include", // Include credentials (cookies) if needed
      ...(isDev && { cache: "no-store" }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch homepage layout: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error("Failed to fetch homepage layout:", error);
    return null;
  }
}

