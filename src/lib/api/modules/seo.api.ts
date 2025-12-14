import { apiClient } from "../apiClient";
import {
  SEOApiResponse,
  StructuredDataApiResponse,
} from "@/types/seo.types";

export const seoApi = {
  /**
   * Get SEO metadata for a news article
   */
  getNewsSEO: (slug: string) => {
    return apiClient.get<SEOApiResponse>(`/seo/news/${slug}`);
  },

  /**
   * Get SEO metadata for a category page
   */
  getCategorySEO: (slug: string) => {
    return apiClient.get<SEOApiResponse>(`/seo/category/${slug}`);
  },

  /**
   * Get SEO metadata for homepage
   */
  getHomepageSEO: () => {
    return apiClient.get<SEOApiResponse>("/seo/homepage");
  },

  /**
   * Get NewsArticle JSON-LD structured data for a news article
   */
  getNewsStructuredData: (slug: string) => {
    return apiClient.get<StructuredDataApiResponse>(
      `/seo/news/${slug}/structured-data`
    );
  },

  /**
   * Get CollectionPage JSON-LD structured data for a category
   */
  getCategoryStructuredData: (slug: string) => {
    return apiClient.get<StructuredDataApiResponse>(
      `/seo/category/${slug}/structured-data`
    );
  },

  /**
   * Get WebSite/Organization JSON-LD structured data for homepage
   */
  getHomepageStructuredData: () => {
    return apiClient.get<StructuredDataApiResponse>(
      "/seo/homepage/structured-data"
    );
  },
};

