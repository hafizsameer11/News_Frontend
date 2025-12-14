import { useMutation } from "@tanstack/react-query";
import { newsletterApi } from "@/lib/api/modules/newsletter.api";
import { SubscribeInput, UnsubscribeInput } from "@/types/newsletter.types";

// Subscribe to newsletter mutation
export const useSubscribeNewsletter = () => {
  return useMutation({
    mutationFn: (data: SubscribeInput) => newsletterApi.subscribe(data),
  });
};

// Unsubscribe from newsletter mutation
export const useUnsubscribeNewsletter = () => {
  return useMutation({
    mutationFn: (data: UnsubscribeInput) => newsletterApi.unsubscribe(data),
  });
};

