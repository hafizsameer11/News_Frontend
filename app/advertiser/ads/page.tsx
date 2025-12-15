"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { useGetMe } from "@/lib/hooks/useAuth";
import { useAds, useDeleteAd } from "@/lib/hooks/useAds";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import { DeleteConfirmModal } from "@/components/admin/delete-confirm-modal";
import { Ad, AdResponse } from "@/types/ads.types";
import { AuthResponse } from "@/types/user.types";
import { formatDate } from "@/lib/helpers/formatDate";
import { useLanguage } from "@/providers/LanguageProvider";
import Link from "next/link";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { formatPrice } from "@/lib/helpers/ad-pricing";

export default function AdvertiserAdsPage() {
  const router = useRouter();
  const { user: authUser, isAuthenticated } = useAuth();
  const { language, formatNumber } = useLanguage();
  const { data: userData, isLoading: userLoading } = useGetMe(isAuthenticated);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [deletingAd, setDeletingAd] = useState<Ad | null>(null);

  const user = (userData as AuthResponse | undefined)?.data?.user || authUser;
  const limit = 10;

  const { data, isLoading, error } = useAds({
    page,
    limit,
    status: statusFilter || undefined,
    type: typeFilter || undefined,
  });

  const deleteMutation = useDeleteAd();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "ADVERTISER") {
      router.push("/login");
    }
  }, [isAuthenticated, user, router]);

  if (userLoading || !isAuthenticated || !user || user.role !== "ADVERTISER") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading />
      </div>
    );
  }

  const adsList = (data as AdResponse | undefined)?.data?.ads || [];
  const meta = (data as AdResponse | undefined)?.data?.meta;

  // Filter ads to only show advertiser's own ads
  const userAds = adsList.filter((ad) => ad.advertiserId === user.id);

  // Filter by search
  const filteredAds = userAds.filter((ad) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return ad.title.toLowerCase().includes(searchLower);
  });

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {language === "it" ? "I Miei Annunci" : "My Ads"}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {language === "it"
              ? "Gestisci tutti i tuoi annunci pubblicitari"
              : "Manage all your advertising campaigns"}
          </p>
        </div>
        <Link
          href="/advertiser/ads/create"
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
        >
          {language === "it" ? "+ Crea Annuncio" : "+ Create Ad"}
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === "it" ? "Cerca" : "Search"}
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={
                language === "it" ? "Cerca per titolo..." : "Search by title..."
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === "it" ? "Stato" : "Status"}
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">
                {language === "it" ? "Tutti gli stati" : "All Status"}
              </option>
              <option value="PENDING">
                {language === "it" ? "In Attesa" : "Pending"}
              </option>
              <option value="ACTIVE">
                {language === "it" ? "Attivo" : "Active"}
              </option>
              <option value="PAUSED">
                {language === "it" ? "In Pausa" : "Paused"}
              </option>
              <option value="EXPIRED">
                {language === "it" ? "Scaduto" : "Expired"}
              </option>
              <option value="REJECTED">
                {language === "it" ? "Rifiutato" : "Rejected"}
              </option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === "it" ? "Tipo" : "Type"}
            </label>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">
                {language === "it" ? "Tutti i tipi" : "All Types"}
              </option>
              <option value="BANNER_TOP">Banner Top</option>
              <option value="BANNER_SIDE">Banner Side</option>
              <option value="INLINE">Inline</option>
              <option value="FOOTER">Footer</option>
              <option value="SLIDER">Slider</option>
              <option value="TICKER">Ticker</option>
              <option value="POPUP">Popup</option>
              <option value="STICKY">Sticky</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ads Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading ? (
          <div className="p-8">
            <Loading />
          </div>
        ) : error ? (
          <div className="p-8">
            <ErrorMessage error={error} />
          </div>
        ) : filteredAds.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📢</div>
            <p className="text-lg font-medium text-gray-900 mb-2">
              {language === "it"
                ? "Non hai ancora creato annunci"
                : "You haven't created any ads yet"}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              {language === "it"
                ? "Inizia a creare il tuo primo annuncio per raggiungere migliaia di utenti"
                : "Start creating your first ad to reach thousands of users"}
            </p>
            <Link
              href="/advertiser/ads/create"
              className="inline-block px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
            >
              {language === "it"
                ? "Crea il Primo Annuncio"
                : "Create Your First Ad"}
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      {language === "it" ? "Immagine" : "Image"}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      {language === "it" ? "Titolo" : "Title"}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      {language === "it" ? "Tipo" : "Type"}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      {language === "it" ? "Stato" : "Status"}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      {language === "it" ? "Visualizzazioni" : "Impressions"}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      {language === "it" ? "Clic" : "Clicks"}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      {language === "it" ? "Prezzo" : "Price"}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      {language === "it" ? "Azioni" : "Actions"}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAds.map((ad) => (
                    <tr key={ad.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="w-24 h-16 relative rounded overflow-hidden bg-gray-100">
                          <OptimizedImage
                            src={ad.imageUrl}
                            alt={ad.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-gray-900">
                            {ad.title}
                          </div>
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
                        <span className="text-sm text-gray-600">
                          {getTypeLabel(ad.type)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(
                            ad.status
                          )}`}
                        >
                          {ad.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatNumber(ad.impressions || 0)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatNumber(ad.clicks || 0)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {ad.price ? formatPrice(Number(ad.price)) : "-"}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        <div className="flex gap-2">
                          <Link
                            href={`/advertiser/ads/${ad.id}`}
                            className="text-red-600 hover:text-red-900 hover:underline"
                          >
                            {language === "it" ? "Visualizza" : "View"}
                          </Link>
                          {ad.status === "PENDING" && (
                            <Link
                              href={`/advertiser/ads/${ad.id}?edit=true`}
                              className="text-blue-600 hover:text-blue-900 hover:underline"
                            >
                              {language === "it" ? "Modifica" : "Edit"}
                            </Link>
                          )}
                          <button
                            onClick={() => handleDelete(ad)}
                            className="text-red-600 hover:text-red-900 hover:underline"
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

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  {language === "it" ? "Mostrando" : "Showing"}{" "}
                  {(page - 1) * limit + 1} {language === "it" ? "a" : "to"}{" "}
                  {Math.min(page * limit, meta.total)}{" "}
                  {language === "it" ? "di" : "of"} {meta.total}{" "}
                  {language === "it" ? "risultati" : "results"}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {language === "it" ? "Precedente" : "Previous"}
                  </button>
                  <button
                    onClick={() =>
                      setPage((p) => Math.min(meta.totalPages, p + 1))
                    }
                    disabled={page === meta.totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {language === "it" ? "Successivo" : "Next"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingAd && (
        <DeleteConfirmModal
          isOpen={!!deletingAd}
          onCancel={() => setDeletingAd(null)}
          onConfirm={confirmDelete}
          title={language === "it" ? "Elimina Annuncio" : "Delete Ad"}
          message={
            language === "it"
              ? `Sei sicuro di voler eliminare l'annuncio "${deletingAd.title}"? Questa azione non può essere annullata.`
              : `Are you sure you want to delete the ad "${deletingAd.title}"? This action cannot be undone.`
          }
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
