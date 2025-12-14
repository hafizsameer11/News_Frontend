"use client";

import { useState, useEffect, useMemo } from "react";
import { User, CreateUserInput, UpdateUserInput } from "@/types/user.types";
import { Category } from "@/types/category.types";
import { ErrorMessage } from "@/components/ui/error-message";
import { useLanguage } from "@/providers/LanguageProvider";

interface UserFormModalProps {
  user?: User | null;
  categories: Category[];
  onSubmit: (data: CreateUserInput | UpdateUserInput) => void;
  onClose: () => void;
  isLoading?: boolean;
  error?: any;
}

const ROLES = [
  { value: "SUPER_ADMIN", label: "Super Admin" },
  { value: "ADMIN", label: "Admin" },
  { value: "EDITOR", label: "Editor" },
  { value: "ADVERTISER", label: "Advertiser" },
  { value: "USER", label: "User" },
] as const;

export function UserFormModal({
  user,
  categories,
  onSubmit,
  onClose,
  isLoading = false,
  error,
}: UserFormModalProps) {
  const { t, language } = useLanguage();
  const initialFormData = useMemo(() => {
    if (user) {
      return {
        name: user.name,
        email: user.email,
        password: "", // Don't pre-fill password
        role: user.role,
        isActive: user.isActive,
        companyName: user.companyName || "",
        socialPostingAllowed: user.socialPostingAllowed,
        categoryIds: user.allowedCategories?.map((cat) => cat.id) || [],
      };
    }
    return {
      name: "",
      email: "",
      password: "",
      role: "EDITOR" as User["role"],
      isActive: true,
      companyName: "",
      socialPostingAllowed: false,
      categoryIds: [] as string[],
    };
  }, [user]);

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when user changes
  useEffect(() => {
    setFormData(initialFormData);
    setErrors({});
  }, [initialFormData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = language === "it" ? "Il nome è obbligatorio" : "Name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = language === "it" ? "Il nome deve essere di almeno 2 caratteri" : "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = language === "it" ? "L'email è obbligatoria" : "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = language === "it" ? "Inserisci un indirizzo email valido" : "Please enter a valid email address";
    }

    if (!user && !formData.password) {
      newErrors.password = language === "it" ? "La password è obbligatoria" : "Password is required";
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = language === "it" ? "La password deve essere di almeno 6 caratteri" : "Password must be at least 6 characters";
    }

    if (formData.role === "EDITOR" && formData.categoryIds.length === 0) {
      newErrors.categoryIds = language === "it" ? "È richiesta almeno una categoria per gli Editor" : "At least one category is required for Editors";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const submitData: CreateUserInput | UpdateUserInput = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
        isActive: formData.isActive,
        socialPostingAllowed: formData.socialPostingAllowed,
      };

      // Only include password if provided (for new users or password updates)
      if (formData.password) {
        submitData.password = formData.password;
      }

      // Include company name for advertisers
      if (formData.role === "ADVERTISER" && formData.companyName) {
        submitData.companyName = formData.companyName.trim();
      }

      // Include categoryIds for editors
      if (formData.role === "EDITOR") {
        submitData.categoryIds = formData.categoryIds;
      }

      onSubmit(submitData);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setFormData((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter((id) => id !== categoryId)
        : [...prev.categoryIds, categoryId],
    }));
    if (errors.categoryIds) {
      setErrors({ ...errors, categoryIds: "" });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {user ? t("admin.editUser") : t("admin.createUser")}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && <ErrorMessage error={error} />}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("admin.name")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: "" });
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder={language === "it" ? "Nome completo" : "Full name"}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("admin.email")} <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: "" });
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="user@example.com"
                disabled={isLoading || !!user} // Don't allow changing email
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
              {user && (
                <p className="mt-1 text-xs text-gray-500">
                  {language === "it" ? "L'email non può essere modificata" : "Email cannot be changed"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {user 
                  ? (language === "it" ? "Nuova Password (lascia vuoto per mantenere quella attuale)" : "New Password (leave blank to keep current)")
                  : t("admin.password")
                } 
                {!user && <span className="text-red-500">*</span>}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  if (errors.password) setErrors({ ...errors, password: "" });
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
                placeholder={user 
                  ? (language === "it" ? "Inserisci nuova password" : "Enter new password")
                  : (language === "it" ? "Minimo 6 caratteri" : "Minimum 6 characters")
                }
                disabled={isLoading}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("admin.role")} <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) => {
                  setFormData({ ...formData, role: e.target.value as User["role"] });
                  // Clear categoryIds if role changes from EDITOR
                  if (e.target.value !== "EDITOR") {
                    setFormData((prev) => ({ ...prev, categoryIds: [] }));
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                {ROLES.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            {formData.role === "ADVERTISER" && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === "it" ? "Nome Azienda" : "Company Name"}
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) =>
                    setFormData({ ...formData, companyName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={language === "it" ? "Nome azienda (opzionale)" : "Company name (optional)"}
                  disabled={isLoading}
                />
              </div>
            )}

            {formData.role === "EDITOR" && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === "it" ? "Categorie Consentite" : "Allowed Categories"} <span className="text-red-500">*</span>
                </label>
                <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto">
                  {categories.length === 0 ? (
                    <p className="text-sm text-gray-500">{language === "it" ? "Nessuna categoria disponibile" : "No categories available"}</p>
                  ) : (
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <label
                          key={category.id}
                          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={formData.categoryIds.includes(category.id)}
                            onChange={() => toggleCategory(category.id)}
                            disabled={isLoading}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">
                            {category.nameEn} {category.nameIt && `(${category.nameIt})`}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                {errors.categoryIds && (
                  <p className="mt-1 text-sm text-red-600">{errors.categoryIds}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {language === "it" ? "Seleziona le categorie per cui questo editor può creare post" : "Select categories this editor can create posts for"}
                </p>
              </div>
            )}

            <div className="md:col-span-2 flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  disabled={isLoading}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">{t("admin.active")}</span>
              </label>

              {(formData.role === "EDITOR" || formData.role === "ADMIN") && (
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.socialPostingAllowed}
                    onChange={(e) =>
                      setFormData({ ...formData, socialPostingAllowed: e.target.checked })
                    }
                    disabled={isLoading}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {language === "it" ? "Consenti Pubblicazione Social Media" : "Allow Social Media Posting"}
                  </span>
                </label>
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
              {t("common.cancel")}
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
                  {user 
                    ? (language === "it" ? "Aggiornamento..." : "Updating...")
                    : (language === "it" ? "Creazione..." : "Creating...")
                  }
                </>
              ) : (
                <>{user ? t("admin.updateUser") : t("admin.createUser")}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

