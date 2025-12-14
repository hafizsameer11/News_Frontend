import { apiClient } from "../apiClient";

export interface PublicConfig {
  enableEmailVerification: boolean;
  frontendUrl: string;
  siteName: string;
}

export interface ConfigResponse {
  success: boolean;
  message: string;
  data: PublicConfig;
}

export const configApi = {
  getPublicConfig: () => {
    return apiClient.get<ConfigResponse>("/config/public");
  },
};

