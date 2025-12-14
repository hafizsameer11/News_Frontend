"use client";

import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useMediaList, useDeleteMedia } from "@/lib/hooks/useMedia";
import { Media } from "@/types/media.types";
import { MediaItem } from "./media-item";
import { LoadingSpinner } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import { InputWithClear } from "@/components/ui/input-with-clear";

interface MediaGridProps {
  onSelect?: (media: Media) => void;
  selectedMediaId?: string;
  filterType?: "IMAGE" | "VIDEO" | "DOCUMENT" | "ALL";
}

export function MediaGrid({
  onSelect,
  selectedMediaId,
  filterType = "ALL",
}: MediaGridProps) {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"IMAGE" | "VIDEO" | "DOCUMENT" | "ALL">(
    filterType
  );
  const [uploaderFilter, setUploaderFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const limit = 20;

  const { data, isLoading, error, refetch } = useMediaList({ page, limit });
  const deleteMutation = useDeleteMedia();

  // Check if user is admin or super-admin
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      // Refetch if current page might be empty after deletion
      if (data?.data?.media.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        refetch();
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to delete media";
      console.error("Failed to delete media:", errorMessage, error);
      // You could also show a toast notification here
      alert(errorMessage);
    }
  };

  // Get unique uploaders for filter dropdown
  const uploaders = data?.data?.media.reduce((acc, media) => {
    const uploaderId = media.uploader?.id || media.uploadedBy?.id || media.uploaderId;
    const uploaderName = media.uploader?.name || media.uploadedBy?.name || media.uploaderName || "Unknown";
    if (uploaderId && !acc.find(u => u.id === uploaderId)) {
      acc.push({ id: uploaderId, name: uploaderName });
    }
    return acc;
  }, [] as { id: string; name: string }[]) || [];

  // Check if filters are active
  const hasActiveFilters = searchTerm || typeFilter !== "ALL" || uploaderFilter !== "ALL" || statusFilter !== "ALL";

  // Filter media based on search term, type, uploader, access control, and status
  const allFilteredMedia =
    data?.data?.media.filter((media) => {
      // Access control: Admin/Super-Admin sees all, others see only their own
      if (!isAdmin && user) {
        const mediaUploaderId = media.uploader?.id || media.uploadedBy?.id || media.uploaderId;
        if (mediaUploaderId !== user.id) {
          return false;
        }
      }

      // ALWAYS filter out FAILED media when selecting (for ads/news)
      // But allow viewing FAILED media in browse mode (admin can see what was rejected)
      // Only hide FAILED when onSelect is provided (selection mode)
      if (media.processingStatus === "FAILED" && onSelect) {
        return false;
      }

      // Also filter by status filter
      const matchesStatus = statusFilter === "ALL" || 
        (statusFilter === "APPROVED" && media.processingStatus === "COMPLETED") ||
        (statusFilter === "PENDING" && media.processingStatus === "PENDING") ||
        (statusFilter === "PROCESSING" && media.processingStatus === "PROCESSING") ||
        (statusFilter === "FAILED" && media.processingStatus === "FAILED");

      const matchesSearch =
        !searchTerm ||
        media.caption?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        media.url.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === "ALL" || media.type === typeFilter;
      const mediaUploaderId = media.uploader?.id || media.uploadedBy?.id || media.uploaderId;
      const matchesUploader = uploaderFilter === "ALL" || 
        mediaUploaderId === uploaderFilter ||
        (uploaderFilter === "MY_MEDIA" && mediaUploaderId === user?.id);
      return matchesSearch && matchesType && matchesUploader && matchesStatus;
    }) || [];

  // When no filters are active, use backend data directly (backend pagination)
  // When filters are active, use filtered results (client-side filtering on current page only)
  const displayMedia = hasActiveFilters ? allFilteredMedia : (data?.data?.media || []);
  const totalPages = hasActiveFilters 
    ? Math.ceil(allFilteredMedia.length / limit) 
    : (data?.data?.meta.totalPages || 1);
  
  // For client-side pagination when filters are active
  const startIndex = hasActiveFilters ? (page - 1) * limit : 0;
  const endIndex = hasActiveFilters ? startIndex + limit : displayMedia.length;
  const filteredMedia = hasActiveFilters 
    ? allFilteredMedia.slice(startIndex, endIndex)
    : displayMedia;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  if (!data?.data?.media || data.data.media.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
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
        <h3 className="mt-2 text-sm font-medium text-gray-900">No media found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by uploading your first file.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Search and filter controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {/* Search input */}
        <div className="sm:col-span-2 lg:col-span-2 xl:col-span-2">
          <InputWithClear
            type="text"
            placeholder="Search by caption or filename..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1); // Reset to first page on search
            }}
            onClear={() => {
              setSearchTerm("");
              setPage(1);
            }}
            className="w-full"
          />
        </div>

        {/* Type filter */}
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value as typeof typeFilter);
            setPage(1); // Reset to first page on filter change
          }}
          className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Types</option>
          <option value="IMAGE">Images</option>
          <option value="VIDEO">Videos</option>
          <option value="DOCUMENT">Documents</option>
        </select>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1); // Reset to first page on filter change
          }}
          className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Status</option>
          <option value="APPROVED">Approved</option>
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          {!onSelect && <option value="FAILED">Failed (View Only)</option>}
        </select>

        {/* Uploader filter (only show if admin or multiple uploaders exist) */}
        {(isAdmin || uploaders.length > 1) && (
          <select
            value={uploaderFilter}
            onChange={(e) => {
              setUploaderFilter(e.target.value);
              setPage(1); // Reset to first page on filter change
            }}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Uploaders</option>
            {!isAdmin && user && (
              <option value="MY_MEDIA">My Media</option>
            )}
            {uploaders.map((uploader) => (
              <option key={uploader.id} value={uploader.id}>
                {uploader.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Results count */}
      {displayMedia.length > 0 && (
        <div className="text-sm text-gray-600">
          {hasActiveFilters ? (
            <>
              Showing {startIndex + 1} to {Math.min(endIndex, allFilteredMedia.length)} of {allFilteredMedia.length} media
              {searchTerm && ` matching "${searchTerm}"`}
            </>
          ) : (
            <>
              Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, data?.data?.meta.total || 0)} of {data?.data?.meta.total || 0} media
            </>
          )}
        </div>
      )}

      {/* Media grid */}
      {filteredMedia.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
            {filteredMedia.map((media) => {
              const mediaUploaderId = media.uploader?.id || media.uploadedBy?.id || media.uploaderId;
              const canDelete = isAdmin || (user && mediaUploaderId === user.id);
              
              return (
                <MediaItem
                  key={media.id}
                  media={media}
                  onSelect={onSelect}
                  onDelete={canDelete ? handleDelete : undefined}
                  isSelected={selectedMediaId === media.id}
                  showDelete={canDelete}
                />
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
              <div className="text-sm text-gray-700">
                Page {page} of {totalPages}
                {hasActiveFilters && allFilteredMedia.length > 0 && ` (${allFilteredMedia.length} filtered results)`}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
    </div>
  );
}

