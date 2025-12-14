/**
 * SEO Type Definitions
 * Matches backend SEOService interfaces
 */

export interface OpenGraphMetadata {
  title: string;
  description: string;
  type: string;
  url: string;
  image: string;
  siteName: string;
}

export interface TwitterCardMetadata {
  card: string;
  title: string;
  description: string;
  image: string;
}

export interface ArticleMetadata {
  publishedTime: string;
  modifiedTime: string;
  author: string;
  section: string;
  tags: string[];
}

export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string[];
  canonicalUrl: string;
  openGraph: OpenGraphMetadata;
  twitterCard: TwitterCardMetadata;
  article?: ArticleMetadata;
}

export interface SEOApiResponse {
  success: boolean;
  message: string;
  data: SEOMetadata;
}

export interface StructuredDataApiResponse {
  success: boolean;
  message: string;
  data: Record<string, unknown>;
}

export type StructuredData = Record<string, unknown>;

