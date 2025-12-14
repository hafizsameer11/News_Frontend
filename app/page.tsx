import { Metadata } from "next";
import { fetchNews, fetchHomepageLayout } from "@/lib/api/server-api";
import { seoApi } from "@/lib/api/modules/seo.api";
import { mapSEOToNextMetadata } from "@/lib/helpers/metadataMapper";
import { HomeClient } from "@/components/home/home-client";
import { API_CONFIG } from "@/lib/api/apiConfig";

// Generate metadata for homepage (runs on server)
export async function generateMetadata(): Promise<Metadata> {
  try {
    const response = await seoApi.getHomepageSEO();
    if (response.success && response.data) {
      return mapSEOToNextMetadata(response.data);
    }
  } catch (error) {
    console.error("Failed to fetch homepage SEO metadata:", error);
  }

  // Fallback metadata
  return {
    title: "NEWS NEXT - Edizione Calabria",
    description: "Next-generation digital news platform for Calabria",
  };
}

// Server component - fetches data on server
export default async function Home() {
  // Fetch news data on server
  let allNews = [];
  let structuredData = null;
  let homepageSections = [];

  try {
    const newsData = await fetchNews({
      limit: 50,
      status: "PUBLISHED",
    });
    allNews = newsData?.data?.news || [];

    // Fetch homepage layout
    try {
      const layoutData = await fetchHomepageLayout();
      if (layoutData?.success && layoutData.data) {
        homepageSections = layoutData.data;
      }
    } catch (error) {
      console.error("Failed to fetch homepage layout:", error);
    }

    // Fetch structured data
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/seo/homepage/structured-data`, {
        next: { revalidate: 3600 }, // Revalidate every hour
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          structuredData = data.data;
        }
      }
    } catch (error) {
      console.error("Failed to fetch homepage structured data:", error);
    }
  } catch (error) {
    console.error("Failed to fetch news:", error);
    // Return empty array on error - client component will handle error display
  }

  // Pass data to client component
  return <HomeClient allNews={allNews} structuredData={structuredData} sections={homepageSections} />;
}
