export type SocialPlatform = "FACEBOOK" | "INSTAGRAM";

export interface SocialAccount {
  id: string;
  platform: SocialPlatform;
  accountId: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export interface SocialPostLog {
  id: string;
  newsId: string;
  platform: SocialPlatform;
  status: "SUCCESS" | "FAILED";
  message: string | null;
  postedAt: string;
}

export interface SocialPostResponse {
  success: boolean;
  message: string;
  data: SocialPostLog[];
}

export interface SocialPostResult {
  platform: SocialPlatform;
  status: "SUCCESS" | "FAILED";
  message: string | null;
  postId?: string;
  error?: string;
}

export interface PostToSocialInput {
  newsId: string;
  platforms?: SocialPlatform[];
  scheduledFor?: string; // ISO 8601 datetime string
}

