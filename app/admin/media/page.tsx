"use client";

import { useState } from "react";
import { MediaUpload } from "@/components/admin/media-upload";
import { MediaGrid } from "@/components/admin/media-grid";
import { useLanguage } from "@/providers/LanguageProvider";

export default function MediaLibraryPage() {
  const [activeTab, setActiveTab] = useState<"browse" | "upload">("browse");
  const { t, language } = useLanguage();

  return (
    <div className="w-full">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t("admin.mediaLibrary")}</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
          {t("admin.uploadManageMedia")}
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 sm:mb-6">
        <div className="border-b border-gray-200 px-4 sm:px-6">
          <div className="flex gap-2 sm:gap-4">
            <button
              onClick={() => setActiveTab("browse")}
              className={`px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-medium border-b-2 transition-colors ${
                activeTab === "browse"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t("admin.browseMedia")}
            </button>
            <button
              onClick={() => setActiveTab("upload")}
              className={`px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-medium border-b-2 transition-colors ${
                activeTab === "upload"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t("admin.uploadFiles")}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {activeTab === "browse" ? (
            <MediaGrid filterType="ALL" />
          ) : (
            <MediaUpload multiple={true} />
          )}
        </div>
      </div>
    </div>
  );
}

