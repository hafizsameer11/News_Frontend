"use client";

import { Report } from "@/types/report.types";
import { formatDate } from "@/lib/helpers/formatDate";
import { useLanguage } from "@/providers/LanguageProvider";

interface ReportDetailModalProps {
  report: Report;
  onClose: () => void;
}

export function ReportDetailModal({
  report,
  onClose,
}: ReportDetailModalProps) {
  const { language } = useLanguage();

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {language === "it" ? "Dettagli Segnalazione" : "Report Details"}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {language === "it" ? "ID" : "ID"}
                </label>
                <p className="mt-1 text-sm text-gray-900">{report.id}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {language === "it" ? "Stato" : "Status"}
                </label>
                <p className="mt-1">
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
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {language === "it" ? "Contenuto" : "Content"}
                </label>
                <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                  {report.content}
                </p>
              </div>

              {report.mediaUrl && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {language === "it" ? "URL Media" : "Media URL"}
                  </label>
                  <a
                    href={report.mediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 text-sm text-red-600 hover:text-red-800 break-all"
                  >
                    {report.mediaUrl}
                  </a>
                </div>
              )}

              {report.contactInfo && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {language === "it"
                      ? "Informazioni di Contatto"
                      : "Contact Info"}
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {report.contactInfo}
                  </p>
                </div>
              )}

              {report.user && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {language === "it" ? "Utente" : "User"}
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {report.user.name} ({report.user.email})
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {language === "it" ? "Data di Creazione" : "Created At"}
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {formatDate(report.createdAt)}
                </p>
              </div>
            </div>
          </div>

        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            onClick={onClose}
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
          >
            {language === "it" ? "Chiudi" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}

