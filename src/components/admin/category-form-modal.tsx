"use client";

import { useState, useEffect, useMemo } from "react";
import { Category, CreateCategoryInput, UpdateCategoryInput } from "@/types/category.types";
import { slugify } from "@/lib/helpers/slugify";
import { ErrorMessage } from "@/components/ui/error-message";
import { 
  getDepthWithParent, 
  getCategoryPath, 
  getParentCategory,
  getCategoryLevel,
  flattenCategories
} from "@/lib/helpers/category-helpers";
import { useLanguage } from "@/providers/LanguageProvider";

interface CategoryFormModalProps {
  category?: Category | null;
  categories: Category[];
  onSubmit: (data: CreateCategoryInput | UpdateCategoryInput) => void;
  onClose: () => void;
  isLoading?: boolean;
  error?: any;
}

export function CategoryFormModal({
  category,
  categories,
  onSubmit,
  onClose,
  isLoading = false,
  error,
}: CategoryFormModalProps) {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    nameEn: "",
    nameIt: "",
    slug: "",
    description: "",
    parentId: "",
    order: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [autoGenerateSlug, setAutoGenerateSlug] = useState(true);
  const [autoOrder, setAutoOrder] = useState(true);
  const MAX_DEPTH = 3; // Maximum depth: 0=root, 1=child, 2=grandchild, 3=great-grandchild

  // Calculate depth if parent is selected
  const selectedParentDepth = useMemo(() => {
    if (!formData.parentId) return 0;
    return getDepthWithParent(formData.parentId, categories);
  }, [formData.parentId, categories]);

  // Get parent path for display
  const parentPath = useMemo(() => {
    if (!formData.parentId) return [];
    const parent = getParentCategory(formData.parentId, categories);
    if (!parent) return [];
    return getCategoryPath(parent, categories);
  }, [formData.parentId, categories]);

  // Calculate max order for selected parent (for auto-order)
  const maxOrderForParent = useMemo(() => {
    const flat = flattenCategories(categories);
    const siblings = flat.filter((cat) => 
      (cat.parentId || null) === (formData.parentId || null)
    );
    if (siblings.length === 0) return 0;
    return Math.max(...siblings.map((cat) => cat.order)) + 1;
  }, [formData.parentId, categories]);

  // Auto-calculate order when parent changes (if auto-order is enabled)
  useEffect(() => {
    if (autoOrder && !category) {
      setFormData((prev) => ({ ...prev, order: maxOrderForParent }));
    }
  }, [formData.parentId, maxOrderForParent, autoOrder, category]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Filter out current category and its children from parent options to prevent circular references
  // Since categories are now flattened, we can safely filter by parentId
  const availableParents = category
    ? categories.filter((cat) => {
        // Exclude the current category itself
        if (cat.id === category.id) return false;
        // Exclude categories that have the current category as parent (to prevent circular refs)
        if (cat.parentId === category.id) return false;
        return true;
      })
    : categories;

  useEffect(() => {
    if (category) {
      setFormData({
        nameEn: category.nameEn,
        nameIt: category.nameIt,
        slug: category.slug,
        description: category.description || "",
        parentId: category.parentId || "",
        order: category.order,
      });
      setAutoGenerateSlug(false);
      setAutoOrder(false); // Don't auto-order when editing
    } else {
      // Reset form for new category
      setFormData({
        nameEn: "",
        nameIt: "",
        slug: "",
        description: "",
        parentId: "",
        order: 0,
      });
      setAutoGenerateSlug(true);
      setAutoOrder(true);
    }
  }, [category]);

  const handleNameEnChange = (nameEn: string) => {
    setFormData({ ...formData, nameEn });
    if (autoGenerateSlug) {
      setFormData((prev) => ({ ...prev, nameEn, slug: slugify(nameEn) }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nameEn.trim()) {
      newErrors.nameEn = language === "it" ? "Il nome inglese è obbligatorio" : "English name is required";
    } else if (formData.nameEn.length < 2) {
      newErrors.nameEn = language === "it" ? "Il nome inglese deve essere di almeno 2 caratteri" : "English name must be at least 2 characters";
    }

    if (!formData.nameIt.trim()) {
      newErrors.nameIt = language === "it" ? "Il nome italiano è obbligatorio" : "Italian name is required";
    } else if (formData.nameIt.length < 2) {
      newErrors.nameIt = language === "it" ? "Il nome italiano deve essere di almeno 2 caratteri" : "Italian name must be at least 2 characters";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = language === "it" ? "Lo slug è obbligatorio" : "Slug is required";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = language === "it" ? "Lo slug deve essere minuscolo con solo trattini" : "Slug must be lowercase with hyphens only";
    }

    // Validate depth (max 4 levels total: 0, 1, 2, 3)
    // selectedParentDepth is the depth the NEW category would have (parent level + 1)
    // We allow up to level 3 (4th level), so selectedParentDepth can be at most 3
    if (selectedParentDepth > MAX_DEPTH) {
      newErrors.parentId = language === "it"
        ? `La profondità massima della categoria è ${MAX_DEPTH + 1} livelli. Il genitore selezionato creerebbe una categoria al livello ${selectedParentDepth + 1}, che supera il limite.`
        : `Maximum category depth is ${MAX_DEPTH + 1} levels. Selected parent would create a category at level ${selectedParentDepth + 1}, which exceeds the limit.`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const submitData: CreateCategoryInput | UpdateCategoryInput = {
        nameEn: formData.nameEn.trim(),
        nameIt: formData.nameIt.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim() || undefined,
      };

      // Only include order if manually set (not auto)
      if (!autoOrder || category) {
        submitData.order = formData.order;
      }

      // Only include parentId if it's set, otherwise set to null to make it a root category
      if (formData.parentId) {
        submitData.parentId = formData.parentId;
      } else if (category && category.parentId) {
        // If editing and removing parent, set to null
        submitData.parentId = null;
      }

      onSubmit(submitData);
    }
  };

  // Build hierarchical options for parent selector
  const buildParentOptions = (cats: Category[], level = 0, excludeId?: string): React.ReactElement[] => {
    const options: React.ReactElement[] = [];
    const rootCats = cats.filter((cat) => !cat.parentId && cat.id !== excludeId);
    
    const renderCategoryOption = (cat: Category, depth: number) => {
      if (cat.id === excludeId) return null;
      const indent = depth * 20;
      const catLevel = getCategoryLevel(cat, categories);
      
      options.push(
        <option key={cat.id} value={cat.id} style={{ paddingLeft: `${indent}px` }}>
          {" ".repeat(depth * 2)}
          {cat.nameEn} {catLevel > 0 && `(Level ${catLevel})`}
        </option>
      );
      
      // Recursively add children
      const children = cats.filter((c) => c.parentId === cat.id && c.id !== excludeId);
      children.forEach((child) => renderCategoryOption(child, depth + 1));
    };
    
    rootCats.forEach((cat) => renderCategoryOption(cat, 0));
    return options;
  };

  const parentOptions = useMemo(() => {
    const flat = flattenCategories(categories);
    return buildParentOptions(flat, 0, category?.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories, category?.id]);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && !isLoading && onClose()}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-gray-900">
            {category ? t("admin.editCategory") : t("admin.createCategory")}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl leading-none transition"
            disabled={isLoading}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {error && <ErrorMessage error={error} />}

            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                {language === "it" ? "Informazioni Base" : "Basic Information"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === "it" ? "Nome (Inglese)" : "Name (English)"} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nameEn}
                onChange={(e) => handleNameEnChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.nameEn ? "border-red-500" : "border-gray-300"
                }`}
                placeholder={language === "it" ? "Nome Categoria (EN)" : "Category Name (EN)"}
                disabled={isLoading}
              />
              {errors.nameEn && (
                <p className="mt-1 text-sm text-red-600">{errors.nameEn}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === "it" ? "Nome (Italiano)" : "Name (Italian)"} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nameIt}
                onChange={(e) =>
                  setFormData({ ...formData, nameIt: e.target.value })
                }
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.nameIt ? "border-red-500" : "border-gray-300"
                }`}
                placeholder={language === "it" ? "Nome Categoria (IT)" : "Category Name (IT)"}
                disabled={isLoading}
              />
              {errors.nameIt && (
                <p className="mt-1 text-sm text-red-600">{errors.nameIt}</p>
              )}
            </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === "it" ? "Slug" : "Slug"} <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-3 mb-2">
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoGenerateSlug}
                        onChange={(e) => setAutoGenerateSlug(e.target.checked)}
                        disabled={isLoading}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="font-medium">{language === "it" ? "Genera automaticamente" : "Auto-generate"}</span>
                    </label>
                    {autoGenerateSlug && formData.nameEn && (
                      <span className="text-xs text-gray-500">
                        {language === "it" ? "Anteprima" : "Preview"}: <code className="bg-gray-100 px-2 py-0.5 rounded">{slugify(formData.nameEn)}</code>
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: slugify(e.target.value) })
                    }
                    disabled={autoGenerateSlug || isLoading}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.slug ? "border-red-500" : "border-gray-300"
                    } ${autoGenerateSlug ? "bg-gray-100 cursor-not-allowed" : ""}`}
                    placeholder="category-slug"
                  />
                  {errors.slug && (
                    <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === "it" ? "Descrizione" : "Description"}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={language === "it" ? "Descrizione categoria (opzionale)" : "Category description (optional)"}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Hierarchy Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                {language === "it" ? "Gerarchia" : "Hierarchy"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === "it" ? "Categoria Genitore" : "Parent Category"}
                    {formData.parentId && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {language === "it" ? "Livello" : "Level"} {selectedParentDepth + 1} / {MAX_DEPTH + 1}
                      </span>
                    )}
                  </label>
                  <select
                    value={formData.parentId}
                    onChange={(e) =>
                      setFormData({ ...formData, parentId: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.parentId ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={isLoading}
                  >
                    <option value="">{language === "it" ? "Nessuna (Categoria Radice)" : "None (Root Category)"}</option>
                    {parentOptions}
                  </select>
                  {errors.parentId && (
                    <p className="mt-1 text-sm text-red-600">{errors.parentId}</p>
                  )}
                  {formData.parentId && parentPath.length > 0 && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                      <strong>{language === "it" ? "Percorso" : "Path"}:</strong> {parentPath.map((p) => p.nameEn).join(" > ")}
                    </div>
                  )}
                  {selectedParentDepth > MAX_DEPTH && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                      ⚠ {language === "it" 
                        ? `La profondità massima è ${MAX_DEPTH + 1} livelli. Il genitore selezionato creerebbe una categoria al livello ${selectedParentDepth + 1}, che supera il limite.`
                        : `Maximum depth is ${MAX_DEPTH + 1} levels. Selected parent would create a category at level ${selectedParentDepth + 1}, which exceeds the limit.`
                      }
                    </div>
                  )}
                  {!errors.parentId && selectedParentDepth < MAX_DEPTH && (
                    <p className="mt-1 text-xs text-gray-500">
                      {language === "it" 
                        ? `Seleziona una categoria genitore per creare una sottocategoria (max ${MAX_DEPTH + 1} livelli)`
                        : `Select a parent category to create a subcategory (max ${MAX_DEPTH + 1} levels)`
                      }
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === "it" ? "Ordine" : "Order"}
                  </label>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoOrder}
                        onChange={(e) => setAutoOrder(e.target.checked)}
                        disabled={isLoading || !!category}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="font-medium">{language === "it" ? "Automatico" : "Auto"}</span>
                    </label>
                    {autoOrder && (
                      <span className="text-xs text-gray-500">
                        {language === "it" ? "Prossimo ordine" : "Next order"}: <strong>{maxOrderForParent}</strong>
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => {
                      setFormData({ ...formData, order: parseInt(e.target.value) || 0 });
                      setAutoOrder(false);
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      autoOrder ? "bg-gray-100" : ""
                    }`}
                    placeholder="0"
                    min="0"
                    disabled={isLoading || (autoOrder && !category)}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {language === "it" ? "Ordine di visualizzazione (i numeri più bassi appaiono per primi)" : "Display order (lower numbers appear first)"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition font-medium"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition font-medium shadow-sm"
            >
              {isLoading ? (
                <>
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
                  {category 
                    ? (language === "it" ? "Aggiornamento..." : "Updating...")
                    : (language === "it" ? "Creazione..." : "Creating...")
                  }
                </>
              ) : (
                <>{category ? t("admin.updateCategory") : t("admin.createCategory")}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

