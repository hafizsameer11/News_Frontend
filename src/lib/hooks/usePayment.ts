import { useMutation, useQuery } from "@tanstack/react-query";
import { paymentApi } from "@/lib/api/modules/payment.api";
import { TransactionResponse } from "@/types/transaction.types";

export const useCreatePlanCheckout = () => {
  return useMutation({
    mutationFn: ({ planId, planPrice }: { planId: string; planPrice: number }) =>
      paymentApi.createPlanCheckout(planId, planPrice),
  });
};

export const useCreateAdPayment = () => {
  return useMutation({
    mutationFn: (adId: string) => paymentApi.createAdPayment(adId),
  });
};

export const useTransactions = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  userId?: string;
}) => {
  return useQuery<TransactionResponse>({
    queryKey: ["transactions", params],
    queryFn: () => paymentApi.getAllTransactions(params),
  });
};

export const useUserTransactions = () => {
  return useQuery({
    queryKey: ["transactions", "me"],
    queryFn: () => paymentApi.getUserTransactions(),
  });
};

