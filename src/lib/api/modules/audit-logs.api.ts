import { apiClient } from "../apiClient";
import { AuditLogResponse, AuditLogFilters } from "@/types/audit-log.types";

export const auditLogsApi = {
  // Get audit logs with filters and pagination
  getAuditLogs: (filters?: AuditLogFilters) => {
    const params = new URLSearchParams();
    
    if (filters?.actionType) {
      params.append("actionType", filters.actionType);
    }
    if (filters?.userId) {
      params.append("userId", filters.userId);
    }
    if (filters?.startDate) {
      params.append("startDate", filters.startDate);
    }
    if (filters?.endDate) {
      params.append("endDate", filters.endDate);
    }
    if (filters?.search) {
      params.append("search", filters.search);
    }
    if (filters?.page) {
      params.append("page", filters.page.toString());
    }
    if (filters?.limit) {
      params.append("limit", filters.limit.toString());
    }

    const queryString = params.toString();
    const url = `/audit-logs${queryString ? `?${queryString}` : ""}`;

    return apiClient.get<AuditLogResponse>(url);
  },
};

