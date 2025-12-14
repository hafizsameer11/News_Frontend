import { useMutation, useQuery } from "@tanstack/react-query";
import { videoUploadApi } from "@/lib/api/modules/video-upload.api";

// Initiate video upload mutation
export const useInitiateVideoUpload = () => {
  return useMutation({
    mutationFn: ({
      fileName,
      fileSize,
      mimeType,
    }: {
      fileName: string;
      fileSize: number;
      mimeType: string;
    }) => videoUploadApi.initiate(fileName, fileSize, mimeType),
  });
};

// Upload chunk mutation
export const useUploadChunk = () => {
  return useMutation({
    mutationFn: ({
      uploadId,
      chunkIndex,
      chunk,
      onUploadProgress,
    }: {
      uploadId: string;
      chunkIndex: number;
      chunk: Blob;
      onUploadProgress?: (progress: number) => void;
    }) => videoUploadApi.uploadChunk(uploadId, chunkIndex, chunk, onUploadProgress),
  });
};

// Complete upload mutation
export const useCompleteVideoUpload = () => {
  return useMutation({
    mutationFn: (uploadId: string) => videoUploadApi.complete(uploadId),
  });
};

// Cancel upload mutation
export const useCancelVideoUpload = () => {
  return useMutation({
    mutationFn: (uploadId: string) => videoUploadApi.cancel(uploadId),
  });
};

// Get upload progress query
export const useVideoUploadProgress = (uploadId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["video-upload", "progress", uploadId],
    queryFn: () => videoUploadApi.getProgress(uploadId),
    enabled: enabled && !!uploadId,
    refetchInterval: (query) => {
      const status = query.state.data?.data?.status;
      return status === "UPLOADING" || status === "PROCESSING" ? 2000 : false;
    },
  });
};

