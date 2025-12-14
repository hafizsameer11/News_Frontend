"use client";

import { useState } from "react";
import { useChangePassword } from "@/lib/hooks/useAuth";
import { FormField } from "@/components/ui/form-field";
import { ErrorMessage } from "@/components/ui/error-message";
import { Loading } from "@/components/ui/loading";
import { useLanguage } from "@/providers/LanguageProvider";

export function PasswordForm() {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const changePasswordMutation = useChangePassword();
  const { language } = useLanguage();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword =
        language === "it"
          ? "La password attuale è obbligatoria"
          : "Current password is required";
    }

    if (!formData.newPassword) {
      newErrors.newPassword =
        language === "it" ? "La nuova password è obbligatoria" : "New password is required";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword =
        language === "it"
          ? "La password deve essere di almeno 6 caratteri"
          : "Password must be at least 6 characters";
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword =
        language === "it"
          ? "Le password non corrispondono"
          : "Passwords do not match";
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

    changePasswordMutation.mutate(
      {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      },
      {
        onSuccess: () => {
          // Reset form
          setFormData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {changePasswordMutation.error && (
        <ErrorMessage error={changePasswordMutation.error} />
      )}

      {changePasswordMutation.isSuccess && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">
            {language === "it"
              ? "Password cambiata con successo!"
              : "Password changed successfully!"}
          </p>
        </div>
      )}

      <FormField
        label={
          language === "it" ? "Password Attuale" : "Current Password"
        }
        required
        error={errors.currentPassword}
      >
        <input
          type="password"
          id="currentPassword"
          name="currentPassword"
          value={formData.currentPassword}
          onChange={(e) => {
            setFormData({ ...formData, currentPassword: e.target.value });
            if (errors.currentPassword)
              setErrors({ ...errors, currentPassword: "" });
          }}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
        />
      </FormField>

      <FormField
        label={language === "it" ? "Nuova Password" : "New Password"}
        required
        error={errors.newPassword}
      >
        <input
          type="password"
          id="newPassword"
          name="newPassword"
          value={formData.newPassword}
          onChange={(e) => {
            setFormData({ ...formData, newPassword: e.target.value });
            if (errors.newPassword) setErrors({ ...errors, newPassword: "" });
          }}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
        />
      </FormField>

      <FormField
        label={
          language === "it" ? "Conferma Password" : "Confirm Password"
        }
        required
        error={errors.confirmPassword}
      >
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={(e) => {
            setFormData({ ...formData, confirmPassword: e.target.value });
            if (errors.confirmPassword)
              setErrors({ ...errors, confirmPassword: "" });
          }}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
        />
      </FormField>

      <div>
        <button
          type="submit"
          disabled={changePasswordMutation.isPending}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {changePasswordMutation.isPending ? (
            <Loading />
          ) : language === "it" ? (
            "Cambia Password"
          ) : (
            "Change Password"
          )}
        </button>
      </div>
    </form>
  );
}

