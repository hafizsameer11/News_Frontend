"use client";

import { handleApiError } from "@/lib/helpers/errorHandler";

interface ErrorMessageProps {
  error: any;
  className?: string;
}

export function ErrorMessage({ error, className = "" }: ErrorMessageProps) {
  if (!error) return null;

  const errorMessage = handleApiError(error);
  const isConnectionError = error?.code === "CONNECTION_REFUSED" || error?.code === "NETWORK_ERROR";

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
            {isConnectionError ? "Backend Server Not Running" : "Error"}
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
              <p className="font-semibold">To fix this:</p>
              <ol className="list-decimal list-inside mt-1 space-y-1">
                <li>Open a terminal in the <code className="bg-yellow-100 px-1 rounded">backend</code> directory</li>
                <li>Make sure MySQL/XAMPP is running</li>
                <li>Run: <code className="bg-yellow-100 px-1 rounded">npm run dev</code></li>
                <li>Wait for the server to start on port 3001</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

