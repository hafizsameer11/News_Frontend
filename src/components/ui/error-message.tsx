"use client";

import { handleApiError } from "@/lib/helpers/errorHandler";
import { useLanguage } from "@/providers/LanguageProvider";

interface ErrorMessageProps {
  error: any;
  className?: string;
}

export function ErrorMessage({ error, className = "" }: ErrorMessageProps) {
  const { language, t } = useLanguage();
  
  if (!error) return null;
  const errorMessage = handleApiError(error, language);
  const isConnectionError =
    error?.code === "CONNECTION_REFUSED" || error?.code === "NETWORK_ERROR";

  return (
    <div
      className={`bg-red-50 border border-red-200 rounded-lg p-4 ${
        isConnectionError ? "bg-yellow-50 border-yellow-200" : ""
      } ${className}`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {isConnectionError ? (
            <span className="text-yellow-600 text-xl">⚠️</span>
          ) : (
            <span className="text-red-600 text-xl">❌</span>
          )}
        </div>
        <div className="ml-3 flex-1">
          <h3
            className={`text-sm font-medium ${
              isConnectionError ? "text-yellow-800" : "text-red-800"
            }`}
          >
            {isConnectionError
              ? t("errors.backendNotRunning")
              : t("common.error")}
          </h3>
          <p
            className={`mt-1 text-sm ${
              isConnectionError ? "text-yellow-700" : "text-red-700"
            }`}
          >
            {errorMessage}
          </p>
          {isConnectionError && (
            <div className="mt-3 text-sm text-yellow-700">
              <p className="font-semibold">{t("errors.toFixThis")}</p>
              <ol className="list-decimal list-inside mt-1 space-y-1">
                <li>
                  {t("errors.openTerminal")}{" "}
                  <code className="bg-yellow-100 px-1 rounded">backend</code>{" "}
                  {language === "it" ? "directory" : "directory"}
                </li>
                <li>{t("errors.makeSureMySQL")}</li>
                <li>
                  {language === "it" ? "Esegui:" : "Run:"}{" "}
                  <code className="bg-yellow-100 px-1 rounded">
                    npm run dev
                  </code>
                </li>
                <li>{t("errors.waitForServer")}</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
