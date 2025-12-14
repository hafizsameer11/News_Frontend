"use client";

import { useState } from "react";
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from "@/lib/hooks/useUser";
import { UserResponse } from "@/types/user.types";
import { useCategories } from "@/lib/hooks/useCategories";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import { UserFormModal } from "@/components/admin/user-form-modal";
import { ResetPasswordModal } from "@/components/admin/reset-password-modal";
import { DeleteConfirmModal } from "@/components/admin/delete-confirm-modal";
import { ClearFilterButton } from "@/components/ui/clear-filter-button";
import { InputWithClear } from "@/components/ui/input-with-clear";
import { useLanguage } from "@/providers/LanguageProvider";
import { User } from "@/types/user.types";
import { CategoryResponse } from "@/types/category.types";
import { formatDate } from "@/lib/helpers/formatDate";

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [resettingPasswordUser, setResettingPasswordUser] = useState<User | null>(null);

  const limit = 10;

  // Fetch users with filters
  const { data, isLoading, error } = useUsers({
    page,
    limit,
    role: roleFilter || undefined,
  });

  // Fetch categories for assignment
  const { data: categoriesData } = useCategories(true);

  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();
  const { t, language } = useLanguage();

  const usersList = (data as UserResponse | undefined)?.data?.users || [];
  const meta = (data as UserResponse | undefined)?.data?.meta;

  // Filter by search
  const filteredUsers = usersList.filter((user) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    );
  });

  const handleCreate = () => {
    setEditingUser(null);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsCreateModalOpen(true);
  };

  const handleDelete = (user: User) => {
    setDeletingUser(user);
  };

  const confirmDelete = () => {
    if (deletingUser) {
      deleteMutation.mutate(deletingUser.id, {
        onSuccess: () => {
          setDeletingUser(null);
        },
      });
    }
  };

  const handleSubmit = (formData: any) => {
    if (editingUser) {
      updateMutation.mutate(
        { id: editingUser.id, data: formData },
        {
          onSuccess: () => {
            setIsCreateModalOpen(false);
            setEditingUser(null);
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

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-red-100 text-red-800";
      case "ADMIN":
        return "bg-purple-100 text-purple-800";
      case "EDITOR":
        return "bg-blue-100 text-blue-800";
      case "ADVERTISER":
        return "bg-green-100 text-green-800";
      case "USER":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t("admin.userManagement")}</h1>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition whitespace-nowrap"
        >
          + {t("admin.createUser")}
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("admin.search")}</label>
            <InputWithClear
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              onClear={() => {
                setSearch("");
                setPage(1);
              }}
              placeholder={t("admin.search") + "..."}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("admin.role")}</label>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{language === "it" ? "Tutti i Ruoli" : "All Roles"}</option>
              <option value="SUPER_ADMIN">{language === "it" ? "Super Amministratore" : "Super Admin"}</option>
              <option value="ADMIN">{language === "it" ? "Amministratore" : "Admin"}</option>
              <option value="EDITOR">{language === "it" ? "Editore" : "Editor"}</option>
              <option value="ADVERTISER">{language === "it" ? "Inserzionista" : "Advertiser"}</option>
              <option value="USER">{language === "it" ? "Utente" : "User"}</option>
            </select>
          </div>
          <div className="flex items-end">
            <ClearFilterButton
              onClick={() => {
                setSearch("");
                setRoleFilter("");
                setPage(1);
              }}
              disabled={!search && !roleFilter}
              className="w-full"
            />
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
          {/* Users Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {language === "it" ? "Nessun utente trovato." : "No users found."} {search || roleFilter ? t("admin.filterBy") : t("admin.createUser")}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px]">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                          {language === "it" ? "Nome" : "Name"}
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                          {t("admin.email")}
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                          {t("admin.role")}
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                          {language === "it" ? "Categorie Consentite" : "Allowed Categories"}
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                          {t("admin.status")}
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                          {t("admin.created")}
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                          {t("admin.actions")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900">{user.name}</div>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{user.email}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${getRoleBadgeColor(
                                user.role
                              )}`}
                            >
                              {user.role.replace(/_/g, " ")}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {user.role === "EDITOR" ? (
                              user.allowedCategories && user.allowedCategories.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {user.allowedCategories.slice(0, 3).map((cat) => (
                                    <span
                                      key={cat.id}
                                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                                    >
                                      {cat.nameEn}
                                    </span>
                                  ))}
                                  {user.allowedCategories.length > 3 && (
                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                      +{user.allowedCategories.length - 3}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400 text-sm">No categories</span>
                              )
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                user.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {user.isActive ? t("admin.active") : t("admin.inactive")}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {formatDate(user.createdAt, "MMM dd, yyyy")}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEdit(user)}
                                className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
                              >
                                {t("common.edit")}
                              </button>
                              <span className="text-gray-300">|</span>
                              <button
                                onClick={() => setResettingPasswordUser(user)}
                                className="text-purple-600 hover:text-purple-800 hover:underline text-sm"
                              >
                                {language === "it" ? "Reimposta Password" : "Reset Password"}
                              </button>
                              <span className="text-gray-300">|</span>
                              <button
                                onClick={() => handleDelete(user)}
                                className="text-red-600 hover:text-red-800 hover:underline text-sm"
                              >
                                {t("common.delete")}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {meta && meta.totalPages > 1 && (
                  <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
                    <div className="text-sm text-gray-700">
                      Showing {(page - 1) * limit + 1} to {Math.min(page * limit, meta.total)} of{" "}
                      {meta.total} results
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                      >
                        Previous
                      </button>
                      <span className="px-3 py-1 text-sm text-gray-700">
                        Page {page} of {meta.totalPages}
                      </span>
                      <button
                        onClick={() => setPage(page + 1)}
                        disabled={page >= meta.totalPages}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      {/* Create/Edit Modal */}
      {isCreateModalOpen && (
        <UserFormModal
          user={editingUser}
          categories={(categoriesData as CategoryResponse | undefined)?.data || []}
          onSubmit={handleSubmit}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingUser(null);
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
          error={createMutation.error || updateMutation.error}
        />
      )}

      {/* Reset Password Modal */}
      {resettingPasswordUser && (
        <ResetPasswordModal
          userEmail={resettingPasswordUser.email}
          onClose={() => setResettingPasswordUser(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingUser && (
        <DeleteConfirmModal
          title="Delete User"
          message={`Are you sure you want to delete user "${deletingUser.name}"? This action cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeletingUser(null)}
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
