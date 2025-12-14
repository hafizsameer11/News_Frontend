"use client";

import { useState } from "react";
import { useLogin } from "@/lib/hooks/useAuth";
import { ErrorMessage } from "@/components/ui/error-message";
import { Loading } from "@/components/ui/loading";
import Link from "next/link";
import { useLanguage } from "@/providers/LanguageProvider";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const loginMutation = useLogin();
  const { language, t } = useLanguage();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = language === "it" ? "Email richiesta" : "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = language === "it" ? "Inserisci un indirizzo email valido" : "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = language === "it" ? "Password richiesta" : "Password is required";
    } else if (password.length < 6) {
      newErrors.password = language === "it" ? "La password deve essere di almeno 6 caratteri" : "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      return;
    }

    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {language === "it" ? "Accedi" : "Sign In"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {language === "it" 
              ? "Accedi al tuo account per continuare" 
              : "Sign in to your account to continue"}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {loginMutation.error && (
            <ErrorMessage error={loginMutation.error} className="mb-4" />
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                {language === "it" ? "Indirizzo email" : "Email address"}
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
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  errors.email
                    ? "border-red-300 text-red-900 placeholder-red-300"
                    : "border-gray-300 text-gray-900 placeholder-gray-500"
                } rounded-t-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm`}
                placeholder={language === "it" ? "Indirizzo email" : "Email address"}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                {language === "it" ? "Password" : "Password"}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: "" });
                }}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  errors.password
                    ? "border-red-300 text-red-900 placeholder-red-300"
                    : "border-gray-300 text-gray-900 placeholder-gray-500"
                } rounded-b-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm`}
                placeholder={language === "it" ? "Password" : "Password"}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                href="/forgot-password"
                className="font-medium text-red-600 hover:text-red-500"
              >
                {language === "it" ? "Password dimenticata?" : "Forgot your password?"}
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loginMutation.isPending ? (
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
                  {language === "it" ? "Accesso in corso..." : "Signing in..."}
                </span>
              ) : (
                language === "it" ? "Accedi" : "Sign in"
              )}
            </button>
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>
              {language === "it" ? "Non hai un account?" : "Don't have an account?"}{" "}
              <Link
                href="/register"
                className="font-medium text-red-600 hover:text-red-500"
              >
                {language === "it" ? "Registrati qui" : "Register here"}
              </Link>
            </p>
            <div className="mt-4">
              <Link
                href="/"
                className="font-medium text-gray-600 hover:text-gray-900"
              >
                {language === "it" ? "← Torna alle notizie" : "← Back to News"}
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

