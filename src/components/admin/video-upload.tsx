"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  useInitiateVideoUpload,
  useUploadChunk,
  useCompleteVideoUpload,
  useCancelVideoUpload,
  useVideoUploadProgress,
} from "@/lib/hooks/useVideoUpload";
import { VideoUploadProgress } from "./video-upload-progress";
import { VideoMetadataForm } from "./video-metadata-form";
import { ErrorMessage } from "@/components/ui/error-message";
import { VideoUploadProgress as ProgressType } from "@/types/video.types";

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 1024 * 1024 * 1024; // 1GB
const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo", // avi
  "video/x-matroska", // mkv
];

interface VideoUploadProps {
  onUploadSuccess?: (mediaId: string) => void;
}

export function VideoUpload({ onUploadSuccess }: VideoUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<ProgressType | null>(null);
  const [uploadedMediaId, setUploadedMediaId] = useState<string | null>(null);
  const [showMetadataForm, setShowMetadataForm] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const initiateMutation = useInitiateVideoUpload();
  const uploadChunkMutation = useUploadChunk();
  const completeMutation = useCompleteVideoUpload();
  const cancelMutation = useCancelVideoUpload();
  const { data: progressData } = useVideoUploadProgress(
    uploadId || "",
    !!uploadId && isUploading
  );

  // Update progress from API
  useEffect(() => {
    if (progressData?.data) {
      setUploadProgress(progressData.data);
    }
  }, [progressData]);

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_VIDEO_SIZE) {
      return `File "${file.name}" is too large. Maximum size is 1GB.`;
    }
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      return `File "${file.name}" has an unsupported type. Allowed types: MP4, WebM, QuickTime, AVI, MKV.`;
    }
    return null;
  };

  const handleFileSelect = (file: File) => {
    const error = validateFile(file);
    if (error) {
      setErrors([error]);
      return;
    }
    setErrors([]);
    setSelectedFile(file);
    setUploadId(null);
    setUploadProgress(null);
    setUploadedMediaId(null);
    setShowMetadataForm(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const splitFileIntoChunks = (file: File): Blob[] => {
    const chunks: Blob[] = [];
    let start = 0;
    while (start < file.size) {
      const end = Math.min(start + CHUNK_SIZE, file.size);
      chunks.push(file.slice(start, end));
      start = end;
    }
    return chunks;
  };

  const uploadVideo = useCallback(async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setErrors([]);
    abortControllerRef.current = new AbortController();

    try {
      // Step 1: Initiate upload
      const chunks = splitFileIntoChunks(selectedFile);
      const initiateResponse = await initiateMutation.mutateAsync({
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        mimeType: selectedFile.type,
      });

      const newUploadId = initiateResponse.data.data.uploadId;
      setUploadId(newUploadId);

      // Step 2: Upload chunks sequentially
      for (let i = 0; i < chunks.length; i++) {
        if (abortControllerRef.current?.signal.aborted) {
          throw new Error("Upload cancelled");
        }

        await uploadChunkMutation.mutateAsync({
          uploadId: newUploadId,
          chunkIndex: i,
          chunk: chunks[i],
          onUploadProgress: (progress) => {
            // Calculate overall progress
            const chunkProgress = (i / chunks.length) * 100 + (progress / chunks.length);
            setUploadProgress({
              uploadId: newUploadId,
              uploadedChunks: i + 1,
              totalChunks: chunks.length,
              progress: Math.min(chunkProgress, 99),
              status: "UPLOADING",
            });
          },
        });
      }

      // Step 3: Complete upload
      const completeResponse = await completeMutation.mutateAsync(newUploadId);
      const mediaData = completeResponse.data.data;
      setUploadedMediaId(mediaData.mediaId);
      setUploadProgress({
        uploadId: newUploadId,
        uploadedChunks: chunks.length,
        totalChunks: chunks.length,
        progress: 100,
        status: "COMPLETED",
      });

      setShowMetadataForm(true);
      onUploadSuccess?.(mediaData.mediaId);
    } catch (error: any) {
      setErrors([error.message || "Upload failed. Please try again."]);
      setUploadProgress((prev) =>
        prev
          ? {
              ...prev,
              status: "FAILED",
            }
          : null
      );
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, initiateMutation, uploadChunkMutation, completeMutation, onUploadSuccess]);

  const handleCancel = useCallback(async () => {
    if (uploadId) {
      try {
        await cancelMutation.mutateAsync(uploadId);
      } catch (error) {
        console.error("Failed to cancel upload:", error);
      }
    }
    abortControllerRef.current?.abort();
    setIsUploading(false);
    setUploadId(null);
    setUploadProgress(null);
  }, [uploadId, cancelMutation]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
  };


  return (
    <div className="space-y-6">
      {/* File Selection */}
      {!selectedFile && (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors"
        >
          <input
            type="file"
            id="video-upload-input"
            className="hidden"
            accept={ALLOWED_VIDEO_TYPES.join(",")}
            onChange={handleFileInput}
          />
          <label
            htmlFor="video-upload-input"
            className="cursor-pointer flex flex-col items-center"
          >
            <svg
              className="w-16 h-16 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <p className="text-gray-700 font-medium mb-2">
              Drag and drop a video file here, or click to select
            </p>
            <p className="text-sm text-gray-500">
              Supported formats: MP4, WebM, QuickTime, AVI, MKV
            </p>
            <p className="text-xs text-gray-400 mt-1">Max size: 1GB</p>
          </label>
        </div>
      )}

      {/* Selected File Preview */}
      {selectedFile && !uploadId && !isUploading && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedFile.name}</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Size: {formatFileSize(selectedFile.size)}</p>
                <p>Type: {selectedFile.type}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedFile(null);
                setErrors([]);
              }}
              className="text-red-600 hover:text-red-800 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Video Preview */}
          <div className="mb-4">
            <video
              src={URL.createObjectURL(selectedFile)}
              controls
              className="w-full rounded-lg"
              preload="metadata"
            />
          </div>

          <button
            onClick={uploadVideo}
            disabled={initiateMutation.isPending}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {initiateMutation.isPending ? "Starting upload..." : "Start Upload"}
          </button>
        </div>
      )}

      {/* Upload Progress */}
      {uploadProgress && (
        <VideoUploadProgress progress={uploadProgress} onCancel={handleCancel} />
      )}

      {/* Metadata Form */}
      {showMetadataForm && uploadedMediaId && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Video Metadata</h3>
          <VideoMetadataForm
            onSubmit={async (metadata) => {
              // Here you would typically create/update a news article with the video
              // For now, we'll just show success
              console.log("Metadata submitted:", metadata);
              alert("Video uploaded successfully! Media ID: " + uploadedMediaId);
            }}
            onCancel={() => {
              setShowMetadataForm(false);
              setSelectedFile(null);
              setUploadId(null);
              setUploadProgress(null);
              setUploadedMediaId(null);
            }}
            isLoading={false}
          />
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="space-y-2">
          {errors.map((error, index) => (
            <ErrorMessage key={index} error={new Error(error)} />
          ))}
        </div>
      )}
    </div>
  );
}

