"use client";

import { useState } from "react";
import { useLanguage } from "@/providers/LanguageProvider";
import { MediaUpload } from "@/components/admin/media-upload";
import { MediaGrid } from "@/components/admin/media-grid";

export default function EditorMediaPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"browse" | "upload">("browse");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {t("admin.mediaLibrary")}
        </h1>
        <p className="text-gray-600 mt-2">{t("admin.uploadManageMedia")}</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200 px-6">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("browse")}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === "browse"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t("admin.browseMedia")}
            </button>
            <button
              onClick={() => setActiveTab("upload")}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
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
        <div className="p-6">
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
