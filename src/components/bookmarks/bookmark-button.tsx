"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useCheckBookmark, useCreateBookmark, useDeleteBookmark } from "@/lib/hooks/useBookmarks";
import { bookmarksApi } from "@/lib/api/modules/bookmarks.api";
import { useLanguage } from "@/providers/LanguageProvider";
import { useRouter } from "next/navigation";

interface BookmarkButtonProps {
  newsId: string;
  className?: string;
}

export function BookmarkButton({ newsId, className = "" }: BookmarkButtonProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { language } = useLanguage();
  const [isToggling, setIsToggling] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure client-side only rendering to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data: checkData, refetch } = useCheckBookmark(newsId, isAuthenticated && isMounted);
  const isBookmarked = checkData?.data?.isBookmarked ?? false;

  const createMutation = useCreateBookmark();
  const deleteMutation = useDeleteBookmark();

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    setIsToggling(true);

    try {
      if (isBookmarked) {
        // Get bookmarks to find the bookmark ID
        const response = await bookmarksApi.getAll({ limit: 100 });
        const bookmark = response.data?.bookmarks?.find(
          (b) => b.newsId === newsId
        );
        if (bookmark) {
          await deleteMutation.mutateAsync(bookmark.id);
        }
      } else {
        await createMutation.mutateAsync(newsId);
      }
      await refetch();
    } catch (error) {
      console.error("Failed to toggle bookmark:", error);
    } finally {
      setIsToggling(false);
    }
  };

  // Render consistent button structure on server and client to avoid hydration mismatch
  // Only change className and title after mount
  const buttonClassName = !isMounted
    ? `${className} text-gray-400 hover:text-red-600 transition`
    : !isAuthenticated
    ? `${className} text-gray-400 hover:text-red-600 transition`
    : `${className} ${
        isBookmarked ? "text-red-600" : "text-gray-400 hover:text-red-600"
      } transition disabled:opacity-50`;

  const buttonTitle = !isMounted
    ? language === "it" ? "Accedi per salvare" : "Login to save"
    : !isAuthenticated
    ? language === "it" ? "Accedi per salvare" : "Login to save"
    : isBookmarked
    ? language === "it"
      ? "Rimuovi dai segnalibri"
      : "Remove from bookmarks"
    : language === "it"
    ? "Salva nei segnalibri"
    : "Save to bookmarks";

  const svgFill = !isMounted ? "none" : isAuthenticated && isBookmarked ? "currentColor" : "none";

  return (
    <button
      onClick={handleClick}
      disabled={isMounted && isAuthenticated && (isToggling || createMutation.isPending || deleteMutation.isPending)}
      className={buttonClassName}
      title={buttonTitle}
    >
      <svg
        className="w-5 h-5"
        fill={svgFill}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        />
      </svg>
    </button>
  );
}

