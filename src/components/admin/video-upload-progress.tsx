"use client";

import { VideoUploadProgress as ProgressType } from "@/types/video.types";

interface VideoUploadProgressProps {
  progress: ProgressType;
  onCancel?: () => void;
}

export function VideoUploadProgress({ progress, onCancel }: VideoUploadProgressProps) {
  const getStatusColor = () => {
    switch (progress.status) {
      case "UPLOADING":
        return "bg-blue-600";
      case "PROCESSING":
        return "bg-yellow-600";
      case "COMPLETED":
        return "bg-green-600";
      case "FAILED":
        return "bg-red-600";
      default:
        return "bg-gray-600";
    }
  };

  const getStatusText = () => {
    switch (progress.status) {
      case "UPLOADING":
        return "Uploading...";
      case "PROCESSING":
        return "Processing video...";
      case "COMPLETED":
        return "Upload completed!";
      case "FAILED":
        return "Upload failed";
      default:
        return "Unknown status";
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Upload Progress</h3>
        {progress.status === "UPLOADING" && onCancel && (
          <button
            onClick={onCancel}
            className="text-sm text-red-600 hover:text-red-800 transition"
          >
            Cancel
          </button>
        )}
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>{getStatusText()}</span>
          <span>
            {progress.uploadedChunks} / {progress.totalChunks} chunks
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full ${getStatusColor()} transition-all duration-300`}
            style={{ width: `${progress.progress}%` }}
          />
        </div>
        <div className="text-sm text-gray-500 mt-2 text-center">
          {progress.progress.toFixed(1)}%
        </div>
      </div>

      {progress.status === "PROCESSING" && (
        <div className="text-sm text-yellow-700 bg-yellow-50 p-3 rounded">
          Video is being processed. This may take a few minutes...
        </div>
      )}

      {progress.status === "COMPLETED" && (
        <div className="text-sm text-green-700 bg-green-50 p-3 rounded">
          Video uploaded and processed successfully!
        </div>
      )}

      {progress.status === "FAILED" && (
        <div className="text-sm text-red-700 bg-red-50 p-3 rounded">
          Upload failed. Please try again.
        </div>
      )}
    </div>
  );
}

