"use client";

import { useState } from "react";
import { useReports } from "@/lib/hooks/useReports";
import { ReportsListResponse } from "@/types/report.types";
import { ReportsList } from "@/components/admin/reports/reports-list";
import { ClearFilterButton } from "@/components/ui/clear-filter-button";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import { useLanguage } from "@/providers/LanguageProvider";

export default function AdminReportsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<
    "pending" | "resolved" | "all"
  >("all");
  const { language, t } = useLanguage();
  const limit = 10;

  const { data, isLoading, error } = useReports({
    page,
    limit,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const reportsList = (data as ReportsListResponse | undefined)?.data?.reports || [];
  const pagination = (data as ReportsListResponse | undefined)?.data?.pagination;

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {t("admin.reportManagement")}
        </h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("admin.filterBy")} {t("admin.status")}:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as "pending" | "resolved" | "all");
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">
                {t("admin.all")}
              </option>
              <option value="pending">
                {t("admin.pending")}
              </option>
              <option value="resolved">
                {t("admin.resolved")}
              </option>
            </select>
          </div>
          <div>
            <ClearFilterButton
              onClick={() => {
                setStatusFilter("all");
                setPage(1);
              }}
              disabled={statusFilter === "all"}
            />
          </div>
        </div>
      </div>

      {error && <ErrorMessage error={error} />}

      {isLoading ? (
        <Loading />
      ) : (
        <>
          <ReportsList reports={reportsList} isLoading={isLoading} />

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                {language === "it"
                  ? `Mostrando ${(page - 1) * limit + 1} - ${Math.min(
                      page * limit,
                      pagination.total
                    )} di ${pagination.total}`
                  : `Showing ${(page - 1) * limit + 1} - ${Math.min(
                      page * limit,
                      pagination.total
                    )} of ${pagination.total}`}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {language === "it" ? "Precedente" : "Previous"}
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= pagination.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {language === "it" ? "Successivo" : "Next"}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

