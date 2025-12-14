import { apiClient } from "../apiClient";
import { AuthResponse, User } from "@/types/user.types";

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  role?: string;
  companyName?: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}

export const authApi = {
  // Login
  login: (data: LoginInput) => {
    return apiClient.post<AuthResponse>("/auth/login", data);
  },

  // Register
  register: (data: RegisterInput) => {
    return apiClient.post<AuthResponse>("/auth/register", data);
  },

  // Get current user profile
  getMe: () => {
    return apiClient.get<{ data: User }>("/auth/me");
  },

  // Forgot password
  forgotPassword: (data: ForgotPasswordInput) => {
    return apiClient.post<{ success: boolean; message: string }>("/auth/forgot-password", data);
  },

  // Reset password
  resetPassword: (data: ResetPasswordInput) => {
    return apiClient.post<{ success: boolean; message: string }>("/auth/reset-password", data);
  },

  // Verify email
  verifyEmail: (token: string) => {
    return apiClient.post<{ success: boolean; message: string }>("/auth/verify-email", { token });
  },

  // Resend verification email
  resendVerification: () => {
    return apiClient.post<{ success: boolean; message: string }>("/auth/resend-verification", {});
  },

  // Update profile
  updateProfile: (data: { name?: string; email?: string; avatar?: string }) => {
    return apiClient.patch<{ data: User }>("/auth/profile", data);
  },

  // Change password
  changePassword: (data: { currentPassword: string; newPassword: string }) => {
    return apiClient.patch<{ success: boolean; message: string }>("/auth/password", data);
  },
};

