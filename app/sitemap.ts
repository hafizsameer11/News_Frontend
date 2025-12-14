import { MetadataRoute } from "next";
import { API_CONFIG } from "@/lib/api/apiConfig";

/**
 * Generate sitemap.xml for the site
 * Fetches sitemap from backend API and returns it
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    try {
        // Fetch sitemap XML from backend
        // Backend endpoint: /api/sitemap.xml (not versioned)
        const backendUrl = API_CONFIG.BASE_URL.replace("/api/v1", "/api");
        const response = await fetch(`${backendUrl}/sitemap.xml`, {
            next: { revalidate: 3600 }, // Revalidate every hour
        });

        if (!response.ok) {
            throw new Error("Failed to fetch sitemap from backend");
        }

        const xml = await response.text();

        // Parse XML to extract URLs (simplified approach)
        // For a more robust solution, we could use an XML parser
        const urlMatches = xml.matchAll(/<loc>(.*?)<\/loc>/g);
        const urls: MetadataRoute.Sitemap = [];

        for (const match of urlMatches) {
            const url = match[1];
            if (url) {
                // Extract lastmod if available
                const lastmodMatch = xml.match(
                    new RegExp(`<loc>${url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}<\/loc>\\s*<lastmod>(.*?)<\/lastmod>`, "s")
                );
                const lastmod = lastmodMatch ? lastmodMatch[1] : undefined;

                // Extract changefreq if available
                const changefreqMatch = xml.match(
                    new RegExp(`<loc>${url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}<\/loc>.*?<changefreq>(.*?)<\/changefreq>`, "s")
                );
                const changefreq = changefreqMatch
                    ? (changefreqMatch[1] as MetadataRoute.Sitemap[0]["changeFrequency"])
                    : undefined;

                // Extract priority if available
                const priorityMatch = xml.match(
                    new RegExp(`<loc>${url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}<\/loc>.*?<priority>(.*?)<\/priority>`, "s")
                );
                const priority = priorityMatch ? parseFloat(priorityMatch[1]) : undefined;

                urls.push({
                    url,
                    lastModified: lastmod ? new Date(lastmod) : undefined,
                    changeFrequency: changefreq,
                    priority,
                });
            }
        }

        return urls;
    } catch (error) {
        console.error("Error generating sitemap:", error);

        // Fallback: return basic sitemap with homepage
        const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";
        return [
            {
                url: frontendUrl,
                lastModified: new Date(),
                changeFrequency: "daily",
                priority: 1.0,
            },
        ];
    }
}

