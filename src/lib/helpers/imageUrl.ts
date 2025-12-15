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
  
  // Clean up any duplicate base URLs in the URL
  // Handle cases like "https://news-backend.hmstech.org/https://news-backend.hmstech.org/uploads/..."
  if (url.includes(`https://${backendHostname}/https://`) || url.includes(`http://${backendHostname}/http://`)) {
    // Extract the last occurrence of the actual URL
    const urlMatch = url.match(/https?:\/\/[^\/]+(\/.*)$/);
    if (urlMatch && urlMatch[1]) {
      url = `https://${backendHostname}${urlMatch[1]}`;
    }
  }
  
  // If already absolute URL, check if it's localhost and replace it
  if (url.startsWith("http://") || url.startsWith("https://")) {
    // Check if URL already contains the backend hostname - if so, return as-is (after cleanup)
    if (url.includes(backendHostname)) {
      // Ensure it uses https (not http) for production
      if (url.startsWith("http://") && url.includes(backendHostname)) {
        return url.replace("http://", "https://");
      }
      return url;
    }
    
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
    // If it's already a valid absolute URL (not localhost, not our backend), return as-is
    return url;
  }
  
  // For relative URLs, ensure it starts with / and prepend base URL
  const normalizedUrl = url.startsWith("/") ? url : `/${url}`;
  
  return `${baseUrl}${normalizedUrl}`;
}

/**
 * Normalizes an image URL to ensure it doesn't have duplicate base URLs
 * This should be called before saving URLs to the database
 * 
 * @param url - The image URL to normalize
 * @returns The normalized URL without duplicates
 */
export function normalizeImageUrl(url: string | null | undefined): string {
  if (!url) return "";
  
  // Get base URL from API config
  const baseUrl = API_CONFIG.BASE_URL.replace("/api/v1", "");
  const backendHostname = new URL(baseUrl).hostname;
  
  // First, check for and remove duplicate base URLs
  // Handle cases like "https://news-backend.hmstech.org/https://news-backend.hmstech.org/uploads/..."
  const escapedHostname = backendHostname.replace(/\./g, '\\.');
  const duplicatePattern = new RegExp(`https?://${escapedHostname}/https?://${escapedHostname}`, 'g');
  
  if (duplicatePattern.test(url)) {
    // Extract just the path from the last occurrence and reconstruct
    const pathMatch = url.match(/https?:\/\/[^\/]+(\/.*)$/);
    if (pathMatch && pathMatch[1]) {
      url = `https://${backendHostname}${pathMatch[1]}`;
    } else {
      // Fallback: remove duplicate pattern
      url = url.replace(duplicatePattern, `https://${backendHostname}`);
    }
  }
  
  // Now use getImageUrl to ensure proper format (which also handles duplicates)
  let normalized = getImageUrl(url);
  
  // Double-check for any remaining duplicates after getImageUrl processing
  if (normalized.includes(`https://${backendHostname}/https://`) || 
      normalized.includes(`http://${backendHostname}/http://`)) {
    const pathMatch = normalized.match(/https?:\/\/[^\/]+(\/.*)$/);
    if (pathMatch && pathMatch[1]) {
      normalized = `https://${backendHostname}${pathMatch[1]}`;
    }
  }
  
  // Ensure it uses https (not http) for production backend
  if (normalized.includes(backendHostname) && normalized.startsWith("http://")) {
    normalized = normalized.replace("http://", "https://");
  }
  
  return normalized;
}

/**
 * Gets the backend base URL (without /api/v1)
 * Useful for constructing URLs to static assets
 */
export function getBackendBaseUrl(): string {
  return API_CONFIG.BASE_URL.replace("/api/v1", "");
}

