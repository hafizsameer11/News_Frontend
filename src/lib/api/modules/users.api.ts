import { apiClient } from "../apiClient";
import { User, UserResponse, CreateUserInput, UpdateUserInput } from "@/types/user.types";

export const usersApi = {
  // Get all users
  getAll: (params?: { page?: number; limit?: number; role?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.role) queryParams.append("role", params.role);

    const url = `/users${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    return apiClient.get<UserResponse>(url);
  },

  // Get user by ID
  getById: (id: string) => {
    return apiClient.get<{ data: User }>(`/users/${id}`);
  },

  // Create user
  create: (data: CreateUserInput) => {
    return apiClient.post<{ data: User }>("/users", data);
  },

  // Update user
  update: (id: string, data: UpdateUserInput) => {
    return apiClient.patch<{ data: User }>(`/users/${id}`, data);
  },

  // Delete user
  delete: (id: string) => {
    return apiClient.delete<{ message: string }>(`/users/${id}`);
  },

  // Assign categories to editor
  assignCategories: (id: string, categoryIds: string[]) => {
    return apiClient.post<{ data: User }>(`/users/${id}/categories`, { categoryIds });
  },
};

