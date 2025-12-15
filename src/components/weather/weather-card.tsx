"use client";

import { WeatherData } from "@/types/weather.types";
import Image from "next/image";
import { getWeatherIconInfo } from "@/lib/helpers/weather-icons";
import { useLanguage } from "@/providers/LanguageProvider";

interface WeatherCardProps {
  weather: WeatherData;
  className?: string;
  compact?: boolean;
}

export function WeatherCard({
  weather,
  className = "",
  compact = false,
}: WeatherCardProps) {
  const { t, formatTime, formatDateTime } = useLanguage();
  const iconInfo = weather.icon
    ? getWeatherIconInfo(weather.icon, weather.condition)
    : null;

  if (compact) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {typeof weather.city === "string"
                ? weather.city
                : weather.city.name}
            </h3>
            <p className="text-xs text-gray-500 mb-2">
              {weather.conditionDescription || weather.description || ""}
            </p>
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(weather.temperature)}°C
            </div>
          </div>
          {iconInfo && (
            <div className="w-12 h-12 relative ml-4">
              <Image
                src={iconInfo.iconUrl}
                alt={weather.condition}
                width={48}
                height={48}
                className="object-contain"
                quality={75}
              />
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs mt-3 pt-3 border-t border-gray-200">
          <div>
            <span className="text-gray-500">Feels:</span>
            <span className="ml-1 font-medium">
              {weather.feelsLike !== undefined
                ? `${Math.round(weather.feelsLike)}°C`
                : "N/A"}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Humidity:</span>
            <span className="ml-1 font-medium">{weather.humidity}%</span>
          </div>
          <div>
            <span className="text-gray-500">Wind:</span>
            <span className="ml-1 font-medium">{weather.windSpeed} m/s</span>
          </div>
          <div>
            <span className="text-gray-500">Pressure:</span>
            <span className="ml-1 font-medium">
              {weather.pressure ? `${weather.pressure} hPa` : "N/A"}
            </span>
          </div>
          {weather.visibility && (
            <div>
              <span className="text-gray-500">Visibility:</span>
              <span className="ml-1 font-medium">
                {Math.round(weather.visibility / 1000)} km
              </span>
            </div>
          )}
          {weather.cloudiness !== undefined && (
            <div>
              <span className="text-gray-500">Clouds:</span>
              <span className="ml-1 font-medium">{weather.cloudiness}%</span>
            </div>
          )}
        </div>
        {(weather.sunrise || weather.sunset) && (
          <div className="grid grid-cols-2 gap-2 text-xs mt-2 pt-2 border-t border-gray-200">
            {weather.sunrise && (
              <div>
                <span className="text-gray-500">Sunrise:</span>
                <span className="ml-1 font-medium">
                  {formatTime(new Date(weather.sunrise), "p")}
                </span>
              </div>
            )}
            {weather.sunset && (
              <div>
                <span className="text-gray-500">Sunset:</span>
                <span className="ml-1 font-medium">
                  {formatTime(new Date(weather.sunset), "p")}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">
            {typeof weather.city === "string"
              ? weather.city
              : weather.city.name}
          </h3>
          <p className="text-sm text-gray-500">
            {weather.conditionDescription || weather.description || ""}
          </p>
        </div>
        {iconInfo && (
          <div className="w-16 h-16 relative">
            <Image
              src={iconInfo.iconUrl}
              alt={weather.condition}
              width={64}
              height={64}
              className="object-contain"
              quality={75}
            />
          </div>
        )}
      </div>
      <div className="text-4xl font-bold text-gray-900 mb-4">
        {Math.round(weather.temperature)}°C
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
        <div>
          <span className="text-gray-500">Feels like:</span>
          <span className="ml-2 font-medium">
            {weather.feelsLike !== undefined
              ? `${Math.round(weather.feelsLike)}°C`
              : "N/A"}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Humidity:</span>
          <span className="ml-2 font-medium">{weather.humidity}%</span>
        </div>
        <div>
          <span className="text-gray-500">Wind:</span>
          <span className="ml-2 font-medium">{weather.windSpeed} m/s</span>
        </div>
        <div>
          <span className="text-gray-500">Pressure:</span>
          <span className="ml-2 font-medium">
            {weather.pressure ? `${weather.pressure} hPa` : "N/A"}
          </span>
        </div>
        {weather.visibility && (
          <div>
            <span className="text-gray-500">Visibility:</span>
            <span className="ml-2 font-medium">
              {weather.visibility / 1000} km
            </span>
          </div>
        )}
        {weather.cloudiness !== undefined && (
          <div>
            <span className="text-gray-500">Cloudiness:</span>
            <span className="ml-2 font-medium">{weather.cloudiness}%</span>
          </div>
        )}
      </div>
      {(weather.sunrise || weather.sunset) && (
        <div className="grid grid-cols-2 gap-4 text-sm mb-4 pt-4 border-t border-gray-200">
          {weather.sunrise && (
            <div>
              <span className="text-gray-500">Sunrise:</span>
              <span className="ml-2 font-medium">
                {formatTime(new Date(weather.sunrise), "p")}
              </span>
            </div>
          )}
          {weather.sunset && (
            <div>
              <span className="text-gray-500">Sunset:</span>
              <span className="ml-2 font-medium">
                {formatTime(new Date(weather.sunset), "p")}
              </span>
            </div>
          )}
        </div>
      )}
      {weather.updatedAt && (
        <p className="text-xs text-gray-400 mt-4">
          {t("weather.updated")}: {formatDateTime(new Date(weather.updatedAt))}
        </p>
      )}
    </div>
  );
}
