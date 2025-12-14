"use client";

import { useState } from "react";
import { FormModal } from "@/components/ui/form-modal";
import { DateRangeFilter } from "@/components/advertiser/date-range-filter";
import { exportApi, ExportType, ExportFormat } from "@/lib/api/modules/export.api";
import { downloadBlob, generateExportFilename } from "@/lib/helpers/export";
import { useToast } from "@/components/ui/toast";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const [exportType, setExportType] = useState<ExportType>("audit-logs");
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const { showToast } = useToast();

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsExporting(true);

    try {
      const options = {
        format,
        startDate: startDate ? startDate.toISOString() : undefined,
        endDate: endDate ? endDate.toISOString() : undefined,
      };

      const blob = await exportApi.exportData(exportType, options);
      const filename = generateExportFilename(exportType, format, new Date());
      downloadBlob(blob, filename);

      showToast("Export completed successfully", "success");
      onClose();
    } catch (error: any) {
      showToast(
        error?.message || "Failed to export data. Please try again.",
        "error"
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <FormModal
      title="Export Analytics Data"
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleExport}
      isLoading={isExporting}
      submitLabel="Export"
      cancelLabel="Cancel"
    >
      <div className="space-y-6">
        {/* Export Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Export Type <span className="text-red-600">*</span>
          </label>
          <select
            value={exportType}
            onChange={(e) => setExportType(e.target.value as ExportType)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="audit-logs">Audit Logs</option>
            <option value="user-behavior">User Behavior</option>
            <option value="news-views">News Views</option>
            <option value="ad-analytics">Ad Analytics</option>
          </select>
        </div>

        {/* Format */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Format <span className="text-red-600">*</span>
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="csv"
                checked={format === "csv"}
                onChange={(e) => setFormat(e.target.value as ExportFormat)}
                className="mr-2"
              />
              CSV
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="json"
                checked={format === "json"}
                onChange={(e) => setFormat(e.target.value as ExportFormat)}
                className="mr-2"
              />
              JSON
            </label>
          </div>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Range (Optional)
          </label>
          <DateRangeFilter
            onRangeChange={(start, end) => {
              setStartDate(start);
              setEndDate(end);
            }}
            preset="custom"
          />
        </div>
      </div>
    </FormModal>
  );
}

