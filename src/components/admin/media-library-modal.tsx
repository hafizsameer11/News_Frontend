"use client";

import { useState } from "react";
import { Media } from "@/types/media.types";
import { MediaUpload } from "./media-upload";
import { MediaGrid } from "./media-grid";
import { useLanguage } from "@/providers/LanguageProvider";
import { getImageUrl } from "@/lib/helpers/imageUrl";

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (media: Media) => void;
  selectedMediaId?: string;
  filterType?: "IMAGE" | "VIDEO" | "DOCUMENT" | "ALL";
  title?: string;
}

export function MediaLibraryModal({
  isOpen,
  onClose,
  onSelect,
  selectedMediaId,
  filterType = "ALL",
  title = "Media Library",
}: MediaLibraryModalProps) {
  const [activeTab, setActiveTab] = useState<"browse" | "upload">("browse");
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const { formatDate } = useLanguage();

  if (!isOpen) return null;

  const handleSelect = (media: Media) => {
    // Prevent selection of FAILED media
    if (media.processingStatus === "FAILED") {
      alert("Cannot select rejected media. Please select an approved image.");
      return;
    }
    // Prevent selection of PENDING media (unless admin)
    if (media.processingStatus === "PENDING") {
      alert(
        "Cannot select pending media. Please wait for admin approval or select an approved image."
      );
      return;
    }
    setSelectedMedia(media);
    onSelect?.(media);
    // Auto-close modal after selection
    handleClose();
  };

  const handleClose = () => {
    setSelectedMedia(null);
    onClose();
  };

  const handleUploadSuccess = () => {
    // Switch to browse tab after successful upload
    setActiveTab("browse");
  };

  // Use centralized image URL helper

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold">{title}</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("browse")}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === "browse"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Browse
            </button>
            <button
              onClick={() => setActiveTab("upload")}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === "upload"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Upload
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "browse" ? (
            <MediaGrid
              onSelect={handleSelect}
              selectedMediaId={selectedMediaId || selectedMedia?.id}
              filterType={filterType}
            />
          ) : (
            <MediaUpload
              onUploadSuccess={handleUploadSuccess}
              multiple={true}
            />
          )}
        </div>

        {/* Footer with selected media info */}
        {selectedMedia && (
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                  {selectedMedia.type === "IMAGE" ? (
                    <img
                      src={getImageUrl(selectedMedia.url)}
                      alt={selectedMedia.caption || "Selected"}
                      className="w-full h-full object-cover"
                    />
                  ) : selectedMedia.type === "VIDEO" &&
                    selectedMedia.thumbnailUrl ? (
                    <img
                      src={getImageUrl(selectedMedia.thumbnailUrl)}
                      alt={selectedMedia.caption || "Selected"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {selectedMedia.caption || "Selected Media"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedMedia.type} • {formatDate(selectedMedia.createdAt)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (selectedMedia && onSelect) {
                    // Double-check status before using
                    if (selectedMedia.processingStatus === "FAILED") {
                      alert(
                        "Cannot use rejected media. Please select an approved image."
                      );
                      return;
                    }
                    if (selectedMedia.processingStatus === "PENDING") {
                      alert(
                        "Cannot use pending media. Please wait for admin approval or select an approved image."
                      );
                      return;
                    }
                    onSelect(selectedMedia);
                  }
                  handleClose();
                }}
                disabled={
                  selectedMedia?.processingStatus === "FAILED" ||
                  selectedMedia?.processingStatus === "PENDING"
                }
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Use Selected
              </button>
            </div>
          </div>
        )}

        {/* Footer without selection */}
        {!selectedMedia && (
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex justify-end">
              <button
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
