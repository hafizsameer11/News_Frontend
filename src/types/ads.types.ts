// Ads Types
export interface Ad {
  id: string;
  title: string;
  name?: string; // Optional display name for easier identification (especially for ticker ads)
  type: "BANNER_TOP" | "BANNER_SIDE" | "INLINE" | "FOOTER" | "SLIDER" | "SLIDER_TOP" | "TICKER" | "POPUP" | "STICKY";
  imageUrl: string;
  targetLink: string;
  position?: string;
  startDate: string;
  endDate: string;
  advertiserId?: string;
  advertiser?: {
    id: string;
    name: string;
    email: string;
    companyName?: string;
  };
  status: "PENDING" | "ACTIVE" | "PAUSED" | "EXPIRED" | "REJECTED";
  price?: number | { s: number; e: number; d: number[] } | null; // Can be number or Prisma Decimal format
  isPaid: boolean;
  impressions: number;
  clicks: number;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdResponse {
  success: boolean;
  message: string;
  data: {
    ads: Ad[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface CreateAdInput {
  title: string;
  name?: string; // Optional display name for easier identification
  type: Ad["type"];
  imageUrl: string;
  targetLink?: string; // Optional now
  position?: string;
  startDate: string;
  endDate: string;
  price?: number; // Optional, can be calculated automatically
}

export interface UpdateAdInput {
  title?: string;
  name?: string; // Optional display name for easier identification
  type?: Ad["type"];
  imageUrl?: string;
  targetLink?: string;
  position?: string;
  startDate?: string;
  endDate?: string;
  status?: Ad["status"];
  price?: number; // Optional
}

export interface AdAnalytics {
  impressions: number;
  clicks: number;
  ctr: number;
  impressionsOverTime: { date: string; count: number }[];
  clicksOverTime: { date: string; count: number }[];
}

export interface AdvertiserAnalytics {
  totalImpressions: number;
  totalClicks: number;
  averageCTR: number;
  totalRevenue: number;
  ads: AdAnalytics[];
}

export interface AdAnalyticsResponse {
  success: boolean;
  message: string;
  data: AdAnalytics;
}

export interface AdvertiserAnalyticsResponse {
  success: boolean;
  message: string;
  data: AdvertiserAnalytics;
}

