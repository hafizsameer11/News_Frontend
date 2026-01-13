"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { News, CreateNewsInput } from "@/types/news.types";
import { Category } from "@/types/category.types";
import { Media } from "@/types/media.types";
import { slugify } from "@/lib/helpers/slugify";
import { ErrorMessage } from "@/components/ui/error-message";
import { NewsPreviewModal } from "./news-preview-modal";
import { getImageUrl, normalizeImageUrl } from "@/lib/helpers/imageUrl";
import { useSocialAccounts } from "@/lib/hooks/useSocial";
import { SocialPostPreview } from "./social-post-preview";
import { SocialPlatform } from "@/types/social.types";
import { useLanguage } from "@/providers/LanguageProvider";
import {
  flattenCategories,
  getCategoryLevel,
  getCategoryBreadcrumb,
  getCategoryPath,
  getParentCategory,
} from "@/lib/helpers/category-helpers";

// Lazy load heavy components
const RichTextEditor = dynamic(
  () =>
    import("./rich-text-editor").then((mod) => ({
      default: mod.RichTextEditor,
    })),
  {
    loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded" />,
    ssr: false,
  }
);

const MediaLibraryModal = dynamic(
  () =>
    import("./media-library-modal").then((mod) => ({
      default: mod.MediaLibraryModal,
    })),
  {
    ssr: false,
  }
);

interface NewsFormModalProps {
  news?: News | null;
  categories: Category[];
  onSubmit: (data: CreateNewsInput) => void;
  onClose: () => void;
  isLoading?: boolean;
  error?: any;
  onSocialPost?: (
    newsId: string,
    platforms: SocialPlatform[],
    scheduledFor?: string
  ) => void;
}

