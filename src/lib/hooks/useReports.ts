import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { reportsApi } from "@/lib/api/modules/reports.api";
import { CreateReportInput, ReportsListResponse } from "@/types/report.types";

// Submit a report mutation
export const useCreateReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateReportInput) => reportsApi.create(data),
    onSuccess: () => {
      // Invalidate reports list query to refresh admin view
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
};

// Get all reports (admin only)
export const useReports = (params?: {
  page?: number;
  limit?: number;
  status?: "pending" | "resolved" | "all";
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery<ReportsListResponse>({
    queryKey: ["reports", params],
    queryFn: () => reportsApi.getAll(params),
  });
};

// Resolve a report mutation (admin only)
export const useResolveReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reportsApi.resolve(id),
    onSuccess: () => {
      // Invalidate reports list query to refresh
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
};

