"use client";

import { useState, useEffect } from "react";
import { useResendVerification } from "@/lib/hooks/useAuth";
import { usePublicConfig } from "@/lib/hooks/useConfig";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { ErrorMessage } from "@/components/ui/error-message";
import { Loading } from "@/components/ui/loading";
import { useLanguage } from "@/providers/LanguageProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CheckInboxPage() {
  const [emailSent, setEmailSent] = useState(false);
  const resendMutation = useResendVerification();
  const { language } = useLanguage();
  const router = useRouter();
  const { data: configData, isLoading: isLoadingConfig } = usePublicConfig();
  const isEmailVerificationEnabled = configData?.data?.data?.enableEmailVerification ?? true;

  // Redirect if email verification is disabled
  useEffect(() => {
    if (!isLoadingConfig && !isEmailVerificationEnabled) {
      router.push("/dashboard");
    }
  }, [isLoadingConfig, isEmailVerificationEnabled, router]);

  if (isLoadingConfig) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <Loading />
        </main>
        <Footer />
      </div>
    );
  }

  if (!isEmailVerificationEnabled) {
    return null; // Will redirect
  }

  const handleResend = () => {
    resendMutation.mutate(undefined, {
      onSuccess: () => {
        setEmailSent(true);
      },
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <div className="mb-6">
              <svg
                className="mx-auto h-16 w-16 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {language === "it"
                ? "Controlla la tua email"
                : "Check Your Email"}
            </h1>
            <p className="text-gray-600 mb-6">
              {language === "it"
                ? "Ti abbiamo inviato un'email di verifica. Clicca sul link nell'email per verificare il tuo account."
                : "We've sent you a verification email. Click the link in the email to verify your account."}
            </p>

            {resendMutation.error && (
              <ErrorMessage error={resendMutation.error} className="mb-4" />
            )}

            {emailSent && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">
                  {language === "it"
                    ? "Email inviata con successo!"
                    : "Email sent successfully!"}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={handleResend}
                disabled={resendMutation.isPending || emailSent}
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendMutation.isPending ? (
                  <Loading />
                ) : language === "it" ? (
                  "Invia di nuovo l'email"
                ) : (
                  "Resend Email"
                )}
              </button>

              <Link
                href="/login"
                className="block text-center text-sm text-red-600 hover:text-red-800"
              >
                {language === "it" ? "Torna al login" : "Back to Login"}
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

