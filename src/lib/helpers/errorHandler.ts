// Error handler utility
import { ApiError } from "@/types/api.types";

interface ErrorWithMessage {
  message?: string;
  errors?: ApiError[] | Record<string, string> | string[];
  status?: number;
}

export const handleApiError = (error: unknown): string => {
  if (error && typeof error === "object") {
    const err = error as ErrorWithMessage;
    if (err.message) return err.message;
    if (err.errors) {
      if (Array.isArray(err.errors)) {
        return err.errors.map((e) => {
          if (typeof e === "string") return e;
          if (e && typeof e === "object" && "message" in e) return String(e.message);
          return String(e);
        }).join(", ");
      }
      if (typeof err.errors === "object") {
        return Object.values(err.errors).join(", ");
      }
    }
  }
  return "An unexpected error occurred";
};

export const isApiError = (error: unknown): error is { message: string; status?: number } => {
  return error !== null && typeof error === "object" && "message" in error && typeof (error as { message: unknown }).message === "string";
};

