"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WizardFormData } from "../ad-creation-wizard";
import { useCreateAd } from "@/lib/hooks/useAds";
import { useCreatePayment } from "@/lib/hooks/useAds";
import { useStripe, isPaymentBypassEnabled } from "@/lib/hooks/useStripe";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import { formatPrice, calculateAdPrice } from "@/lib/helpers/ad-pricing";
import { useLanguage } from "@/providers/LanguageProvider";

interface PaymentStepProps {
  formData: WizardFormData;
  onComplete: (adId: string) => void;
  onBack: () => void;
}

export function PaymentStep({ formData, onComplete, onBack }: PaymentStepProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const { stripe, loading: stripeLoading } = useStripe();
  const createAdMutation = useCreateAd();
  const createPaymentMutation = useCreatePayment();
  const [error, setError] = useState<string>("");
  const [processing, setProcessing] = useState(false);
  
  const bypassPayment = isPaymentBypassEnabled();

  const startDate = formData.startDate ? new Date(formData.startDate + "T00:00:00") : new Date();
  const endDate = formData.endDate ? new Date(formData.endDate + "T23:59:59") : new Date();
  const calculatedPrice = calculateAdPrice(formData.type, startDate, endDate);

  const handlePayment = async () => {
    setError("");
    setProcessing(true);

    try {
      // Step 1: Create the ad
      const adData = {
        title: formData.title,
        type: formData.type,
        imageUrl: formData.imageUrl,
        targetLink: formData.targetLink,
        position: formData.position,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };

      const adResult = await createAdMutation.mutateAsync(adData);
      const adId = adResult.data?.id;

      if (!adId) {
        throw new Error("Failed to create ad");
      }

      // Step 2: Handle payment (bypass or Stripe)
      if (bypassPayment) {
        // Bypass payment - mark ad as paid directly
        // The backend should handle this when bypass is enabled
        // For now, we'll create a payment with bypass flag
        try {
          await createPaymentMutation.mutateAsync(adId);
        } catch (paymentErr) {
          // If backend doesn't support bypass yet, we'll just complete
          console.warn("Payment bypass: Backend may not support bypass yet", paymentErr);
        }
        // Complete the wizard
        onComplete(adId);
        router.push(`/advertiser/dashboard?payment=success`);
      } else {
        // Normal Stripe payment flow
        if (!stripe) {
          throw new Error("Stripe is not configured. Please contact support.");
        }

        const paymentResult = await createPaymentMutation.mutateAsync(adId);
        const clientSecret = paymentResult.data?.clientSecret;

        if (!clientSecret) {
          throw new Error("Failed to initialize payment");
        }

        // Step 3: Redirect to Stripe Checkout
        router.push(`/advertiser/payment/checkout?adId=${adId}&clientSecret=${encodeURIComponent(clientSecret)}`);
      }
    } catch (err: unknown) {
      let errorMessage = "An error occurred during payment";
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "object" && err !== null) {
        const errorObj = err as { message?: string; status?: number; errors?: unknown };
        if (errorObj.message) {
          errorMessage = errorObj.message;
        } else if (errorObj.status === 403) {
          errorMessage = "You don't have permission to perform this action. Please contact support.";
        } else if (errorObj.status === 400) {
          errorMessage = "Invalid request. Please check your input and try again.";
        } else if (errorObj.status === 0) {
          errorMessage = "Unable to connect to the server. Please try again later.";
        }
      }
      
      setError(errorMessage);
      setProcessing(false);
    }
  };

  // Show loading only if Stripe is loading and bypass is not enabled
  if (stripeLoading && !bypassPayment) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loading />
      </div>
    );
  }

  // Show error only if Stripe is required but not configured
  if (!bypassPayment && !stripe && !stripeLoading) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
    const hasKey = publishableKey.trim() && 
                   !publishableKey.includes("placeholder") &&
                   (publishableKey.startsWith("pk_test_") || publishableKey.startsWith("pk_live_"));
    
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">
          {hasKey 
            ? language === "it" 
              ? "Stripe non è stato inizializzato correttamente. Si prega di ricaricare la pagina."
              : "Stripe was not initialized correctly. Please reload the page."
            : language === "it"
              ? "Stripe non è configurato. Si prega di contattare il supporto."
              : "Stripe is not configured. Please contact support."}
        </p>
        {hasKey && (
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition mt-4"
          >
            {language === "it" ? "Ricarica Pagina" : "Reload Page"}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Payment
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Review your ad details and proceed to payment.
        </p>
      </div>

      {/* Ad Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">
          Ad Summary
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Title:</span>
            <span className="font-medium">{formData.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Type:</span>
            <span className="font-medium">{formData.type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Slot:</span>
            <span className="font-medium">{formData.position || "HEADER"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Duration:</span>
            <span className="font-medium">
              {formData.startDate} to {formData.endDate}
            </span>
          </div>
          <div className="border-t border-gray-300 pt-2 mt-2">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-900">Total Price:</span>
              <span className="font-bold text-lg text-red-600">
                {formatPrice(calculatedPrice)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {error && <ErrorMessage error={new Error(error)} className="mb-4" />}

      {/* Payment Bypass Notice */}
      {bypassPayment && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                {language === "it" ? "Modalità Sviluppo" : "Development Mode"}
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                {language === "it"
                  ? "Il pagamento è stato disabilitato per i test. L'annuncio verrà creato senza pagamento."
                  : "Payment is disabled for testing. The ad will be created without payment."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Button */}
      <div className="flex gap-4 pt-4 border-t border-gray-200">
        <button
          onClick={onBack}
          className="px-6 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition font-semibold"
        >
          {language === "it" ? "Indietro" : "Back"}
        </button>
        <button
          onClick={handlePayment}
          disabled={processing || createAdMutation.isPending || createPaymentMutation.isPending}
          className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          {processing || createAdMutation.isPending || createPaymentMutation.isPending
            ? (language === "it" ? "Elaborazione..." : "Processing...")
            : bypassPayment
              ? (language === "it" ? `Crea Annuncio (${formatPrice(calculatedPrice)})` : `Create Ad (${formatPrice(calculatedPrice)})`)
              : (language === "it" ? `Paga ${formatPrice(calculatedPrice)}` : `Pay ${formatPrice(calculatedPrice)}`)}
        </button>
      </div>

      {!bypassPayment && (
        <p className="text-xs text-gray-500 text-center">
          {language === "it"
            ? "Il tuo pagamento è sicuro e crittografato. Verrai reindirizzato a Stripe Checkout per completare il pagamento."
            : "Your payment is secure and encrypted. You will be redirected to Stripe Checkout to complete the payment."}
        </p>
      )}
    </div>
  );
}

