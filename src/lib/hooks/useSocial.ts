import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { socialApi, ConnectAccountInput, PostToSocialParams } from "@/lib/api/modules/social.api";

// Get connected accounts
export const useSocialAccounts = () => {
  return useQuery({
    queryKey: ["social", "accounts"],
    queryFn: async () => {
      try {
        const response = await socialApi.getAccounts();
        // Response structure from apiClient: { success: true, message: string, data: { accounts: SocialAccount[] } }
        // apiClient.get returns ApiResponse<T> where T is the type passed to get<>
        // So response is ApiResponse<{ accounts: SocialAccount[] }>
        // Which means response.data is { accounts: SocialAccount[] }
        console.log("Social API response:", response);
        const accounts = (response.data as { accounts?: unknown[] })?.accounts || [];
        console.log("Extracted accounts:", accounts);
        return { accounts };
      } catch (error) {
        console.error("Error fetching social accounts:", error);
        return { accounts: [] };
      }
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0, // Always consider data stale to ensure fresh data
    cacheTime: 0, // Don't cache to ensure fresh data
  });
};

// Connect account mutation
export const useConnectAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ConnectAccountInput) => socialApi.connectAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social", "accounts"] });
    },
  });
};

// Disconnect account mutation
export const useDisconnectAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => socialApi.disconnectAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social", "accounts"] });
    },
  });
};

// Post to social media mutation
export const usePostToSocial = () => {
  return useMutation({
    mutationFn: (params: PostToSocialParams) => socialApi.post(params),
  });
};

