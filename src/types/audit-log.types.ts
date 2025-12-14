// Audit Log Types

export interface AuditLog {
  id: string;
  action: string;
  details?: string;
  ipAddress?: string;
  method?: string;
  endpoint?: string;
  userAgent?: string;
  responseStatus?: number;
  userId?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  createdAt: string;
}

export interface AuditLogFilters {
  actionType?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AuditLogResponse {
  success: boolean;
  message: string;
  data: {
    logs: AuditLog[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

