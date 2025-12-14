"use client";

import { useState, useMemo } from "react";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { useWeather, useWeatherCities } from "@/lib/hooks/useWeather";
import { WeatherCard } from "@/components/weather/weather-card";
import { CitySelector } from "@/components/weather/city-selector";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import { WeatherCity } from "@/types/weather.types";

export function WeatherPageClient() {
  const [selectedCityId, setSelectedCityId] = useState<string>("");
  const [viewMode, setViewMode] = useState<"single" | "all">("all");

  const { data: citiesData, isLoading: citiesLoading, error: citiesError } = useWeatherCities();
  const { data: weatherData, isLoading: weatherLoading, error: weatherError } = useWeather(
    selectedCityId,
    !!selectedCityId && viewMode === "single"
  );

  const cities = citiesData?.data?.filter((city) => city.isActive) || [];
  const weather = weatherData?.data;

  // Fetch weather for all cities when in "all" mode
  const allCitiesWeather = useMemo(() => {
    if (viewMode === "all" && cities.length > 0) {
      return cities;
    }
    return [];
  }, [viewMode, cities]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 md:mb-0">Weather - Calabria Cities</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setViewMode("all")}
              className={`px-4 py-2 rounded-md transition ${
                viewMode === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              View All Cities
            </button>
            <button
              onClick={() => setViewMode("single")}
              className={`px-4 py-2 rounded-md transition ${
                viewMode === "single"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Single City
            </button>
          </div>
        </div>

        {citiesError && <ErrorMessage error={citiesError} className="mb-6" />}

        {citiesLoading ? (
          <Loading />
        ) : viewMode === "single" ? (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select a City
              </label>
              <CitySelector
                cities={cities}
                selectedCityId={selectedCityId}
                onCityChange={setSelectedCityId}
                className="w-full md:w-64"
              />
            </div>

            {selectedCityId && (
              <>
                {weatherError && <ErrorMessage error={weatherError} />}
                {weatherLoading ? (
                  <Loading />
                ) : weather ? (
                  <WeatherCard weather={weather} />
                ) : null}
              </>
            )}

            {!selectedCityId && cities.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-600">Please select a city to view weather information.</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            {cities.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-600">No active cities available.</p>
              </div>
            ) : (
              <>
                <p className="text-gray-600 mb-4">
                  Showing weather for {cities.length} cities in Calabria
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cities.map((city) => (
                    <CityWeatherCard key={city.id} city={city} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

// Component to fetch and display weather for a single city
function CityWeatherCard({ city }: { city: WeatherCity }) {
  const { data: weatherData, isLoading, error } = useWeather(city.id, true);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error || !weatherData?.data) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-1">{city.name}</h3>
        <p className="text-sm text-gray-500">Weather data unavailable</p>
      </div>
    );
  }

  return <WeatherCard weather={weatherData.data} compact={true} />;
}

