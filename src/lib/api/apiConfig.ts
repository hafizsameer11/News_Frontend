// API Configuration
// NEXT_PUBLIC_API_URL must be set in environment variables
const getApiUrl = (): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    if (typeof window !== "undefined") {
      // Client-side: throw error if not configured
      throw new Error("NEXT_PUBLIC_API_URL environment variable is not set");
    }
    // Server-side: return empty string to avoid build errors, but this should be set
    console.warn("NEXT_PUBLIC_API_URL environment variable is not set");
    return "";
  }
  return apiUrl;
};

export const API_CONFIG = {
  BASE_URL: getApiUrl(),
  TIMEOUT: 30000,
};

// Helper to get backend base URL (without /api/v1)
export const getBackendBaseUrl = (): string => {
  const baseUrl = API_CONFIG.BASE_URL;
  if (!baseUrl) return "";
  return baseUrl.replace("/api/v1", "");
};

// Helper to get backend hostname
export const getBackendHostname = (): string => {
  const baseUrl = getBackendBaseUrl();
  if (!baseUrl) return "";
  try {
    return new URL(baseUrl).hostname;
  } catch {
    return "";
  }
};

export default API_CONFIG;

