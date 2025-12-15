import { API_CONFIG } from "@/lib/api/apiConfig";

/**
 * Converts a relative image URL to an absolute URL using the backend domain
 * Also replaces localhost URLs with the production backend domain
 * If the URL is already absolute and not localhost, it returns it as-is
 * 
 * @param url - The image URL (can be relative like "/uploads/..." or absolute)
 * @returns The full absolute URL using the production backend domain
 * 
 * @example
 * getImageUrl("/uploads/image.jpg") // "https://news-backend.hmstech.org/uploads/image.jpg"
 * getImageUrl("http://localhost:3001/uploads/image.jpg") // "https://news-backend.hmstech.org/uploads/image.jpg"
 * getImageUrl("https://example.com/image.jpg") // "https://example.com/image.jpg"
 */
export function getImageUrl(url: string | null | undefined): string {
  if (!url) return "";
  
  // Get base URL from API config (remove /api/v1 to get the root)
  const baseUrl = API_CONFIG.BASE_URL.replace("/api/v1", "");
  const backendHostname = new URL(baseUrl).hostname;
  
  // If already absolute URL, check if it's localhost and replace it
  if (url.startsWith("http://") || url.startsWith("https://")) {
    // Replace localhost URLs with production backend domain
    if (url.includes("localhost") || url.includes("127.0.0.1")) {
      // Extract the path from the localhost URL
      try {
        const urlObj = new URL(url);
        const path = urlObj.pathname;
        // Use https for production
        return `https://${backendHostname}${path}`;
      } catch {
        // If URL parsing fails, try simple string replacement
        const pathMatch = url.match(/(\/uploads\/.*|uploads\/.*)/);
        if (pathMatch) {
          const path = pathMatch[1].startsWith("/") ? pathMatch[1] : `/${pathMatch[1]}`;
          return `https://${backendHostname}${path}`;
        }
        // Fallback: just replace localhost with backend hostname
        return url.replace(/https?:\/\/[^\/]+/, `https://${backendHostname}`);
      }
    }
    // If it's already a valid absolute URL (not localhost), return as-is
    return url;
  }
  
  // For relative URLs, ensure it starts with / and prepend base URL
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

