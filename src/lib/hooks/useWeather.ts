import { useQuery } from "@tanstack/react-query";
import { weatherApi } from "@/lib/api/modules/weather.api";
import { WeatherData, WeatherCity } from "@/types/weather.types";

// Get weather for a city
export const useWeather = (cityId: string, enabled: boolean = true) => {
  return useQuery<WeatherData>({
    queryKey: ["weather", cityId],
    queryFn: () => weatherApi.getWeather(cityId),
    enabled: enabled && !!cityId,
    staleTime: Infinity, // Never consider stale - only fetch on mount or when cityId changes
    refetchOnMount: false, // Don't refetch if cached data exists (queryKey change triggers new fetch)
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnReconnect: false, // Don't refetch on reconnect
    refetchInterval: false, // Disable automatic refetching
  });
};

// Get all weather cities
export const useWeatherCities = () => {
  return useQuery<WeatherCity[]>({
    queryKey: ["weather", "cities"],
    queryFn: () => weatherApi.getCities(),
    staleTime: Infinity, // Cities are hardcoded, never stale
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });
};

