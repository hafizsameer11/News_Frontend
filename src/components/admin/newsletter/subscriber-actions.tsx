"use client";

import { useState } from "react";
import { NewsletterSubscriber } from "@/types/newsletter.types";
import { DeleteConfirmModal } from "../delete-confirm-modal";
import { useToast } from "@/components/ui/toast";

interface SubscriberActionsProps {
  subscriber: NewsletterSubscriber;
  onToggleStatus?: (id: string, newStatus: boolean) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onRefresh?: () => void;
}

export function SubscriberActions({
  subscriber,
  onToggleStatus,
  onDelete,
  onRefresh,
}: SubscriberActionsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useToast();

  const handleToggleStatus = async () => {
    if (!onToggleStatus) {
      showToast("Toggle status functionality is not available.", "warning");
      return;
    }

    setIsToggling(true);
    try {
      await onToggleStatus(subscriber.id, !subscriber.isActive);
      showToast(
        `Subscriber ${!subscriber.isActive ? "activated" : "deactivated"} successfully`,
        "success"
      );
      onRefresh?.();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to update subscriber status";
      showToast(errorMessage, "error");
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) {
      showToast("Delete functionality is not available.", "warning");
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(subscriber.id);
      showToast("Subscriber deleted successfully", "success");
      setShowDeleteConfirm(false);
      onRefresh?.();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to delete subscriber";
      showToast(errorMessage, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Toggle Status Button */}
        <button
          onClick={handleToggleStatus}
          disabled={isToggling || isDeleting}
          className={`px-3 py-1 rounded text-xs font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${
            subscriber.isActive
              ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
              : "bg-green-100 text-green-800 hover:bg-green-200"
          }`}
          title={subscriber.isActive ? "Deactivate subscriber" : "Activate subscriber"}
        >
          {isToggling ? (
            <svg
              className="animate-spin h-3 w-3 inline"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : subscriber.isActive ? (
            "Deactivate"
          ) : (
            "Activate"
          )}
        </button>

        {/* Delete Button */}
        <button
          onClick={() => setShowDeleteConfirm(true)}
          disabled={isToggling || isDeleting}
          className="px-3 py-1 bg-red-100 text-red-800 rounded text-xs font-medium hover:bg-red-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
          title="Delete subscriber"
        >
          Delete
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <DeleteConfirmModal
          title="Delete Subscriber"
          message={`Are you sure you want to delete ${subscriber.email}? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
          isLoading={isDeleting}
        />
      )}
    </>
  );
}

