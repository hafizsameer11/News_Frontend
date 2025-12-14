import { useState, useEffect } from "react";
import { loadStripe, Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
    const trimmedKey = publishableKey.trim();
    
    // Check if key exists and is not empty/placeholder
    if (!trimmedKey || 
        trimmedKey === "" || 
        trimmedKey === "pk_test_placeholder" || 
        trimmedKey === "pk_live_placeholder" ||
        trimmedKey.startsWith("pk_placeholder")) {
      console.warn("Stripe publishable key not found or is placeholder. Payment functionality will be disabled.");
      return Promise.resolve(null);
    }
    
    // Validate key format
    if (!trimmedKey.startsWith("pk_test_") && !trimmedKey.startsWith("pk_live_")) {
      console.warn("Invalid Stripe publishable key format. Must start with 'pk_test_' or 'pk_live_'");
      return Promise.resolve(null);
    }
    
    stripePromise = loadStripe(trimmedKey);
  }
  return stripePromise;
}

export function useStripe() {
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStripe().then((stripeInstance) => {
      setStripe(stripeInstance);
      setLoading(false);
    });
  }, []);

  return { stripe, loading };
}

export function isPaymentBypassEnabled(): boolean {
  return process.env.NEXT_PUBLIC_BYPASS_PAYMENT === "true";
}

