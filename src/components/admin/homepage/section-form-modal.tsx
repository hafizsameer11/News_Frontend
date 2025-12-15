"use client";

import { useState, useEffect, useMemo } from "react";
import { HomepageSection, CreateHomepageSectionInput } from "@/lib/api/modules/homepage.api";
import { FormField } from "@/components/ui/form-field";
import { useLanguage } from "@/providers/LanguageProvider";
import { useCategories } from "@/lib/hooks/useCategories";

interface SectionFormModalProps {
  section?: HomepageSection | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateHomepageSectionInput) => void;
}

export function SectionFormModal({
  section,
  isOpen,
  onClose,
  onSubmit,
}: SectionFormModalProps) {
  const { language } = useLanguage();
  const { data: categoriesData } = useCategories(true);
  const categories = categoriesData?.data || [];

  const initialFormData = useMemo<CreateHomepageSectionInput>(() => {
    if (section) {
      return {
        type: section.type,
        title: section.title || "",
        dataSource: section.dataSource || "",
        config: section.config,
        isActive: section.isActive,
      };
    }
    return {
      type: "FEATURED_SECTION",
      title: "",
      dataSource: "",
      isActive: true,
    };
  }, [section]);

  const [formData, setFormData] = useState<CreateHomepageSectionInput>(initialFormData);

  useEffect(() => {
    setFormData(initialFormData);
  }, [initialFormData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {section
                    ? language === "it"
                      ? "Modifica Sezione"
                      : "Edit Section"
                    : language === "it"
                    ? "Aggiungi Sezione"
                    : "Add Section"}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <FormField
                  label={language === "it" ? "Tipo" : "Type"}
                  required
                >
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as any })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                  >
                    <option value="HERO_SLIDER">
                      {language === "it" ? "Hero Slider" : "Hero Slider"}
                    </option>
                    <option value="BREAKING_TICKER">
                      {language === "it" ? "Breaking Ticker" : "Breaking Ticker"}
                    </option>
                    <option value="FEATURED_SECTION">
                      {language === "it" ? "Sezione in Evidenza" : "Featured Section"}
                    </option>
                    <option value="CATEGORY_BLOCK">
                      {language === "it" ? "Blocco Categoria" : "Category Block"}
                    </option>
                    <option value="MANUAL_LIST">
                      {language === "it" ? "Lista Manuale" : "Manual List"}
                    </option>
                  </select>
                </FormField>

                <FormField
                  label={language === "it" ? "Titolo" : "Title"}
                >
                  <input
                    type="text"
                    value={formData.title || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                  />
                </FormField>

                <FormField
                  label={language === "it" ? "Fonte Dati" : "Data Source"}
                  hint={
                    language === "it"
                      ? "featured, category:slug, o manual"
                      : "featured, category:slug, or manual"
                  }
                >
                  {formData.type === "CATEGORY_BLOCK" ? (
                    <select
                      value={formData.dataSource?.replace("category:", "") || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dataSource: e.target.value
                            ? `category:${e.target.value}`
                            : "",
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                    >
                      <option value="">
                        {language === "it" ? "Seleziona categoria" : "Select category"}
                      </option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.slug}>
                          {language === "it" ? cat.nameIt : cat.nameEn}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <select
                      value={formData.dataSource || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, dataSource: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                    >
                      <option value="featured">
                        {language === "it" ? "Notizie in Evidenza" : "Featured News"}
                      </option>
                      <option value="manual">
                        {language === "it" ? "Manuale" : "Manual"}
                      </option>
                    </select>
                  )}
                </FormField>

                <FormField
                  label={language === "it" ? "Attivo" : "Active"}
                >
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive ?? true}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {language === "it"
                        ? "Mostra questa sezione"
                        : "Show this section"}
                    </span>
                  </label>
                </FormField>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                {language === "it" ? "Salva" : "Save"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                {language === "it" ? "Annulla" : "Cancel"}
              </button>
            </div>
          </form>
      </div>
    </div>
  );
}

