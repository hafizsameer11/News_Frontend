import { useQuery } from "@tanstack/react-query";
import { weatherApi } from "@/lib/api/modules/weather.api";

// Get weather for a city
export const useWeather = (cityId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["weather", cityId],
    queryFn: () => weatherApi.getWeather(cityId),
    enabled: enabled && !!cityId,
    staleTime: 1000 * 60 * 60, // 1 hour - weather updates hourly
    refetchInterval: 1000 * 60 * 60, // Refetch every hour
  });
};

// Get all weather cities
export const useWeatherCities = () => {
  return useQuery({
    queryKey: ["weather", "cities"],
    queryFn: () => weatherApi.getCities(),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours - cities don't change often
  });
};

