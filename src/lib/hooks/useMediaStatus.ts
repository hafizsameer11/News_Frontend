import { useQuery } from "@tanstack/react-query";
import { mediaApi } from "@/lib/api/modules/media.api";

/**
 * Hook to check media status by URL
 */
export const useMediaStatus = (url: string | null | undefined) => {
  return useQuery({
    queryKey: ["media-status", url],
    queryFn: () => {
      if (!url) return null;
      return mediaApi.checkStatus(url);
    },
    enabled: !!url && url.startsWith("/uploads/"),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

