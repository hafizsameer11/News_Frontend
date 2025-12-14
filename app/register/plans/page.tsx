"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { useLanguage } from "@/providers/LanguageProvider";
import { useCreatePlanCheckout } from "@/lib/hooks/usePayment";
import { ErrorMessage } from "@/components/ui/error-message";
import { Loading } from "@/components/ui/loading";
import Link from "next/link";

interface Plan {
  id: string;
  name: string;
  nameIt: string;
  price: number;
  duration: number; // days
  features: string[];
  featuresIt: string[];
  adLimit: number;
  popular?: boolean;
}

const PLANS: Plan[] = [
  {
    id: "basic",
    name: "Basic Plan",
    nameIt: "Piano Base",
    price: 50,
    duration: 30,
    adLimit: 5,
    features: [
      "5 ads per month",
      "Banner placement",
      "Basic analytics",
      "Email support",
    ],
    featuresIt: [
      "5 annunci al mese",
      "Posizionamento banner",
      "Analisi di base",
      "Supporto email",
    ],
  },
  {
    id: "premium",
    name: "Premium Plan",
    nameIt: "Piano Premium",
    price: 150,
    duration: 30,
    adLimit: 20,
    popular: true,
    features: [
      "20 ads per month",
      "All ad types",
      "Advanced analytics",
      "Priority support",
      "Featured placement",
    ],
    featuresIt: [
      "20 annunci al mese",
      "Tutti i tipi di annunci",
      "Analisi avanzate",
      "Supporto prioritario",
      "Posizionamento in evidenza",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise Plan",
    nameIt: "Piano Enterprise",
    price: 500,
    duration: 30,
    adLimit: 100,
    features: [
      "100 ads per month",
      "All ad types",
      "Full analytics dashboard",
      "Dedicated account manager",
      "Custom ad placements",
      "API access",
    ],
    featuresIt: [
      "100 annunci al mese",
      "Tutti i tipi di annunci",
      "Dashboard analisi completa",
      "Account manager dedicato",
      "Posizionamenti personalizzati",
      "Accesso API",
    ],
  },
];

export default function PlansPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const checkoutMutation = useCreatePlanCheckout();

  // Check for payment success
  const paymentSuccess = searchParams?.get("payment") === "success";
  const paymentCancelled = searchParams?.get("payment") === "cancelled";

  // Redirect if not authenticated
  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }

  const handleSelectPlan = async (plan: Plan) => {
    setSelectedPlan(plan.id);
    try {
      const response = await checkoutMutation.mutateAsync({
        planId: plan.id,
        planPrice: plan.price,
      });
      
      if (response.data?.url) {
        // Redirect to Stripe checkout
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Payment Status Messages */}
        {paymentSuccess && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            <p className="font-semibold">
              {language === "it" ? "Pagamento completato con successo!" : "Payment completed successfully!"}
            </p>
            <p className="text-sm mt-1">
              {language === "it"
                ? "Il tuo piano è stato attivato. Puoi ora creare annunci."
                : "Your plan has been activated. You can now create ads."}
            </p>
          </div>
        )}

        {paymentCancelled && (
          <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
            <p className="font-semibold">
              {language === "it" ? "Pagamento annullato" : "Payment cancelled"}
            </p>
            <p className="text-sm mt-1">
              {language === "it"
                ? "Il pagamento è stato annullato. Puoi riprovare quando sei pronto."
                : "Payment was cancelled. You can try again when you're ready."}
            </p>
          </div>
        )}

        {checkoutMutation.error && (
          <div className="mb-6">
            <ErrorMessage error={checkoutMutation.error} />
          </div>
        )}

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {language === "it" ? "Scegli il Tuo Piano" : "Choose Your Plan"}
          </h1>
          <p className="text-xl text-gray-600">
            {language === "it"
              ? "Seleziona il piano che meglio si adatta alle tue esigenze pubblicitarie"
              : "Select the plan that best fits your advertising needs"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-lg shadow-lg overflow-hidden ${
                plan.popular
                  ? "ring-2 ring-red-600 scale-105"
                  : "border border-gray-200"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-red-600 text-white text-center py-2 text-sm font-bold">
                  {language === "it" ? "PIÙ POPOLARE" : "MOST POPULAR"}
                </div>
              )}

              <div className={`p-8 ${plan.popular ? "pt-12" : ""}`}>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {language === "it" ? plan.nameIt : plan.name}
                </h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">€{plan.price}</span>
                  <span className="text-gray-600 ml-2">
                    /{language === "it" ? "mese" : "month"}
                  </span>
                </div>

                <ul className="space-y-4 mb-8">
                  {(language === "it" ? plan.featuresIt : plan.features).map(
                    (feature, index) => (
                      <li key={index} className="flex items-start">
                        <svg
                          className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5"
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
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    )
                  )}
                </ul>

                <button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={checkoutMutation.isPending || selectedPlan === plan.id}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed ${
                    plan.popular
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  }`}
                >
                  {checkoutMutation.isPending && selectedPlan === plan.id
                    ? language === "it"
                      ? "Caricamento..."
                      : "Loading..."
                    : language === "it"
                      ? "Seleziona Piano"
                      : "Select Plan"}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/advertiser/dashboard"
            className="text-red-600 hover:text-red-700 font-medium"
          >
            {language === "it"
              ? "Salta per ora, sceglierò più tardi"
              : "Skip for now, I'll choose later"}
          </Link>
        </div>
      </div>
    </div>
  );
}

