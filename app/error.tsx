"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/providers/LanguageProvider";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const { language, t } = useLanguage();

  useEffect(() => {
    // Log error to console or error tracking service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-red-600">500</h1>
            <h2 className="mt-4 text-3xl font-bold text-gray-900">
              {t("error.serverError.title")}
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              {t("error.serverError.message")}
            </p>
            {process.env.NODE_ENV === "development" && error.message && (
              <p className="mt-4 text-sm text-gray-500 font-mono">
                {error.message}
              </p>
            )}
          </div>
          <div className="mt-8 flex gap-4 justify-center">
            <button
              onClick={reset}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition"
            >
              {t("error.serverError.tryAgain")}
            </button>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition"
            >
              {t("error.serverError.backHome")}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

