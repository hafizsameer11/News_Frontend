import { apiClient } from "../apiClient";
import {
  VideoUploadInitResponse,
  VideoUploadProgress,
  VideoUploadCompleteResponse,
} from "@/types/video.types";

export const videoUploadApi = {
  // Initiate chunked upload
  initiate: (fileName: string, fileSize: number, mimeType: string) => {
    return apiClient.post<VideoUploadInitResponse>("/video/upload/initiate", {
      fileName,
      fileSize,
      mimeType,
    });
  },

  // Upload a chunk
  uploadChunk: (
    uploadId: string,
    chunkIndex: number,
    chunk: Blob,
    onUploadProgress?: (progress: number) => void
  ) => {
    const formData = new FormData();
    formData.append("uploadId", uploadId);
    formData.append("chunkIndex", chunkIndex.toString());
    formData.append("chunk", chunk);

    return apiClient.post<{ success: boolean; message: string }>(
      "/video/upload/chunk",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (onUploadProgress && progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onUploadProgress(percentCompleted);
          }
        },
      }
    );
  },

  // Complete upload
  complete: (uploadId: string) => {
    return apiClient.post<VideoUploadCompleteResponse>("/video/upload/complete", {
      uploadId,
    });
  },

  // Cancel upload
  cancel: (uploadId: string) => {
    return apiClient.post<{ success: boolean; message: string }>("/video/upload/cancel", {
      uploadId,
    });
  },

  // Get upload progress
  getProgress: (uploadId: string) => {
    return apiClient.get<{ success: boolean; data: VideoUploadProgress }>(
      `/video/upload/progress/${uploadId}`
    );
  },
};

