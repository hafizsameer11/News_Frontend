"use client";

import { useState } from "react";
import { useSubscribeNewsletter } from "@/lib/hooks/useNewsletter";
import { validateEmail } from "@/lib/helpers/form-validation";
import { useToast } from "@/components/ui/toast";
import {
  useBehaviorTracking,
  trackNewsletterSubscription,
} from "@/lib/hooks/useBehaviorTracking";
import { useLanguage } from "@/providers/LanguageProvider";

interface SubscriptionFormProps {
  className?: string;
  onSuccess?: () => void;
}

export function SubscriptionForm({
  className = "",
  onSuccess,
}: SubscriptionFormProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { showToast } = useToast();
  const { mutate: track } = useBehaviorTracking();
  const { t } = useLanguage();

  const subscribeMutation = useSubscribeNewsletter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validate email
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      showToast(emailError, "error", 6000);
      return;
    }

    try {
      const subscribedEmail = email; // Store before clearing
      await subscribeMutation.mutateAsync({ email });
      setSuccess(true);
      setEmail("");
      showToast(t("toast.registered"), "success", 7000);

      // Track newsletter subscription
      trackNewsletterSubscription(track, subscribedEmail, {
        timestamp: new Date().toISOString(),
      });

      onSuccess?.();
      // Reset success message after 8 seconds (longer visibility)
      setTimeout(() => setSuccess(false), 8000);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || t("toast.actionFailed");
      setError(errorMessage);
      showToast(errorMessage, "error", 6000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      {/* Success Banner */}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg flex items-start gap-3 animate-in slide-in-from-top">
          <svg
            className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium text-green-800">
              {t("toast.registered")}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
              setSuccess(false);
            }}
            placeholder={t("footer.newsletter.placeholder")}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed transition ${
              success
                ? "border-green-300 focus:ring-green-500 bg-green-50"
                : error
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
            required
            disabled={subscribeMutation.isPending || success}
          />
          {success && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <svg
                className="w-5 h-5 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={subscribeMutation.isPending || !email.trim() || success}
          className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex-shrink-0 flex items-center justify-center gap-2 min-w-[120px]"
        >
          {subscribeMutation.isPending ? (
            <>
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>{t("common.loading")}</span>
            </>
          ) : success ? (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{t("footer.newsletter.subscribe")}!</span>
            </>
          ) : (
            t("footer.newsletter.subscribe")
          )}
        </button>
      </div>
      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
          <svg
            className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
    </form>
  );
}
