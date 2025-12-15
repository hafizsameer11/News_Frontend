"use client";

import { useState } from "react";
import { useForgotPassword } from "@/lib/hooks/useAuth";
import { ErrorMessage } from "@/components/ui/error-message";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { useLanguage } from "@/providers/LanguageProvider";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const forgotPasswordMutation = useForgotPassword();
  const [isSuccess, setIsSuccess] = useState(false);
  const { t } = useLanguage();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = t("validation.emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t("validation.emailInvalid");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (validateForm()) {
      forgotPasswordMutation.mutate(
        { email: email.trim() },
        {
          onSuccess: () => {
            setIsSuccess(true);
          },
        }
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              {t("auth.forgotPassword")}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {t("auth.forgotPasswordDescription")}
            </p>
          </div>

          {isSuccess ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center">
                <svg
                  className="h-6 w-6 text-green-600 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h3 className="text-lg font-medium text-green-800">
                    {t("auth.emailSent")}
                  </h3>
                  <p className="mt-1 text-sm text-green-700">
                    {t("auth.emailSentDescription")}
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <Link
                  href="/login"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  {t("auth.backToLogin")}
                </Link>
              </div>
            </div>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              {forgotPasswordMutation.error && (
                <ErrorMessage
                  error={forgotPasswordMutation.error}
                  className="mb-4"
                />
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {t("auth.email")}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: "" });
                  }}
                  className={`appearance-none relative block w-full px-3 py-2 border ${
                    errors.email
                      ? "border-red-300 text-red-900 placeholder-red-300"
                      : "border-gray-300 text-gray-900 placeholder-gray-500"
                  } rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                  placeholder={t("auth.enterYourEmail")}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={forgotPasswordMutation.isPending}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {forgotPasswordMutation.isPending ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                      {t("auth.sending")}
                    </span>
                  ) : (
                    t("auth.sendResetLink")
                  )}
                </button>
              </div>

              <div className="text-center text-sm text-gray-600">
                <Link
                  href="/login"
                  className="font-medium text-red-600 hover:text-red-500"
                >
                  {t("auth.backToLogin")}
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
