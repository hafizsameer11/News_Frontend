"use client";

import { useState } from "react";
import { useAuditLogs } from "@/lib/hooks/useAuditLogs";
import { AuditLogResponse } from "@/types/audit-log.types";
import { AuditLogFilters } from "@/types/audit-log.types";
import { AuditLogTable } from "@/components/admin/audit-logs/audit-log-table";
import { AuditLogFiltersComponent } from "@/components/admin/audit-logs/audit-log-filters";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import { ExportModal } from "@/components/admin/analytics/export-modal";

export default function AuditLogsPage() {
  const [filters, setFilters] = useState<AuditLogFilters>({
    page: 1,
    limit: 50,
  });
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const { data, isLoading, error } = useAuditLogs(filters);

  const logs = (data as AuditLogResponse | undefined)?.data?.logs || [];
  const meta = (data as AuditLogResponse | undefined)?.data?.meta;

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
        <button
          onClick={() => setIsExportModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Export Logs
        </button>
      </div>

      {/* Filters */}
      <AuditLogFiltersComponent filters={filters} onFiltersChange={setFilters} />

      {/* Loading State */}
      {isLoading && <Loading />}

      {/* Error State */}
      {error && <ErrorMessage error={error} />}

      {/* Table */}
      {!isLoading && !error && (
        <>
          <AuditLogTable logs={logs} isLoading={isLoading} />

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((meta.page - 1) * meta.limit) + 1} to{" "}
                {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} logs
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(meta.page - 1)}
                  disabled={meta.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-700">
                  Page {meta.page} of {meta.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(meta.page + 1)}
                  disabled={meta.page >= meta.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
}

