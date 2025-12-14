"use client";

import { useState, useEffect, useMemo } from "react";
import { useUpdateProfile } from "@/lib/hooks/useAuth";
import { useAuth } from "@/providers/AuthProvider";
import { FormField } from "@/components/ui/form-field";
import { ErrorMessage } from "@/components/ui/error-message";
import { Loading } from "@/components/ui/loading";
import { useLanguage } from "@/providers/LanguageProvider";

export function ProfileForm() {
  const { user } = useAuth();
  const initialFormData = useMemo(() => {
    if (user) {
      return {
        name: user.name || "",
        email: user.email || "",
        avatar: user.avatar || "",
      };
    }
    return {
      name: "",
      email: "",
      avatar: "",
    };
  }, [user]);
  
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const updateProfileMutation = useUpdateProfile();
  const { language } = useLanguage();

  // Reset form when user changes
  useEffect(() => {
    setFormData(initialFormData);
  }, [initialFormData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name =
        language === "it" ? "Il nome è obbligatorio" : "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email =
        language === "it" ? "L'email è obbligatoria" : "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email =
        language === "it"
          ? "Inserisci un indirizzo email valido"
          : "Please enter a valid email address";
    }

    if (formData.avatar && !/^https?:\/\/.+/.test(formData.avatar)) {
      newErrors.avatar =
        language === "it" ? "Inserisci un URL valido" : "Please enter a valid URL";
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

    const updateData: { name?: string; email?: string; avatar?: string } = {};
    if (formData.name !== user?.name) updateData.name = formData.name.trim();
    if (formData.email !== user?.email) updateData.email = formData.email.trim();
    if (formData.avatar !== user?.avatar)
      updateData.avatar = formData.avatar.trim() || undefined;

    if (Object.keys(updateData).length === 0) {
      return; // No changes
    }

    updateProfileMutation.mutate(updateData);
  };

  if (!user) {
    return (
      <p className="text-gray-600">
        {language === "it" ? "Caricamento..." : "Loading..."}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {updateProfileMutation.error && (
        <ErrorMessage error={updateProfileMutation.error} />
      )}

      {updateProfileMutation.isSuccess && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">
            {language === "it"
              ? "Profilo aggiornato con successo!"
              : "Profile updated successfully!"}
          </p>
        </div>
      )}

      <FormField
        label={language === "it" ? "Nome" : "Name"}
        required
        error={errors.name}
      >
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={(e) => {
            setFormData({ ...formData, name: e.target.value });
            if (errors.name) setErrors({ ...errors, name: "" });
          }}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
        />
      </FormField>

      <FormField
        label={language === "it" ? "Email" : "Email"}
        required
        error={errors.email}
      >
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={(e) => {
            setFormData({ ...formData, email: e.target.value });
            if (errors.email) setErrors({ ...errors, email: "" });
          }}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
        />
        {user.emailVerified === false && (
          <p className="mt-1 text-xs text-yellow-600">
            {language === "it"
              ? "Email non verificata. Controlla la tua email per il link di verifica."
              : "Email not verified. Check your email for the verification link."}
          </p>
        )}
      </FormField>

      <FormField
        label={language === "it" ? "Avatar URL" : "Avatar URL"}
        error={errors.avatar}
        hint={
          language === "it"
            ? "URL dell'immagine del profilo"
            : "Profile image URL"
        }
      >
        <input
          type="url"
          id="avatar"
          name="avatar"
          value={formData.avatar}
          onChange={(e) => {
            setFormData({ ...formData, avatar: e.target.value });
            if (errors.avatar) setErrors({ ...errors, avatar: "" });
          }}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
          placeholder="https://example.com/avatar.jpg"
        />
        {formData.avatar && (
          <div className="mt-2">
            <img
              src={formData.avatar}
              alt="Avatar preview"
              className="h-20 w-20 rounded-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}
      </FormField>

      <div>
        <button
          type="submit"
          disabled={updateProfileMutation.isPending}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {updateProfileMutation.isPending ? (
            <Loading />
          ) : language === "it" ? (
            "Salva Modifiche"
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </form>
  );
}

