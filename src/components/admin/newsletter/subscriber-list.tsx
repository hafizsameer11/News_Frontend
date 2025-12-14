"use client";

import { useState } from "react";
import { useNewsletterSubscribers } from "@/lib/hooks/useNewsletterAdmin";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import { NewsletterSubscriber } from "@/types/newsletter.types";
import { formatDate } from "@/lib/helpers/formatDate";
import { SubscriberActions } from "./subscriber-actions";
import { InputWithClear } from "@/components/ui/input-with-clear";
import { useLanguage } from "@/providers/LanguageProvider";
import { useQueryClient } from "@tanstack/react-query";
import { newsletterApi } from "@/lib/api/modules/newsletter.api";

export function SubscriberList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const limit = 50;
  const queryClient = useQueryClient();
  const { t, language } = useLanguage();

  const { data, isLoading, error } = useNewsletterSubscribers(page, limit);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["newsletter", "subscribers"] });
    queryClient.invalidateQueries({ queryKey: ["newsletter"] }); // Also refresh stats
  };

  // Subscriber action handlers
  const handleToggleStatus = async (id: string, newStatus: boolean) => {
    const response = await newsletterApi.updateSubscriberStatus(id, newStatus);
    return response;
  };

  const handleDelete = async (id: string) => {
    const response = await newsletterApi.deleteSubscriber(id);
    return response;
  };

  // apiClient interceptor returns response.data, so data is { success, message, data: {...} }
  // Then data.data is { subscribers: [...], meta: {...} }
  const subscribers = data?.data?.subscribers || [];
  const meta = data?.data?.meta;

  // Filter by search
  const filteredSubscribers = subscribers.filter((subscriber) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return subscriber.email.toLowerCase().includes(searchLower);
  });

  const handleExportCSV = () => {
    const csvContent = [
      ["Email", "Status", "Subscribed At", "Unsubscribed At"],
      ...subscribers.map((s) => [
        s.email,
        s.isActive ? "Active" : "Inactive",
        formatDate(s.subscribedAt, "yyyy-MM-dd HH:mm:ss"),
        s.unsubscribedAt ? formatDate(s.unsubscribedAt, "yyyy-MM-dd HH:mm:ss") : "",
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `newsletter-subscribers-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Search and Export */}
      <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 max-w-md w-full">
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
        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition text-sm whitespace-nowrap"
        >
          {language === "it" ? "Esporta CSV" : "Export CSV"}
        </button>
      </div>

      {/* Error Message */}
      {error && <ErrorMessage error={error} className="m-4" />}

      {/* Loading State */}
      {isLoading ? (
        <div className="p-8">
          <Loading />
        </div>
      ) : (
        <>
          {filteredSubscribers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {search ? "No subscribers found matching your search." : "No subscribers yet."}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                        {t("admin.subscriberEmail")}
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                        {t("admin.status")}
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                        {t("admin.subscribedAt")}
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                        {t("admin.unsubscribedAt")}
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                        {t("admin.actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredSubscribers.map((subscriber) => (
                      <tr key={subscriber.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{subscriber.email}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              subscriber.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {subscriber.isActive ? t("admin.active") : t("admin.inactive")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatDate(subscriber.subscribedAt, "MMM dd, yyyy HH:mm")}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {subscriber.unsubscribedAt
                            ? formatDate(subscriber.unsubscribedAt, "MMM dd, yyyy HH:mm")
                            : "-"}
                        </td>
                        <td className="px-4 py-3">
                          <SubscriberActions
                            subscriber={subscriber}
                            onToggleStatus={handleToggleStatus}
                            onDelete={handleDelete}
                            onRefresh={handleRefresh}
                          />
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
        </>
      )}
    </div>
  );
}

