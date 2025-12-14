// Transport Types
export type TransportType = "BUS" | "TRAIN" | "TAXI" | "RENTAL";

export interface Transport {
  id: string;
  type: TransportType;
  name: string;
  nameIt?: string;
  description?: string;
  descriptionIt?: string;
  route?: string;
  schedule?: string;
  contactPhone?: string;
  contactEmail?: string;
  website?: string;
  city?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TransportResponse {
  success: boolean;
  message: string;
  data: {
    transports: Transport[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

