import { apiClient } from "../apiClient";
import { TransportResponse, TransportType } from "@/types/transport.types";

export const transportApi = {
  // Get all transport options
  getAll: (params?: {
    page?: number;
    limit?: number;
    type?: TransportType;
    city?: string;
    search?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.type) queryParams.append("type", params.type);
    if (params?.city) queryParams.append("city", params.city);
    if (params?.search) queryParams.append("search", params.search);

    const url = `/transport${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    return apiClient.get<TransportResponse["data"]>(url);
  },
};

