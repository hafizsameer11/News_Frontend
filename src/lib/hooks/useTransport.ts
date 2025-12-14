import { useQuery } from "@tanstack/react-query";
import { transportApi } from "@/lib/api/modules/transport.api";
import { TransportType } from "@/types/transport.types";

export const useTransport = (params?: {
  page?: number;
  limit?: number;
  type?: TransportType;
  city?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: ["transport", params],
    queryFn: () => transportApi.getAll(params),
    staleTime: 1000 * 60 * 60, // 1 hour - transport info doesn't change frequently
  });
};

