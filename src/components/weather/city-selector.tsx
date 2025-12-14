"use client";

import { WeatherCity } from "@/types/weather.types";

interface CitySelectorProps {
  cities: WeatherCity[];
  selectedCityId: string;
  onCityChange: (cityId: string) => void;
  className?: string;
}

export function CitySelector({
  cities,
  selectedCityId,
  onCityChange,
  className = "",
}: CitySelectorProps) {
  return (
    <select
      value={selectedCityId}
      onChange={(e) => onCityChange(e.target.value)}
      className={`px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    >
      <option value="">Select a city</option>
      {cities
        .filter((city) => city.isActive)
        .map((city) => (
          <option key={city.id} value={city.id}>
            {city.name}
          </option>
        ))}
    </select>
  );
}

