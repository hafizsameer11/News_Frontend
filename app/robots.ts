import { MetadataRoute } from "next";

/**
 * Generate robots.txt for the site
 */
export default function robots(): MetadataRoute.Robots {
  const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/advertiser/", "/editor/", "/dashboard/", "/login", "/register"],
      },
    ],
    sitemap: `${frontendUrl}/sitemap.xml`,
  };
}

