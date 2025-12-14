// Media Types
export type MediaType = "IMAGE" | "VIDEO" | "DOCUMENT";

export type ProcessingStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface Media {
  id: string;
  url: string;
  type: MediaType;
  caption?: string;
  newsId?: string;
  duration?: number; // Video only
  width?: number; // Video only
  height?: number; // Video only
  fileSize?: number | string; // Video only (BigInt from backend)
  thumbnailUrl?: string; // Video only
  processingStatus?: ProcessingStatus; // Video only
  codec?: string; // Video only
  bitrate?: number; // Video only
  uploaderId?: string;
  uploader?: {
    id: string;
    name: string;
    email: string;
    role?: string;
  };
  // Legacy fields for backward compatibility
  uploadedBy?: {
    id: string;
    name: string;
    email: string;
  };
  uploaderName?: string;
  uploaderEmail?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MediaResponse {
  success: boolean;
  message: string;
  data: Media;
}

export interface MediaListResponse {
  success: boolean;
  message: string;
  data: {
    media: Media[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface UploadMediaInput {
  file: File;
  caption?: string;
  newsId?: string;
}

