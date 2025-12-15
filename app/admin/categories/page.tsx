"use client";

import { useState, useMemo } from "react";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useUpdateCategoryOrder,
} from "@/lib/hooks/useCategories";
import { useToast } from "@/components/ui/toast";
import { CategoryDragList } from "@/components/admin/category-drag-list";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import { CategoryFormModal } from "@/components/admin/category-form-modal";
import { DeleteConfirmModal } from "@/components/admin/delete-confirm-modal";
import { ClearFilterButton } from "@/components/ui/clear-filter-button";
import { InputWithClear } from "@/components/ui/input-with-clear";
import { useLanguage } from "@/providers/LanguageProvider";
import { Category, CategoryResponse } from "@/types/category.types";
import { formatDate } from "@/lib/helpers/formatDate";
import { useQueryClient } from "@tanstack/react-query";
import {
  flattenCategories,
  getParentCategory,
  getRootCategories,
  getSubcategories,
  getCategoryBreadcrumb,
  getCategoryLevel,
  getCategoryPath,
} from "@/lib/helpers/category-helpers";

export default function AdminCategoriesPage() {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"hierarchical" | "flat">(
    "hierarchical"
  );
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null
  );
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const queryClient = useQueryClient();

  // Fetch categories - use flat=true for flat view
  const { data, isLoading, error } = useCategories(viewMode === "flat");

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  const updateOrderMutation = useUpdateCategoryOrder();
  const { showToast } = useToast();
  const { language, t } = useLanguage();

  const categories: Category[] =
    (data as CategoryResponse | undefined)?.data || [];

  // Flatten categories for filtering and operations (works with both hierarchical and flat data)
  const allCategoriesFlat = useMemo(() => {
    return flattenCategories(categories);
  }, [categories]);

  // Filter categories by search (on flattened array to include all subcategories)
  const filteredCategoriesFlat = useMemo(() => {
    if (!search) return allCategoriesFlat;
    const searchLower = search.toLowerCase();
    return allCategoriesFlat.filter(
      (cat) =>
        cat.nameEn.toLowerCase().includes(searchLower) ||
        cat.nameIt.toLowerCase().includes(searchLower) ||
        cat.slug.toLowerCase().includes(searchLower)
    );
  }, [allCategoriesFlat, search]);

  // Helper function to filter hierarchical structure by search
  const filterHierarchicalCategories = (cats: Category[]): Category[] => {
    if (!search) return cats;
    const searchLower = search.toLowerCase();
    return cats
      .map((cat) => {
        const matchesSearch =
          cat.nameEn.toLowerCase().includes(searchLower) ||
          cat.nameIt.toLowerCase().includes(searchLower) ||
          cat.slug.toLowerCase().includes(searchLower);

        // Recursively filter children
        const filteredChildren = cat.children
          ? filterHierarchicalCategories(cat.children)
          : [];

        // Include category if it matches or has matching children
        if (matchesSearch || filteredChildren.length > 0) {
          return {
            ...cat,
            children:
              filteredChildren.length > 0 ? filteredChildren : cat.children,
          };
        }
        return null;
      })
      .filter(
        (cat): cat is NonNullable<typeof cat> =>
          cat !== null && cat !== undefined
      ) as Category[];
  };

  // Get hierarchical categories (original structure) for hierarchical view
  const hierarchicalCategories = useMemo(() => {
    if (viewMode === "flat") return [];
    return filterHierarchicalCategories(categories);
  }, [categories, viewMode, search]);

  // Get root categories from filtered results
  const rootCategories = useMemo(() => {
    if (viewMode === "hierarchical") {
      return hierarchicalCategories.filter((cat) => !cat.parentId);
    }
    return getRootCategories(filteredCategoriesFlat);
  }, [filteredCategoriesFlat, hierarchicalCategories, viewMode]);

  // Helper to get children - works with both flat and hierarchical data
  const getChildren = (parentId: string, category?: Category): Category[] => {
    // If we have the category with children property (hierarchical view), use it
    if (category && category.children && Array.isArray(category.children)) {
      return category.children;
    }
    // Otherwise, use flattened array lookup
    return getSubcategories(parentId, filteredCategoriesFlat);
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsCreateModalOpen(true);
  };

  const handleDelete = (category: Category) => {
    setDeletingCategory(category);
  };

  const confirmDelete = () => {
    if (deletingCategory) {
      deleteMutation.mutate(deletingCategory.id, {
        onSuccess: () => {
          setDeletingCategory(null);
        },
      });
    }
  };

  const handleSubmit = (formData: any) => {
    if (editingCategory) {
      updateMutation.mutate(
        { id: editingCategory.id, data: formData },
        {
          onSuccess: () => {
            setIsCreateModalOpen(false);
            setEditingCategory(null);
          },
        }
      );
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => {
          setIsCreateModalOpen(false);
        },
      });
    }
  };

  const handleReorder = async (
    orderUpdates: Array<{ id: string; order: number }>
  ) => {
    setIsSavingOrder(true);
    updateOrderMutation.mutate(orderUpdates, {
      onSuccess: () => {
        showToast(t("toast.updated"), "success", 3000);
        // Don't exit reorder mode - let user continue reordering
      },
      onError: (error: any) => {
        const errorMessage =
          error?.message ||
          error?.response?.data?.message ||
          t("toast.actionFailed");
        showToast(errorMessage, "error");
      },
      onSettled: () => {
        setIsSavingOrder(false);
      },
    });
  };

  const renderCategoryRow = (category: Category, level: number = 0) => {
    const children = getChildren(category.id, category);
    const indent = level * 20; // 20px per level
    const categoryLevel = getCategoryLevel(category, allCategoriesFlat);
    const breadcrumb = category.parentId
      ? getCategoryBreadcrumb(category, allCategoriesFlat)
      : "";

    // Tree line indicators for hierarchical view
    const getTreeIndicator = (currentLevel: number) => {
      if (currentLevel === 0) return null;
      const lines = [];
      for (let i = 0; i < currentLevel; i++) {
        lines.push(
          <span key={i} className="inline-block w-5 text-gray-300 text-xs">
            {i === currentLevel - 1 ? "└─" : "│"}
          </span>
        );
      }
      return <div className="flex items-center">{lines}</div>;
    };

    return (
      <tr
        key={category.id}
        className="border-t hover:bg-gray-50 transition-colors"
      >
        <td className="px-4 py-3">
          <span className="text-gray-600 font-mono text-sm">
            {category.order}
          </span>
        </td>
        <td className="px-4 py-3">
          <div
            className="flex items-center gap-2"
            style={{ paddingLeft: `${indent}px` }}
          >
            {getTreeIndicator(level)}
            <span className="font-medium text-gray-900">{category.nameEn}</span>
          </div>
        </td>
        <td className="px-4 py-3 text-gray-600">{category.nameIt}</td>
        <td className="px-4 py-3">
          <code className="text-gray-600 font-mono text-sm bg-gray-50 px-2 py-1 rounded">
            {category.slug}
          </code>
        </td>
        <td className="px-4 py-3">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Level {categoryLevel}
          </span>
        </td>
        <td className="px-4 py-3 text-gray-600 text-sm">
          {breadcrumb ? (
            <span className="text-gray-600" title={breadcrumb}>
              {breadcrumb.length > 40
                ? `${breadcrumb.substring(0, 40)}...`
                : breadcrumb}
            </span>
          ) : (
            <span className="text-gray-400 italic">Root</span>
          )}
        </td>
        <td className="px-4 py-3 text-gray-600 text-sm">
          {formatDate(category.createdAt, "MMM dd, yyyy")}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleEdit(category)}
              className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium"
            >
              Edit
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => handleDelete(category)}
              className="text-red-600 hover:text-red-800 hover:underline text-sm font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
              disabled={children.length > 0}
              title={
                children.length > 0
                  ? "Cannot delete category with subcategories"
                  : ""
              }
            >
              Delete
            </button>
          </div>
        </td>
      </tr>
    );
  };

  const renderHierarchicalRows = (
    parentCategories: Category[]
  ): React.ReactElement[] => {
    const rows: React.ReactElement[] = [];

    // Helper function to recursively find category in hierarchical structure with all nested children (up to 4 levels)
    const findCategoryInOriginalHierarchy = (
      cats: Category[],
      id: string
    ): Category | null => {
      for (const cat of cats) {
        if (cat.id === id) return cat;
        if (
          cat.children &&
          Array.isArray(cat.children) &&
          cat.children.length > 0
        ) {
          const found = findCategoryInOriginalHierarchy(cat.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    // Recursively render category and all its nested children (supports 4 levels: 0, 1, 2, 3)
    const renderCategoryAndChildren = (
      category: Category,
      level: number = 0
    ) => {
      // Maximum depth is 3 (0-indexed, so level 3 is the 4th level)
      if (level > 3) return;

      rows.push(renderCategoryRow(category, level));

      // Get children - ALWAYS use hierarchical structure if available to preserve all nested children
      let children: Category[] = [];

      // First, try to get from the category's children property (hierarchical structure)
      if (
        category.children &&
        Array.isArray(category.children) &&
        category.children.length > 0
      ) {
        children = category.children;
      } else {
        // If category doesn't have children property, find it in original hierarchy
        const categoryWithChildren = findCategoryInOriginalHierarchy(
          categories,
          category.id
        );
        if (
          categoryWithChildren &&
          categoryWithChildren.children &&
          Array.isArray(categoryWithChildren.children)
        ) {
          children = categoryWithChildren.children;
        } else {
          // Last resort: use flat lookup
          children = getChildren(category.id, category);
        }
      }

      // Sort children by order for consistent display
      const sortedChildren = [...children].sort((a, b) => a.order - b.order);

      // Recursively render children (supports all 4 levels)
      sortedChildren.forEach((child) => {
        // Find the child in the original hierarchical structure to preserve ALL nested children
        const childWithAllChildren =
          findCategoryInOriginalHierarchy(categories, child.id) || child;
        renderCategoryAndChildren(childWithAllChildren, level + 1);
      });
    };

    // Sort root categories by order
    const sortedRootCategories = [...parentCategories].sort(
      (a, b) => a.order - b.order
    );
    sortedRootCategories.forEach((category) =>
      renderCategoryAndChildren(category, 0)
    );
    return rows;
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {t("admin.categoryManagement")}
        </h1>
        <div className="flex gap-2 flex-wrap">
          {!isReorderMode ? (
            <>
              <button
                onClick={() => setIsReorderMode(true)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition whitespace-nowrap"
              >
                {language === "it"
                  ? "Riordina Categorie"
                  : "Reorder Categories"}
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition whitespace-nowrap"
              >
                + {t("admin.createCategory")}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsReorderMode(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition whitespace-nowrap"
                disabled={isSavingOrder}
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={() => {
                  // Save will be triggered by drag end
                  setIsReorderMode(false);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                disabled={isSavingOrder}
              >
                {isSavingOrder
                  ? language === "it"
                    ? "Salvataggio..."
                    : "Saving..."
                  : language === "it"
                  ? "Fatto"
                  : "Done"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filters and View Toggle */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("admin.search")}
            </label>
            <InputWithClear
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch("")}
              placeholder={t("admin.search") + "..."}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("admin.viewMode")}
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("hierarchical")}
                className={`flex-1 px-3 py-2 rounded-md text-sm transition ${
                  viewMode === "hierarchical"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {t("admin.hierarchical")}
              </button>
              <button
                onClick={() => setViewMode("flat")}
                className={`flex-1 px-3 py-2 rounded-md text-sm transition ${
                  viewMode === "flat"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {t("admin.flat")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && <ErrorMessage error={error} className="mb-4" />}

      {/* Loading State */}
      {isLoading ? (
        <Loading />
      ) : (
        <>
          {isReorderMode ? (
            /* Drag and Drop Reorder Mode */
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {t("admin.reorderCategories")}
                </h2>
                <div className="flex items-start gap-2 text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <svg
                    className="w-5 h-5 text-blue-600 shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-900 mb-1">
                      {t("admin.dragAndDropHint")}
                    </p>
                    <p className="text-xs text-gray-600">
                      {t("admin.dragAndDropDescription")}
                    </p>
                  </div>
                </div>
              </div>
              {isSavingOrder && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2 text-sm text-blue-800">
                  <svg
                    className="animate-spin h-4 w-4"
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
                  {t("admin.saving")}
                </div>
              )}
              {filteredCategoriesFlat.length === 0 ? (
                <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
                  {t("admin.noCategoriesToReorder")}
                </div>
              ) : (
                <CategoryDragList
                  categories={filteredCategoriesFlat.sort(
                    (a, b) => a.order - b.order
                  )}
                  onReorder={handleReorder}
                />
              )}
            </div>
          ) : (
            /* Categories Table */
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {filteredCategoriesFlat.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  {search ? (
                    <>
                      No categories found matching &quot;{search}&quot;.{" "}
                      <button
                        onClick={() => setSearch("")}
                        className="text-blue-600 hover:underline"
                      >
                        Clear search
                      </button>
                    </>
                  ) : (
                    "No categories found. Create your first category!"
                  )}
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px]">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                            Order
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                            Name (EN)
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                            Name (IT)
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                            Slug
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                            Level
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                            Parent Path
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                            Created
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewMode === "hierarchical"
                          ? // Hierarchical view - show root categories and their children
                            renderHierarchicalRows(rootCategories)
                          : // Flat view - show all categories in order
                            filteredCategoriesFlat
                              .sort((a, b) => a.order - b.order)
                              .map((category) =>
                                renderCategoryRow(category, 0)
                              )}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary */}
                  <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                    <div className="text-sm text-gray-700">
                      Total: {allCategoriesFlat.length} categories
                      {rootCategories.length > 0 &&
                        ` (${rootCategories.length} root, ${
                          allCategoriesFlat.length - rootCategories.length
                        } subcategories)`}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      {isCreateModalOpen && (
        <CategoryFormModal
          category={editingCategory}
          categories={allCategoriesFlat}
          onSubmit={handleSubmit}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingCategory(null);
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
          error={createMutation.error || updateMutation.error}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingCategory && (
        <DeleteConfirmModal
          title="Delete Category"
          message={`Are you sure you want to delete "${
            deletingCategory.nameEn
          }"? This action cannot be undone.${
            getChildren(deletingCategory.id).length > 0
              ? " Note: This category has subcategories and cannot be deleted."
              : ""
          }`}
          onConfirm={
            getChildren(deletingCategory.id).length > 0
              ? () => setDeletingCategory(null)
              : confirmDelete
          }
          onCancel={() => setDeletingCategory(null)}
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
