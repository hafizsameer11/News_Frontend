import { apiClient } from "../apiClient";
import { WeatherResponse, WeatherCitiesResponse } from "@/types/weather.types";

export const weatherApi = {
  // Get weather for a city
  getWeather: (cityId: string) => {
    return apiClient.get<WeatherResponse>(`/weather?cityId=${cityId}`);
  },

  // Get all weather cities
  getCities: () => {
    return apiClient.get<WeatherCitiesResponse>("/weather/cities");
  },
};

