import { getBackendBaseUrl, getBackendHostname } from "@/lib/api/apiConfig";

/**
 * Converts a relative image URL to an absolute URL using the backend domain
 * Also replaces localhost URLs with the production backend domain
 * If the URL is already absolute and not localhost, it returns it as-is
 * 
 * @param url - The image URL (can be relative like "/uploads/..." or absolute)
 * @returns The full absolute URL using the backend domain from API_CONFIG
 * 
 * @example
 * getImageUrl("/uploads/image.jpg") // Uses backend URL from API_CONFIG
 * getImageUrl("http://localhost:3001/uploads/image.jpg") // Replaces localhost with backend URL
 * getImageUrl("https://example.com/image.jpg") // Returns as-is (external URL)
 */
export function getImageUrl(url: string | null | undefined): string {
  if (!url) return "";
  
  // Get base URL and hostname from API config
  const baseUrl = getBackendBaseUrl();
  const backendHostname = getBackendHostname();
  
  // If no backend URL is configured, return the URL as-is (or empty if relative)
  if (!baseUrl || !backendHostname) {
    // If it's already an absolute URL, return it
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    // If it's relative and no backend is configured, return empty or the relative URL
    return url.startsWith("/") ? url : `/${url}`;
  }
  
  // Clean up any duplicate base URLs in the URL
  // Handle cases where the backend URL is duplicated in the path
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
  
  // Get base URL and hostname from API config
  const baseUrl = getBackendBaseUrl();
  const backendHostname = getBackendHostname();
  
  // If no backend URL is configured, return the URL as-is
  if (!baseUrl || !backendHostname) {
    return url;
  }
  
  // First, check for and remove duplicate base URLs
  // Handle cases where the backend URL is duplicated in the path
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

// getBackendBaseUrl is now exported from @/lib/api/apiConfig
// Re-export it here for backward compatibility
export { getBackendBaseUrl } from "@/lib/api/apiConfig";

