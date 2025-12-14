import { Metadata } from "next";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { CategoryClient } from "@/components/category/category-client";
import { fetchCategoryBySlug, fetchNews } from "@/lib/api/server-api";
import { mapSEOToNextMetadata } from "@/lib/helpers/metadataMapper";
import { API_CONFIG } from "@/lib/api/apiConfig";

// Generate metadata for category page (runs on server)
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;
    const response = await fetch(`${API_CONFIG.BASE_URL}/seo/category/${slug}`, {
      next: { revalidate: 3600 },
    });
    if (response.ok) {
      const seoResponse = await response.json();
      if (seoResponse.success && seoResponse.data) {
        return mapSEOToNextMetadata(seoResponse.data);
      }
    }
  } catch (error) {
    console.error("Failed to fetch category SEO metadata:", error);
  }

  // Fallback metadata
  return {
    title: "Category | NEWS NEXT",
    description: "Browse news articles by category on NEWS NEXT",
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
        const response = await fetch(`${API_CONFIG.BASE_URL}/seo/category/${slug}/structured-data`, {
          next: { revalidate: 3600 }, // Revalidate every hour
        });
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
