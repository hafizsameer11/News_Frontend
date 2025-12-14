import { apiClient } from "../apiClient";
import {
  CreateReportInput,
  ReportResponse,
  ReportsListResponse,
  ResolveReportResponse,
} from "@/types/report.types";

export const reportsApi = {
  // Submit a report (public endpoint)
  create: (data: CreateReportInput) => {
    return apiClient.post<ReportResponse>("/reports", data);
  },

  // Get all reports (admin only)
  getAll: (params?: {
    page?: number;
    limit?: number;
    status?: "pending" | "resolved" | "all";
    startDate?: string;
    endDate?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.status) queryParams.append("status", params.status);
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);

    const url = `/reports${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    return apiClient.get<ReportsListResponse>(url);
  },

  // Resolve a report (admin only)
  resolve: (id: string) => {
    return apiClient.patch<ResolveReportResponse>(`/reports/${id}/resolve`, {});
  },
};
