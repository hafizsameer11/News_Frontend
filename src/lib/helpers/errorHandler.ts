// Error handler utility
import { ApiError } from "@/types/api.types";
import type { Language } from "@/lib/i18n/translations";
import { tClient } from "@/lib/i18n/client-translations";

interface ErrorWithMessage {
  message?: string;
  errors?: ApiError[] | Record<string, string> | string[];
  status?: number;
  code?: string;
}

/**
 * Handle API errors with translation support
 * @param error - The error object
 * @param language - Language for translation (defaults to "en")
 * @returns Translated error message
 */
export const handleApiError = (error: unknown, language: Language = "en"): string => {
  if (error && typeof error === "object") {
    const err = error as ErrorWithMessage;

    // Check for specific error codes first
    if (err.code) {
      switch (err.code) {
        case "NETWORK_ERROR":
        case "CONNECTION_REFUSED":
          return tClient("errors.network", language);
        case "UNAUTHORIZED":
          return tClient("errors.unauthorized", language);
        case "FORBIDDEN":
          return tClient("errors.forbidden", language);
        case "NOT_FOUND":
          return tClient("errors.notFound", language);
        case "BAD_REQUEST":
          return tClient("errors.badRequest", language);
        case "TIMEOUT":
          return tClient("errors.timeout", language);
      }
    }

    // Check for HTTP status codes
    if (err.status) {
      switch (err.status) {
        case 400:
          return tClient("errors.badRequest", language);
        case 401:
          return tClient("errors.unauthorized", language);
        case 403:
          return tClient("errors.forbidden", language);
        case 404:
          return tClient("errors.notFound", language);
        case 500:
        case 502:
        case 503:
          return tClient("errors.serverError", language);
        case 504:
          return tClient("errors.timeout", language);
      }
    }

    // Use error message if available
    if (err.message) {
      // Check if it's a known error message that should be translated
      const lowerMessage = err.message.toLowerCase();
      if (lowerMessage.includes("network") || lowerMessage.includes("connection")) {
        return tClient("errors.network", language);
      }
      return err.message;
    }

    // Handle errors array
    if (err.errors) {
      if (Array.isArray(err.errors)) {
        const messages = err.errors.map((e) => {
          if (typeof e === "string") return e;
          if (e && typeof e === "object" && "message" in e) return String(e.message);
          return String(e);
        });
        return messages.join(", ");
      }
      if (typeof err.errors === "object") {
        return Object.values(err.errors).join(", ");
      }
    }
  }

  return tClient("errors.unexpected", language);
};

export const isApiError = (error: unknown): error is { message: string; status?: number } => {
  return error !== null && typeof error === "object" && "message" in error && typeof (error as { message: unknown }).message === "string";
};

