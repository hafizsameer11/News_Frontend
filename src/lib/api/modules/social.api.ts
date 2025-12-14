import { apiClient } from "../apiClient";
import { SocialAccount, SocialPostLog, SocialPlatform } from "@/types/social.types";

export interface ConnectAccountInput {
  platform: SocialPlatform;
  token: string;
  accountId: string;
  name: string;
}

export interface PostToSocialParams {
  newsId: string;
  platforms?: SocialPlatform[];
  scheduledFor?: string; // ISO 8601 datetime string
}

export const socialApi = {
  // Get all connected accounts
  getAccounts: async () => {
    return apiClient.get<{ accounts: SocialAccount[] }>("/social");
  },

  // Connect a social account
  connectAccount: async (data: ConnectAccountInput) => {
    return apiClient.post<{ account: SocialAccount }>("/social/connect", data);
  },

  // Disconnect a social account
  disconnectAccount: async (id: string) => {
    return apiClient.delete(`/social/${id}`);
  },

  // Post to social media
  post: async (params: PostToSocialParams) => {
    const { newsId, platforms, scheduledFor } = params;
    const body: { platforms?: SocialPlatform[]; scheduledFor?: string } = {};
    
    if (platforms && platforms.length > 0) {
      body.platforms = platforms;
    }
    
    if (scheduledFor) {
      body.scheduledFor = scheduledFor;
    }

    return apiClient.post<{ success: boolean; message: string; data: SocialPostLog[] }>(
      `/social/post/${newsId}`,
      body
    );
  },
};

