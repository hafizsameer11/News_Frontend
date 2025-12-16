"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { useGetMe } from "@/lib/hooks/useAuth";
import { AuthResponse } from "@/types/user.types";
import {
  useNews,
  useCreateNews,
  useUpdateNews,
  useDeleteNews,
} from "@/lib/hooks/useNews";
import { useCategories } from "@/lib/hooks/useCategories";
import { CategoryResponse } from "@/types/category.types";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import { NewsFormModal } from "@/components/admin/news-form-modal";
import { DeleteConfirmModal } from "@/components/admin/delete-confirm-modal";
import { News, CreateNewsInput, UpdateNewsInput, NewsResponse } from "@/types/news.types";
import { formatDate } from "@/lib/helpers/formatDate";
import { useLanguage } from "@/providers/LanguageProvider";
import { InputWithClear } from "@/components/ui/input-with-clear";
import Link from "next/link";

type NewsStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "PUBLISHED"
  | "ARCHIVED"
  | "REJECTED";

function EditorNewsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: authUser, isAuthenticated } = useAuth();
  const { data: userData, isLoading: userLoading } = useGetMe(isAuthenticated);
  const { language, t } = useLanguage();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [deletingNews, setDeletingNews] = useState<News | null>(null);

  // Get current user with allowed categories
  const currentUser = (userData as AuthResponse | undefined)?.data?.user || authUser;

  const allowedCategoryIds = useMemo(
    () => currentUser?.allowedCategories?.map((cat: any) => cat.id) || [],
    [currentUser?.allowedCategories]
  );

  // Check if create modal should be open from URL
  useEffect(() => {
    if (searchParams.get("create") === "true") {
      // Use setTimeout to defer state update
      const timer = setTimeout(() => {
        setIsCreateModalOpen(true);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const limit = 10;

  // Fetch news - get all news for editor (all statuses), then filter client-side
  // We need to fetch without status filter to get DRAFT, PENDING_REVIEW, etc.
  // Backend defaults to PUBLISHED if no status, so we need to explicitly request all statuses
  // For editors, we'll fetch multiple times for different statuses, or use a workaround
  const { data, isLoading, error, refetch } = useNews({
    page: 1,
    limit: 500,
    // Don't pass status - but backend will default to PUBLISHED
    // We need to fetch all statuses, so we'll make multiple requests
  });

  // Fetch news with different statuses to get all editor's news
  const { data: draftData } = useNews({
    page: 1,
    limit: 500,
    status: "DRAFT",
  });
  const { data: pendingData } = useNews({
    page: 1,
    limit: 500,
    status: "PENDING_REVIEW",
  });
  const { data: rejectedData } = useNews({
    page: 1,
    limit: 500,
    status: "REJECTED",
  });
  const { data: archivedData } = useNews({
    page: 1,
    limit: 500,
    status: "ARCHIVED",
  });

  // Fetch all categories but filter to show only allowed ones
  const { data: categoriesData } = useCategories(true);
  const categoriesList = (categoriesData as CategoryResponse | undefined)?.data || [];
  const allowedCategories =
    categoriesList.filter((cat) =>
      allowedCategoryIds.includes(cat.id)
    );

  const createMutation = useCreateNews();
  const updateMutation = useUpdateNews();
  const deleteMutation = useDeleteNews();

  // Refetch news after mutations
  useEffect(() => {
    if (
      createMutation.isSuccess ||
      updateMutation.isSuccess ||
      deleteMutation.isSuccess
    ) {
      refetch();
    }
  }, [
    createMutation.isSuccess,
    updateMutation.isSuccess,
    deleteMutation.isSuccess,
    refetch,
  ]);

  // Combine news from all status queries
  const allNews = useMemo(() => {
    const publishedNews = (data as NewsResponse | undefined)?.data?.news || [];
    const draftNews = (draftData as NewsResponse | undefined)?.data?.news || [];
    const pendingNews = (pendingData as NewsResponse | undefined)?.data?.news || [];
    const rejectedNews = (rejectedData as NewsResponse | undefined)?.data?.news || [];
    const archivedNews = (archivedData as NewsResponse | undefined)?.data?.news || [];

    // Combine and deduplicate by ID
    const combined = [
      ...publishedNews,
      ...draftNews,
      ...pendingNews,
      ...rejectedNews,
      ...archivedNews,
    ];

    // Remove duplicates based on ID
    const uniqueNews = combined.filter(
      (news, index, self) => index === self.findIndex((n) => n.id === news.id)
    );

    return uniqueNews;
  }, [
    data,
    draftData,
    pendingData,
    rejectedData,
    archivedData,
  ]);
  const userNews = useMemo(() => {
    if (!currentUser?.id) return [];
    if (!allNews.length) return [];

    return allNews.filter((news) => {
      // Convert both to strings for comparison to handle UUID string comparison issues
      const newsAuthorId = String(news.authorId || "");
      const userId = String(currentUser.id || "");
      const matchesAuthor = newsAuthorId === userId;

      const matchesCategory =
        allowedCategoryIds.length === 0 ||
        allowedCategoryIds.includes(news.categoryId);

      return matchesAuthor && matchesCategory;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allNews, currentUser?.id, allowedCategoryIds]);

  // Apply additional filters (search, status, category)
  const filteredNews = useMemo(() => {
    let filtered = [...userNews]; // Create a copy to avoid mutating

    // Client-side search filter
    if (search && search.trim()) {
      const searchLower = search.toLowerCase().trim();
      filtered = filtered.filter(
        (news) =>
          news.title?.toLowerCase().includes(searchLower) ||
          news.summary?.toLowerCase().includes(searchLower)
      );
    }

    // Client-side status filter
    if (statusFilter && statusFilter.trim()) {
      filtered = filtered.filter((news) => news.status === statusFilter);
    }

    // Client-side category filter
    if (categoryFilter && categoryFilter.trim()) {
      filtered = filtered.filter((news) => news.categoryId === categoryFilter);
    }

    return filtered;
  }, [userNews, search, statusFilter, categoryFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredNews.length / limit);
  const paginatedNews = filteredNews.slice((page - 1) * limit, page * limit);

  useEffect(() => {
    if (
      !userLoading &&
      (!isAuthenticated || (currentUser && currentUser.role !== "EDITOR"))
    ) {
      router.push("/admin-login");
    }
  }, [isAuthenticated, currentUser, userLoading, router]);

  // Show loading only if main query is loading (other queries can load in background)
  if (userLoading || isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated || currentUser?.role !== "EDITOR") {
    return null; // Will redirect
  }

  const handleCreate = () => {
    setEditingNews(null);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (news: News) => {
    setEditingNews(news);
    setIsCreateModalOpen(true);
  };

  const handleDelete = (news: News) => {
    setDeletingNews(news);
  };

  const confirmDelete = () => {
    if (deletingNews) {
      deleteMutation.mutate(deletingNews.id, {
        onSuccess: () => {
          setDeletingNews(null);
          refetch(); // Refetch news after deletion
        },
      });
    }
  };

  const handleSubmit = (formData: CreateNewsInput | UpdateNewsInput) => {
    // Ensure category is in allowed categories
    if (
      formData.categoryId &&
      !allowedCategoryIds.includes(formData.categoryId)
    ) {
      alert(
        language === "it"
          ? "Non hai il permesso di pubblicare in questa categoria"
          : "You don't have permission to post in this category"
      );
      return;
    }

    if (editingNews) {
      updateMutation.mutate(
        { id: editingNews.id, data: formData },
        {
          onSuccess: () => {
            setIsCreateModalOpen(false);
            setEditingNews(null);
            refetch(); // Refetch news after update
          },
        }
      );
    } else {
      createMutation.mutate(formData as CreateNewsInput, {
        onSuccess: () => {
          setIsCreateModalOpen(false);
          refetch(); // Refetch news after creation
        },
      });
    }
  };

  const getStatusLabel = (status: string) => {
    if (status === "PUBLISHED") return t("admin.published");
    if (status === "PENDING_REVIEW") return t("admin.pendingReview");
    if (status === "REJECTED") return t("admin.rejected");
    if (status === "DRAFT") return t("admin.draft");
    if (status === "ARCHIVED") return t("admin.archived");
    return status;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t("editor.news")}</h1>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          disabled={allowedCategories.length === 0}
        >
          + {t("admin.createNews")}
        </button>
      </div>

      {allowedCategories.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center mb-6">
          <p className="text-yellow-800">{t("editor.noCategoriesAssigned")}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("admin.search")}
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={t("admin.search") + "..."}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("admin.status")}
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t("admin.allStatus")}</option>
              <option value="DRAFT">{t("admin.draft")}</option>
              <option value="PENDING_REVIEW">{t("admin.pendingReview")}</option>
              <option value="PUBLISHED">{t("admin.published")}</option>
              <option value="REJECTED">{t("admin.rejected")}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("admin.category")}
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t("admin.allCategories")}</option>
              {allowedCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {language === "it" ? cat.nameIt : cat.nameEn}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* News List */}
      {error && (
        <div className="mb-6">
          <ErrorMessage error={error} />
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {paginatedNews.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {t("editor.noNewsAvailable")}
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    {t("admin.title")}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    {t("admin.category")}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    {t("admin.status")}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    {t("admin.created")}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    {t("admin.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedNews.map((news) => (
                  <tr key={news.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {news.title}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {language === "it"
                        ? news.category?.nameIt
                        : news.category?.nameEn || "N/A"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          news.status === "PUBLISHED"
                            ? "bg-green-100 text-green-800"
                            : news.status === "PENDING_REVIEW"
                            ? "bg-yellow-100 text-yellow-800"
                            : news.status === "REJECTED"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {getStatusLabel(news.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(news.createdAt, "MMM dd, yyyy")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(news)}
                          className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
                        >
                          {t("common.edit")}
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => handleDelete(news)}
                          className="text-red-600 hover:text-red-800 hover:underline text-sm"
                        >
                          {t("common.delete")}
                        </button>
                        <span className="text-gray-300">|</span>
                        <Link
                          href={`/news/${news.slug || news.id}`}
                          target="_blank"
                          className="text-green-600 hover:text-green-800 hover:underline text-sm"
                        >
                          {language === "it" ? "Visualizza" : "View"}
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  {t("search.page")} {page} {t("common.of")} {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {language === "it" ? "Precedente" : "Previous"}
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {language === "it" ? "Successivo" : "Next"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isCreateModalOpen && (
        <NewsFormModal
          news={editingNews}
          categories={allowedCategories}
          onSubmit={handleSubmit}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingNews(null);
            // Remove create param from URL
            router.replace("/editor/news");
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
          error={createMutation.error || updateMutation.error}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingNews && (
        <DeleteConfirmModal
          title={language === "it" ? "Elimina Notizia" : "Delete News"}
          message={
            language === "it"
              ? `Sei sicuro di voler eliminare "${deletingNews.title}"? Questa azione non può essere annullata.`
              : `Are you sure you want to delete "${deletingNews.title}"? This action cannot be undone.`
          }
          onConfirm={confirmDelete}
          onCancel={() => setDeletingNews(null)}
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  );
}

export default function EditorNewsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading />
      </div>
    }>
      <EditorNewsPageContent />
    </Suspense>
  );
}
