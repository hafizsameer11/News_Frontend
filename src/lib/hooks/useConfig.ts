import { useQuery } from "@tanstack/react-query";
import { configApi } from "@/lib/api/modules/config.api";

export const usePublicConfig = () => {
  return useQuery({
    queryKey: ["publicConfig"],
    queryFn: () => configApi.getPublicConfig(),
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    refetchOnWindowFocus: false,
  });
};

