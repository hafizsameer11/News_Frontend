// Transaction Types
export interface Transaction {
  id: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
    companyName?: string;
  };
  adId?: string;
  ad?: {
    id: string;
    title: string;
    type: string;
  };
  planId?: string;
  amount: number;
  currency: string;
  status: "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED";
  stripePaymentIntentId?: string;
  stripeCustomerId?: string;
  stripeChargeId?: string;
  description?: string;
  metadata?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionResponse {
  success: boolean;
  message: string;
  data: {
    transactions: Transaction[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

