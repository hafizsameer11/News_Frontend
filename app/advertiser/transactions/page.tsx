"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { useGetMe } from "@/lib/hooks/useAuth";
import { paymentApi } from "@/lib/api/modules/payment.api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import { Transaction } from "@/types/transaction.types";
import { AuthResponse } from "@/types/user.types";
import { formatDate } from "@/lib/helpers/formatDate";
import { useLanguage } from "@/providers/LanguageProvider";
import { InputWithClear } from "@/components/ui/input-with-clear";
import Link from "next/link";
import { formatPrice } from "@/lib/helpers/ad-pricing";

// Available plans with pricing
const AVAILABLE_PLANS = [
  { id: "basic", name: "Basic", price: 29.99 },
  { id: "premium", name: "Premium", price: 79.99 },
  { id: "enterprise", name: "Enterprise", price: 199.99 },
];

export default function TransactionsPage() {
  const router = useRouter();
  const { user: authUser, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const { data: userData, isLoading: userLoading } = useGetMe(isAuthenticated);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedNewPlan, setSelectedNewPlan] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const user = (userData as AuthResponse | undefined)?.data?.user || authUser;

  const { data, isLoading, error } = useQuery({
    queryKey: ["transactions", "me"],
    queryFn: () => paymentApi.getUserTransactions(),
    enabled: isAuthenticated && !!user,
  });

  const cancelPlanMutation = useMutation({
    mutationFn: (transactionId: string) => paymentApi.cancelPlan(transactionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions", "me"] });
      setShowCancelModal(false);
      setSelectedTransaction(null);
      setSuccessMessage(
        language === "it"
          ? "Piano cancellato con successo"
          : "Plan cancelled successfully"
      );
      setTimeout(() => setSuccessMessage(""), 5000);
    },
    onError: (error: any) => {
      setErrorMessage(
        error?.message ||
          (language === "it"
            ? "Errore durante la cancellazione del piano"
            : "Error cancelling plan")
      );
      setTimeout(() => setErrorMessage(""), 5000);
    },
  });

  const changePlanMutation = useMutation({
    mutationFn: ({
      transactionId,
      newPlanId,
      newPlanPrice,
    }: {
      transactionId: string;
      newPlanId: string;
      newPlanPrice: number;
    }) => paymentApi.changePlan(transactionId, newPlanId, newPlanPrice),
    onSuccess: (response) => {
      // ApiResponse wraps the data, so access response.data.data.checkoutUrl
      const responseData = response?.data?.data as { message: string; checkoutUrl: string; sessionId: string } | undefined;
      if (responseData?.checkoutUrl) {
        // Redirect to checkout
        // eslint-disable-next-line react-hooks/immutability
        window.location.href = responseData.checkoutUrl;
      } else {
        queryClient.invalidateQueries({ queryKey: ["transactions", "me"] });
        setShowChangeModal(false);
        setSelectedTransaction(null);
        setSelectedNewPlan("");
        setSuccessMessage(
          language === "it"
            ? "Piano modificato con successo"
            : "Plan changed successfully"
        );
        setTimeout(() => setSuccessMessage(""), 5000);
      }
    },
    onError: (error: any) => {
      setErrorMessage(
        error?.message ||
          (language === "it"
            ? "Errore durante la modifica del piano"
            : "Error changing plan")
      );
      setTimeout(() => setErrorMessage(""), 5000);
    },
  });

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

  const transactions: Transaction[] = (data as { data: { data: Transaction[] } } | undefined)?.data?.data || [];

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction) => {
    if (search) {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        transaction.ad?.title?.toLowerCase().includes(searchLower) ||
        transaction.id.toLowerCase().includes(searchLower) ||
        transaction.stripePaymentIntentId?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }
    if (statusFilter && transaction.status !== statusFilter) return false;
    return true;
  });

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

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { en: string; it: string }> = {
      SUCCEEDED: { en: "Succeeded", it: "Completato" },
      PENDING: { en: "Pending", it: "In Attesa" },
      FAILED: { en: "Failed", it: "Fallito" },
      REFUNDED: { en: "Refunded", it: "Rimborsato" },
    };
    return labels[status]?.[language === "it" ? "it" : "en"] || status;
  };

  // Calculate totals
  const totalAmount = filteredTransactions
    .filter((t) => t.status === "SUCCEEDED")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalTransactions = filteredTransactions.length;
  const succeededTransactions = filteredTransactions.filter(
    (t) => t.status === "SUCCEEDED"
  ).length;

  const handleCancelPlan = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowCancelModal(true);
  };

  const handleChangePlan = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setSelectedNewPlan("");
    setShowChangeModal(true);
  };

  const confirmCancelPlan = () => {
    if (selectedTransaction) {
      cancelPlanMutation.mutate(selectedTransaction.id);
    }
  };

  const confirmChangePlan = () => {
    if (selectedTransaction && selectedNewPlan) {
      const newPlan = AVAILABLE_PLANS.find((p) => p.id === selectedNewPlan);
      if (newPlan) {
        changePlanMutation.mutate({
          transactionId: selectedTransaction.id,
          newPlanId: newPlan.id,
          newPlanPrice: newPlan.price,
        });
      }
    }
  };

  const availablePlansForChange = AVAILABLE_PLANS.filter(
    (plan) => plan.id !== selectedTransaction?.planId
  );

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{errorMessage}</span>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {language === "it" ? "Transazioni" : "Transactions"}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {language === "it"
              ? "Visualizza la cronologia dei pagamenti"
              : "View your payment history"}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            {language === "it" ? "Totale Transazioni" : "Total Transactions"}
          </h3>
          <p className="text-3xl font-bold text-gray-900">{totalTransactions}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            {language === "it" ? "Transazioni Completate" : "Succeeded Transactions"}
          </h3>
          <p className="text-3xl font-bold text-green-600">{succeededTransactions}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            {language === "it" ? "Totale Pagato" : "Total Paid"}
          </h3>
          <p className="text-3xl font-bold text-purple-600">
            {formatPrice(totalAmount)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === "it" ? "Cerca" : "Search"}
            </label>
            <InputWithClear
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch("")}
              placeholder={
                language === "it"
                  ? "Cerca per ID, annuncio o Stripe ID..."
                  : "Search by ID, ad, or Stripe ID..."
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
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">{language === "it" ? "Tutti gli stati" : "All Status"}</option>
              <option value="SUCCEEDED">
                {language === "it" ? "Completato" : "Succeeded"}
              </option>
              <option value="PENDING">
                {language === "it" ? "In Attesa" : "Pending"}
              </option>
              <option value="FAILED">
                {language === "it" ? "Fallito" : "Failed"}
              </option>
              <option value="REFUNDED">
                {language === "it" ? "Rimborsato" : "Refunded"}
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading ? (
          <div className="p-8">
            <Loading />
          </div>
        ) : error ? (
          <div className="p-8">
            <ErrorMessage error={error} />
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">💳</div>
            <p className="text-lg font-medium text-gray-900 mb-2">
              {language === "it"
                ? "Nessuna transazione trovata"
                : "No transactions found"}
            </p>
            <p className="text-sm text-gray-500">
              {language === "it"
                ? "Le tue transazioni appariranno qui quando effettuerai un pagamento."
                : "Your transactions will appear here when you make a payment."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    {language === "it" ? "Data" : "Date"}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    {language === "it" ? "Annuncio" : "Ad"}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    {language === "it" ? "Importo" : "Amount"}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    {language === "it" ? "Stato" : "Status"}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    {language === "it" ? "Stripe ID" : "Stripe ID"}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    {language === "it" ? "Azioni" : "Actions"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(transaction.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      {transaction.ad ? (
                        <Link
                          href={`/advertiser/ads/${transaction.ad.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {transaction.ad.title}
                        </Link>
                      ) : transaction.planId ? (
                        <span className="text-gray-600">
                          {language === "it" ? "Piano" : "Plan"} ({transaction.planId})
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      {formatPrice(Number(transaction.amount))} {transaction.currency}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(
                          transaction.status
                        )}`}
                      >
                        {getStatusLabel(transaction.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-mono text-xs">
                      {transaction.stripePaymentIntentId || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      <div className="flex gap-2">
                        {transaction.ad && (
                          <Link
                            href={`/advertiser/ads/${transaction.ad.id}`}
                            className="text-red-600 hover:text-red-900 hover:underline"
                          >
                            {language === "it" ? "Visualizza" : "View"}
                          </Link>
                        )}
                        {transaction.planId && (
                          <>
                            {transaction.status === "SUCCEEDED" ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleCancelPlan(transaction)}
                                  className="text-red-600 hover:text-red-900 hover:underline text-sm"
                                >
                                  {language === "it" ? "Cancella" : "Cancel"}
                                </button>
                                <button
                                  onClick={() => handleChangePlan(transaction)}
                                  className="text-blue-600 hover:text-blue-900 hover:underline text-sm"
                                >
                                  {language === "it" ? "Cambia Piano" : "Change Plan"}
                                </button>
                              </div>
                            ) : transaction.status === "PENDING" ? (
                              <span className="text-sm text-gray-500">
                                {language === "it" ? "In attesa di pagamento" : "Payment pending"}
                              </span>
                            ) : null}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cancel Plan Modal */}
      {showCancelModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {language === "it" ? "Cancella Piano" : "Cancel Plan"}
            </h2>
            <p className="text-gray-600 mb-6">
              {language === "it"
                ? `Sei sicuro di voler cancellare il piano "${selectedTransaction.planId}"? Questa azione non può essere annullata.`
                : `Are you sure you want to cancel the plan "${selectedTransaction.planId}"? This action cannot be undone.`}
            </p>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedTransaction(null);
                }}
                disabled={cancelPlanMutation.isPending}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                {language === "it" ? "Annulla" : "Cancel"}
              </button>
              <button
                onClick={confirmCancelPlan}
                disabled={cancelPlanMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {cancelPlanMutation.isPending ? (
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
                    {language === "it" ? "Cancellazione..." : "Cancelling..."}
                  </>
                ) : (
                  language === "it" ? "Conferma Cancellazione" : "Confirm Cancellation"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Plan Modal */}
      {showChangeModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {language === "it" ? "Cambia Piano" : "Change Plan"}
            </h2>
            <p className="text-gray-600 mb-4">
              {language === "it"
                ? `Seleziona un nuovo piano per sostituire "${selectedTransaction.planId}".`
                : `Select a new plan to replace "${selectedTransaction.planId}".`}
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === "it" ? "Nuovo Piano" : "New Plan"}
              </label>
              <select
                value={selectedNewPlan}
                onChange={(e) => setSelectedNewPlan(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">
                  {language === "it" ? "Seleziona un piano" : "Select a plan"}
                </option>
                {availablePlansForChange.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} - {formatPrice(plan.price)}/month
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowChangeModal(false);
                  setSelectedTransaction(null);
                  setSelectedNewPlan("");
                }}
                disabled={changePlanMutation.isPending}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                {language === "it" ? "Annulla" : "Cancel"}
              </button>
              <button
                onClick={confirmChangePlan}
                disabled={changePlanMutation.isPending || !selectedNewPlan}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {changePlanMutation.isPending ? (
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
                    {language === "it" ? "Elaborazione..." : "Processing..."}
                  </>
                ) : (
                  language === "it" ? "Conferma Cambio" : "Confirm Change"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

