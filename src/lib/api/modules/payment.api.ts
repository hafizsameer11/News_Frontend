import { apiClient } from "../apiClient";

export interface PlanCheckoutResponse {
  sessionId: string;
  url: string;
}

export interface AdPaymentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
}

export const paymentApi = {
  createPlanCheckout: async (planId: string, planPrice: number) => {
    return apiClient.post<{ data: PlanCheckoutResponse }>("/payment/plan/checkout", {
      planId,
      planPrice,
    });
  },

  createAdPayment: async (adId: string) => {
    return apiClient.post<{ data: AdPaymentResponse }>(`/payment/ad/${adId}`);
  },

  getAllTransactions: async (params?: { page?: number; limit?: number; status?: string; userId?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.status) queryParams.append("status", params.status);
    if (params?.userId) queryParams.append("userId", params.userId);

    const url = `/payment/transactions${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    return apiClient.get<import("@/types/transaction.types").TransactionResponse>(url);
  },

  getUserTransactions: async () => {
    return apiClient.get<{ data: import("@/types/transaction.types").Transaction[] }>("/payment/transactions/me");
  },

  cancelPlan: async (transactionId: string) => {
    return apiClient.post<{ data: { message: string; transactionId: string } }>(
      `/payment/plan/${transactionId}/cancel`
    );
  },

  changePlan: async (transactionId: string, newPlanId: string, newPlanPrice: number) => {
    return apiClient.post<{ data: { message: string; checkoutUrl: string; sessionId: string } }>(
      `/payment/plan/${transactionId}/change`,
      {
        newPlanId,
        newPlanPrice,
      }
    );
  },
};

