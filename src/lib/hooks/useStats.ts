import { useQuery } from "@tanstack/react-query";
import { statsApi } from "@/lib/api/modules/stats.api";
import {
  TrendData,
  NewsPopularityItem,
  UserEngagement,
  CategoryPerformanceItem,
  ConversionMetrics,
  StatsResponse,
  DashboardResponse,
} from "@/types/stats.types";

// Get admin statistics
export const useAdminStats = () => {
  return useQuery<StatsResponse>({
    queryKey: ["admin-stats"],
    queryFn: () => statsApi.getAdminStats(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

// Get trends
export const useTrends = (period: "daily" | "weekly" | "monthly" = "daily") => {
  return useQuery<{ data: { period: string; data: TrendData[] } }>({
    queryKey: ["trends", period],
    queryFn: async () => {
      const response = await statsApi.getTrends(period);
      // Transform backend format to frontend format
      // Backend returns: { period, trends: { news: [...], users: [...], views: [...] } }
      // Frontend expects: { period, data: TrendData[] }
      interface BackendTrendItem {
        viewedAt?: string;
        createdAt: string;
        _count?: number;
        _sum?: { amount?: number | string };
      }
      
      interface BackendTrendsData {
        period?: string;
        trends?: {
          views?: BackendTrendItem[];
          news?: BackendTrendItem[];
          users?: BackendTrendItem[];
          revenue?: BackendTrendItem[];
        };
      }
      
      const backendData = response.data as BackendTrendsData | undefined;
      
      if (!backendData || !backendData.trends) {
        return { data: { period, data: [] } };
      }

      // Create a map to aggregate data by date
      const dateMap = new Map<string, { views: number; news: number; users: number; revenue?: number }>();

      // Process view trends
      if (backendData.trends.views && Array.isArray(backendData.trends.views)) {
        backendData.trends.views.forEach((item: BackendTrendItem) => {
          const date = new Date(item.viewedAt || item.createdAt).toISOString().split('T')[0];
          const existing = dateMap.get(date) || { views: 0, news: 0, users: 0 };
          dateMap.set(date, { ...existing, views: item._count || 0 });
        });
      }

      // Process news trends
      if (backendData.trends.news && Array.isArray(backendData.trends.news)) {
        backendData.trends.news.forEach((item: BackendTrendItem) => {
          const date = new Date(item.createdAt).toISOString().split('T')[0];
          const existing = dateMap.get(date) || { views: 0, news: 0, users: 0 };
          dateMap.set(date, { ...existing, news: item._count || 0 });
        });
      }

      // Process user trends
      if (backendData.trends.users && Array.isArray(backendData.trends.users)) {
        backendData.trends.users.forEach((item: BackendTrendItem) => {
          const date = new Date(item.createdAt).toISOString().split('T')[0];
          const existing = dateMap.get(date) || { views: 0, news: 0, users: 0, revenue: 0 };
          dateMap.set(date, { ...existing, users: item._count || 0 });
        });
      }

      // Process revenue trends
      if (backendData.trends.revenue && Array.isArray(backendData.trends.revenue)) {
        backendData.trends.revenue.forEach((item: BackendTrendItem) => {
          const date = new Date(item.createdAt).toISOString().split('T')[0];
          const existing = dateMap.get(date) || { views: 0, news: 0, users: 0, revenue: 0 };
          const amount = item._sum?.amount || 0;
          const revenueValue = typeof amount === 'number' ? amount : parseFloat(String(amount)) || 0;
          dateMap.set(date, { ...existing, revenue: revenueValue });
        });
      }

      // Convert map to array and sort by date
      const trendData: TrendData[] = Array.from(dateMap.entries())
        .map(([date, values]) => ({
          date,
          views: values.views,
          news: values.news,
          users: values.users,
          revenue: values.revenue || 0,
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return { data: { period: backendData.period || period, data: trendData } };
    },
    staleTime: 60000, // 1 minute
  });
};

// Get news popularity
export const useNewsPopularity = (limit: number = 10) => {
  return useQuery<{ data: NewsPopularityItem[] }>({
    queryKey: ["news-popularity", limit],
    queryFn: () => statsApi.getNewsPopularity(limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
};

// Get user engagement
export const useUserEngagement = () => {
  return useQuery<{ data: UserEngagement }>({
    queryKey: ["user-engagement"],
    queryFn: () => statsApi.getUserEngagement(),
    staleTime: 60000, // 1 minute
  });
};

// Get category performance
export const useCategoryPerformance = () => {
  return useQuery<{ data: CategoryPerformanceItem[] }>({
    queryKey: ["category-performance"],
    queryFn: () => statsApi.getCategoryPerformance(),
    staleTime: 60000, // 1 minute
  });
};

// Get conversion metrics
export const useConversionMetrics = () => {
  return useQuery<{ data: ConversionMetrics }>({
    queryKey: ["conversion-metrics"],
    queryFn: () => statsApi.getConversionMetrics(),
    staleTime: 60000, // 1 minute
  });
};

// Get comprehensive dashboard data
export const useDashboard = () => {
  return useQuery<DashboardResponse>({
    queryKey: ["dashboard"],
    queryFn: () => statsApi.getDashboard(),
    staleTime: 60000, // 1 minute
    refetchInterval: 300000, // Refetch every 5 minutes
  });
};

