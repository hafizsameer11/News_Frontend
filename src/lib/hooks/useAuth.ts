import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi, LoginInput, RegisterInput, ForgotPasswordInput, ResetPasswordInput } from "@/lib/api/modules/auth.api";
import { useAuth as useAuthContext } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { AuthResponse } from "@/types/user.types";

// Login mutation
export const useLogin = () => {
  const { login } = useAuthContext();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginInput) => authApi.login(data),
    onSuccess: (response) => {
      if (response.data) {
        login(response.data.token, response.data.user);
        queryClient.setQueryData(["user", "me"], response.data.user);
        // Redirect based on role
        if (response.data.user.role === "EDITOR") {
          router.push("/editor");
        } else if (response.data.user.role === "ADMIN" || response.data.user.role === "SUPER_ADMIN") {
          router.push("/admin/dashboard");
        } else if (response.data.user.role === "ADVERTISER") {
          router.push("/advertiser/dashboard");
        } else {
          router.push("/dashboard");
        }
      }
    },
  });
};

// Register mutation
export const useRegister = () => {
  const { login } = useAuthContext();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterInput) => authApi.register(data),
    onSuccess: (response) => {
      if (response.data) {
        login(response.data.token, response.data.user);
        queryClient.setQueryData(["user", "me"], response.data.user);
        // Redirect based on role
        if (response.data.user.role === "ADVERTISER") {
          router.push("/register/plans");
        } else if (response.data.user.role === "EDITOR") {
          router.push("/editor");
        } else if (response.data.user.role === "ADMIN" || response.data.user.role === "SUPER_ADMIN") {
          router.push("/admin/dashboard");
        } else {
          router.push("/dashboard");
        }
      }
    },
  });
};

// Get current user
export const useGetMe = (enabled: boolean = true) => {
  const { token } = useAuthContext();
  return useQuery<AuthResponse>({
    queryKey: ["user", "me"],
    queryFn: () => authApi.getMe(),
    enabled: enabled && !!token,
  });
};

// Forgot password mutation
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (data: ForgotPasswordInput) => authApi.forgotPassword(data),
  });
};

// Reset password mutation
export const useResetPassword = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: (data: ResetPasswordInput) => authApi.resetPassword(data),
    onSuccess: () => {
      // Redirect to login after successful password reset
      router.push("/login");
    },
  });
};

// Verify email mutation
export const useVerifyEmail = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: (token: string) => authApi.verifyEmail(token),
    onSuccess: () => {
      // Redirect to login after successful verification
      router.push("/login?verified=true");
    },
  });
};

// Resend verification email mutation
export const useResendVerification = () => {
  return useMutation({
    mutationFn: () => authApi.resendVerification(),
  });
};

// Update profile mutation
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { login } = useAuthContext();
  return useMutation({
    mutationFn: (data: { name?: string; email?: string; avatar?: string }) =>
      authApi.updateProfile(data),
    onSuccess: (response) => {
      if (response.data) {
        // Update auth context
        const currentToken = localStorage.getItem("token");
        if (currentToken) {
          login(currentToken, response.data);
        }
        // Update query cache
        queryClient.setQueryData(["user", "me"], response.data);
      }
    },
  });
};

// Change password mutation
export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      authApi.changePassword(data),
  });
};

