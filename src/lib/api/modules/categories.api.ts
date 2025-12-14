import { apiClient } from "../apiClient";
import { Category, CategoryResponse, CreateCategoryInput, UpdateCategoryInput } from "@/types/category.types";

export const categoriesApi = {
  // Get all categories
  getAll: (flat?: boolean) => {
    const url = flat ? `/categories?flat=true` : "/categories";
    return apiClient.get<CategoryResponse>(url);
  },

  // Get category by ID
  getById: (id: string) => {
    return apiClient.get<{ data: Category }>(`/categories/${id}`);
  },

  // Create category
  create: (data: CreateCategoryInput) => {
    return apiClient.post<{ data: Category }>("/categories", data);
  },

  // Update category
  update: (id: string, data: UpdateCategoryInput) => {
    return apiClient.patch<{ data: Category }>(`/categories/${id}`, data);
  },

  // Delete category
  delete: (id: string) => {
    return apiClient.delete<{ message: string }>(`/categories/${id}`);
  },

  // Update category order (bulk)
  updateOrder: (updates: Array<{ id: string; order: number }>) => {
    return apiClient.patch<{ data: Category[] }>("/categories/order", { updates });
  },
};

