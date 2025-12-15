"use client";

import { useState, useEffect } from "react";
import { Ad } from "@/types/ads.types";
import { ErrorMessage } from "@/components/ui/error-message";
import { MediaLibraryModal } from "./media-library-modal";
import { Media } from "@/types/media.types";
import { API_CONFIG } from "@/lib/api/apiConfig";
import { convertPriceToNumber } from "@/lib/helpers/ad-pricing";
import { useLanguage } from "@/providers/LanguageProvider";

interface AdFormModalProps {
  ad?: Ad | null;
  onSubmit: (data: any) => void;
  onClose: () => void;
  isLoading?: boolean;
  error?: any;
}

const AD_TYPES = [
  { value: "BANNER_TOP", label: "Banner Top" },
  { value: "BANNER_SIDE", label: "Banner Side" },
  { value: "INLINE", label: "Inline" },
  { value: "FOOTER", label: "Footer" },
  { value: "SLIDER", label: "Slider" },
  { value: "TICKER", label: "Ticker" },
  { value: "POPUP", label: "Popup" },
  { value: "STICKY", label: "Sticky" },
] as const;

const AD_STATUSES = [
  { value: "PENDING", label: "Pending" },
  { value: "ACTIVE", label: "Active" },
  { value: "PAUSED", label: "Paused" },
  { value: "EXPIRED", label: "Expired" },
  { value: "REJECTED", label: "Rejected" },
] as const;

const AD_POSITIONS = [
  { value: "", label: "None (Auto)" },
  { value: "HEADER", label: "Header" },
  { value: "HEADER_LEADERBOARD", label: "Header Leaderboard" },
  { value: "SIDEBAR", label: "Sidebar" },
  { value: "SIDEBAR_RECT", label: "Sidebar Rectangle" },
  { value: "INLINE_ARTICLE", label: "Inline Article" },
  { value: "FOOTER", label: "Footer" },
  { value: "MOBILE", label: "Mobile" },
] as const;

