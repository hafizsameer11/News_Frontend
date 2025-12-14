import { apiClient } from "../apiClient";
import {
  StatsResponse,
  TrendsResponse,
  NewsPopularityResponse,
  UserEngagementResponse,
  CategoryPerformanceResponse,
  ConversionMetricsResponse,
  DashboardResponse,
} from "@/types/stats.types";

export const statsApi = {
  // Get admin statistics
  getAdminStats: () => {
    return apiClient.get<StatsResponse>("/stats");
  },

  // Get trends
  getTrends: (period: "daily" | "weekly" | "monthly" = "daily") => {
    return apiClient.get<TrendsResponse>(`/stats/trends?period=${period}`);
  },

  // Get news popularity
  getNewsPopularity: (limit: number = 10) => {
    return apiClient.get<NewsPopularityResponse>(`/stats/news-popularity?limit=${limit}`);
  },

  // Get user engagement
  getUserEngagement: () => {
    return apiClient.get<UserEngagementResponse>("/stats/user-engagement");
  },

  // Get category performance
  getCategoryPerformance: () => {
    return apiClient.get<CategoryPerformanceResponse>("/stats/category-performance");
  },

  // Get conversion metrics
  getConversionMetrics: () => {
    return apiClient.get<ConversionMetricsResponse>("/stats/conversion-metrics");
  },

  // Get comprehensive dashboard data
  getDashboard: () => {
    return apiClient.get<DashboardResponse>("/stats/dashboard");
  },
};

