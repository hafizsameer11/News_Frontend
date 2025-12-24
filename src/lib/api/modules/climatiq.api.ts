/**
 * Climatiq Travel API integration
 * API Documentation: https://www.climatiq.io/docs/api-reference/travel/travel-v1-preview3
 */

const CLIMATIQ_API_KEY = "V2FABFKPAN7NSDEPQG6JPH7PGW";
const CLIMATIQ_BASE_URL = "https://preview.api.climatiq.io";

export type TravelMode = "air" | "car" | "rail";
export type SpendType = "air" | "road" | "rail" | "sea" | "hotel";
export type CarType = "petrol" | "diesel" | "plugin_hybrid" | "battery_electric" | "average";
export type CarSize = "small" | "medium" | "large" | "average";
export type AirClass = "economy" | "business" | "first";

export interface LocationInput {
  query?: string;
  locode?: string;
  iata?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface DistanceBasedRequest {
  travel_mode: TravelMode;
  origin: LocationInput;
  destination: LocationInput;
  year?: number;
  distance_km?: number;
  car_details?: {
    car_type?: CarType;
    car_size?: CarSize;
  };
  air_details?: {
    class?: AirClass;
  };
}

export interface SpendBasedRequest {
  spend_type: SpendType;
  money: number;
  money_unit: string;
  spend_location: LocationInput;
  spend_year?: number;
}

export interface HotelRequest {
  hotel_nights: number;
  location: LocationInput;
  year?: number;
}

export interface ClimatiqResponse {
  co2e: number;
  co2e_unit: string;
  co2e_calculation_method: string;
  distance_km?: number;
  origin?: ResponseLocation;
  destination?: ResponseLocation;
  location?: ResponseLocation;
  spend_location?: ResponseLocation;
  direct_emissions?: {
    co2e: number;
    co2e_unit: string;
    source_trail: SourceDataPoint[];
  };
  indirect_emissions?: {
    co2e: number;
    co2e_unit: string;
    source_trail: SourceDataPoint[];
  };
  notices: Notice[];
  source_trail: SourceDataPoint[];
}

export interface ResponseLocation {
  name: string;
  latitude?: string | null;
  longitude?: string | null;
  confidence_score?: number | null;
}

export interface SourceDataPoint {
  data_category: string | null;
  name: string;
  source: string;
  source_dataset: string | null;
  year: string | null;
  region: string;
  region_name: string;
  id: string | null;
}

export interface Notice {
  severity: "warning" | "info";
  message: string;
  code?: string;
}

async function climatiqRequest<T>(
  endpoint: string,
  body: DistanceBasedRequest | SpendBasedRequest | HotelRequest
): Promise<T> {
  const response = await fetch(`${CLIMATIQ_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${CLIMATIQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const climatiqApi = {
  /**
   * Calculate emissions using distance-based method
   */
  calculateDistance: (request: DistanceBasedRequest): Promise<ClimatiqResponse> => {
    return climatiqRequest<ClimatiqResponse>("/travel/v1-preview3/distance", request);
  },

  /**
   * Calculate emissions using spend-based method
   */
  calculateSpend: (request: SpendBasedRequest): Promise<ClimatiqResponse> => {
    return climatiqRequest<ClimatiqResponse>("/travel/v1-preview3/spend", request);
  },

  /**
   * Calculate emissions for hotel stays
   */
  calculateHotel: (request: HotelRequest): Promise<ClimatiqResponse> => {
    return climatiqRequest<ClimatiqResponse>("/travel/v1-preview3/hotel", request);
  },
};

