import { Metadata } from "next";
import { SEOMetadata } from "@/types/seo.types";

/**
 * Maps backend SEO metadata to Next.js Metadata format
 */
export function mapSEOToNextMetadata(seoData: SEOMetadata): Metadata {
  const metadata: Metadata = {
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords,
    alternates: {
      canonical: seoData.canonicalUrl,
    },
    openGraph: {
      title: seoData.openGraph.title,
      description: seoData.openGraph.description,
      type: seoData.openGraph.type as "article" | "website",
      url: seoData.openGraph.url,
      images: [
        {
          url: seoData.openGraph.image,
          width: 1200,
          height: 630,
          alt: seoData.openGraph.title,
        },
      ],
      siteName: seoData.openGraph.siteName,
    },
    twitter: {
      card: seoData.twitterCard.card as "summary" | "summary_large_image",
      title: seoData.twitterCard.title,
      description: seoData.twitterCard.description,
      images: [seoData.twitterCard.image],
    },
  };

  // Add article-specific metadata if available
  if (seoData.article) {
    metadata.openGraph = {
      ...metadata.openGraph,
      type: "article",
      publishedTime: seoData.article.publishedTime,
      modifiedTime: seoData.article.modifiedTime,
      authors: [seoData.article.author],
      section: seoData.article.section,
      tags: seoData.article.tags,
    };
  }

  return metadata;
}

