// News Types
import { Category } from "./category.types";

export interface News {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  mainImage?: string;
  categoryId: string;
  category?: Category;
  authorId: string;
  author?: {
    id: string;
    name: string;
    avatar?: string;
  };
  status: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "ARCHIVED" | "REJECTED";
  isBreaking: boolean;
  isFeatured: boolean;
  isTG: boolean;
  views: number;
  tags?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewsResponse {
  success: boolean;
  message: string;
  data: {
    news: News[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface NewsDetail {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  mainImage?: string;
  category: Category;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  gallery?: Array<{ id: string; url: string; type: string }>;
  tags?: string;
  status: string;
  isBreaking: boolean;
  isFeatured: boolean;
  isTG: boolean;
  views: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNewsInput {
  title: string;
  slug: string;
  summary: string;
  content: string; // HTML content supported
  categoryId: string;
  mainImage?: string; // URL or media library ID
  mainImageId?: string; // Optional media library reference
  tags?: string;
  status?: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED";
  isBreaking?: boolean;
  isFeatured?: boolean;
  isTG?: boolean;
  scheduledFor?: string;
  publishedAt?: string; // Retroactive publishing date (allows past dates)
}

export interface UpdateNewsInput extends Partial<CreateNewsInput> {
  title?: string;
  slug?: string;
  summary?: string;
  content?: string;
  categoryId?: string;
  mainImage?: string;
  mainImageId?: string;
  tags?: string;
  status?: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED";
  isBreaking?: boolean;
  isFeatured?: boolean;
  isTG?: boolean;
  scheduledFor?: string;
  publishedAt?: string; // Retroactive publishing date (allows past dates)
}

