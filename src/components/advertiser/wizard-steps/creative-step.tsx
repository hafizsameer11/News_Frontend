"use client";

import { useState } from "react";
import { WizardFormData } from "../ad-creation-wizard";
import { MediaLibraryModal } from "@/components/admin/media-library-modal";
import { Media } from "@/types/media.types";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { useLanguage } from "@/providers/LanguageProvider";

interface CreativeStepProps {
  formData: WizardFormData;
  updateFormData: (updates: Partial<WizardFormData>) => void;
  errors: Record<string, string>;
}

export function CreativeStep({ formData, updateFormData, errors }: CreativeStepProps) {
  const { language } = useLanguage();
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [uploadMode, setUploadMode] = useState<"url" | "library">("url");
  const [imageError, setImageError] = useState<string>("");

  const handleMediaSelect = (media: Media) => {
    if (media.type === "IMAGE") {
      const fullUrl = getImageUrl(media.url);
      updateFormData({ imageUrl: fullUrl });
      setImageError("");
      setShowMediaLibrary(false);
    }
  };

  const validateImageUrl = (url: string): boolean => {
    if (!url.trim()) {
      setImageError("Image URL is required");
      return false;
    }
    if (!/^https?:\/\/.+/.test(url)) {
      setImageError("Invalid URL format");
      return false;
    }
    setImageError("");
    return true;
  };

  const handleUrlChange = (url: string) => {
    updateFormData({ imageUrl: url });
    if (url) {
      validateImageUrl(url);
    } else {
      setImageError("");
    }
  };

  const getRecommendedDimensions = (): string => {
    const dimensions: Record<string, string> = {
      BANNER_TOP: "728x90px",
      BANNER_SIDE: "300x250px",
      INLINE: "728x90px",
      FOOTER: "728x90px",
      SLIDER: "1920x600px",
      TICKER: "728x90px",
      POPUP: "600x600px",
      STICKY: "300x250px",
    };
    return dimensions[formData.type] || "300x250px";
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {language === "it" ? "Caricamento Creativo" : "Creative Upload"}
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          {language === "it"
            ? "Carica o fornisci un URL immagine per il tuo annuncio. Dimensione consigliata:"
            : "Upload or provide an image URL for your advertisement. Recommended size:"}{" "}
          <span className="font-medium">{getRecommendedDimensions()}</span>
        </p>
      </div>

      {/* Upload Mode Selection */}
      <div className="flex gap-4 border-b border-gray-200 pb-4">
        <button
          onClick={() => setUploadMode("url")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            uploadMode === "url"
              ? "border-red-600 text-red-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          {language === "it" ? "URL Immagine" : "Image URL"}
        </button>
        <button
          onClick={() => setShowMediaLibrary(true)}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            uploadMode === "library"
              ? "border-red-600 text-red-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          {language === "it" ? "Libreria Media" : "Media Library"}
        </button>
      </div>

      {/* URL Input Mode */}
      {uploadMode === "url" && (
        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
            {language === "it" ? "URL Immagine" : "Image URL"} *
          </label>
          <input
            id="imageUrl"
            type="url"
            value={formData.imageUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            className={`w-full px-3 py-2 border ${
              errors.imageUrl || imageError ? "border-red-300" : "border-gray-300"
            } rounded-md text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500`}
            placeholder="https://example.com/image.jpg"
          />
          {(errors.imageUrl || imageError) && (
            <p className="mt-1 text-sm text-red-600">{errors.imageUrl || imageError}</p>
          )}
          <p className="mt-2 text-xs text-gray-500">
            {language === "it"
              ? "Oppure usa la Libreria Media per selezionare un'immagine già caricata"
              : "Or use Media Library to select an already uploaded image"}
          </p>
        </div>
      )}

      {/* Image Preview */}
      {formData.imageUrl && !imageError && !errors.imageUrl && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {language === "it" ? "Anteprima" : "Preview"}
          </label>
          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
            <div className="relative w-full max-w-md mx-auto">
              {formData.imageUrl && formData.imageUrl.trim() !== "" ? (
                <OptimizedImage
                  src={formData.imageUrl}
                  alt="Ad preview"
                  width={300}
                  height={250}
                  className="object-contain w-full h-auto rounded"
                  style={{ width: "auto", height: "auto" }}
                  quality={85}
                  onError={() => setImageError(language === "it" ? "Impossibile caricare l'immagine. Controlla l'URL." : "Failed to load image. Please check the URL.")}
                />
              ) : (
                <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded">
                  <p className="text-gray-500 text-sm">{language === "it" ? "Nessuna immagine" : "No image"}</p>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              {language === "it" ? "Consigliato:" : "Recommended:"} {getRecommendedDimensions()}
            </p>
            <button
              onClick={() => {
                updateFormData({ imageUrl: "" });
                setImageError("");
              }}
              className="mt-2 w-full px-3 py-1 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded hover:bg-red-50 transition"
            >
              {language === "it" ? "Rimuovi Immagine" : "Remove Image"}
            </button>
          </div>
        </div>
      )}

      {/* Media Library Modal */}
      <MediaLibraryModal
        isOpen={showMediaLibrary}
        onClose={() => {
          setShowMediaLibrary(false);
          setUploadMode("url");
        }}
        onSelect={(media) => {
          handleMediaSelect(media);
          setUploadMode("url");
        }}
        filterType="IMAGE"
        title={language === "it" ? "Seleziona Immagine dalla Libreria Media" : "Select Image from Media Library"}
      />
    </div>
  );
}

