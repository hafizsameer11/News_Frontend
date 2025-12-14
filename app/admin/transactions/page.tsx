"use client";

import { useState } from "react";
import { useTransactions } from "@/lib/hooks/usePayment";
import { TransactionResponse } from "@/types/transaction.types";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import { ClearFilterButton } from "@/components/ui/clear-filter-button";
import { formatDate } from "@/lib/helpers/formatDate";
import { useLanguage } from "@/providers/LanguageProvider";

export default function AdminTransactionsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const { language, t } = useLanguage();
  const limit = 20;

  const { data, isLoading, error } = useTransactions({
    page,
    limit,
    status: statusFilter || undefined,
  });

  const transactions = (data as TransactionResponse | undefined)?.data?.transactions || [];
  const meta = (data as TransactionResponse | undefined)?.data?.meta;

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "SUCCEEDED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      case "REFUNDED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatAmount = (amount: number, currency: string = "EUR") => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {language === "it" ? "Transazioni" : "Transactions"}
        </h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                {language === "it" ? "Tutti gli Stati" : "All Status"}
              </option>
              <option value="PENDING">
                {language === "it" ? "In Attesa" : "Pending"}
              </option>
              <option value="SUCCEEDED">
                {language === "it" ? "Completato" : "Succeeded"}
              </option>
              <option value="FAILED">
                {language === "it" ? "Fallito" : "Failed"}
              </option>
              <option value="REFUNDED">
                {language === "it" ? "Rimborsato" : "Refunded"}
              </option>
            </select>
          </div>
          <div className="flex items-end">
            <ClearFilterButton
              onClick={() => {
                setStatusFilter("");
                setPage(1);
              }}
              disabled={!statusFilter}
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
          {/* Transactions Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {transactions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {language === "it"
                  ? "Nessuna transazione trovata"
                  : "No transactions found"}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px]">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                          {language === "it" ? "Data" : "Date"}
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                          {language === "it" ? "Utente" : "User"}
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                          {language === "it" ? "Tipo" : "Type"}
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          {language === "it" ? "Importo" : "Amount"}
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          {language === "it" ? "Stato" : "Status"}
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          {language === "it" ? "Dettagli" : "Details"}
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          {language === "it" ? "Stripe ID" : "Stripe ID"}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {transactions.map((transaction: any) => (
                        <tr key={transaction.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {formatDate(transaction.createdAt, "MMM dd, yyyy HH:mm")}
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <div className="font-medium text-gray-900">
                                {transaction.user?.name || "N/A"}
                              </div>
                              <div className="text-xs text-gray-500">
                                {transaction.user?.email || ""}
                              </div>
                              {transaction.user?.companyName && (
                                <div className="text-xs text-gray-400">
                                  {transaction.user.companyName}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {transaction.planId ? (
                              <div>
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                  {language === "it" ? "Piano" : "Plan"}
                                </span>
                                <div className="text-xs text-gray-500 mt-1">
                                  {transaction.planId.toUpperCase()}
                                </div>
                              </div>
                            ) : transaction.adId ? (
                              <div>
                                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                                  {language === "it" ? "Annuncio" : "Ad"}
                                </span>
                                {transaction.ad && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    {transaction.ad.title}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">
                                {language === "it" ? "Altro" : "Other"}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-gray-900">
                              {formatAmount(Number(transaction.amount), transaction.currency)}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(
                                transaction.status
                              )}`}
                            >
                              {transaction.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {transaction.description && (
                              <div className="max-w-xs truncate" title={transaction.description}>
                                {transaction.description}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {transaction.stripePaymentIntentId ? (
                              <div className="text-xs text-gray-500 font-mono">
                                {transaction.stripePaymentIntentId.substring(0, 20)}...
                              </div>
                            ) : (
                              <span className="text-gray-400 text-xs">-</span>
                            )}
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
                      {language === "it"
                        ? `Mostrando ${(page - 1) * limit + 1} a ${Math.min(page * limit, meta.total)} di ${meta.total} risultati`
                        : `Showing ${(page - 1) * limit + 1} to ${Math.min(page * limit, meta.total)} of ${meta.total} results`}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                      >
                        {language === "it" ? "Precedente" : "Previous"}
                      </button>
                      <span className="px-3 py-1 text-sm text-gray-700">
                        {language === "it"
                          ? `Pagina ${page} di ${meta.totalPages}`
                          : `Page ${page} of ${meta.totalPages}`}
                      </span>
                      <button
                        onClick={() => setPage(page + 1)}
                        disabled={page >= meta.totalPages}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                      >
                        {language === "it" ? "Successivo" : "Next"}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

