import { useQuery } from "@tanstack/react-query";
import { auditLogsApi } from "@/lib/api/modules/audit-logs.api";
import { AuditLogFilters, AuditLogResponse } from "@/types/audit-log.types";

/**
 * Hook for fetching audit logs with filters and pagination
 */
export const useAuditLogs = (filters?: AuditLogFilters) => {
  return useQuery<AuditLogResponse>({
    queryKey: ["audit-logs", filters],
    queryFn: () => auditLogsApi.getAuditLogs(filters),
    staleTime: 1000 * 60, // 1 minute
    enabled: true,
  });
};

