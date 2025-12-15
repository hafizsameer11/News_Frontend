import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from "axios";
import { API_CONFIG } from "./apiConfig";
import { ApiResponse, ApiError } from "@/types/api.types";
import { normalizeImageUrl } from "@/lib/helpers/imageUrl";

// Create axios instance
// No CORS restrictions - allows requests from anywhere
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
  // Allow credentials (cookies) to be sent with requests
  withCredentials: true,
  // No origin restrictions - allow requests from any origin
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

// Response interceptor - Handle errors and normalize image URLs
axiosInstance.interceptors.response.use(
  (response) => {
    // Normalize image URLs in response data to prevent duplicates
    const normalizeResponseData = (data: any): any => {
      if (!data || typeof data !== "object") return data;
      
      if (Array.isArray(data)) {
        return data.map(normalizeResponseData);
      }
      
      const normalized: any = {};
      for (const [key, value] of Object.entries(data)) {
        if (key === "mainImage" || key === "url" || key === "thumbnailUrl" || key === "imageUrl") {
          // Normalize image URLs
          normalized[key] = typeof value === "string" ? normalizeImageUrl(value) : value;
        } else if (key === "data" && value && typeof value === "object") {
          // Recursively normalize nested data
          normalized[key] = normalizeResponseData(value);
        } else if (key === "news" && Array.isArray(value)) {
          // Normalize news array
          normalized[key] = value.map((item: any) => {
            if (item && typeof item === "object") {
              return {
                ...item,
                mainImage: item.mainImage ? normalizeImageUrl(item.mainImage) : item.mainImage,
              };
            }
            return item;
          });
        } else {
          normalized[key] = value;
        }
      }
      return normalized;
    };
    
    const normalizedData = normalizeResponseData(response.data);
    return normalizedData;
  },
  (error: AxiosError) => {
    // Handle connection errors
    if (error.code === "ECONNREFUSED" || error.message.includes("ERR_CONNECTION_REFUSED")) {
      return Promise.reject({
        message: "Unable to connect to the server. Please try again later.",
        status: 0,
        code: "CONNECTION_REFUSED",
        errors: null,
      });
    }

    // Handle network errors
    if (error.code === "ERR_NETWORK" || !error.response) {
      return Promise.reject({
        message: "Network error. Please check your connection and try again.",
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
    // Response interceptor already returns response.data, so response is already ApiResponse<T>
    return response as unknown as ApiResponse<T>;
  },

  post: async <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    const response = await axiosInstance.post<ApiResponse<T>>(url, data, config);
    // Response interceptor already returns response.data, so response is already ApiResponse<T>
    return response as unknown as ApiResponse<T>;
  },

  put: async <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    const response = await axiosInstance.put<ApiResponse<T>>(url, data, config);
    // Response interceptor already returns response.data, so response is already ApiResponse<T>
    return response as unknown as ApiResponse<T>;
  },

  patch: async <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    const response = await axiosInstance.patch<ApiResponse<T>>(url, data, config);
    // Response interceptor already returns response.data, so response is already ApiResponse<T>
    return response as unknown as ApiResponse<T>;
  },

  delete: async <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response = await axiosInstance.delete<ApiResponse<T>>(url, config);
    // Response interceptor already returns response.data, so response is already ApiResponse<T>
    return response as unknown as ApiResponse<T>;
  },
};

export default apiClient;

