import axios from "axios";
import { API_CONFIG } from "../apiConfig";

export type ExportType = "audit-logs" | "user-behavior" | "news-views" | "ad-analytics";
export type ExportFormat = "csv" | "json";

export interface ExportOptions {
  format?: ExportFormat;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export const exportApi = {
  // Export analytics data
  exportData: async (
    type: ExportType,
    options?: ExportOptions
  ): Promise<Blob> => {
    const params = new URLSearchParams();
    
    if (options?.format) {
      params.append("format", options.format);
    }
    if (options?.startDate) {
      params.append("startDate", options.startDate);
    }
    if (options?.endDate) {
      params.append("endDate", options.endDate);
    }
    if (options?.limit) {
      params.append("limit", options.limit.toString());
    }

    const queryString = params.toString();
    const url = `${API_CONFIG.BASE_URL}/stats/export/${type}${queryString ? `?${queryString}` : ""}`;

    // Get token for authentication
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    // Use axios directly for blob response
    const response = await axios.get(url, {
      responseType: "blob",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    return response.data;
  },
};

