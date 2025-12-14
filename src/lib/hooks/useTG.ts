import { useQuery } from "@tanstack/react-query";
import { tgApi } from "@/lib/api/modules/tg.api";

// Get all TG videos
export const useTGVideos = (params?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sortBy?: "createdAt" | "duration";
  sortOrder?: "asc" | "desc";
}) => {
  return useQuery({
    queryKey: ["tg", "videos", params],
    queryFn: () => tgApi.getVideos(params),
  });
};

// Get single TG video
export const useTGVideo = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["tg", "videos", id],
    queryFn: () => tgApi.getVideoById(id),
    enabled: enabled && !!id,
  });
};

// Get related videos
export const useRelatedTGVideos = (id: string, limit: number = 6) => {
  return useQuery({
    queryKey: ["tg", "videos", "related", id, limit],
    queryFn: () => tgApi.getRelatedVideos(id, limit),
    enabled: !!id,
  });
};

// Get popular videos
export const usePopularTGVideos = (limit: number = 10) => {
  return useQuery({
    queryKey: ["tg", "videos", "popular", limit],
    queryFn: () => tgApi.getPopularVideos(limit),
  });
};

