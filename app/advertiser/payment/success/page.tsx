"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/providers/LanguageProvider";
import { useAds } from "@/lib/hooks/useAds";
import { AdResponse } from "@/types/ads.types";
import { Loading } from "@/components/ui/loading";
import Link from "next/link";

function PaymentSuccessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useLanguage();
  const adId = searchParams?.get("adId");
  const paymentIntentId = searchParams?.get("payment_intent");
  
  const { data: adsData, isLoading } = useAds({});
  const [ad, setAd] = useState<any>(null);

  useEffect(() => {
    const adsList = (adsData as AdResponse | undefined)?.data?.ads || [];
    if (adsList.length > 0 && adId) {
      // Use setTimeout to defer state update
      const timer = setTimeout(() => {
        const foundAd = adsList.find((a) => a.id === adId);
        setAd(foundAd || null);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [adsData, adId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {language === "it" ? "Pagamento Completato!" : "Payment Successful!"}
          </h1>

          <p className="text-gray-600 mb-8">
            {language === "it"
              ? "Il tuo annuncio è stato creato e il pagamento è stato completato con successo."
              : "Your ad has been created and payment has been completed successfully."}
          </p>

          {ad && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6 text-left">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {language === "it" ? "Dettagli Annuncio" : "Ad Details"}
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{language === "it" ? "Titolo:" : "Title:"}</span>
                  <span className="font-medium">{ad.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{language === "it" ? "Tipo:" : "Type:"}</span>
                  <span className="font-medium">{ad.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{language === "it" ? "Stato:" : "Status:"}</span>
                  <span className="font-medium">{ad.status}</span>
                </div>
                {paymentIntentId && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {language === "it" ? "ID Pagamento:" : "Payment ID:"}
                    </span>
                    <span className="font-medium text-xs">{paymentIntentId}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/advertiser/dashboard"
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
            >
              {language === "it" ? "Vai alla Dashboard" : "Go to Dashboard"}
            </Link>
            <Link
              href="/advertiser/ads/create"
              className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition font-semibold"
            >
              {language === "it" ? "Crea Altro Annuncio" : "Create Another Ad"}
            </Link>
          </div>

          <p className="text-xs text-gray-500 mt-6">
            {language === "it"
              ? "Riceverai una email di conferma con i dettagli del pagamento."
              : "You will receive a confirmation email with payment details."}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading />
      </div>
    }>
      <PaymentSuccessPageContent />
    </Suspense>
  );
}

