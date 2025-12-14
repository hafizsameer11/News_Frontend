// Analytics Types

export type BehaviorEventType =
  | "page_view"
  | "search_query"
  | "click"
  | "newsletter_subscription"
  | "report_submission";

export interface BehaviorEventData {
  eventType: BehaviorEventType;
  eventData?: {
    [key: string]: unknown;
    newsId?: string;
    newsSlug?: string;
    categoryId?: string;
    searchQuery?: string;
    clickTarget?: string;
    url?: string;
    referrer?: string;
    page?: string;
    query?: string;
  };
}

export interface TrackBehaviorRequest {
  eventType: string; // Backend expects uppercase like "PAGE_VIEW"
  eventData?: Record<string, unknown>;
}

export interface TrackBehaviorResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    eventType: BehaviorEventType;
    metadata?: Record<string, unknown>;
    createdAt: string;
  };
}

