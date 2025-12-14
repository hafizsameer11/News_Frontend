export interface Report {
  id: string;
  content: string;
  mediaUrl?: string | null;
  contactInfo?: string | null;
  userId?: string | null;
  isResolved: boolean;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface CreateReportInput {
  content: string;
  mediaUrl?: string;
  contactInfo?: string;
}

export interface ReportResponse {
  data: Report;
  message: string;
}

export interface ReportsListResponse {
  data: {
    reports: Report[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message: string;
}

export interface ResolveReportResponse {
  data: Report;
  message: string;
}

