// Weather Types
export interface WeatherCity {
  id: string;
  name: string;
  nameIt?: string;
  country: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
}

export interface WeatherData {
  cityId: string;
  city: WeatherCity | string; // Support both object and string for backward compatibility
  temperature: number;
  feelsLike?: number;
  humidity: number;
  pressure?: number;
  windSpeed: number;
  windDirection?: number;
  condition: string;
  conditionDescription?: string;
  description?: string; // Alternative field name
  icon: string;
  visibility?: number;
  cloudiness?: number;
  sunrise?: string;
  sunset?: string;
  updatedAt: string;
}

export interface WeatherResponse {
  success: boolean;
  message: string;
  data: WeatherData;
}

export interface WeatherCitiesResponse {
  success: boolean;
  message: string;
  data: WeatherCity[];
}

