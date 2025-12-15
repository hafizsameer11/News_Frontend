import { Metadata } from "next";
import { cookies } from "next/headers";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { NewsDetailClient } from "@/components/news/news-detail-client";
import { mapSEOToNextMetadata } from "@/lib/helpers/metadataMapper";
import { API_CONFIG } from "@/lib/api/apiConfig";
import { fetchNews } from "@/lib/api/server-api";
import { News } from "@/types/news.types";
import { getServerLanguage } from "@/lib/i18n/server";
import { getDefaultMetadata } from "@/lib/i18n/metadata";

// Generate metadata for news detail page (runs on server)
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  try {
    const { id } = await params;
    // Fetch news to get slug (since route uses [id] but SEO API needs slug)
    const response = await fetch(`${API_CONFIG.BASE_URL}/news/${id}`, {
      next: { revalidate: 3600 },
    });
    if (response.ok) {
      const newsResponse = await response.json();
      if (newsResponse.success && newsResponse.data && newsResponse.data.slug) {
        const seoResponse = await fetch(
          `${API_CONFIG.BASE_URL}/seo/news/${newsResponse.data.slug}`,
          {
            next: { revalidate: 3600 },
          }
        );
        if (seoResponse.ok) {
          const seoData = await seoResponse.json();
          if (seoData.success && seoData.data) {
            return mapSEOToNextMetadata(seoData.data);
          }
        }
      }
    }
  } catch (error) {
    console.error("Failed to fetch news SEO metadata:", error);
  }

  // Fallback metadata with language support
  const language = await getServerLanguage(cookies());
  return {
    title:
      language === "it" ? "Articolo | NEWS NEXT" : "News Article | NEWS NEXT",
    description:
      language === "it"
        ? "Leggi l'ultimo articolo di NEWS NEXT"
        : "Read the latest news article on NEWS NEXT",
  };
}

// Server component - fetches data on server with ISR
export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idOrSlug } = await params;

  // Fetch news data on server
  let news: News | null = null;
  let structuredData = null;
  let relatedNews: any[] = [];

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/news/${idOrSlug}`, {
      next: { revalidate: 60 }, // ISR: Revalidate every 60 seconds
    });

    if (!response.ok) {
      // If 404, news will be null and NewsDetailClient will handle it
      if (response.status === 404) {
        console.warn(`News not found: ${idOrSlug}`);
      } else {
        console.error(
          `Failed to fetch news: ${response.status} ${response.statusText}`
        );
      }
    } else {
      const newsResponse = await response.json();
      if (newsResponse.success && newsResponse.data) {
        // Normalize mainImage URL to prevent duplicates
        const { normalizeImageUrl } = await import("@/lib/helpers/imageUrl");
        news = {
          ...newsResponse.data,
          mainImage: newsResponse.data.mainImage ? normalizeImageUrl(newsResponse.data.mainImage) : newsResponse.data.mainImage,
        };
      }
    }

    if (news) {
      // Fetch structured data
      if (news.slug) {
        try {
          const response = await fetch(
            `${API_CONFIG.BASE_URL}/seo/news/${news.slug}/structured-data`,
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
          console.error("Failed to fetch news structured data:", error);
        }
      }

      // Fetch related news from same category
      if (news.category?.id) {
        try {
          const relatedData = await fetchNews({
            categoryId: news.category.id,
            status: "PUBLISHED",
            limit: 4,
          });
          relatedNews =
            relatedData?.data?.news
              ?.filter((n) => news && n.id !== news.id)
              .slice(0, 3) || [];
        } catch (error) {
          console.error("Failed to fetch related news:", error);
        }
      }
    }
  } catch (error) {
    console.error("Failed to fetch news:", error);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <NewsDetailClient
        initialNews={news}
        initialStructuredData={structuredData}
        initialRelatedNews={relatedNews}
      />
      <Footer />
    </div>
  );
}
