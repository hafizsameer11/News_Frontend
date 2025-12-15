"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStripe } from "@/lib/hooks/useStripe";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";

export default function PaymentCheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { stripe, loading: stripeLoading } = useStripe();
  const [error, setError] = useState<string>("");
  const [processing, setProcessing] = useState(false);

  const adId = searchParams?.get("adId");
  const clientSecret = searchParams?.get("clientSecret");

  useEffect(() => {
    if (!stripe || !clientSecret || !adId) {
      return;
    }

    const handleCheckout = async () => {
      setProcessing(true);
      setError("");

      try {
        // Confirm Payment Intent with clientSecret
        // For Payment Intents, use confirmPayment instead of redirectToCheckout
        // redirectToCheckout is only for Checkout Sessions (sessionId)
        const { error: stripeError } = await stripe.confirmPayment({
          clientSecret: clientSecret,
          confirmParams: {
            return_url: `${window.location.origin}/advertiser/payment/success?adId=${adId}`,
          },
        });

        if (stripeError) {
          setError(stripeError.message || "Payment failed");
          setProcessing(false);
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        setProcessing(false);
      }
    };

    if (!stripeLoading) {
      handleCheckout();
    }
  }, [stripe, clientSecret, adId, stripeLoading]);

  if (stripeLoading || processing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loading />
          <p className="mt-4 text-gray-600">Redirecting to payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <ErrorMessage error={new Error(error)} />
          <button
            onClick={() => router.push(`/advertiser/payment/failure?adId=${adId}`)}
            className="mt-4 w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Go to Failure Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loading />
        <p className="mt-4 text-gray-600">Processing payment...</p>
      </div>
    </div>
  );
}

