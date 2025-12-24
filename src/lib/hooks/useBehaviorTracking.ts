import { useMutation } from "@tanstack/react-query";
import { useCallback, useRef } from "react";
import { analyticsApi } from "@/lib/api/modules/analytics.api";
import { TrackBehaviorRequest } from "@/types/analytics.types";

/**
 * Hook for tracking user behavior events
 */
export const useBehaviorTracking = () => {
  const mutation = useMutation({
    mutationFn: (data: TrackBehaviorRequest) => {
      // Validate and sanitize input data
      if (!data || typeof data !== "object") {
        throw new Error("Invalid tracking data: data must be an object");
      }

      // Validate eventType before sending
      if (!data.eventType || typeof data.eventType !== "string" || data.eventType.trim().length === 0) {
        throw new Error("eventType is required and must be a non-empty string");
      }

      // Convert eventType to uppercase as backend expects and ensure it's valid
      const eventType = data.eventType.trim().toUpperCase();
      if (eventType.length === 0 || eventType.length > 100) {
        throw new Error("eventType must be between 1 and 100 characters");
      }

      // Prepare backend data with all required fields
      const backendData: TrackBehaviorRequest = {
        eventType,
        eventData: data.eventData && typeof data.eventData === "object" ? data.eventData : {},
      };

      // Double-check before sending
      if (!backendData.eventType || backendData.eventType.length === 0) {
        throw new Error("eventType cannot be empty after processing");
      }

      return analyticsApi.trackEvent(backendData);
    },
    // Don't retry on failure - analytics should be fire-and-forget
    retry: false,
    // Don't show errors to user - analytics failures shouldn't break UX
    onError: (error: unknown) => {
      // Only log validation errors that we didn't catch (backend validation failures)
      // Skip logging errors we already validated on the frontend
      const isFrontendValidationError = 
        error instanceof Error && 
        (error.message.includes("eventType is required") || 
         error.message.includes("Invalid tracking data") ||
         error.message.includes("cannot be empty"));

      if (isFrontendValidationError) {
        // Silently skip - we already validated this
        return;
      }

      // Check if it's a validation error from backend
      // Handle both object errors and stringified JSON errors
      let errorMessage = "";
      let errorStatus = null;
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "object" && error !== null) {
        errorMessage = error.message || "";
        errorStatus = error.status;
      } else if (typeof error === "string") {
        errorMessage = error;
        // Try to parse if it's JSON string
        try {
          const parsed = JSON.parse(error);
          errorMessage = parsed.message || errorMessage;
          errorStatus = parsed.status || errorStatus;
        } catch {
          // Not JSON, use as is
        }
      }

      const isBackendValidationError = 
        errorStatus === 422 || 
        errorMessage.includes("Validation failed") || 
        errorMessage.includes("Required");

      // Silently ignore validation errors - analytics should never break UX
      if (isBackendValidationError) {
        // Only log in development for debugging
        if (process.env.NODE_ENV === "development") {
          console.warn("Analytics tracking validation error (silently ignored):", error);
        }
        return;
      }

      // Log other errors in development only
      if (process.env.NODE_ENV === "development") {
        // Log error with more details
        const errorMessage = error instanceof Error 
          ? error.message 
          : typeof error === "object" && error !== null
          ? JSON.stringify(error, Object.getOwnPropertyNames(error))
          : String(error);
        console.error("Analytics tracking error:", errorMessage, error);
      }
    },
  });

  // Track in-flight requests to prevent duplicates
  const pendingRequestsRef = useRef<Set<string>>(new Set());

  // Wrap mutate function to add pre-validation - memoize to prevent infinite loops
  const safeMutate = useCallback((data: TrackBehaviorRequest) => {
    // Pre-validate before calling mutation
    if (!data || typeof data !== "object") {
      if (process.env.NODE_ENV === "development") {
        console.warn("Analytics tracking skipped: invalid data", data);
      }
      return;
    }

    if (!data.eventType || typeof data.eventType !== "string" || data.eventType.trim().length === 0) {
      if (process.env.NODE_ENV === "development") {
        console.warn("Analytics tracking skipped: missing eventType", data);
      }
      return;
    }

    // Create a unique key for this tracking request
    const requestKey = `${data.eventType}:${JSON.stringify(data.eventData || {})}`;
    
    // Prevent duplicate requests
    if (pendingRequestsRef.current.has(requestKey)) {
      if (process.env.NODE_ENV === "development") {
        console.warn("Analytics tracking skipped: duplicate request", requestKey);
      }
      return;
    }

    // Mark request as pending
    pendingRequestsRef.current.add(requestKey);

    // Call the actual mutation
    mutation.mutate(data, {
      onSettled: () => {
        // Remove from pending after request completes (success or error)
        setTimeout(() => {
          pendingRequestsRef.current.delete(requestKey);
        }, 1000); // Keep in set for 1 second to prevent rapid duplicates
      },
    });
  }, [mutation]);

  return {
    ...mutation,
    mutate: safeMutate,
  };
};

/**
 * Helper function to track page views
 */
export const trackPageView = (
  track: ReturnType<typeof useBehaviorTracking>["mutate"],
  url: string,
  metadata?: Record<string, unknown>
) => {
  // Validate URL before tracking
  if (!url || typeof url !== "string" || url.trim().length === 0) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Analytics tracking skipped: invalid URL", url);
    }
    return;
  }

  track({
    eventType: "PAGE_VIEW",
    eventData: {
      page: url.trim(),
      ...metadata,
    },
  });
};

/**
 * Helper function to track search queries
 */
export const trackSearch = (
  track: ReturnType<typeof useBehaviorTracking>["mutate"],
  query: string,
  metadata?: Record<string, unknown>
) => {
  track({
    eventType: "SEARCH",
    eventData: {
      query,
      ...metadata,
    },
  });
};

/**
 * Helper function to track clicks
 */
export const trackClick = (
  track: ReturnType<typeof useBehaviorTracking>["mutate"],
  target: string,
  metadata?: Record<string, unknown>
) => {
  track({
    eventType: "CLICK",
    eventData: {
      clickTarget: target,
      ...metadata,
    },
  });
};

/**
 * Helper function to track newsletter subscriptions
 */
export const trackNewsletterSubscription = (
  track: ReturnType<typeof useBehaviorTracking>["mutate"],
  email: string,
  metadata?: Record<string, unknown>
) => {
  track({
    eventType: "NEWSLETTER_SUBSCRIBE",
    eventData: {
      email,
      ...metadata,
    },
  });
};

/**
 * Helper function to track report submissions
 */
export const trackReportSubmission = (
  track: ReturnType<typeof useBehaviorTracking>["mutate"],
  reportType: string,
  metadata?: Record<string, unknown>
) => {
  track({
    eventType: "REPORT_SUBMIT",
    eventData: {
      reportType,
      ...metadata,
    },
  });
};

