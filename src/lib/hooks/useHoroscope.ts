import { useQuery } from "@tanstack/react-query";
import { horoscopeApi } from "@/lib/api/modules/horoscope.api";
import { ZodiacSign } from "@/types/horoscope.types";

// All zodiac signs for selection
export const ALL_ZODIAC_SIGNS: ZodiacSign[] = [
  "ARIES",
  "TAURUS",
  "GEMINI",
  "CANCER",
  "LEO",
  "VIRGO",
  "LIBRA",
  "SCORPIO",
  "SAGITTARIUS",
  "CAPRICORN",
  "AQUARIUS",
  "PISCES",
];

// Get daily horoscope for selected signs
// Only fetches when manually triggered (enabled: false by default)
export const useDailyHoroscope = (enabled: boolean = false, selectedSigns?: ZodiacSign[]) => {
  return useQuery({
    queryKey: ["horoscope", "daily", selectedSigns],
    queryFn: () => horoscopeApi.getDaily(selectedSigns),
    enabled: enabled, // Only fetch when explicitly enabled
    staleTime: 1000 * 60 * 60 * 24, // 24 hours - daily horoscope updates once per day
  });
};

// Get weekly horoscope for selected signs
// Only fetches when manually triggered (enabled: false by default)
export const useWeeklyHoroscope = (enabled: boolean = false, selectedSigns?: ZodiacSign[]) => {
  return useQuery({
    queryKey: ["horoscope", "weekly", selectedSigns],
    queryFn: () => horoscopeApi.getWeekly(selectedSigns),
    enabled: enabled, // Only fetch when explicitly enabled
    staleTime: 1000 * 60 * 60 * 24 * 7, // 7 days - weekly horoscope updates once per week
  });
};

// Get horoscope for a specific sign
// Only fetches when manually triggered (enabled: false by default)
export const useHoroscopeBySign = (sign: ZodiacSign, type: "daily" | "weekly" = "daily", enabled: boolean = false) => {
  return useQuery({
    queryKey: ["horoscope", sign, type],
    queryFn: () => horoscopeApi.getBySign(sign, type),
    enabled: enabled && !!sign, // Only fetch when explicitly enabled and sign is provided
    staleTime: type === "daily" ? 1000 * 60 * 60 * 24 : 1000 * 60 * 60 * 24 * 7,
  });
};

