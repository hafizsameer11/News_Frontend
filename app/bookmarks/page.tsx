"use client";

import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useBookmarks, useDeleteBookmark } from "@/lib/hooks/useBookmarks";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import { useLanguage } from "@/providers/LanguageProvider";
import Link from "next/link";
import { formatDate } from "@/lib/helpers/formatDate";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { bookmarksApi } from "@/lib/api/modules/bookmarks.api";

export default function BookmarksPage() {
  const { isAuthenticated } = useAuth();
  const [page, setPage] = useState(1);
  const limit = 12;
  const { language } = useLanguage();
  const deleteMutation = useDeleteBookmark();

  const { data, isLoading, error } = useBookmarks({ page, limit });

  const bookmarks = data?.data?.bookmarks || [];
  const pagination = data?.data?.pagination;

  const handleDelete = async (bookmarkId: string) => {
    if (
      confirm(
        language === "it"
          ? "Sei sicuro di voler rimuovere questo segnalibro?"
          : "Are you sure you want to remove this bookmark?"
      )
    ) {
      deleteMutation.mutate(bookmarkId);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full bg-white shadow rounded-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {language === "it" ? "I Miei Segnalibri" : "My Bookmarks"}
            </h1>
            <p className="text-gray-600 mb-6">
              {language === "it"
                ? "Devi essere autenticato per vedere i tuoi segnalibri"
                : "You must be logged in to view your bookmarks"}
            </p>
            <Link
              href="/login"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              {language === "it" ? "Accedi" : "Login"}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {language === "it" ? "I Miei Segnalibri" : "My Bookmarks"}
            </h1>
          </div>

          {error && <ErrorMessage error={error} />}

          {isLoading ? (
            <Loading />
          ) : bookmarks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">
                {language === "it"
                  ? "Non hai ancora salvato nessun articolo"
                  : "You haven't saved any articles yet"}
              </p>
              <Link
                href="/"
                className="text-red-600 hover:text-red-800"
              >
                {language === "it" ? "Esplora le notizie" : "Explore News"}
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookmarks.map((bookmark) => (
                  <div
                    key={bookmark.id}
                    className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition"
                  >
                    <Link href={`/news/${bookmark.news.slug}`}>
                      <div className="relative h-48">
                        {bookmark.news.mainImage ? (
                          <OptimizedImage
                            src={bookmark.news.mainImage}
                            alt={bookmark.news.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200"></div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                          {bookmark.news.title}
                        </h3>
                        {bookmark.news.summary && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {bookmark.news.summary}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>
                            {formatDate(bookmark.news.createdAt)}
                          </span>
                          <span>
                            {language === "it"
                              ? bookmark.news.category.nameIt
                              : bookmark.news.category.nameEn}
                          </span>
                        </div>
                      </div>
                    </Link>
                    <div className="px-4 pb-4">
                      <button
                        onClick={() => handleDelete(bookmark.id)}
                        disabled={deleteMutation.isPending}
                        className="w-full text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                      >
                        {language === "it" ? "Rimuovi" : "Remove"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    {language === "it"
                      ? `Mostrando ${(page - 1) * limit + 1} - ${Math.min(
                          page * limit,
                          pagination.total
                        )} di ${pagination.total}`
                      : `Showing ${(page - 1) * limit + 1} - ${Math.min(
                          page * limit,
                          pagination.total
                        )} of ${pagination.total}`}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {language === "it" ? "Precedente" : "Previous"}
                    </button>
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page >= pagination.totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {language === "it" ? "Successivo" : "Next"}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

