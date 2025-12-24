import { apiClient } from "../apiClient";
import {
  StatsResponse,
  NewsPopularityResponse,
  UserEngagementResponse,
  CategoryPerformanceResponse,
  ConversionMetricsResponse,
  DashboardResponse,
} from "@/types/stats.types";

interface TrendsApiResponse {
  data?: {
    period?: string;
    trends?: {
      views?: unknown[];
      news?: unknown[];
      users?: unknown[];
      revenue?: unknown[];
    };
  };
}

export const statsApi = {
  // Get admin statistics
  getAdminStats: () => {
    return apiClient.get<StatsResponse["data"]>("/stats");
  },

  // Get trends
  getTrends: (period: "daily" | "weekly" | "monthly" = "daily") => {
    return apiClient.get<TrendsApiResponse>(`/stats/trends?period=${period}`);
  },

  // Get news popularity
  getNewsPopularity: (limit: number = 10) => {
    return apiClient.get<NewsPopularityResponse["data"]>(`/stats/news-popularity?limit=${limit}`);
  },

  // Get user engagement
  getUserEngagement: () => {
    return apiClient.get<UserEngagementResponse["data"]>("/stats/user-engagement");
  },

  // Get category performance
  getCategoryPerformance: () => {
    return apiClient.get<CategoryPerformanceResponse["data"]>("/stats/category-performance");
  },

  // Get conversion metrics
  getConversionMetrics: () => {
    return apiClient.get<ConversionMetricsResponse["data"]>("/stats/conversion-metrics");
  },

  // Get comprehensive dashboard data
  getDashboard: () => {
    return apiClient.get<DashboardResponse["data"]>("/stats/dashboard");
  },
};

