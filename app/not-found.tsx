"use client";

import Link from "next/link";
import { useLanguage } from "@/providers/LanguageProvider";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";

export default function NotFound() {
  const { language, t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-red-600">404</h1>
            <h2 className="mt-4 text-3xl font-bold text-gray-900">
              {t("error.notFound.title")}
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              {t("error.notFound.message")}
            </p>
          </div>
          <div className="mt-8">
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition"
            >
              {t("error.notFound.backHome")}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

