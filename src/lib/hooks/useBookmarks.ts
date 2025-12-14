import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bookmarksApi } from "@/lib/api/modules/bookmarks.api";

// Save a bookmark mutation
export const useCreateBookmark = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newsId: string) => bookmarksApi.create(newsId),
    onSuccess: () => {
      // Invalidate bookmarks queries
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });
};

// Get user's bookmarks
export const useBookmarks = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ["bookmarks", params],
    queryFn: () => bookmarksApi.getAll(params),
  });
};

// Remove a bookmark mutation
export const useDeleteBookmark = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookmarkId: string) => bookmarksApi.delete(bookmarkId),
    onSuccess: () => {
      // Invalidate bookmarks queries
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });
};

// Check if news is bookmarked
export const useCheckBookmark = (newsId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["bookmarks", "check", newsId],
    queryFn: () => bookmarksApi.check(newsId),
    enabled: enabled && !!newsId,
  });
};

