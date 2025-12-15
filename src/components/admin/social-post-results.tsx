"use client";

import { SocialPostLog, SocialPlatform } from "@/types/social.types";
import { useLanguage } from "@/providers/LanguageProvider";

interface SocialPostResultsProps {
  results: SocialPostLog[];
  onClose: () => void;
}

export function SocialPostResults({
  results,
  onClose,
}: SocialPostResultsProps) {
  const { t, formatDateTime } = useLanguage();
  const successCount = results.filter((r) => r.status === "SUCCESS").length;
  const failureCount = results.filter((r) => r.status === "FAILED").length;
  const totalCount = results.length;

  const getPlatformIcon = (platform: SocialPlatform) => {
    if (platform === "FACEBOOK") {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    );
  };

  const getStatusColor = (status: string) => {
    return status === "SUCCESS" ? "text-green-600" : "text-red-600";
  };

  const getStatusBg = (status: string) => {
    return status === "SUCCESS" ? "bg-green-50" : "bg-red-50";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Social Posting Results
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium text-gray-900">Summary</h3>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-green-600 font-medium">
                  ✓ {successCount} Success{successCount !== 1 ? "es" : ""}
                </span>
                {failureCount > 0 && (
                  <span className="text-red-600 font-medium">
                    ✗ {failureCount} Failure{failureCount !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${(successCount / totalCount) * 100}%` }}
              />
            </div>
          </div>

          {/* Results List */}
          <div className="space-y-3">
            {results.map((result) => (
              <div
                key={result.id}
                className={`border rounded-lg p-4 ${getStatusBg(
                  result.status
                )}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`mt-1 ${getStatusColor(result.status)}`}>
                      {getPlatformIcon(result.platform)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 capitalize">
                          {result.platform}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            result.status === "SUCCESS"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {result.status}
                        </span>
                      </div>
                      {result.status === "SUCCESS" && result.message && (
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Post ID:</span>{" "}
                          {result.message}
                        </p>
                      )}
                      {result.status === "FAILED" && result.message && (
                        <p className="text-sm text-red-600 mt-1">
                          <span className="font-medium">Error:</span>{" "}
                          {result.message}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {t("admin.postedAt")}:{" "}
                        {formatDateTime(new Date(result.postedAt), {
                          dateFormat: "PP",
                          timeFormat: "p",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Help Text */}
          {failureCount > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Some posts failed. Please check your
                social media account connections and try again. Common issues
                include expired tokens or missing required content (e.g.,
                Instagram requires an image).
              </p>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
