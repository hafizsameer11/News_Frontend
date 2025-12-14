import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from "axios";
import { API_CONFIG } from "./apiConfig";
import { ApiResponse, ApiError } from "@/types/api.types";

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Inject token
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error: AxiosError) => {
    // Handle connection errors
    if (error.code === "ECONNREFUSED" || error.message.includes("ERR_CONNECTION_REFUSED")) {
      return Promise.reject({
        message: "Backend server is not running. Please start the backend server on port 3001.",
        status: 0,
        code: "CONNECTION_REFUSED",
        errors: null,
      });
    }

    // Handle network errors
    if (error.code === "ERR_NETWORK" || !error.response) {
      return Promise.reject({
        message: "Network error. Please check your connection and ensure the backend server is running.",
        status: 0,
        code: "NETWORK_ERROR",
        errors: null,
      });
    }

    // Handle 401 - Unauthorized
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        // Check if we're on a public route
        const publicRoutes = ['/login', '/register', '/', '/news', '/category', '/search', '/weather', '/horoscope', '/transport', '/tg', '/forgot-password', '/reset-password', '/verify-email'];
        const currentPath = window.location.pathname;
        const isPublicRoute = publicRoutes.some(route => currentPath.startsWith(route));
        
        // Only redirect if not on public route
        if (!isPublicRoute) {
          // Determine redirect based on route context
          if (currentPath.startsWith('/admin')) {
            window.location.href = "/admin-login";
          } else if (currentPath.startsWith('/advertiser')) {
            window.location.href = "/login";
          } else if (currentPath.startsWith('/editor')) {
            window.location.href = "/login";
          } else {
            window.location.href = "/login";
          }
        }
      }
    }

    // Return error response
    const errorData = error.response?.data as { message?: string; errors?: ApiError[] | Record<string, string> } | undefined;
    return Promise.reject({
      message: errorData?.message || error.message || "An error occurred",
      status: error.response?.status,
      errors: errorData?.errors || null,
    });
  }
);

// API Client
export const apiClient = {
  get: async <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    // Add cache-control headers to prevent browser caching
    const response = await axiosInstance.get<ApiResponse<T>>(url, {
      ...config,
      headers: {
        ...config?.headers,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
      },
    });
    return response as ApiResponse<T>;
  },

  post: async <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    const response = await axiosInstance.post<ApiResponse<T>>(url, data, config);
    return response as ApiResponse<T>;
  },

  put: async <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    const response = await axiosInstance.put<ApiResponse<T>>(url, data, config);
    return response as ApiResponse<T>;
  },

  patch: async <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    const response = await axiosInstance.patch<ApiResponse<T>>(url, data, config);
    return response as ApiResponse<T>;
  },

  delete: async <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response = await axiosInstance.delete<ApiResponse<T>>(url, config);
    return response as ApiResponse<T>;
  },
};

export default apiClient;

