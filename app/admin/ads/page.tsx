"use client";

import { useState, useEffect } from "react";
import { formatPrice } from "@/lib/helpers/ad-pricing";
import { useAds, useCreateAd, useUpdateAd, useDeleteAd } from "@/lib/hooks/useAds";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import { AdFormModal } from "@/components/admin/ad-form-modal";
import { DeleteConfirmModal } from "@/components/admin/delete-confirm-modal";
import { ClearFilterButton } from "@/components/ui/clear-filter-button";
import { useLanguage } from "@/providers/LanguageProvider";
import { Ad, AdResponse } from "@/types/ads.types";
import { formatDate } from "@/lib/helpers/formatDate";
import { InputWithClear } from "@/components/ui/input-with-clear";

export default function AdminAdsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [deletingAd, setDeletingAd] = useState<Ad | null>(null);

  const limit = 10;

  // Fetch ads with filters
  const { data, isLoading, error, refetch } = useAds({
    page,
    limit,
    status: statusFilter || undefined,
    type: typeFilter || undefined,
  });

  const createMutation = useCreateAd();
  const updateMutation = useUpdateAd();
  const deleteMutation = useDeleteAd();
  const { t, language } = useLanguage();

  const adsList = (data as AdResponse | undefined)?.data?.ads || [];
  const meta = (data as AdResponse | undefined)?.data?.meta;

  // Filter by search
  const filteredAds = adsList.filter((ad: Ad) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return ad.title.toLowerCase().includes(searchLower);
  });

  const handleCreate = () => {
    setEditingAd(null);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (ad: Ad) => {
    setEditingAd(ad);
    setIsCreateModalOpen(true);
  };

  const handleDelete = (ad: Ad) => {
    setDeletingAd(ad);
  };

  const confirmDelete = () => {
    if (deletingAd) {
      deleteMutation.mutate(deletingAd.id, {
        onSuccess: () => {
          setDeletingAd(null);
        },
      });
    }
  };

  const handleSubmit = (formData: any) => {
    if (editingAd) {
      updateMutation.mutate(
        { id: editingAd.id, data: formData },
        {
          onSuccess: () => {
            setIsCreateModalOpen(false);
            setEditingAd(null);
          },
        }
      );
    } else {
      createMutation.mutate(formData, {
        onSuccess: async () => {
          setIsCreateModalOpen(false);
          // Clear filters after successful creation
          setSearch("");
          setStatusFilter("");
          setTypeFilter("");
          // Wait a bit for backend to process, then refetch
          await new Promise(resolve => setTimeout(resolve, 500));
          // Manually refetch to ensure the new ad appears
          await refetch();
        },
      });
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "PAUSED":
        return "bg-gray-100 text-gray-800";
      case "EXPIRED":
        return "bg-red-100 text-red-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeLabel = (type: string) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t("admin.adManagement")}</h1>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition whitespace-nowrap"
        >
          + {t("admin.createAd")}
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("admin.status")}</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t("admin.allStatus")}</option>
              <option value="PENDING">{t("admin.pending")}</option>
              <option value="ACTIVE">{language === "it" ? "Attivo" : "Active"}</option>
              <option value="PAUSED">{language === "it" ? "In Pausa" : "Paused"}</option>
              <option value="EXPIRED">{language === "it" ? "Scaduto" : "Expired"}</option>
              <option value="REJECTED">{t("admin.rejected")}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("admin.type")}</label>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{language === "it" ? "Tutti i Tipi" : "All Types"}</option>
              <option value="BANNER_TOP">{language === "it" ? "Banner Superiore" : "Banner Top"}</option>
              <option value="BANNER_SIDE">{language === "it" ? "Banner Laterale" : "Banner Side"}</option>
              <option value="INLINE">{language === "it" ? "In Linea" : "Inline"}</option>
              <option value="FOOTER">{language === "it" ? "Piè di Pagina" : "Footer"}</option>
              <option value="SLIDER">{language === "it" ? "Slider" : "Slider"}</option>
              <option value="TICKER">{language === "it" ? "Ticker" : "Ticker"}</option>
              <option value="POPUP">{language === "it" ? "Popup" : "Popup"}</option>
              <option value="STICKY">{language === "it" ? "Fisso" : "Sticky"}</option>
            </select>
          </div>
          <div className="flex items-end">
            <ClearFilterButton
              onClick={() => {
                setSearch("");
                setStatusFilter("");
                setTypeFilter("");
                setPage(1);
              }}
              disabled={!search && !statusFilter && !typeFilter}
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
          {/* Ads Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {filteredAds.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {language === "it" ? "Nessun annuncio trovato." : "No ads found."} {search || statusFilter || typeFilter ? t("admin.filterBy") : t("admin.createAd")}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1000px]">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                          {t("admin.preview")}
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                          {t("admin.title")}
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                          {t("admin.advertiser")}
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                          {t("admin.type")}
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                          {t("admin.status")}
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                          {t("admin.dateRange")}
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                          {t("admin.stats")}
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                          {t("admin.price")}
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                          {t("admin.actions")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredAds.map((ad: Ad) => (
                        <tr key={ad.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="w-24 h-16 relative rounded overflow-hidden bg-gray-100">
                              <img
                                src={ad.imageUrl}
                                alt={ad.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='12' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3EAd%3C/text%3E%3C/svg%3E";
                                }}
                              />
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <div className="font-medium text-gray-900">{ad.title}</div>
                              <a
                                href={ad.targetLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline"
                              >
                                {ad.targetLink}
                              </a>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {ad.advertiser ? (
                              <div>
                                <div className="font-medium text-gray-900">{ad.advertiser.name}</div>
                                {ad.advertiser.companyName && (
                                  <div className="text-xs text-gray-500">{ad.advertiser.companyName}</div>
                                )}
                                <div className="text-xs text-gray-400">{ad.advertiser.email}</div>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">System/Admin</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                              {getTypeLabel(ad.type)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(
                                ad.status
                              )}`}
                            >
                              {ad.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            <div className="flex flex-col">
                              <span>{formatDate(ad.startDate, "MMM dd, yyyy")}</span>
                              <span className="text-gray-400">to</span>
                              <span>{formatDate(ad.endDate, "MMM dd, yyyy")}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            <div className="flex flex-col gap-1">
                              <span>
                                <strong className="text-gray-900">{formatNumber(ad.impressions)}</strong>{" "}
                                impressions
                              </span>
                              <span>
                                <strong className="text-gray-900">{formatNumber(ad.clicks)}</strong> clicks
                              </span>
                              {ad.impressions > 0 && (
                                <span className="text-xs text-gray-500">
                                  CTR: {((ad.clicks / ad.impressions) * 100).toFixed(2)}%
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {ad.price ? (
                              <span className="font-semibold text-gray-900">
                                {formatPrice(ad.price)}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                            {ad.isPaid && (
                              <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">
                                Paid
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEdit(ad)}
                                className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
                              >
                                Edit
                              </button>
                              <span className="text-gray-300">|</span>
                              <button
                                onClick={() => handleDelete(ad)}
                                className="text-red-600 hover:text-red-800 hover:underline text-sm"
                              >
                                Delete
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
        <AdFormModal
          ad={editingAd}
          onSubmit={handleSubmit}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingAd(null);
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
          error={createMutation.error || updateMutation.error}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingAd && (
        <DeleteConfirmModal
          title="Delete Advertisement"
          message={`Are you sure you want to delete "${deletingAd.title}"? This action cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeletingAd(null)}
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
