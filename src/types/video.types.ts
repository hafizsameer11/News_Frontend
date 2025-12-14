// Video Upload Types
export interface VideoUploadInitResponse {
  success: boolean;
  message: string;
  data: {
    uploadId: string;
    chunkSize: number;
    totalChunks: number;
  };
}

export interface VideoUploadProgress {
  uploadId: string;
  uploadedChunks: number;
  totalChunks: number;
  progress: number; // 0-100
  status: "UPLOADING" | "PROCESSING" | "COMPLETED" | "FAILED";
}

export interface VideoUploadCompleteResponse {
  success: boolean;
  message: string;
  data: {
    mediaId: string;
    url: string;
    thumbnailUrl?: string;
    duration?: number;
    width?: number;
    height?: number;
    fileSize?: number;
  };
}

