"use client";

import { useState } from "react";
import { useRegister } from "@/lib/hooks/useAuth";
import { usePublicConfig } from "@/lib/hooks/useConfig";
import { AuthResponse } from "@/types/user.types";
import { ApiResponse } from "@/types/api.types";
import { ErrorMessage } from "@/components/ui/error-message";
import Link from "next/link";
import { useLanguage } from "@/providers/LanguageProvider";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "USER" as "USER" | "ADVERTISER" | "EDITOR",
    companyName: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const registerMutation = useRegister();
  const { t } = useLanguage();
  const router = useRouter();
  const { data: configData } = usePublicConfig();
  const isEmailVerificationEnabled =
    configData?.data?.data?.enableEmailVerification ?? true; // Default to true for backward compatibility

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t("validation.nameRequired");
    }

    if (!formData.email.trim()) {
      newErrors.email = t("validation.emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t("validation.emailInvalid");
    }

    if (!formData.password) {
      newErrors.password = t("validation.passwordRequired");
    } else if (formData.password.length < 6) {
      newErrors.password = t("validation.passwordMinLength");
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t("validation.passwordMismatch");
    }

    if (formData.role === "ADVERTISER" && !formData.companyName.trim()) {
      newErrors.companyName = t("validation.companyNameRequired");
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

    const { confirmPassword, ...registerData } = formData;
    registerMutation.mutate(registerData, {
      onSuccess: (response: ApiResponse<AuthResponse>) => {
        const authData = response.data as AuthResponse | undefined;
        if (authData?.data?.user?.role === "ADVERTISER") {
          router.push("/register/plans");
        } else if (
          isEmailVerificationEnabled &&
          !authData?.data?.user?.emailVerified
        ) {
          // Redirect to check inbox page only if email verification is enabled and user is not verified
          router.push("/verify-email/check");
        } else {
          // If email verification is disabled or user is already verified, go to dashboard
          router.push("/dashboard");
        }
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t("auth.register")}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t("auth.createAccountToStart")}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {registerMutation.error && (
            <ErrorMessage error={registerMutation.error} className="mb-4" />
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t("auth.fullName")}
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: "" });
                }}
                className={`appearance-none relative block w-full px-3 py-2 border ${
                  errors.name
                    ? "border-red-300 text-red-900"
                    : "border-gray-300 text-gray-900"
                } rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                placeholder={t("auth.yourName")}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t("auth.email")}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: "" });
                }}
                className={`appearance-none relative block w-full px-3 py-2 border ${
                  errors.email
                    ? "border-red-300 text-red-900"
                    : "border-gray-300 text-gray-900"
                } rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                placeholder={t("auth.emailExample")}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t("auth.accountType")}
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    role: e.target.value as any,
                    companyName: "",
                  });
                  setErrors({});
                }}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
              >
                <option value="USER">{t("auth.user")}</option>
                <option value="EDITOR">{t("auth.editor")}</option>
                <option value="ADVERTISER">{t("auth.advertiser")}</option>
              </select>
            </div>

            {formData.role === "ADVERTISER" && (
              <div>
                <label
                  htmlFor="companyName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t("auth.companyName")}
                </label>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => {
                    setFormData({ ...formData, companyName: e.target.value });
                    if (errors.companyName)
                      setErrors({ ...errors, companyName: "" });
                  }}
                  className={`appearance-none relative block w-full px-3 py-2 border ${
                    errors.companyName
                      ? "border-red-300 text-red-900"
                      : "border-gray-300 text-gray-900"
                  } rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                  placeholder={t("auth.yourCompanyName")}
                />
                {errors.companyName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.companyName}
                  </p>
                )}
              </div>
            )}

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t("auth.password")}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  if (errors.password) setErrors({ ...errors, password: "" });
                }}
                className={`appearance-none relative block w-full px-3 py-2 border ${
                  errors.password
                    ? "border-red-300 text-red-900"
                    : "border-gray-300 text-gray-900"
                } rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                placeholder={t("auth.minimumChars")}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t("auth.confirmPassword")}
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={(e) => {
                  setFormData({ ...formData, confirmPassword: e.target.value });
                  if (errors.confirmPassword)
                    setErrors({ ...errors, confirmPassword: "" });
                }}
                className={`appearance-none relative block w-full px-3 py-2 border ${
                  errors.confirmPassword
                    ? "border-red-300 text-red-900"
                    : "border-gray-300 text-gray-900"
                } rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                placeholder={t("auth.confirmYourPassword")}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {registerMutation.isPending ? (
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
                  {t("auth.registering")}
                </span>
              ) : (
                t("auth.register")
              )}
            </button>
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>
              {t("auth.alreadyHaveAccount")}{" "}
              <Link
                href="/login"
                className="font-medium text-red-600 hover:text-red-500"
              >
                {t("auth.signInHere")}
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
