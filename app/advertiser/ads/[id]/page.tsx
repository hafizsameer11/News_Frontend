"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { useGetMe } from "@/lib/hooks/useAuth";
import { useAds, useDeleteAd, useUpdateAd } from "@/lib/hooks/useAds";
import { useAdAnalytics } from "@/lib/hooks/useAnalytics";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import { DeleteConfirmModal } from "@/components/admin/delete-confirm-modal";
import { AdAnalyticsDetail } from "@/components/advertiser/ad-analytics-detail";
import { AdFormModal } from "@/components/admin/ad-form-modal";
import { Ad, AdResponse } from "@/types/ads.types";
import { AuthResponse } from "@/types/user.types";
import { formatDate } from "@/lib/helpers/formatDate";
import { useLanguage } from "@/providers/LanguageProvider";
import Link from "next/link";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { formatPrice } from "@/lib/helpers/ad-pricing";

function AdDetailPageContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user: authUser, isAuthenticated } = useAuth();
  const { language, formatNumber } = useLanguage();
  const { data: userData, isLoading: userLoading } = useGetMe(isAuthenticated);
  const adId = params.id as string;
  const isEditMode = searchParams?.get("edit") === "true";

  const [deletingAd, setDeletingAd] = useState<Ad | null>(null);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const user = (userData as AuthResponse | undefined)?.data?.user || authUser;

  const { data: adsData, isLoading: adsLoading, error: adsError } = useAds({});
  const { data: analyticsData, isLoading: analyticsLoading } =
    useAdAnalytics(adId);
  const deleteMutation = useDeleteAd();
  const updateMutation = useUpdateAd();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "ADVERTISER") {
      router.push("/login");
    }
  }, [isAuthenticated, user, router]);

  const adsList = (adsData as AdResponse | undefined)?.data?.ads || [];
  const ad = adsList.find((a) => a.id === adId && a.advertiserId === user?.id);

  // Initialize edit mode when ad is loaded
  useEffect(() => {
    if (isEditMode && ad && !editingAd) {
      // Use setTimeout to defer state updates
      const timer = setTimeout(() => {
        setEditingAd(ad);
        setShowEditModal(true);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isEditMode, adId, ad, editingAd]);

  if (userLoading || !isAuthenticated || !user || user.role !== "ADVERTISER") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading />
      </div>
    );
  }

  if (adsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading />
      </div>
    );
  }

  if (adsError) {
    return (
      <div className="p-8">
        <ErrorMessage error={adsError} />
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="p-8 text-center">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {language === "it" ? "Annuncio non trovato" : "Ad Not Found"}
        </h2>
        <p className="text-gray-600 mb-6">
          {language === "it"
            ? "L'annuncio che stai cercando non esiste o non hai i permessi per visualizzarlo."
            : "The ad you're looking for doesn't exist or you don't have permission to view it."}
        </p>
        <Link
          href="/advertiser/ads"
          className="inline-block px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
        >
          {language === "it" ? "Torna agli Annunci" : "Back to Ads"}
        </Link>
      </div>
    );
  }

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

  const handleDelete = () => {
    setDeletingAd(ad);
  };

  const confirmDelete = () => {
    if (deletingAd) {
      deleteMutation.mutate(deletingAd.id, {
        onSuccess: () => {
          router.push("/advertiser/ads");
        },
      });
    }
  };

  const handleEdit = () => {
    setEditingAd(ad);
    setShowEditModal(true);
  };

  const handleSubmit = (formData: any) => {
    if (editingAd) {
      updateMutation.mutate(
        { id: editingAd.id, data: formData },
        {
          onSuccess: () => {
            setShowEditModal(false);
            setEditingAd(null);
            router.push(`/advertiser/ads/${adId}`);
          },
        }
      );
    }
  };

  const canEdit = ad.status === "PENDING";
  const ctr =
    ad.impressions > 0
      ? ((ad.clicks / ad.impressions) * 100).toFixed(2)
      : "0.00";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <Link
            href="/advertiser/ads"
            className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-block"
          >
            ← {language === "it" ? "Torna agli Annunci" : "Back to Ads"}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{ad.title}</h1>
          <p className="text-sm text-gray-600 mt-1">
            {language === "it" ? "ID Annuncio" : "Ad ID"}: {ad.id}
          </p>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              {language === "it" ? "Modifica" : "Edit"}
            </button>
          )}
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
          >
            {language === "it" ? "Elimina" : "Delete"}
          </button>
        </div>
      </div>

      {/* Ad Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Preview */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {language === "it" ? "Anteprima Annuncio" : "Ad Preview"}
            </h2>
            <div className="relative w-full h-64 rounded-lg overflow-hidden bg-gray-100">
              <OptimizedImage
                src={ad.imageUrl}
                alt={ad.title}
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* Ad Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {language === "it" ? "Informazioni Annuncio" : "Ad Information"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === "it" ? "Titolo" : "Title"}
                </label>
                <p className="text-gray-900">{ad.title}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === "it" ? "Tipo" : "Type"}
                </label>
                <p className="text-gray-900">{getTypeLabel(ad.type)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === "it" ? "Stato" : "Status"}
                </label>
                <span
                  className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(
                    ad.status
                  )}`}
                >
                  {ad.status}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === "it" ? "Posizione" : "Position"}
                </label>
                <p className="text-gray-900">{ad.position || "N/A"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === "it" ? "Link di Destinazione" : "Target Link"}
                </label>
                <a
                  href={ad.targetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {ad.targetLink}
                </a>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === "it" ? "Prezzo" : "Price"}
                </label>
                <p className="text-gray-900">
                  {ad.price ? formatPrice(Number(ad.price)) : "-"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === "it" ? "Data di Inizio" : "Start Date"}
                </label>
                <p className="text-gray-900">{formatDate(ad.startDate)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === "it" ? "Data di Fine" : "End Date"}
                </label>
                <p className="text-gray-900">{formatDate(ad.endDate)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === "it" ? "Pagato" : "Paid"}
                </label>
                <p className="text-gray-900">
                  {ad.isPaid ? (
                    <span className="text-green-600 font-semibold">
                      {language === "it" ? "Sì" : "Yes"}
                    </span>
                  ) : (
                    <span className="text-red-600 font-semibold">
                      {language === "it" ? "No" : "No"}
                    </span>
                  )}
                </p>
              </div>
              {ad.rejectionReason && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-red-700 mb-1">
                    {language === "it"
                      ? "Motivo del Rifiuto"
                      : "Rejection Reason"}
                  </label>
                  <p className="text-red-600 bg-red-50 p-3 rounded">
                    {ad.rejectionReason}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Analytics */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {language === "it" ? "Analisi Dettagliate" : "Detailed Analytics"}
            </h2>
            {analyticsLoading ? <Loading /> : <AdAnalyticsDetail adId={adId} />}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {language === "it" ? "Statistiche Rapide" : "Quick Stats"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  {language === "it" ? "Visualizzazioni" : "Impressions"}
                </label>
                <p className="text-2xl font-bold text-blue-600">
                  {formatNumber(ad.impressions || 0)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  {language === "it" ? "Clic" : "Clicks"}
                </label>
                <p className="text-2xl font-bold text-green-600">
                  {formatNumber(ad.clicks || 0)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  {language === "it"
                    ? "Tasso di Click (CTR)"
                    : "Click-Through Rate (CTR)"}
                </label>
                <p className="text-2xl font-bold text-red-600">{ctr}%</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          {!ad.isPaid && ad.status === "PENDING" && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {language === "it" ? "Azioni" : "Actions"}
              </h3>
              <Link
                href={`/advertiser/payment/checkout?adId=${ad.id}`}
                className="block w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-center font-semibold mb-2"
              >
                {language === "it" ? "Paga Ora" : "Pay Now"}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && editingAd && (
        <AdFormModal
          ad={editingAd}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowEditModal(false);
            setEditingAd(null);
            router.push(`/advertiser/ads/${adId}`);
          }}
          isLoading={updateMutation.isPending}
        />
      )}

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

export default function AdDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading />
      </div>
    }>
      <AdDetailPageContent />
    </Suspense>
  );
}
