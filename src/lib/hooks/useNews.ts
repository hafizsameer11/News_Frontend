import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { newsApi } from "@/lib/api/modules/news.api";
import { NewsResponse } from "@/types/news.types";

// Get all news
export const useNews = (params?: {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
  status?: string;
  refetchInterval?: number;
}) => {
  const { refetchInterval, ...queryParams } = params || {};
  return useQuery<NewsResponse>({
    queryKey: ["news", queryParams],
    queryFn: () => newsApi.getAll(queryParams),
    refetchInterval: refetchInterval,
  });
};

// Get news by ID or slug
export const useNewsDetail = (idOrSlug: string) => {
  return useQuery({
    queryKey: ["news", idOrSlug],
    queryFn: () => newsApi.getByIdOrSlug(idOrSlug),
    enabled: !!idOrSlug,
  });
};

// Create news mutation
export const useCreateNews = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: newsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news"] });
    },
  });
};

// Update news mutation
export const useUpdateNews = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: import("@/types/news.types").UpdateNewsInput }) => newsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["news"] });
      queryClient.invalidateQueries({ queryKey: ["news", variables.id] });
    },
  });
};

// Delete news mutation
export const useDeleteNews = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: newsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news"] });
    },
  });
};

// Infinite query for homepage/news feed
export const useNewsInfinite = (params?: {
  categoryId?: string;
  search?: string;
  status?: string;
  limit?: number;
}) => {
  return useInfiniteQuery({
    queryKey: ["news", "infinite", params],
    queryFn: ({ pageParam = 1 }) =>
      newsApi.getAll({ ...params, page: pageParam, limit: params?.limit || 12 }),
    getNextPageParam: (lastPage) => {
      const meta = lastPage?.data?.meta;
      if (meta && meta.page < meta.totalPages) {
        return meta.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
};

