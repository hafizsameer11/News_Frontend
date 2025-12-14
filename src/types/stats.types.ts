// Stats Types

export interface AdminStats {
  counts: {
    users: number;
    news: {
      total: number;
      pending: number;
    };
    ads: {
      total: number;
      active: number;
    };
    reports: {
      total: number;
      pending: number;
    };
  };
  recentNews: Array<{
    id: string;
    title: string;
    slug: string;
    summary: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    author: {
      name: string;
    };
  }>;
}

export interface StatsResponse {
  success: boolean;
  message: string;
  data: AdminStats;
}

export interface TrendData {
  date: string;
  views: number;
  news: number;
  users: number;
  revenue?: number;
}

export interface TrendsResponse {
  success: boolean;
  message: string;
  data: {
    period: "daily" | "weekly" | "monthly";
    data: TrendData[];
  };
}

export interface NewsPopularityItem {
  id: string;
  title: string;
  views: number;
  slug: string;
}

export interface NewsPopularityResponse {
  success: boolean;
  message: string;
  data: NewsPopularityItem[];
}

export interface UserEngagement {
  totalUsers: number;
  activeUsers: number;
  newRegistrations: number;
  activeUsersPercentage: number;
}

export interface UserEngagementResponse {
  success: boolean;
  message: string;
  data: UserEngagement;
}

export interface CategoryPerformanceItem {
  id: string;
  name?: string;
  nameEn?: string;
  nameIt?: string;
  slug?: string;
  newsCount: number;
  totalViews?: number;
  avgViews?: number;
  views?: number;
}

export interface CategoryPerformanceResponse {
  success: boolean;
  message: string;
  data: CategoryPerformanceItem[];
}

export interface ConversionMetrics {
  newsletterSubscriptions: number;
  adClicks: number;
  adImpressions: number;
  clickThroughRate: number;
}

export interface ConversionMetricsResponse {
  success: boolean;
  message: string;
  data: ConversionMetrics;
}

export interface DashboardData {
  overview: AdminStats;
  trends: {
    period: "daily" | "weekly" | "monthly";
    data: TrendData[];
  };
  newsPopularity: NewsPopularityItem[];
  userEngagement: UserEngagement;
  categoryPerformance: CategoryPerformanceItem[];
  conversionMetrics: ConversionMetrics;
  topPerformers: {
    news: NewsPopularityItem[];
    categories: CategoryPerformanceItem[];
  };
  activity: {
    recent: Array<Record<string, unknown>>;
    hourly: Array<{ hour: number; count: number }>;
  };
  timestamp: string;
}

export interface DashboardResponse {
  success: boolean;
  message: string;
  data: DashboardData;
}

