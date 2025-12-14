"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/providers/LanguageProvider";
import Link from "next/link";

export default function PaymentFailurePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useLanguage();
  const adId = searchParams?.get("adId");
  const error = searchParams?.get("error");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          {/* Failure Icon */}
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {language === "it" ? "Pagamento Fallito" : "Payment Failed"}
          </h1>

          <p className="text-gray-600 mb-4">
            {language === "it"
              ? "Spiacenti, il pagamento non è stato completato. Si prega di riprovare."
              : "Sorry, the payment could not be completed. Please try again."}
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-red-800">
                <strong>{language === "it" ? "Errore:" : "Error:"}</strong> {error}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            {adId && (
              <button
                onClick={() => router.push(`/advertiser/ads/create?retry=${adId}`)}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
              >
                {language === "it" ? "Riprova Pagamento" : "Retry Payment"}
              </button>
            )}
            <Link
              href="/advertiser/dashboard"
              className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition font-semibold"
            >
              {language === "it" ? "Torna alla Dashboard" : "Back to Dashboard"}
            </Link>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <p className="text-sm text-gray-600 mb-2">
              {language === "it"
                ? "Hai bisogno di aiuto?"
                : "Need help?"}
            </p>
            <Link
              href="/contact"
              className="text-red-600 hover:text-red-800 font-medium"
            >
              {language === "it" ? "Contatta il Supporto" : "Contact Support"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

