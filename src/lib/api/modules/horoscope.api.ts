import { apiClient } from "../apiClient";
import { HoroscopeResponse, HoroscopeDetailResponse, ZodiacSign } from "@/types/horoscope.types";

export const horoscopeApi = {
  // Get daily horoscope for all signs
  getDaily: () => {
    return apiClient.get<HoroscopeResponse>("/horoscope/daily");
  },

  // Get weekly horoscope for all signs
  getWeekly: () => {
    return apiClient.get<HoroscopeResponse>("/horoscope/weekly");
  },

  // Get horoscope for a specific sign
  getBySign: (sign: ZodiacSign, type: "daily" | "weekly" = "daily") => {
    return apiClient.get<HoroscopeDetailResponse>(`/horoscope/${sign}?type=${type}`);
  },
};

