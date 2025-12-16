import { Metadata } from "next";
import { cookies } from "next/headers";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { CategoryClient } from "@/components/category/category-client";
import { fetchCategoryBySlug, fetchNews, fetchCategories } from "@/lib/api/server-api";
import { mapSEOToNextMetadata } from "@/lib/helpers/metadataMapper";
import { API_CONFIG } from "@/lib/api/apiConfig";
import { getServerLanguage } from "@/lib/i18n/server";

// ISR: Revalidate category pages every 300 seconds (5 minutes)
// Categories change less frequently than news, so longer cache is acceptable
export const revalidate = 300;

// Generate static params for all categories at build time
// This pre-generates category pages for faster initial load
export async function generateStaticParams() {
  try {
    const categoriesData = await fetchCategories(true);
    const categories = categoriesData?.data || [];
    
    // Return array of params for static generation
    return categories
      .filter((cat: { slug?: string }) => cat.slug)
      .map((category: { slug: string }) => ({
        slug: category.slug,
      }));
  } catch (error) {
    console.error("Failed to generate static params for categories:", error);
    // Return empty array on error - pages will be generated on-demand
    return [];
  }
}

// Generate metadata for category page (runs on server)
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/seo/category/${slug}`,
      {
        next: { revalidate: process.env.NODE_ENV === "development" ? 0 : 3600 },
        ...(process.env.NODE_ENV === "development" && { cache: "no-store" }),
      }
    );
    if (response.ok) {
      const seoResponse = await response.json();
      if (seoResponse.success && seoResponse.data) {
        return mapSEOToNextMetadata(seoResponse.data);
      }
    }
  } catch (error) {
    console.error("Failed to fetch category SEO metadata:", error);
  }

  // Fallback metadata with language support
  const language = await getServerLanguage(cookies());
  return {
    title: language === "it" ? "Categoria | NEWS NEXT" : "Category | NEWS NEXT",
    description:
      language === "it"
        ? "Sfoglia gli articoli di notizie per categoria su NEWS NEXT"
        : "Browse news articles by category on NEWS NEXT",
  };
}

// Server component - fetches data on server
export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams?.page) || 1;

  // Fetch category and news data on server
  let category = null;
  let initialNews: any[] = [];
  let structuredData = null;

  try {
    category = await fetchCategoryBySlug(slug);

    if (category?.data) {
      // Fetch news for this category
      const newsData = await fetchNews({
        categoryId: category.data.id,
        status: "PUBLISHED",
        page,
        limit: 12,
      });
      initialNews = newsData?.data?.news || [];

      // Fetch structured data
      try {
        const isDev = process.env.NODE_ENV === "development";
        const response = await fetch(
          `${API_CONFIG.BASE_URL}/seo/category/${slug}/structured-data`,
          {
            next: { revalidate: isDev ? 0 : 3600 }, // No cache in dev, 1h in production
            ...(isDev && { cache: "no-store" }),
          }
        );
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            structuredData = data.data;
          }
        }
      } catch (error) {
        console.error("Failed to fetch category structured data:", error);
      }
    }
  } catch (error) {
    console.error("Failed to fetch category data:", error);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <CategoryClient
        category={category?.data || null}
        initialNews={initialNews}
        structuredData={structuredData}
      />
      <Footer />
    </div>
  );
}