export function NewsFormModal({
  news,
  categories,
  onSubmit,
  onClose,
  isLoading = false,
  error,
  onSocialPost,
}: NewsFormModalProps) {
  const initialFormData = useMemo<CreateNewsInput>(() => {
    if (news) {
      return {
        title: news.title,
        slug: news.slug,
        summary: news.summary,
        content: news.content,
        categoryId: news.categoryId,
        status: news.status as "DRAFT" | "PENDING_REVIEW" | "PUBLISHED",
        isBreaking: news.isBreaking,
        isFeatured: news.isFeatured,
        isTG: news.isTG,
        mainImage: news.mainImage || "",
        tags: "",
        scheduledFor: (news as any).scheduledFor,
        publishedAt: news.publishedAt,
      };
    }
    return {
      title: "",
      slug: "",
      summary: "",
      content: "",
      categoryId: "",
      status: "DRAFT",
      isBreaking: false,
      isFeatured: false,
      isTG: false,
      mainImage: "",
      tags: "",
      scheduledFor: undefined,
      publishedAt: undefined,
    };
  }, [news]);

  const initialScheduledDate = useMemo<Date | null>(() => {
    if (news && (news as any).scheduledFor) {
      return new Date((news as any).scheduledFor);
    }
    return null;
  }, [news]);

  const initialPublishedDate = useMemo<Date | null>(() => {
    if (news && news.publishedAt) {
      return new Date(news.publishedAt);
    }
    return null;
  }, [news]);

  const [formData, setFormData] = useState<CreateNewsInput>(initialFormData);
  const [scheduledDate, setScheduledDate] = useState<Date | null>(initialScheduledDate);
  const [publishedDate, setPublishedDate] = useState<Date | null>(initialPublishedDate);
  const { t, language, formatDateTime } = useLanguage();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [autoGenerateSlug, setAutoGenerateSlug] = useState(!news);
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [postToSocial, setPostToSocial] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>([
    "FACEBOOK",
    "INSTAGRAM",
  ]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSocialPreviewOpen, setIsSocialPreviewOpen] = useState(false);
  const [socialScheduledDate, setSocialScheduledDate] = useState<Date | null>(
    null
  );

  // Fetch connected social accounts
  const { data: socialAccountsData, isLoading: isLoadingAccounts, error: accountsError, refetch: refetchAccounts } = useSocialAccounts();
  const connectedAccounts = Array.isArray(socialAccountsData?.accounts) ? socialAccountsData.accounts : [];
  const facebookAccount = connectedAccounts.find(
    (acc) => acc.platform === "FACEBOOK" && acc.isActive
  );
  const instagramAccount = connectedAccounts.find(
    (acc) => acc.platform === "INSTAGRAM" && acc.isActive
  );
  const hasConnectedAccounts = connectedAccounts.length > 0 && connectedAccounts.some((acc) => acc.isActive);
  
  // Refetch accounts when modal opens
  useEffect(() => {
    refetchAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only on mount
  
  // Debug logging (remove in production)
  useEffect(() => {
    if (socialAccountsData !== undefined) {
      console.log("Social accounts data:", socialAccountsData);
      console.log("Connected accounts:", connectedAccounts);
      console.log("Has connected accounts:", hasConnectedAccounts);
      console.log("Facebook account:", facebookAccount);
      console.log("Instagram account:", instagramAccount);
    }
    if (accountsError) {
      console.error("Error loading social accounts:", accountsError);
    }
  }, [socialAccountsData, connectedAccounts, hasConnectedAccounts, accountsError, facebookAccount, instagramAccount]);

  // Reset form when news changes - use key prop pattern by resetting when dependencies change
  useEffect(() => {
    // Use setTimeout to defer state updates
    const timer = setTimeout(() => {
      setFormData((prev) => {
        if (JSON.stringify(prev) !== JSON.stringify(initialFormData)) {
          return initialFormData;
        }
        return prev;
      });
      setScheduledDate(initialScheduledDate);
      setAutoGenerateSlug(!news);
    }, 0);
    return () => clearTimeout(timer);
  }, [initialFormData, initialScheduledDate, news]);

  const handleTitleChange = (title: string) => {
    setFormData({ ...formData, title });
    if (autoGenerateSlug) {
      setFormData((prev) => ({ ...prev, title, slug: slugify(title) }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title =
        language === "it" ? "Il titolo è obbligatorio" : "Title is required";
    } else if (formData.title.length < 5) {
      newErrors.title =
        language === "it"
          ? "Il titolo deve essere di almeno 5 caratteri"
          : "Title must be at least 5 characters";
    }

    if (!formData.slug.trim()) {
      newErrors.slug =
        language === "it" ? "Lo slug è obbligatorio" : "Slug is required";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug =
        language === "it"
          ? "Lo slug deve essere minuscolo con solo trattini"
          : "Slug must be lowercase with hyphens only";
    }

    if (!formData.summary.trim()) {
      newErrors.summary =
        language === "it"
          ? "Il riassunto è obbligatorio"
          : "Summary is required";
    } else if (formData.summary.length < 10) {
      newErrors.summary =
        language === "it"
          ? "Il riassunto deve essere di almeno 10 caratteri"
          : "Summary must be at least 10 characters";
    }

    if (!formData.content.trim()) {
      newErrors.content =
        language === "it"
          ? "Il contenuto è obbligatorio"
          : "Content is required";
    } else {
      // Remove HTML tags for length validation
      const textContent = formData.content.replace(/<[^>]*>/g, "").trim();
      if (textContent.length < 20) {
        newErrors.content =
          language === "it"
            ? "Il contenuto deve essere di almeno 20 caratteri"
            : "Content must be at least 20 characters";
      }
    }

    if (!formData.categoryId) {
      newErrors.categoryId =
        language === "it"
          ? "La categoria è obbligatoria"
          : "Category is required";
    }

    // Social posting validation
    if (postToSocial && onSocialPost) {
      if (selectedPlatforms.length === 0) {
        newErrors.socialPlatforms =
          language === "it"
            ? "Seleziona almeno una piattaforma"
            : "Please select at least one platform";
      }
      if (selectedPlatforms.includes("INSTAGRAM") && !formData.mainImage) {
        newErrors.socialInstagram =
          language === "it"
            ? "Instagram richiede un'immagine. Aggiungi un'immagine principale."
            : "Instagram requires an image. Please add a main image.";
      }
      if (socialScheduledDate && socialScheduledDate <= new Date()) {
        newErrors.socialScheduled =
          language === "it"
            ? "L'orario di pubblicazione programmata deve essere nel futuro"
            : "Scheduled posting time must be in the future";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Normalize mainImage URL before submitting to prevent duplicates
      const normalizedMainImage = formData.mainImage ? normalizeImageUrl(formData.mainImage) : "";
      
      // Convert scheduled date and published date to ISO string if set
      const submitData: any = {
        ...formData,
        mainImage: normalizedMainImage,
        scheduledFor: scheduledDate ? scheduledDate.toISOString() : undefined,
        publishedAt: publishedDate ? publishedDate.toISOString() : undefined,
      };

      // Include social media platforms if posting to social and status is PUBLISHED
      if (postToSocial && selectedPlatforms.length > 0 && formData.status === "PUBLISHED") {
        submitData.socialMediaPlatforms = selectedPlatforms;
      }

      // Also call the callback for backward compatibility (if parent component handles it separately)
      if (onSocialPost && postToSocial && selectedPlatforms.length > 0) {
        onSocialPost(
          "", // newsId will be available after creation/update
          selectedPlatforms,
          socialScheduledDate ? socialScheduledDate.toISOString() : undefined
        );
      }
      onSubmit(submitData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            {news ? t("admin.editNews") : t("admin.createNews")}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPreviewOpen(true)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm flex items-center gap-2"
              disabled={isLoading || !formData.title}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              {t("common.view")}
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
              disabled={isLoading}
              title={t("common.close")}
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && <ErrorMessage error={error} />}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("admin.title")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? "border-red-500" : "border-gray-300"
                }`}
                placeholder={
                  language === "it"
                    ? "Inserisci il titolo della notizia"
                    : "Enter news title"
                }
                disabled={isLoading}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  {t("admin.slug")} <span className="text-red-500">*</span>
                </label>
                <label className="flex items-center gap-1 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={autoGenerateSlug}
                    onChange={(e) => setAutoGenerateSlug(e.target.checked)}
                    disabled={isLoading}
                  />
                  {language === "it"
                    ? "Genera automaticamente"
                    : "Auto-generate"}
                </label>
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
                } ${autoGenerateSlug ? "bg-gray-100" : ""}`}
                placeholder="news-slug"
              />
              {errors.slug && (
                <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("admin.category")} <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: e.target.value })
                }
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                  errors.categoryId ? "border-red-500" : "border-gray-300"
                }`}
                disabled={isLoading}
              >
                <option value="">
                  {language === "it"
                    ? "Seleziona una categoria"
                    : "Select a category"}
                </option>
                {(() => {
                  // Build hierarchical category options
                  const flat = flattenCategories(categories);
                  const rootCats = flat
                    .filter((cat) => !cat.parentId)
                    .sort((a, b) => a.order - b.order);

                  const buildOptions = (
                    parentId: string | null,
                    level = 0
                  ): React.ReactElement[] => {
                    const options: React.ReactElement[] = [];
                    const children = flat
                      .filter((cat) => (cat.parentId || null) === parentId)
                      .sort((a, b) => a.order - b.order);

                    children.forEach((cat) => {
                      const catLevel = getCategoryLevel(cat, flat);
                      const displayName =
                        language === "it" ? cat.nameIt : cat.nameEn;
                      const breadcrumb = cat.parentId
                        ? getCategoryBreadcrumb(cat, flat)
                        : "";

                      // Build option text with hierarchy indicator
                      const indent = "  ".repeat(level);
                      const treeChar = level > 0 ? "└─ " : "";
                      let optionText = `${indent}${treeChar}${displayName}`;

                      // Add level indicator for non-root categories
                      if (catLevel > 0) {
                        optionText += ` [L${catLevel + 1}]`;
                      }

                      options.push(
                        <option
                          key={cat.id}
                          value={cat.id}
                          title={
                            breadcrumb
                              ? `${displayName} - ${breadcrumb}`
                              : displayName
                          }
                        >
                          {optionText}
                        </option>
                      );

                      // Recursively add children
                      const childOptions = buildOptions(cat.id, level + 1);
                      options.push(...childOptions);
                    });

                    return options;
                  };

                  return buildOptions(null, 0);
                })()}
              </select>
              {formData.categoryId &&
                (() => {
                  const flat = flattenCategories(categories);
                  const selectedCat = flat.find(
                    (c) => c.id === formData.categoryId
                  );
                  if (!selectedCat) return null;

                  const breadcrumb = selectedCat.parentId
                    ? getCategoryBreadcrumb(selectedCat, flat)
                    : "";
                  const level = getCategoryLevel(selectedCat, flat);

                  return (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-blue-900">
                          {language === "it"
                            ? selectedCat.nameIt
                            : selectedCat.nameEn}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-medium">
                          {language === "it" ? "Livello" : "Level"} {level + 1}
                        </span>
                        {breadcrumb && (
                          <span className="text-blue-700">
                            {language === "it" ? "Percorso" : "Path"}:{" "}
                            {breadcrumb}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })()}
              {errors.categoryId && (
                <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("admin.status")}
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as
                      | "DRAFT"
                      | "PENDING_REVIEW"
                      | "PUBLISHED",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                <option value="DRAFT">{t("admin.draft")}</option>
                <option value="PENDING_REVIEW">
                  {t("admin.pendingReview")}
                </option>
                <option value="PUBLISHED">{t("admin.published")}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === "it"
                  ? "Programma Pubblicazione"
                  : "Schedule Publishing"}
              </label>
              <div className="space-y-2">
                <DatePicker
                  selected={scheduledDate}
                  onChange={(date) => {
                    setScheduledDate(date);
                    if (date) {
                      // Validate date is in the future
                      if (date <= new Date()) {
                        setErrors((prev) => ({
                          ...prev,
                          scheduledFor:
                            language === "it"
                              ? "La data programmata deve essere nel futuro"
                              : "Scheduled date must be in the future",
                        }));
                      } else {
                        setErrors((prev) => {
                          const newErrors = { ...prev };
                          delete newErrors.scheduledFor;
                          return newErrors;
                        });
                      }
                    }
                  }}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="MMMM d, yyyy h:mm aa"
                  placeholderText="Select date and time (optional)"
                  minDate={new Date()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
                {scheduledDate && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>
                      {t("admin.willPublishOn")}:{" "}
                      {formatDateTime(scheduledDate, {
                        dateFormat: "PP",
                        timeFormat: "p",
                      })}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setScheduledDate(null);
                        setFormData({ ...formData, scheduledFor: undefined });
                      }}
                      className="ml-auto text-red-600 hover:text-red-800 text-xs"
                    >
                      Clear
                    </button>
                  </div>
                )}
                {errors.scheduledFor && (
                  <p className="text-sm text-red-600">{errors.scheduledFor}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === "it"
                  ? "Data di Pubblicazione (Retroattiva)"
                  : "Published Date (Retroactive)"}
              </label>
              <div className="space-y-2">
                <DatePicker
                  selected={publishedDate}
                  onChange={(date) => {
                    setPublishedDate(date);
                    if (date) {
                      setFormData({
                        ...formData,
                        publishedAt: date.toISOString(),
                      });
                    } else {
                      setFormData({
                        ...formData,
                        publishedAt: undefined,
                      });
                    }
                  }}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="MMMM d, yyyy h:mm aa"
                  placeholderText={
                    language === "it"
                      ? "Seleziona data e ora (opzionale, consente date passate)"
                      : "Select date and time (optional, allows past dates)"
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
                {publishedDate && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>
                      {language === "it"
                        ? "Pubblicato il"
                        : "Published on"}:{" "}
                      {formatDateTime(publishedDate, {
                        dateFormat: "PP",
                        timeFormat: "p",
                      })}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setPublishedDate(null);
                        setFormData({ ...formData, publishedAt: undefined });
                      }}
                      className="ml-auto text-red-600 hover:text-red-800 text-xs"
                    >
                      {language === "it" ? "Cancella" : "Clear"}
                    </button>
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  {language === "it"
                    ? "Imposta una data di pubblicazione passata per retroattivare la notizia. Se non impostata, verrà utilizzata la data corrente quando viene pubblicata."
                    : "Set a past publication date to retroactively publish news. If not set, current date will be used when publishing."}
                </p>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Main Image/Video
              </label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formData.mainImage}
                    onChange={(e) => {
                      // Normalize URL when user manually enters it to prevent duplicates
                      const normalizedUrl = normalizeImageUrl(e.target.value);
                      setFormData({ ...formData, mainImage: normalizedUrl });
                      // Clear selectedMedia if URL is manually changed
                      if (selectedMedia && selectedMedia.url !== normalizedUrl) {
                        setSelectedMedia(null);
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/image.jpg or video.mp4"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setIsMediaLibraryOpen(true)}
                    disabled={isLoading}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 flex items-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
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
                    Select from Library
                  </button>
                </div>
                {/* Selected media preview */}
                {selectedMedia && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded border border-gray-200">
                    <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                      {selectedMedia.type === "IMAGE" ? (
                        <img
                          src={getImageUrl(selectedMedia.url)}
                          alt={selectedMedia.caption || "Selected"}
                          className="w-full h-full object-cover"
                        />
                      ) : selectedMedia.type === "VIDEO" && selectedMedia.thumbnailUrl ? (
                        <img
                          src={getImageUrl(selectedMedia.thumbnailUrl)}
                          alt={selectedMedia.caption || "Selected Video"}
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
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {selectedMedia.caption || "Selected Media"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {selectedMedia.type}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMedia(null);
                        setFormData({ ...formData, mainImage: "" });
                      }}
                      className="text-red-600 hover:text-red-800"
                      title="Remove selection"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                )}
                {/* Preview of main image/video */}
                {formData.mainImage && !selectedMedia && (
                  <div className="mt-2">
                    {formData.mainImage.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                      <video
                        src={formData.mainImage}
                        controls
                        className="max-h-48 w-auto rounded border border-gray-300"
                        onError={(e) => {
                          (e.target as HTMLVideoElement).style.display = "none";
                        }}
                      >
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <img
                        src={formData.mainImage}
                        alt="Preview"
                        className="max-h-48 w-auto rounded border border-gray-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Summary <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.summary}
                onChange={(e) =>
                  setFormData({ ...formData, summary: e.target.value })
                }
                rows={3}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.summary ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Brief summary of the news..."
                disabled={isLoading}
              />
              {errors.summary && (
                <p className="mt-1 text-sm text-red-600">{errors.summary}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content <span className="text-red-500">*</span>
              </label>
              <div
                className={
                  errors.content ? "border-2 border-red-500 rounded" : ""
                }
              >
                <RichTextEditor
                  value={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                  placeholder="Enter full news content..."
                  disabled={isLoading}
                />
              </div>
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="tag1, tag2, tag3"
                disabled={isLoading}
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isBreaking}
                    onChange={(e) =>
                      setFormData({ ...formData, isBreaking: e.target.checked })
                    }
                    disabled={isLoading}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Breaking News
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) =>
                      setFormData({ ...formData, isFeatured: e.target.checked })
                    }
                    disabled={isLoading}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Featured
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isTG}
                    onChange={(e) =>
                      setFormData({ ...formData, isTG: e.target.checked })
                    }
                    disabled={isLoading}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">TG</span>
                </label>
                {onSocialPost && (
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={postToSocial}
                      onChange={(e) => {
                        setPostToSocial(e.target.checked);
                        if (!e.target.checked) {
                          setSocialScheduledDate(null);
                        }
                      }}
                      disabled={isLoading || !hasConnectedAccounts}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                    />
                    <span
                      className={`text-sm font-medium ${
                        !hasConnectedAccounts
                          ? "text-gray-400"
                          : "text-gray-700"
                      }`}
                    >
                      Post to Social Media
                    </span>
                  </label>
                )}
              </div>
              {onSocialPost && !hasConnectedAccounts && (
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    ⚠️ No social media accounts connected. Please connect
                    accounts in{" "}
                    <a
                      href="/admin/settings"
                      className="underline font-medium"
                      target="_blank"
                    >
                      Settings
                    </a>{" "}
                    first.
                  </p>
                </div>
              )}
              {onSocialPost && postToSocial && hasConnectedAccounts && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      Select Platforms
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsSocialPreviewOpen(true)}
                      disabled={!formData.title || !formData.summary}
                      className="px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      Preview Post
                    </button>
                  </div>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedPlatforms.includes("FACEBOOK")}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPlatforms([
                              ...selectedPlatforms,
                              "FACEBOOK",
                            ]);
                          } else {
                            setSelectedPlatforms(
                              selectedPlatforms.filter((p) => p !== "FACEBOOK")
                            );
                          }
                        }}
                        disabled={isLoading || !facebookAccount}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700">Facebook</span>
                        {facebookAccount ? (
                          <span className="text-xs text-green-600 flex items-center gap-1">
                            <svg
                              className="w-3 h-3"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {facebookAccount.name}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">
                            Not connected
                          </span>
                        )}
                      </div>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedPlatforms.includes("INSTAGRAM")}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPlatforms([
                              ...selectedPlatforms,
                              "INSTAGRAM",
                            ]);
                          } else {
                            setSelectedPlatforms(
                              selectedPlatforms.filter((p) => p !== "INSTAGRAM")
                            );
                          }
                        }}
                        disabled={isLoading || !instagramAccount}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700">Instagram</span>
                        {instagramAccount ? (
                          <span className="text-xs text-green-600 flex items-center gap-1">
                            <svg
                              className="w-3 h-3"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {instagramAccount.name}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">
                            Not connected
                          </span>
                        )}
                      </div>
                    </label>
                  </div>
                  {errors.socialPlatforms && (
                    <p className="text-sm text-red-600">
                      {errors.socialPlatforms}
                    </p>
                  )}
                  {errors.socialInstagram && (
                    <p className="text-sm text-red-600">
                      {errors.socialInstagram}
                    </p>
                  )}

                  {/* Scheduled Posting for Social */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Schedule Social Post (Optional)
                    </label>
                    <DatePicker
                      selected={socialScheduledDate}
                      onChange={(date) => {
                        setSocialScheduledDate(date);
                        if (date && date <= new Date()) {
                          setErrors((prev) => ({
                            ...prev,
                            socialScheduled:
                              "Scheduled time must be in the future",
                          }));
                        } else {
                          setErrors((prev) => {
                            const newErrors = { ...prev };
                            delete newErrors.socialScheduled;
                            return newErrors;
                          });
                        }
                      }}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      dateFormat="MMMM d, yyyy h:mm aa"
                      placeholderText="Select date and time (optional)"
                      minDate={new Date()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isLoading}
                    />
                    {socialScheduledDate && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span>
                          {t("admin.willPostOn")}:{" "}
                          {formatDateTime(socialScheduledDate, {
                            dateFormat: "PP",
                            timeFormat: "p",
                          })}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSocialScheduledDate(null);
                            setErrors((prev) => {
                              const newErrors = { ...prev };
                              delete newErrors.socialScheduled;
                              return newErrors;
                            });
                          }}
                          className="ml-auto text-red-600 hover:text-red-800 text-xs"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                    {errors.socialScheduled && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.socialScheduled}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
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
                  {news ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{news ? "Update News" : "Create News"}</>
              )}
            </button>
          </div>
        </form>

        {/* Media Library Modal */}
        <MediaLibraryModal
          isOpen={isMediaLibraryOpen}
          onClose={() => setIsMediaLibraryOpen(false)}
          onSelect={(media) => {
            // Validate media status before allowing selection
            if (media.processingStatus === "FAILED") {
              alert(
                "Cannot use rejected media. Please select an approved image or video."
              );
              return;
            }
            if (media.processingStatus === "PENDING") {
              alert(
                "Cannot use pending media. Please wait for admin approval or select an approved image or video."
              );
              return;
            }
            if (media.processingStatus !== "COMPLETED") {
              alert("Please select an approved image or video with COMPLETED status.");
              return;
            }
            // Allow both IMAGE and VIDEO types
            if (media.type === "IMAGE" || media.type === "VIDEO") {
              setSelectedMedia(media);
              // Normalize the URL to prevent duplicates before storing
              const normalizedUrl = normalizeImageUrl(media.url);
              setFormData({
                ...formData,
                mainImage: normalizedUrl,
                mainImageId: media.id,
              });
              setIsMediaLibraryOpen(false);
            } else {
              alert("Please select an image or video. Documents are not supported as main media.");
            }
          }}
          filterType="ALL"
          title="Select Main Image or Video"
        />

        {/* Preview Modal */}
        {isPreviewOpen && (
          <NewsPreviewModal
            news={formData as any}
            categories={categories}
            onClose={() => setIsPreviewOpen(false)}
            onOpenInNewTab={() => {
              // Open preview in new tab (if news has an ID)
              if (news?.id) {
                window.open(`/news/${news.slug || news.id}`, "_blank");
              }
            }}
          />
        )}

        {/* Social Post Preview Modal */}
        {isSocialPreviewOpen && (
          <SocialPostPreview
            title={formData.title}
            summary={formData.summary}
            mainImage={formData.mainImage}
            slug={formData.slug}
            platforms={selectedPlatforms}
            onClose={() => setIsSocialPreviewOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
