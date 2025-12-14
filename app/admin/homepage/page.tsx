"use client";

import { useState } from "react";
import {
  useHomepageSections,
  useCreateHomepageSection,
  useUpdateHomepageSection,
  useDeleteHomepageSection,
  useReorderHomepageSections,
} from "@/lib/hooks/useHomepage";
import { HomepageSection, HomepageSectionsResponse } from "@/lib/api/modules/homepage.api";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import { useLanguage } from "@/providers/LanguageProvider";
import { SectionFormModal } from "@/components/admin/homepage/section-form-modal";
import { DeleteConfirmModal } from "@/components/admin/delete-confirm-modal";

export default function AdminHomepagePage() {
  const { data, isLoading, error } = useHomepageSections();
  const createMutation = useCreateHomepageSection();
  const updateMutation = useUpdateHomepageSection();
  const deleteMutation = useDeleteHomepageSection();
  const reorderMutation = useReorderHomepageSections();
  const { language, t } = useLanguage();

  const sections = ((data as HomepageSectionsResponse | undefined)?.data || []) as HomepageSection[];

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<HomepageSection | null>(null);
  const [deletingSection, setDeletingSection] = useState<HomepageSection | null>(null);

  const handleCreate = () => {
    setEditingSection(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (section: HomepageSection) => {
    setEditingSection(section);
    setIsFormModalOpen(true);
  };

  const handleDelete = (section: HomepageSection) => {
    setDeletingSection(section);
  };

  const confirmDelete = () => {
    if (deletingSection) {
      deleteMutation.mutate(deletingSection.id, {
        onSuccess: () => {
          setDeletingSection(null);
        },
      });
    }
  };

  const handleSubmit = (formData: any) => {
    if (editingSection) {
      updateMutation.mutate(
        { id: editingSection.id, data: formData },
        {
          onSuccess: () => {
            setIsFormModalOpen(false);
            setEditingSection(null);
          },
        }
      );
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => {
          setIsFormModalOpen(false);
        },
      });
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newSections = [...sections];
    [newSections[index - 1], newSections[index]] = [
      newSections[index],
      newSections[index - 1],
    ];
    const sectionIds = newSections.map((s) => s.id);
    reorderMutation.mutate(sectionIds);
  };

  const handleMoveDown = (index: number) => {
    if (index === sections.length - 1) return;
    const newSections = [...sections];
    [newSections[index], newSections[index + 1]] = [
      newSections[index + 1],
      newSections[index],
    ];
    const sectionIds = newSections.map((s) => s.id);
    reorderMutation.mutate(sectionIds);
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, { en: string; it: string }> = {
      HERO_SLIDER: { en: "Hero Slider", it: "Hero Slider" },
      BREAKING_TICKER: { en: "Breaking Ticker", it: "Breaking Ticker" },
      FEATURED_SECTION: { en: "Featured Section", it: "Sezione in Evidenza" },
      CATEGORY_BLOCK: { en: "Category Block", it: "Blocco Categoria" },
      MANUAL_LIST: { en: "Manual List", it: "Lista Manuale" },
    };
    return labels[type]?.[language] || type;
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          {t("admin.homepageManagement")}
        </h1>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          {language === "it" ? "+ Aggiungi Sezione" : "+ Add Section"}
        </button>
      </div>

      {error && <ErrorMessage error={error} />}

      {isLoading ? (
        <Loading />
      ) : sections.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">
            {language === "it"
              ? "Nessuna sezione configurata"
              : "No sections configured"}
          </p>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            {language === "it" ? "Aggiungi Prima Sezione" : "Add First Section"}
          </button>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {language === "it" ? "Ordine" : "Order"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {language === "it" ? "Tipo" : "Type"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {language === "it" ? "Titolo" : "Title"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {language === "it" ? "Fonte Dati" : "Data Source"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {language === "it" ? "Stato" : "Status"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {language === "it" ? "Azioni" : "Actions"}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sections.map((section, index) => (
                <tr key={section.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0 || reorderMutation.isPending}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                      >
                        ↑
                      </button>
                      <span className="text-sm text-gray-900">{section.order}</span>
                      <button
                        onClick={() => handleMoveDown(index)}
                        disabled={index === sections.length - 1 || reorderMutation.isPending}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                      >
                        ↓
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getTypeLabel(section.type)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {section.title || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {section.dataSource || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        section.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {section.isActive
                        ? language === "it"
                          ? "Attivo"
                          : "Active"
                        : language === "it"
                        ? "Inattivo"
                        : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(section)}
                        className="text-red-600 hover:text-red-900"
                      >
                        {language === "it" ? "Modifica" : "Edit"}
                      </button>
                      <button
                        onClick={() => handleDelete(section)}
                        className="text-red-600 hover:text-red-900"
                      >
                        {language === "it" ? "Elimina" : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isFormModalOpen && (
        <SectionFormModal
          section={editingSection}
          isOpen={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false);
            setEditingSection(null);
          }}
          onSubmit={handleSubmit}
        />
      )}

      {deletingSection && (
        <DeleteConfirmModal
          isOpen={!!deletingSection}
          onCancel={() => setDeletingSection(null)}
          onConfirm={confirmDelete}
          title={
            language === "it"
              ? "Elimina Sezione"
              : "Delete Section"
          }
          message={
            language === "it"
              ? `Sei sicuro di voler eliminare la sezione "${deletingSection.title || getTypeLabel(deletingSection.type)}"?`
              : `Are you sure you want to delete the section "${deletingSection.title || getTypeLabel(deletingSection.type)}"?`
          }
        />
      )}
    </div>
  );
}

