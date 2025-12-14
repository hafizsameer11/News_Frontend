import { apiClient } from "../apiClient";
import {
  NewsletterResponse,
  SubscribeInput,
  UnsubscribeInput,
  SubscriberListResponse,
  SendNewsletterInput,
  SendNewsletterResponse,
} from "@/types/newsletter.types";

export const newsletterApi = {
  // Subscribe to newsletter
  subscribe: (data: SubscribeInput) => {
    return apiClient.post<NewsletterResponse>("/newsletter/subscribe", data);
  },

  // Unsubscribe from newsletter
  unsubscribe: (data: UnsubscribeInput) => {
    return apiClient.post<{ success: boolean; message: string }>("/newsletter/unsubscribe", data);
  },

  // Admin: Get all subscribers
  getAllSubscribers: (page: number = 1, limit: number = 50) => {
    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    queryParams.append("limit", limit.toString());
    return apiClient.get<SubscriberListResponse>(`/newsletter?${queryParams.toString()}`);
  },

  // Admin: Send newsletter to all subscribers
  sendNewsletter: (data: SendNewsletterInput) => {
    return apiClient.post<SendNewsletterResponse>("/newsletter/send", data);
  },

  // Admin: Update subscriber status (activate/deactivate)
  updateSubscriberStatus: (id: string, isActive: boolean) => {
    return apiClient.patch<NewsletterResponse>(`/newsletter/${id}/status`, { isActive });
  },

  // Admin: Delete subscriber
  deleteSubscriber: (id: string) => {
    return apiClient.delete<{ success: boolean; message: string }>(`/newsletter/${id}`);
  },
};