export function AdFormModal({
  ad,
  onSubmit,
  onClose,
  isLoading = false,
  error,
}: AdFormModalProps) {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    title: "",
    type: "BANNER_TOP" as Ad["type"],
    imageUrl: "",
    targetLink: "",
    position: "",
    startDate: "",
    endDate: "",
    price: "",
    status: "PENDING" as Ad["status"],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);

  const getFullUrl = (url: string): string => {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    const baseUrl = API_CONFIG.BASE_URL.replace("/api/v1", "");
    return `${baseUrl}${url.startsWith("/") ? url : `/${url}`}`;
  };

  const handleMediaSelect = (media: Media) => {
    if (media.type === "IMAGE") {
      const fullUrl = getFullUrl(media.url);
      setFormData({ ...formData, imageUrl: fullUrl });
      if (errors.imageUrl) setErrors({ ...errors, imageUrl: "" });
    }
    setShowMediaLibrary(false);
  };

  useEffect(() => {
    if (ad) {
      // Format dates for datetime-local input (YYYY-MM-DDTHH:mm)
      const formatDateForInput = (dateString: string) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      // Convert price from Decimal to number string if needed
      let priceStr = "";
      if (ad.price) {
        if (typeof ad.price === "number") {
          priceStr = ad.price.toString();
        } else if (typeof ad.price === "object" && ad.price !== null) {
          // Handle Prisma Decimal format
          // Try toNumber first (most reliable for Decimal.js)
          let numPrice: number | null = null;
          if (typeof (ad.price as any).toNumber === "function") {
            numPrice = (ad.price as any).toNumber();
          } else {
            // Fallback to convertPriceToNumber
            numPrice = convertPriceToNumber(ad.price);
          }
          priceStr =
            numPrice !== null && !isNaN(numPrice) ? numPrice.toFixed(2) : "";
        } else {
          priceStr = String(ad.price);
        }
      }

      // Use setTimeout to defer state update
      setTimeout(() => {
        setFormData({
          title: ad.title,
          type: ad.type,
          imageUrl: ad.imageUrl,
          targetLink: ad.targetLink,
          position: ad.position || "",
          startDate: formatDateForInput(ad.startDate),
          endDate: formatDateForInput(ad.endDate),
          price: priceStr,
          status: ad.status,
        });
      }, 0);
    } else {
      // Set default dates for new ad
      const now = new Date();
      const future = new Date();
      future.setMonth(future.getMonth() + 1); // Default to 1 month from now

      const formatDateForInput = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      // Use setTimeout to defer state update
      setTimeout(() => {
        setFormData((prev) => ({
          ...prev,
          startDate: formatDateForInput(now),
          endDate: formatDateForInput(future),
        }));
      }, 0);
    }
  }, [ad]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title =
        language === "it" ? "Il titolo è obbligatorio" : "Title is required";
    } else if (formData.title.length < 3) {
      newErrors.title =
        language === "it"
          ? "Il titolo deve essere di almeno 3 caratteri"
          : "Title must be at least 3 characters";
    }

    if (!formData.imageUrl.trim()) {
      newErrors.imageUrl =
        language === "it"
          ? "L'URL dell'immagine è obbligatorio"
          : "Image URL is required";
    } else {
      try {
        new URL(formData.imageUrl);
      } catch {
        newErrors.imageUrl =
          language === "it"
            ? "L'URL dell'immagine deve essere un URL valido"
            : "Image URL must be a valid URL";
      }
    }

    if (!formData.targetLink.trim()) {
      newErrors.targetLink =
        language === "it"
          ? "Il link di destinazione è obbligatorio"
          : "Target link is required";
    } else {
      try {
        new URL(formData.targetLink);
      } catch {
        newErrors.targetLink =
          language === "it"
            ? "Il link di destinazione deve essere un URL valido"
            : "Target link must be a valid URL";
      }
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (!formData.endDate) {
      newErrors.endDate =
        language === "it"
          ? "La data di fine è obbligatoria"
          : "End date is required";
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end <= start) {
        newErrors.endDate =
          language === "it"
            ? "La data di fine deve essere successiva alla data di inizio"
            : "End date must be after start date";
      }
    }

    // Price is optional, only validate if provided
    if (formData.price && formData.price.trim() !== "") {
      const priceValue = parseFloat(formData.price);
      if (isNaN(priceValue) || priceValue < 0) {
        newErrors.price = "Price must be a positive number";
      }
    } else {
      // Clear price error if field is empty (it's optional)
      if (errors.price) {
        delete newErrors.price;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const submitData: any = {
        title: formData.title.trim(),
        type: formData.type,
        imageUrl: formData.imageUrl.trim(),
        targetLink: formData.targetLink.trim(),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      };

      // Only include position if it's selected (not empty)
      if (formData.position && formData.position.trim() !== "") {
        submitData.position = formData.position.trim();
      }

      // Only include price if it's provided and valid
      if (formData.price && formData.price.trim() !== "") {
        const priceValue = parseFloat(formData.price);
        if (!isNaN(priceValue) && priceValue >= 0) {
          submitData.price = priceValue;
        }
      }

      // For updates, include status
      if (ad) {
        submitData.status = formData.status;
      }

      onSubmit(submitData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            {ad ? t("admin.editAd") : t("admin.createAd")}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
            disabled={isLoading}
            title={t("common.close")}
          >
            ×
          </button>
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
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  if (errors.title) setErrors({ ...errors, title: "" });
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? "border-red-500" : "border-gray-300"
                }`}
                placeholder={
                  language === "it" ? "Titolo annuncio" : "Advertisement title"
                }
                disabled={isLoading}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("admin.type")} <span className="text-red-500">*</span>
                <span
                  className="ml-2 text-xs font-normal text-gray-500"
                  title={
                    language === "it"
                      ? "Il tipo di annuncio determina le dimensioni e il comportamento dell'annuncio (es. Banner Top, Slider, Popup, ecc.)"
                      : "Ad type determines the size and behavior of the ad (e.g., Banner Top, Slider, Popup, etc.)"
                  }
                >
                  ({language === "it" ? "Tipo Annuncio" : "Ad Type"})
                </span>
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as Ad["type"],
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                {AD_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {language === "it"
                      ? type.value === "BANNER_TOP"
                        ? "Banner Superiore"
                        : type.value === "BANNER_SIDE"
                        ? "Banner Laterale"
                        : type.value === "INLINE"
                        ? "In Linea"
                        : type.value === "FOOTER"
                        ? "Piè di Pagina"
                        : type.value === "SLIDER"
                        ? "Slider"
                        : type.value === "TICKER"
                        ? "Ticker"
                        : type.value === "POPUP"
                        ? "Popup"
                        : "Fisso"
                      : type.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                {language === "it"
                  ? "Il tipo di annuncio definisce le dimensioni e il comportamento (es. Banner Top: 728x90px, Slider: 1920x600px)"
                  : "Ad type defines the size and behavior (e.g., Banner Top: 728x90px, Slider: 1920x600px)"}
              </p>
            </div>

            {ad && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("admin.status")}
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as Ad["status"],
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                >
                  {AD_STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.value === "PENDING"
                        ? t("admin.pending")
                        : status.value === "ACTIVE"
                        ? language === "it"
                          ? "Attivo"
                          : "Active"
                        : status.value === "PAUSED"
                        ? language === "it"
                          ? "In Pausa"
                          : "Paused"
                        : status.value === "EXPIRED"
                        ? language === "it"
                          ? "Scaduto"
                          : "Expired"
                        : t("admin.rejected")}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === "it" ? "URL Immagine" : "Image URL"}{" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => {
                    setFormData({ ...formData, imageUrl: e.target.value });
                    if (errors.imageUrl) setErrors({ ...errors, imageUrl: "" });
                  }}
                  className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.imageUrl ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="https://example.com/image.jpg"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowMediaLibrary(true)}
                  className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium text-gray-700 whitespace-nowrap"
                  disabled={isLoading}
                >
                  {t("admin.mediaLibrary")}
                </button>
              </div>
              {errors.imageUrl && (
                <p className="mt-1 text-sm text-red-600">{errors.imageUrl}</p>
              )}
              {formData.imageUrl && (
                <div className="mt-2">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="h-24 w-auto rounded border border-gray-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === "it" ? "Link di Destinazione" : "Target Link"}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={formData.targetLink}
                onChange={(e) => {
                  setFormData({ ...formData, targetLink: e.target.value });
                  if (errors.targetLink)
                    setErrors({ ...errors, targetLink: "" });
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.targetLink ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="https://example.com"
                disabled={isLoading}
              />
              {errors.targetLink && (
                <p className="mt-1 text-sm text-red-600">{errors.targetLink}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === "it" ? "Posizione" : "Position"}
                <span
                  className="ml-1 text-xs font-normal text-gray-500"
                  title={
                    language === "it"
                      ? "Opzionale: Zona di posizionamento specifica all'interno della pagina (es. Header, Sidebar, Footer). Diverso dal Tipo che definisce le dimensioni."
                      : "Optional: Specific placement zone within the page (e.g., Header, Sidebar, Footer). Different from Type which defines dimensions."
                  }
                >
                  ({language === "it" ? "Opzionale" : "Optional"})
                </span>
              </label>
              <select
                value={formData.position}
                onChange={(e) =>
                  setFormData({ ...formData, position: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                {AD_POSITIONS.map((position) => (
                  <option key={position.value} value={position.value}>
                    {position.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                {language === "it"
                  ? "Zona di posizionamento specifica nella pagina (es. Header, Sidebar, Footer). Diverso dal Tipo che definisce dimensioni e comportamento."
                  : "Specific placement zone on the page (e.g., Header, Sidebar, Footer). Different from Type which defines dimensions and behavior."}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("admin.price")} (€)
                <span
                  className="ml-1 text-xs font-normal text-gray-500"
                  title={
                    language === "it"
                      ? "Opzionale: Override manuale del prezzo. Se non impostato, il prezzo verrà calcolato automaticamente in base al tipo di annuncio e alla durata."
                      : "Optional: Manual price override. If not set, price will be calculated automatically based on ad type and duration."
                  }
                >
                  ({language === "it" ? "Opzionale" : "Optional"})
                </span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => {
                  const value = e.target.value;
                  // Allow empty string or valid number
                  if (
                    value === "" ||
                    (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)
                  ) {
                    setFormData({ ...formData, price: value });
                    if (errors.price) setErrors({ ...errors, price: "" });
                  }
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.price ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="0.00"
                disabled={isLoading}
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {language === "it"
                  ? "Opzionale: Override manuale del prezzo. Se non impostato, il prezzo verrà calcolato automaticamente in base al tipo di annuncio e alla durata."
                  : "Optional: Manual price override. If not set, price will be calculated automatically based on ad type and duration."}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === "it" ? "Data di Inizio" : "Start Date"}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => {
                  setFormData({ ...formData, startDate: e.target.value });
                  if (errors.startDate) setErrors({ ...errors, startDate: "" });
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.startDate ? "border-red-500" : "border-gray-300"
                }`}
                disabled={isLoading}
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === "it" ? "Data di Fine" : "End Date"}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => {
                  setFormData({ ...formData, endDate: e.target.value });
                  if (errors.endDate) setErrors({ ...errors, endDate: "" });
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.endDate ? "border-red-500" : "border-gray-300"
                }`}
                disabled={isLoading}
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
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
                  {ad ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{ad ? "Update Advertisement" : "Create Advertisement"}</>
              )}
            </button>
          </div>
        </form>

        {/* Media Library Modal */}
        <MediaLibraryModal
          isOpen={showMediaLibrary}
          onClose={() => setShowMediaLibrary(false)}
          onSelect={handleMediaSelect}
          filterType="IMAGE"
          title={
            language === "it"
              ? "Seleziona Immagine dalla Libreria Media"
              : "Select Image from Media Library"
          }
        />
      </div>
    </div>
  );
}
