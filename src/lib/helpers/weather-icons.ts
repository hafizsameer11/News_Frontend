// Weather Icons Utility
// Maps weather condition codes to icon URLs and descriptions

export interface WeatherIconInfo {
  iconUrl: string;
  description: string;
  emoji?: string;
}

/**
 * Get weather icon URL from OpenWeatherMap icon code
 */
export function getWeatherIconUrl(iconCode: string): string {
  if (iconCode.startsWith("http")) {
    return iconCode;
  }
  // OpenWeatherMap icon format: https://openweathermap.org/img/wn/{icon}@2x.png
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

/**
 * Get weather icon information including URL, description, and emoji
 */
export function getWeatherIconInfo(iconCode: string, condition?: string): WeatherIconInfo {
  const iconUrl = getWeatherIconUrl(iconCode);
  
  // Map common OpenWeatherMap icon codes to descriptions and emojis
  const iconMap: Record<string, { description: string; emoji: string }> = {
    "01d": { description: "Clear sky (day)", emoji: "☀️" },
    "01n": { description: "Clear sky (night)", emoji: "🌙" },
    "02d": { description: "Few clouds (day)", emoji: "⛅" },
    "02n": { description: "Few clouds (night)", emoji: "☁️" },
    "03d": { description: "Scattered clouds", emoji: "☁️" },
    "03n": { description: "Scattered clouds", emoji: "☁️" },
    "04d": { description: "Broken clouds", emoji: "☁️" },
    "04n": { description: "Broken clouds", emoji: "☁️" },
    "09d": { description: "Shower rain", emoji: "🌦️" },
    "09n": { description: "Shower rain", emoji: "🌦️" },
    "10d": { description: "Rain (day)", emoji: "🌧️" },
    "10n": { description: "Rain (night)", emoji: "🌧️" },
    "11d": { description: "Thunderstorm", emoji: "⛈️" },
    "11n": { description: "Thunderstorm", emoji: "⛈️" },
    "13d": { description: "Snow", emoji: "❄️" },
    "13n": { description: "Snow", emoji: "❄️" },
    "50d": { description: "Mist", emoji: "🌫️" },
    "50n": { description: "Mist", emoji: "🌫️" },
  };

  const iconInfo = iconMap[iconCode] || {
    description: condition || "Unknown weather condition",
    emoji: "🌤️",
  };

  return {
    iconUrl,
    description: iconInfo.description,
    emoji: iconInfo.emoji,
  };
}

/**
 * Get weather condition description from condition string
 */
export function getWeatherConditionDescription(condition: string): string {
  const conditionMap: Record<string, string> = {
    Clear: "Clear sky",
    Clouds: "Cloudy",
    Rain: "Rainy",
    Drizzle: "Light rain",
    Thunderstorm: "Thunderstorm",
    Snow: "Snowy",
    Mist: "Misty",
    Fog: "Foggy",
    Haze: "Hazy",
    Dust: "Dusty",
    Sand: "Sandy",
    Ash: "Ash",
    Squall: "Squally",
    Tornado: "Tornado",
  };

  return conditionMap[condition] || condition;
}

