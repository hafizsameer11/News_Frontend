import { useQuery } from "@tanstack/react-query";
import { horoscopeApi } from "@/lib/api/modules/horoscope.api";
import { ZodiacSign } from "@/types/horoscope.types";

// Get daily horoscope for all signs
export const useDailyHoroscope = () => {
  return useQuery({
    queryKey: ["horoscope", "daily"],
    queryFn: () => horoscopeApi.getDaily(),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours - daily horoscope updates once per day
  });
};

// Get weekly horoscope for all signs
export const useWeeklyHoroscope = () => {
  return useQuery({
    queryKey: ["horoscope", "weekly"],
    queryFn: () => horoscopeApi.getWeekly(),
    staleTime: 1000 * 60 * 60 * 24 * 7, // 7 days - weekly horoscope updates once per week
  });
};

// Get horoscope for a specific sign
export const useHoroscopeBySign = (sign: ZodiacSign, type: "daily" | "weekly" = "daily") => {
  return useQuery({
    queryKey: ["horoscope", sign, type],
    queryFn: () => horoscopeApi.getBySign(sign, type),
    enabled: !!sign,
    staleTime: type === "daily" ? 1000 * 60 * 60 * 24 : 1000 * 60 * 60 * 24 * 7,
  });
};

