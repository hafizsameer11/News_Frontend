"use client";

import { Media } from "@/types/media.types";
import { useState } from "react";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { DeleteConfirmModal } from "./delete-confirm-modal";
import { MediaImageModal } from "./media-image-modal";
import { MediaVideoModal } from "./media-video-modal";
import { useUpdateMediaStatus } from "@/lib/hooks/useMedia";
import { useAuth } from "@/providers/AuthProvider";
import { useLanguage } from "@/providers/LanguageProvider";
import { getImageUrl } from "@/lib/helpers/imageUrl";

interface MediaItemProps {
  media: Media;
  onSelect?: (media: Media) => void;
  onDelete?: (id: string) => void;
  isSelected?: boolean;
  showDelete?: boolean;
}

export function MediaItem({
  media,
  onSelect,
  onDelete,
  isSelected = false,
  showDelete = true,
}: MediaItemProps) {
  const { user } = useAuth();
  const { language, formatDate: formatDateUtil } = useLanguage();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const updateStatusMutation = useUpdateMediaStatus();

  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
  // Allow admin to approve/reject media with PENDING status (for both images and videos)
  const canApprove = isAdmin && media.processingStatus === "PENDING";

  const imageUrl =
    media.type === "VIDEO" && media.thumbnailUrl
      ? getImageUrl(media.thumbnailUrl)
      : getImageUrl(media.url);

  const handleDelete = async () => {
    if (onDelete) {
      setIsDeleting(true);
      try {
        await onDelete(media.id);
      } finally {
        setIsDeleting(false);
        setShowDeleteModal(false);
      }
    }
  };

  const handleApprove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await updateStatusMutation.mutateAsync({
      id: media.id,
      status: "COMPLETED",
    });
  };

  const handleReject = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await updateStatusMutation.mutateAsync({ id: media.id, status: "FAILED" });
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (media.type === "IMAGE") {
      setShowImageModal(true);
    }
  };

  const handleVideoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (media.type === "VIDEO") {
      setShowVideoModal(true);
    }
  };

  const formatDate = (dateString: string | Date | null | undefined) => {
    if (!dateString) return "N/A";
    try {
      const date =
        typeof dateString === "string" ? new Date(dateString) : dateString;
      if (isNaN(date.getTime())) return "N/A";
      return formatDateUtil(date, "PP", language);
    } catch {
      return "N/A";
    }
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
        return "bg-red-100 text-red-800";
      case "EDITOR":
        return "bg-blue-100 text-blue-800";
      case "ADVERTISER":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
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

  const uploaderRole = media.uploader?.role;

  // Build tooltip content
  const tooltipContent = [];
  if (media.type === "IMAGE") {
    if (media.width && media.height) {
      tooltipContent.push(`${media.width} × ${media.height}px`);
    }
    if (media.fileSize) {
      tooltipContent.push(formatFileSize(media.fileSize));
    }
  } else if (media.type === "VIDEO") {
    if (media.duration) {
      tooltipContent.push(
        `Duration: ${Math.floor(media.duration / 60)}:${String(
          media.duration % 60
        ).padStart(2, "0")}`
      );
    }
    if (media.fileSize) {
      tooltipContent.push(`Size: ${formatFileSize(media.fileSize)}`);
    }
    if (media.codec) {
      tooltipContent.push(`Codec: ${media.codec}`);
    }
    if (media.bitrate) {
      tooltipContent.push(`Bitrate: ${media.bitrate} kbps`);
    }
  }
  if (media.caption) {
    tooltipContent.push(`Caption: ${media.caption}`);
  }

  return (
    <>
      <div
        className={`relative group bg-white rounded-lg border-2 overflow-hidden transition-all ${
          isSelected
            ? "border-blue-500 ring-2 ring-blue-200"
            : "border-gray-200 hover:border-gray-300"
        }`}
        onClick={() => {
          // Only handle click for images or when not in selection mode
          // Videos in selection mode are handled by the Select button
          if (media.type === "VIDEO" && onSelect) {
            // Don't handle click on video container when in selection mode
            // The Select button handles it
            return;
          }
          
          // Prevent selection of FAILED or PENDING media
          if (media.processingStatus === "FAILED") {
            alert(
              "Cannot select rejected media. Please select an approved image or video."
            );
            return;
          }
          if (media.processingStatus === "PENDING") {
            alert(
              "Cannot select pending media. Please wait for admin approval or select an approved image or video."
            );
            return;
          }
          onSelect?.(media);
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Thumbnail */}
        <div className="aspect-square bg-gray-100 relative overflow-hidden">
          {media.type === "IMAGE" ? (
            imageError ? (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            ) : imageUrl && imageUrl.trim() !== "" ? (
              <div className="relative w-full h-full">
                <OptimizedImage
                  src={imageUrl}
                  alt={media.caption || "Media"}
                  fill
                  className="object-cover"
                  onError={() => setImageError(true)}
                />
                {/* Enlarge button */}
                <button
                  onClick={handleImageClick}
                  className="absolute bottom-2 right-2 bg-black/70 hover:bg-black/90 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg"
                  title="Enlarge image"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )
          ) : media.type === "VIDEO" ? (
            <div className="relative w-full h-full">
              {media.thumbnailUrl ? (
                imageError ? (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                ) : (
                  <img
                    src={imageUrl}
                    alt={media.caption || "Video"}
                    lang={language}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                )
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </div>
              )}
              
              {/* Hover overlay - Different behavior for selection vs browse mode */}
              {onSelect ? (
                // Selection mode: Show "Select" button
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Prevent selection of FAILED or PENDING media
                      if (media.processingStatus === "FAILED") {
                        alert("Cannot select rejected media. Please select an approved video.");
                        return;
                      }
                      if (media.processingStatus === "PENDING") {
                        alert("Cannot select pending media. Please wait for admin approval or select an approved video.");
                        return;
                      }
                      onSelect(media);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium shadow-lg transition-colors flex items-center gap-2"
                    title="Select this video"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Select
                  </button>
                </div>
              ) : (
                // Browse mode: Show play button that opens video modal
                <div
                  className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={handleVideoClick}
                >
                  <div className="bg-white/90 rounded-full p-4">
                    <svg
                      className="w-8 h-8 text-gray-900"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                </div>
              )}
              
              {media.duration && (
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                  {Math.floor(media.duration / 60)}:
                  {String(media.duration % 60).padStart(2, "0")}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          )}

          {/* Processing status badge - only show if status exists and is not COMPLETED */}
          {media.processingStatus && media.processingStatus !== "COMPLETED" && (
            <div className="absolute top-2 left-2 z-10">
              <span
                className={`text-xs font-semibold px-2 py-1 rounded shadow-md ${
                  media.processingStatus === "PROCESSING"
                    ? "bg-yellow-500 text-white animate-pulse"
                    : media.processingStatus === "FAILED"
                    ? "bg-red-500 text-white"
                    : "bg-gray-500 text-white"
                }`}
              >
                {media.processingStatus}
              </span>
            </div>
          )}

          {/* Approve/Reject buttons for admin */}
          {canApprove && (
            <div className="absolute top-2 left-2 right-2 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleApprove}
                disabled={updateStatusMutation.isPending}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded shadow-md transition-colors disabled:opacity-50"
                title="Approve"
              >
                ✓ Approve
              </button>
              <button
                onClick={handleReject}
                disabled={updateStatusMutation.isPending}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded shadow-md transition-colors disabled:opacity-50"
                title="Reject"
              >
                ✗ Reject
              </button>
            </div>
          )}

          {/* Selection indicator */}
          {isSelected && (
            <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1 z-10">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}

          {/* Delete button (shown on hover) */}
          {showDelete && onDelete && !canApprove && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteModal(true);
              }}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
              title="Delete media"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Info section - Clean and minimal */}
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded ${
                media.type === "IMAGE"
                  ? "bg-blue-100 text-blue-800"
                  : media.type === "VIDEO"
                  ? "bg-purple-100 text-purple-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {media.type}
            </span>
            <span className="text-xs text-gray-500">
              {formatDate(media.createdAt)}
            </span>
          </div>

          {/* Uploader with role badge */}
          {(media.uploader || media.uploadedBy || media.uploaderName) && (
            <div className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <p
                  lang={language}
                  className="text-xs font-medium text-gray-700 truncate"
                >
                  {media.uploader?.name ||
                    media.uploadedBy?.name ||
                    media.uploaderName ||
                    "Unknown"}
                </p>
              </div>
              {/* Role badge */}
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded ${getRoleBadgeColor(
                  uploaderRole
                )}`}
              >
                {getRoleLabel(uploaderRole)}
              </span>
            </div>
          )}
        </div>

        {/* Hover tooltip with details */}
        {showTooltip && tooltipContent.length > 0 && (
          <div className="absolute bottom-full left-0 right-0 mb-2 mx-2 bg-gray-900 text-white text-xs rounded-lg p-2 shadow-lg z-20 pointer-events-none">
            {tooltipContent.map((item, idx) => (
              <div key={idx}>{item}</div>
            ))}
          </div>
        )}
      </div>

      {/* Image modal */}
      <MediaImageModal
        media={media}
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
      />

      {/* Video modal */}
      <MediaVideoModal
        media={media}
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
      />

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <DeleteConfirmModal
          title="Delete Media"
          message={`Are you sure you want to delete this ${media.type.toLowerCase()}? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
          isLoading={isDeleting}
        />
      )}
    </>
  );
}
