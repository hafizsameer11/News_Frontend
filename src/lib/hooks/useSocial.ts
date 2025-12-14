import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { socialApi, ConnectAccountInput, PostToSocialParams } from "@/lib/api/modules/social.api";

// Get connected accounts
export const useSocialAccounts = () => {
  return useQuery({
    queryKey: ["social", "accounts"],
    queryFn: async () => {
      const response = await socialApi.getAccounts();
      // Response is ApiResponse<{ accounts: SocialAccount[] }>
      // So response.data is { accounts: SocialAccount[] }
      return (response.data as { accounts?: unknown[] })?.accounts || [];
    },
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

