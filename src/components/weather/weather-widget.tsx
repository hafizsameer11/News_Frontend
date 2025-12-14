"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useWeather, useWeatherCities } from "@/lib/hooks/useWeather";
import { storage } from "@/lib/helpers/storage";

const WEATHER_CITY_STORAGE_KEY = "weather_selected_city_id";

const getInitialCityId = (citiesData: ReturnType<typeof useWeatherCities>["data"]): string => {
  if (citiesData?.data && citiesData.data.length > 0) {
    const savedCityId = storage.get<string>(WEATHER_CITY_STORAGE_KEY);
    const activeCities = citiesData.data.filter((city) => city.isActive);
    
    if (savedCityId && activeCities.some((city) => city.id === savedCityId)) {
      return savedCityId;
    } else if (activeCities.length > 0) {
      const firstCityId = activeCities[0].id;
      storage.set(WEATHER_CITY_STORAGE_KEY, firstCityId);
      return firstCityId;
    }
  }
  return "";
};

export function WeatherWidget() {
  const { data: citiesData } = useWeatherCities();
  const [selectedCityId, setSelectedCityId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return getInitialCityId(citiesData);
    }
    return "";
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Initialize city when citiesData changes (after initial load)
  useEffect(() => {
    if (citiesData?.data && citiesData.data.length > 0 && !selectedCityId) {
      const activeCities = citiesData.data.filter((city) => city.isActive);
      if (activeCities.length > 0) {
        const firstCityId = activeCities[0].id;
        // Use functional update to avoid dependency on selectedCityId
        setSelectedCityId((prev) => {
          if (!prev) {
            storage.set(WEATHER_CITY_STORAGE_KEY, firstCityId);
            return firstCityId;
          }
          return prev;
        });
      }
    }
  }, [citiesData]);

  const handleCityChange = (cityId: string) => {
    setSelectedCityId(cityId);
    storage.set(WEATHER_CITY_STORAGE_KEY, cityId);
    setIsDropdownOpen(false);
  };

  const { data: weatherData, isLoading } = useWeather(selectedCityId, !!selectedCityId);

  const cities = citiesData?.data?.filter((city) => city.isActive) || [];
  const weather = weatherData?.data;

  const getWeatherIcon = (icon: string) => {
    if (icon.startsWith("http")) {
      return icon;
    }
    return `https://openweathermap.org/img/wn/${icon}@2x.png`;
  };

  if (!selectedCityId || isLoading || !cities.length) {
    return (
      <Link
        href="/weather"
        className="hidden md:flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-red-600 transition"
      >
        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs">Weather</span>
      </Link>
    );
  }

  if (!weather) {
    return null;
  }

  return (
    <div className="hidden md:block relative">
      <div className="flex items-center gap-2">
        {/* City Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-red-600 transition border border-gray-200 rounded hover:border-red-600"
            title="Change city"
            aria-label="Select weather city"
          >
            <span className="text-[10px] max-w-[60px] truncate">{weather.city.name}</span>
            <svg
              className={`w-3 h-3 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-90"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-100 max-h-64 overflow-y-auto min-w-[150px]">
                <div className="py-1">
                  {cities.map((city) => (
                    <button
                      key={city.id}
                      onClick={() => handleCityChange(city.id)}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition ${
                        selectedCityId === city.id
                          ? "bg-red-50 text-red-600 font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      {city.name}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Weather Display */}
        <Link
          href="/weather"
          className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-700 hover:text-red-600 transition border border-gray-200 rounded hover:border-red-600"
          title={`${weather.city.name}: ${Math.round(weather.temperature)}°C - ${weather.conditionDescription}. Humidity: ${weather.humidity}%, Wind: ${weather.windSpeed} m/s`}
        >
          {weather.icon && (
            <div className="w-5 h-5 relative">
              <Image
                src={getWeatherIcon(weather.icon)}
                alt={weather.condition}
                width={20}
                height={20}
                className="object-contain"
                quality={75}
              />
            </div>
          )}
          <span className="text-xs font-semibold leading-tight whitespace-nowrap">
            {Math.round(weather.temperature)}°C
          </span>
        </Link>
      </div>
    </div>
  );
}

