"use client";

import { useState } from "react";
import { Report } from "@/types/report.types";
import { formatDate } from "@/lib/helpers/formatDate";
import { ReportDetailModal } from "./report-detail-modal";
import { useResolveReport } from "@/lib/hooks/useReports";
import { useLanguage } from "@/providers/LanguageProvider";

interface ReportsListProps {
  reports: Report[];
  isLoading?: boolean;
}

export function ReportsList({ reports, isLoading }: ReportsListProps) {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const resolveMutation = useResolveReport();
  const { language } = useLanguage();

  const handleResolve = (report: Report) => {
    if (
      confirm(
        language === "it"
          ? "Sei sicuro di voler contrassegnare questa segnalazione come risolta?"
          : "Are you sure you want to mark this report as resolved?"
      )
    ) {
      resolveMutation.mutate(report.id);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          {language === "it" ? "Caricamento..." : "Loading..."}
        </p>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          {language === "it"
            ? "Nessuna segnalazione trovata"
            : "No reports found"}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {language === "it" ? "Contenuto" : "Content"}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {language === "it" ? "Utente" : "User"}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {language === "it" ? "Stato" : "Status"}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {language === "it" ? "Data" : "Date"}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {language === "it" ? "Azioni" : "Actions"}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {report.id.slice(0, 8)}...
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="max-w-md truncate">{report.content}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {report.user ? (
                    <div>
                      <div className="font-medium">{report.user.name}</div>
                      <div className="text-xs text-gray-400">
                        {report.user.email}
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400">
                      {language === "it" ? "Anonimo" : "Anonymous"}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      report.isResolved
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {report.isResolved
                      ? language === "it"
                        ? "Risolto"
                        : "Resolved"
                      : language === "it"
                      ? "In attesa"
                      : "Pending"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(report.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="text-red-600 hover:text-red-900"
                    >
                      {language === "it" ? "Visualizza" : "View"}
                    </button>
                    {!report.isResolved && (
                      <button
                        onClick={() => handleResolve(report)}
                        disabled={resolveMutation.isPending}
                        className="text-green-600 hover:text-green-900 disabled:opacity-50"
                      >
                        {language === "it" ? "Risolvi" : "Resolve"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </>
  );
}

