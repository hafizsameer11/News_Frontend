// Newsletter Types
export interface NewsletterSubscriber {
  id: string;
  email: string;
  isActive: boolean;
  subscribedAt: string;
  unsubscribedAt?: string;
}

export interface NewsletterResponse {
  success: boolean;
  message: string;
  data: NewsletterSubscriber;
}

export interface SubscribeInput {
  email: string;
}

export interface UnsubscribeInput {
  email: string;
}

// Admin Types
export interface SubscriberListResponse {
  success: boolean;
  message: string;
  data: {
    subscribers: NewsletterSubscriber[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface SendNewsletterInput {
  subject: string;
  html: string;
  text?: string;
}

export interface SendNewsletterResponse {
  success: boolean;
  message: string;
  data: {
    queuedCount: number;
    totalSubscribers: number;
  };
}

