import { API_CONFIG } from "@/lib/api/apiConfig";

/**
 * Converts a relative image URL to an absolute URL using the backend domain
 * If the URL is already absolute, it returns it as-is
 * 
 * @param url - The image URL (can be relative like "/uploads/..." or absolute)
 * @returns The full absolute URL
 * 
 * @example
 * getImageUrl("/uploads/image.jpg") // "https://news-backend.hmstech.org/uploads/image.jpg"
 * getImageUrl("https://example.com/image.jpg") // "https://example.com/image.jpg"
 */
export function getImageUrl(url: string | null | undefined): string {
  if (!url) return "";
  
  // If already absolute URL, return as-is
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  
  // Get base URL from API config (remove /api/v1 to get the root)
  const baseUrl = API_CONFIG.BASE_URL.replace("/api/v1", "");
  
  // Ensure URL starts with / for proper concatenation
  const normalizedUrl = url.startsWith("/") ? url : `/${url}`;
  
  return `${baseUrl}${normalizedUrl}`;
}

/**
 * Gets the backend base URL (without /api/v1)
 * Useful for constructing URLs to static assets
 */
export function getBackendBaseUrl(): string {
  return API_CONFIG.BASE_URL.replace("/api/v1", "");
}

