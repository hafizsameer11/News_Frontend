import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { newsletterApi } from "@/lib/api/modules/newsletter.api";
import { SendNewsletterInput } from "@/types/newsletter.types";
import { useToast } from "@/components/ui/toast";

// Get all newsletter subscribers (Admin)
export const useNewsletterSubscribers = (page: number = 1, limit: number = 50) => {
  return useQuery({
    queryKey: ["newsletter", "subscribers", page, limit],
    queryFn: () => newsletterApi.getAllSubscribers(page, limit),
  });
};

// Send newsletter to all subscribers (Admin)
export const useSendNewsletter = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (data: SendNewsletterInput) => newsletterApi.sendNewsletter(data),
    onSuccess: (response) => {
      // apiClient interceptor returns response.data directly, so response is already the API response
      // Structure: { success: true, message: string, data: { queuedCount, totalSubscribers } }
      if (response.success && response.data) {
        const { queuedCount, totalSubscribers } = response.data;
        showToast(
          `Newsletter queued successfully! Will be sent to ${queuedCount} of ${totalSubscribers} active subscribers.`,
          "success",
          8000
        );
      } else {
        showToast(
          response.message || "Newsletter queued for sending",
          "success",
          6000
        );
      }
      queryClient.invalidateQueries({ queryKey: ["newsletter"] });
    },
    onError: (error: unknown) => {
      // Error structure from apiClient: { message, status, errors }
      const errorMessage = error?.message || error?.response?.data?.message || "Failed to send newsletter";
      showToast(errorMessage, "error", 6000);
    },
  });
};

