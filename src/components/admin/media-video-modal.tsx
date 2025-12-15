"use client";

import { useEffect, useState } from "react";
import { Media } from "@/types/media.types";
import { API_CONFIG } from "@/lib/api/apiConfig";
import { VideoPlayer } from "@/components/ui/video-player";
import { useLanguage } from "@/providers/LanguageProvider";

interface MediaVideoModalProps {
  media: Media | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MediaVideoModal({
  media,
  isOpen,
  onClose,
}: MediaVideoModalProps) {
  const { language, formatDate } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
      return () => window.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !media || media.type !== "VIDEO") {
    return null;
  }

  const getFullUrl = (url: string): string => {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    const baseUrl = API_CONFIG.BASE_URL.replace("/api/v1", "");
    return `${baseUrl}${url.startsWith("/") ? url : `/${url}`}`;
  };

  const formatFileSize = (bytes: number | string): string => {
    const size = typeof bytes === "string" ? parseInt(bytes, 10) : bytes;
    if (isNaN(size) || size === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(size) / Math.log(k));
    return `${(size / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case "ADMIN":
      case "SUPER_ADMIN":
        return "bg-red-500";
      case "EDITOR":
        return "bg-blue-500";
      case "ADVERTISER":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case "ADMIN":
        return "Admin";
      case "SUPER_ADMIN":
        return "Super Admin";
      case "EDITOR":
        return "Editor";
      case "ADVERTISER":
        return "Advertiser";
      case "USER":
        return "User";
      default:
        return "Uploader";
    }
  };

  const getStatusBadgeColor = (status?: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-500";
      case "PROCESSING":
        return "bg-yellow-500";
      case "FAILED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const videoUrl = getFullUrl(media.url);
  const posterUrl = media.thumbnailUrl
    ? getFullUrl(media.thumbnailUrl)
    : undefined;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-7xl max-h-[95vh] w-full h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 shrink-0 bg-white/10 hover:bg-white/20 border-white/90 bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-2 transition-all"
          aria-label="Close"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Video Player */}
        <div className="w-full max-w-5xl">
          <VideoPlayer
            mediaId={media.id}
            src={videoUrl}
            poster={posterUrl}
            className="w-full"
            controls={true}
            autoplay={false}
            loop={false}
            muted={false}
          />
        </div>

        {/* Info overlay - Collapsible */}
        <div
          className="absolute bottom-4 left-4 right-4 bg-black/90 backdrop-blur-sm text-white rounded-lg border border-white/10 overflow-hidden transition-all duration-300"
          style={{ maxWidth: "500px", left: "30%" }}
        >
          {/* Header - Always visible */}
          <div
            className="flex items-center justify-between gap-4 p-4 cursor-pointer hover:bg-white/5 transition-colors"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 lang={language} className="text-base font-bold truncate">
                  {media.caption || "Untitled Video"}
                </h3>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded ${
                    media.type === "VIDEO" ? "bg-purple-500" : "bg-gray-500"
                  }`}
                >
                  {media.type}
                </span>
                {media.processingStatus && (
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded ${getStatusBadgeColor(
                      media.processingStatus
                    )}`}
                  >
                    {media.processingStatus}
                  </span>
                )}
              </div>
              {!isExpanded && (
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                  {media.duration && (
                    <span>
                      {Math.floor(media.duration / 60)}:
                      {String(media.duration % 60).padStart(2, "0")}
                    </span>
                  )}
                  {media.fileSize && (
                    <span>• {formatFileSize(media.fileSize)}</span>
                  )}
                  {media.uploader?.name && <span>• {media.uploader.name}</span>}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="shrink-0 bg-white/10 hover:bg-white/20 rounded-full p-1.5 transition-colors"
                aria-label={isExpanded ? "Collapse" : "Expand"}
              >
                <svg
                  className={`w-4 h-4 transition-transform ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Collapsible Content */}
          {isExpanded && (
            <div className="px-4 pb-4 space-y-4 border-t border-white/10 pt-4">
              {/* Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                {/* Dimensions */}
                {media.width && media.height && (
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Dimensions</p>
                    <p className="font-medium">
                      {media.width} × {media.height} px
                    </p>
                  </div>
                )}

                {/* File Size */}
                {media.fileSize && (
                  <div>
                    <p className="text-gray-400 text-xs mb-1">File Size</p>
                    <p className="font-medium">
                      {formatFileSize(media.fileSize)}
                    </p>
                  </div>
                )}

                {/* Duration */}
                {media.duration && (
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Duration</p>
                    <p className="font-medium">
                      {Math.floor(media.duration / 60)}:
                      {String(media.duration % 60).padStart(2, "0")}
                    </p>
                  </div>
                )}

                {/* Codec */}
                {media.codec && (
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Codec</p>
                    <p className="font-medium">{media.codec}</p>
                  </div>
                )}

                {/* Bitrate */}
                {media.bitrate && (
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Bitrate</p>
                    <p className="font-medium">{media.bitrate} kbps</p>
                  </div>
                )}

                {/* Upload Date */}
                <div>
                  <p className="text-gray-400 text-xs mb-1">Uploaded</p>
                  <p className="font-medium">
                    {formatDate(new Date(media.createdAt), "PP")}
                  </p>
                </div>

                {/* Last Updated */}
                {media.updatedAt && media.updatedAt !== media.createdAt && (
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Last Updated</p>
                    <p className="font-medium">
                      {formatDate(new Date(media.updatedAt), "PP")}
                    </p>
                  </div>
                )}
              </div>

              {/* Uploader Info */}
              {(media.uploader || media.uploadedBy || media.uploaderName) && (
                <div className="pt-3 border-t border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">
                        {media.uploader?.name ||
                          media.uploadedBy?.name ||
                          media.uploaderName ||
                          "Unknown"}
                      </p>
                      {media.uploader?.email && (
                        <p className="text-xs text-gray-400 truncate">
                          {media.uploader.email}
                        </p>
                      )}
                    </div>
                    {media.uploader?.role && (
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${getRoleBadgeColor(
                          media.uploader.role
                        )}`}
                      >
                        {getRoleLabel(media.uploader.role)}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Media ID (for reference) */}
              <div className="pt-2 border-t border-white/10">
                <p className="text-xs text-gray-500 font-mono truncate">
                  ID: {media.id}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
