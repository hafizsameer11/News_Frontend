"use client";

import { SocialPlatform } from "@/types/social.types";
import { API_CONFIG } from "@/lib/api/apiConfig";

interface SocialPostPreviewProps {
  title: string;
  summary: string;
  mainImage?: string;
  slug?: string;
  platforms: SocialPlatform[];
  onClose: () => void;
}

export function SocialPostPreview({
  title,
  summary,
  mainImage,
  slug,
  platforms,
  onClose,
}: SocialPostPreviewProps) {
  const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
  const articleUrl = slug ? `${frontendUrl}/news/${slug}` : "#";

  // Format post content as it will appear on social media
  const postMessage = `${title}\n\n${summary}\n\nRead more: ${articleUrl}`;

  // Get full image URL
  const getFullImageUrl = (url?: string): string | undefined => {
    if (!url) return undefined;
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    const baseUrl = API_CONFIG.BASE_URL.replace("/api/v1", "");
    return `${baseUrl}${url.startsWith("/") ? url : `/${url}`}`;
  };

  const imageUrl = getFullImageUrl(mainImage);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Social Post Preview</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Platforms Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900 mb-2">
              Posting to: {platforms.join(" and ")}
            </p>
            {platforms.includes("INSTAGRAM") && !imageUrl && (
              <p className="text-sm text-red-600 font-medium">
                ⚠️ Warning: Instagram requires an image. Please add a main image to post to Instagram.
              </p>
            )}
          </div>

          {/* Facebook Preview */}
          {platforms.includes("FACEBOOK") && (
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-300">
                <p className="text-sm font-medium text-gray-700">Facebook Preview</p>
              </div>
              <div className="bg-white p-4">
                {imageUrl && (
                  <div className="mb-4">
                    <img
                      src={imageUrl}
                      alt={title}
                      className="w-full h-auto rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{postMessage}</p>
                  {!imageUrl && (
                    <div className="mt-2 p-3 bg-gray-100 rounded border border-gray-300">
                      <p className="text-xs text-gray-500">Link Preview</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">{title}</p>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{summary}</p>
                      <p className="text-xs text-blue-600 mt-1">{articleUrl}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Instagram Preview */}
          {platforms.includes("INSTAGRAM") && (
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-300">
                <p className="text-sm font-medium text-gray-700">Instagram Preview</p>
              </div>
              <div className="bg-white">
                {imageUrl ? (
                  <div>
                    <img
                      src={imageUrl}
                      alt={title}
                      className="w-full aspect-square object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <div className="p-4 space-y-2">
                      <p className="text-sm font-medium text-gray-900">{title}</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{summary}</p>
                      <p className="text-xs text-blue-600">{articleUrl}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-red-600 mb-2">
                      Image Required
                    </p>
                    <p className="text-xs text-gray-600">
                      Instagram posts require an image. Please add a main image to your news article.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Post Content Details */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h3 className="text-sm font-medium text-gray-900">Post Details</h3>
            <div className="text-xs text-gray-600 space-y-1">
              <p><span className="font-medium">Title:</span> {title}</p>
              <p><span className="font-medium">Summary:</span> {summary.substring(0, 100)}{summary.length > 100 ? "..." : ""}</p>
              <p><span className="font-medium">Image:</span> {imageUrl ? "✓ Included" : "✗ Missing"}</p>
              <p><span className="font-medium">Link:</span> {articleUrl}</p>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}

