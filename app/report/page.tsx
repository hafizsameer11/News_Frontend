"use client";

import { useState } from "react";
import { ReportForm } from "@/components/reports/report-form";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { useLanguage } from "@/providers/LanguageProvider";
import Link from "next/link";

export default function ReportPage() {
  const [submitted, setSubmitted] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-2xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-8">
            {!submitted ? (
              <>
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {t("report.title")}
                  </h1>
                  <p className="text-gray-600">{t("report.description")}</p>
                </div>
                <ReportForm
                  onSuccess={() => {
                    setSubmitted(true);
                  }}
                />
              </>
            ) : (
              <div className="text-center py-12">
                <div className="mb-4">
                  <svg
                    className="mx-auto h-12 w-12 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {t("report.reportSubmitted")}
                </h2>
                <p className="text-gray-600 mb-8">{t("report.thankYou")}</p>
                <div className="flex gap-4 justify-center">
                  <Link
                    href="/"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                  >
                    {t("report.backToHome")}
                  </Link>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    {t("report.submitAnother")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
