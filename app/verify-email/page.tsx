"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useVerifyEmail } from "@/lib/hooks/useAuth";
import { usePublicConfig } from "@/lib/hooks/useConfig";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { ErrorMessage } from "@/components/ui/error-message";
import { Loading } from "@/components/ui/loading";
import { useLanguage } from "@/providers/LanguageProvider";
import Link from "next/link";

function VerifyEmailPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [verified, setVerified] = useState(false);
  const verifyMutation = useVerifyEmail();
  const { language } = useLanguage();
  const { data: configData, isLoading: isLoadingConfig } = usePublicConfig();
  const isEmailVerificationEnabled = configData?.data?.data?.enableEmailVerification ?? true;

  // Redirect if email verification is disabled
  useEffect(() => {
    if (!isLoadingConfig && !isEmailVerificationEnabled) {
      router.push("/login");
    }
  }, [isLoadingConfig, isEmailVerificationEnabled, router]);

  useEffect(() => {
    if (token && isEmailVerificationEnabled && !isLoadingConfig) {
      verifyMutation.mutate(token, {
        onSuccess: () => {
          setVerified(true);
          // Redirect after 3 seconds
          setTimeout(() => {
            router.push("/login?verified=true");
          }, 3000);
        },
      });
    }
  }, [token, isEmailVerificationEnabled, isLoadingConfig]);

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

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full bg-white shadow rounded-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {language === "it"
                ? "Token di verifica mancante"
                : "Verification Token Missing"}
            </h1>
            <p className="text-gray-600 mb-6">
              {language === "it"
                ? "Il link di verifica non è valido. Controlla la tua email per il link corretto."
                : "The verification link is invalid. Check your email for the correct link."}
            </p>
            <Link
              href="/verify-email/check"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              {language === "it" ? "Richiedi nuova email" : "Request New Email"}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (verified) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full bg-white shadow rounded-lg p-8 text-center">
            <div className="mb-6">
              <svg
                className="mx-auto h-16 w-16 text-green-500"
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
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {language === "it"
                ? "Email Verificata!"
                : "Email Verified!"}
            </h1>
            <p className="text-gray-600 mb-6">
              {language === "it"
                ? "Il tuo account è stato verificato con successo. Verrai reindirizzato al login..."
                : "Your account has been verified successfully. Redirecting to login..."}
            </p>
            <Link
              href="/login"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              {language === "it" ? "Vai al Login" : "Go to Login"}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (verifyMutation.isPending) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full bg-white shadow rounded-lg p-8 text-center">
            <Loading />
            <p className="mt-4 text-gray-600">
              {language === "it"
                ? "Verifica in corso..."
                : "Verifying..."}
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (verifyMutation.error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full bg-white shadow rounded-lg p-8 text-center">
            <div className="mb-6">
              <svg
                className="mx-auto h-16 w-16 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {language === "it"
                ? "Verifica Fallita"
                : "Verification Failed"}
            </h1>
            <ErrorMessage error={verifyMutation.error} className="mb-6" />
            <Link
              href="/verify-email/check"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              {language === "it"
                ? "Richiedi nuova email"
                : "Request New Email"}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return null;
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <Loading />
        </main>
        <Footer />
      </div>
    }>
      <VerifyEmailPageContent />
    </Suspense>
  );
}

