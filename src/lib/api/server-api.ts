// Server-side API client (for SSR/SSG)
// Uses native fetch instead of axios to avoid client-side dependencies

import { API_CONFIG } from "./apiConfig";
import { NewsResponse } from "@/types/news.types";
import { CategoryResponse, Category } from "@/types/category.types";

export async function fetchNews(params?: {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
  status?: string;
}): Promise<NewsResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.categoryId) queryParams.append("categoryId", params.categoryId);
  if (params?.search) queryParams.append("search", params.search);
  if (params?.status) queryParams.append("status", params.status);

  const url = `${API_CONFIG.BASE_URL}/news${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
  
  const response = await fetch(url, {
    next: { revalidate: 60 }, // Revalidate every 60 seconds (ISR)
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch news: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchCategories(flat?: boolean): Promise<CategoryResponse> {
  const url = `${API_CONFIG.BASE_URL}/categories${flat ? "?flat=true" : ""}`;
  
  const response = await fetch(url, {
    next: { revalidate: 3600 }, // Revalidate every hour (categories don't change often)
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchCategoryBySlug(slug: string): Promise<{ data: Category } | null> {
  try {
    // Try direct API endpoint first (more efficient)
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/categories/slug/${slug}`, {
        next: { revalidate: 3600 }, // Revalidate every hour
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          return { data: result.data };
        }
      }
    } catch (directError) {
      // Fall back to fetching all categories if direct endpoint fails
      console.warn("Direct category by slug endpoint failed, falling back to fetching all categories:", directError);
    }
    
    // Fallback: Fetch all categories and search
    const categories = await fetchCategories(true);
    const allCategories = categories.data || [];
    
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
  } catch (error) {
    console.error("Failed to fetch category by slug:", error);
    return null;
  }
}

export async function fetchHomepageLayout(): Promise<{ success: boolean; data: Array<Record<string, unknown>>; message: string } | null> {
  try {
    const url = `${API_CONFIG.BASE_URL}/homepage/layout`;
    
    const response = await fetch(url, {
      next: { revalidate: 60 }, // Revalidate every 60 seconds
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

