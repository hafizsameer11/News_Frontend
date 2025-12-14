"use client";

import { useState } from "react";
import { useCreateReport } from "@/lib/hooks/useReports";
import { FormField } from "@/components/ui/form-field";
import { ErrorMessage } from "@/components/ui/error-message";
import { Loading } from "@/components/ui/loading";
import { useLanguage } from "@/providers/LanguageProvider";

interface ReportFormProps {
  onSuccess?: () => void;
}

export function ReportForm({ onSuccess }: ReportFormProps) {
  const [formData, setFormData] = useState({
    content: "",
    mediaUrl: "",
    contactInfo: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const createReportMutation = useCreateReport();
  const { language } = useLanguage();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.content.trim()) {
      newErrors.content =
        language === "it"
          ? "Il contenuto è obbligatorio"
          : "Content is required";
    } else if (formData.content.trim().length < 10) {
      newErrors.content =
        language === "it"
          ? "Il contenuto deve essere di almeno 10 caratteri"
          : "Content must be at least 10 characters";
    }

    if (formData.mediaUrl && formData.mediaUrl.trim() !== "") {
      const trimmedUrl = formData.mediaUrl.trim();
      // Validate URL format
      if (!/^https?:\/\/.+/.test(trimmedUrl)) {
        newErrors.mediaUrl =
          language === "it"
            ? "Inserisci un URL valido"
            : "Please enter a valid URL";
      }
      // Warn if it looks like a page URL, not a media URL
      else if (!/\.(jpg|jpeg|png|gif|webp|mp4|webm|mov|avi|pdf)(\?.*)?$/i.test(trimmedUrl) && 
               !trimmedUrl.includes('image') && 
               !trimmedUrl.includes('video') &&
               !trimmedUrl.includes('media')) {
        // Just a warning, not an error - allow it but user should know
        // This is optional, so we'll allow it
      }
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

    const submitData = {
      content: formData.content.trim(),
      ...(formData.mediaUrl && formData.mediaUrl.trim() !== "" && { mediaUrl: formData.mediaUrl.trim() }),
      ...(formData.contactInfo && formData.contactInfo.trim() !== "" && { contactInfo: formData.contactInfo.trim() }),
    };

    createReportMutation.mutate(submitData, {
      onSuccess: () => {
        // Reset form
        setFormData({
          content: "",
          mediaUrl: "",
          contactInfo: "",
        });
        if (onSuccess) {
          onSuccess();
        }
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {createReportMutation.error && (
        <ErrorMessage error={createReportMutation.error} />
      )}

      <FormField
        label={language === "it" ? "Contenuto" : "Content"}
        required
        error={errors.content}
      >
        <textarea
          id="content"
          name="content"
          rows={6}
          value={formData.content}
          onChange={(e) => {
            setFormData({ ...formData, content: e.target.value });
            if (errors.content) setErrors({ ...errors, content: "" });
          }}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
          placeholder={
            language === "it"
              ? "Descrivi il problema o la segnalazione (minimo 10 caratteri)..."
              : "Describe the issue or report (minimum 10 characters)..."
          }
        />
      </FormField>

      <FormField
        label={language === "it" ? "URL Media (opzionale)" : "Media URL (optional)"}
        error={errors.mediaUrl}
        hint={
          language === "it"
            ? "Link a un'immagine o video relativo alla segnalazione"
            : "Link to an image or video related to the report"
        }
      >
        <input
          type="url"
          id="mediaUrl"
          name="mediaUrl"
          value={formData.mediaUrl}
          onChange={(e) => {
            setFormData({ ...formData, mediaUrl: e.target.value });
            if (errors.mediaUrl) setErrors({ ...errors, mediaUrl: "" });
          }}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
          placeholder="https://example.com/image.jpg"
          autoComplete="off"
        />
      </FormField>

      <FormField
        label={
          language === "it" ? "Informazioni di contatto (opzionale)" : "Contact Info (optional)"
        }
        hint={
          language === "it"
            ? "Email o telefono per eventuali chiarimenti"
            : "Email or phone for any clarifications"
        }
      >
        <input
          type="text"
          id="contactInfo"
          name="contactInfo"
          value={formData.contactInfo}
          onChange={(e) =>
            setFormData({ ...formData, contactInfo: e.target.value })
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
          placeholder={
            language === "it" ? "email@example.com o +39..." : "email@example.com or +39..."
          }
        />
      </FormField>

      <div>
        <button
          type="submit"
          disabled={createReportMutation.isPending}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createReportMutation.isPending ? (
            <Loading />
          ) : language === "it" ? (
            "Invia Segnalazione"
          ) : (
            "Submit Report"
          )}
        </button>
      </div>
    </form>
  );
}

