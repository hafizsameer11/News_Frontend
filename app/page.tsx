import { Metadata } from "next";
import { cookies } from "next/headers";
import { fetchNews, fetchHomepageLayout } from "@/lib/api/server-api";
import { seoApi } from "@/lib/api/modules/seo.api";
import { News } from "@/types/news.types";
import { HomepageSection } from "@/lib/api/modules/homepage.api";
import { mapSEOToNextMetadata } from "@/lib/helpers/metadataMapper";
import { HomeClient } from "@/components/home/home-client";
import { API_CONFIG } from "@/lib/api/apiConfig";
import { getServerLanguage } from "@/lib/i18n/server";
import { getDefaultMetadata } from "@/lib/i18n/metadata";

// Generate metadata for homepage (runs on server)
export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerLanguage(cookies());

  try {
    const response = await seoApi.getHomepageSEO();
    if (response.success && response.data?.data) {
      return mapSEOToNextMetadata(response.data.data);
    }
  } catch (error) {
    console.error("Failed to fetch homepage SEO metadata:", error);
  }

  // Fallback metadata with language support
  return getDefaultMetadata(language);
}

// Server component - fetches data on server
export default async function Home() {
  // Fetch news data on server
  let allNews: News[] = [];
  let structuredData = null;
  let homepageSections: HomepageSection[] = [];

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
        homepageSections = layoutData.data as unknown as HomepageSection[];
      }
    } catch (error) {
      console.error("Failed to fetch homepage layout:", error);
    }

    // Fetch structured data
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/seo/homepage/structured-data`,
        {
          next: { revalidate: 3600 }, // Revalidate every hour
        }
      );
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
  return (
    <HomeClient
      allNews={allNews}
      structuredData={structuredData}
      sections={homepageSections}
    />
  );
}
