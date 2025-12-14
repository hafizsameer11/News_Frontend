import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mediaApi } from "@/lib/api/modules/media.api";
import { UploadMediaInput } from "@/types/media.types";

// Get all media
export const useMediaList = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ["media", params],
    queryFn: () => mediaApi.getAll(params),
  });
};

// Upload media mutation
export const useUploadMedia = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UploadMediaInput) => mediaApi.upload(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
    },
  });
};

// Update media status mutation
export const useUpdateMediaStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" }) =>
      mediaApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
    },
  });
};

// Delete media mutation
export const useDeleteMedia = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mediaApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
    },
  });
};

