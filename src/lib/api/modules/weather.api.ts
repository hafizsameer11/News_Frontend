import { WeatherData, WeatherCity } from "@/types/weather.types";

const OPENWEATHER_API_KEY = "54949af95d469232d04fde19c3fbb56e";
const OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5";

// Hardcoded Calabria cities list
const CALABRIA_CITIES: WeatherCity[] = [
  {
    id: "catanzaro",
    name: "Catanzaro",
    nameIt: "Catanzaro",
    country: "IT",
    latitude: 38.9108,
    longitude: 16.5874,
    isActive: true,
  },
  {
    id: "reggio-calabria",
    name: "Reggio Calabria",
    nameIt: "Reggio Calabria",
    country: "IT",
    latitude: 38.1105,
    longitude: 15.6614,
    isActive: true,
  },
  {
    id: "cosenza",
    name: "Cosenza",
    nameIt: "Cosenza",
    country: "IT",
    latitude: 39.3099,
    longitude: 16.2502,
    isActive: true,
  },
  {
    id: "crotone",
    name: "Crotone",
    nameIt: "Crotone",
    country: "IT",
    latitude: 39.0808,
    longitude: 17.1276,
    isActive: true,
  },
  {
    id: "vibo-valentia",
    name: "Vibo Valentia",
    nameIt: "Vibo Valentia",
    country: "IT",
    latitude: 38.6753,
    longitude: 16.1006,
    isActive: true,
  },
  {
    id: "lamezia-terme",
    name: "Lamezia Terme",
    nameIt: "Lamezia Terme",
    country: "IT",
    latitude: 38.9659,
    longitude: 16.3092,
    isActive: true,
  },
  {
    id: "corigliano-rossano",
    name: "Corigliano-Rossano",
    nameIt: "Corigliano-Rossano",
    country: "IT",
    latitude: 39.5667,
    longitude: 16.6333,
    isActive: true,
  },
  {
    id: "castrovillari",
    name: "Castrovillari",
    nameIt: "Castrovillari",
    country: "IT",
    latitude: 39.8167,
    longitude: 16.2000,
    isActive: true,
  },
];

// OpenWeatherMap API response types
interface OpenWeatherResponse {
  coord: {
    lon: number;
    lat: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  base: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level?: number;
    grnd_level?: number;
  };
  visibility?: number;
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  rain?: {
    "1h"?: number;
  };
  snow?: {
    "1h"?: number;
  };
  clouds: {
    all: number;
  };
  dt: number;
  sys: {
    type: number;
    id: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

// Map OpenWeatherMap response to WeatherData
function mapOpenWeatherToWeatherData(
  openWeatherData: OpenWeatherResponse,
  city: WeatherCity
): WeatherData {
  const weatherCondition = openWeatherData.weather[0];
  
  return {
    cityId: city.id,
    city: city,
    temperature: openWeatherData.main.temp,
    feelsLike: openWeatherData.main.feels_like,
    humidity: openWeatherData.main.humidity,
    pressure: openWeatherData.main.pressure,
    windSpeed: openWeatherData.wind.speed,
    windDirection: openWeatherData.wind.deg,
    condition: weatherCondition.main,
    conditionDescription: weatherCondition.description,
    description: weatherCondition.description,
    icon: weatherCondition.icon,
    visibility: openWeatherData.visibility,
    cloudiness: openWeatherData.clouds.all,
    sunrise: new Date(openWeatherData.sys.sunrise * 1000).toISOString(),
    sunset: new Date(openWeatherData.sys.sunset * 1000).toISOString(),
    updatedAt: new Date(openWeatherData.dt * 1000).toISOString(),
  };
}

export const weatherApi = {
  // Get weather for a city using OpenWeatherMap API
  getWeather: async (cityId: string): Promise<WeatherData> => {
    const city = CALABRIA_CITIES.find((c) => c.id === cityId);
    
    if (!city) {
      throw new Error(`City with id ${cityId} not found`);
    }

    const url = `${OPENWEATHER_BASE_URL}/weather?lat=${city.latitude}&lon=${city.longitude}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=en`;
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to fetch weather: ${response.statusText}`
        );
      }

      const data: OpenWeatherResponse = await response.json();
      return mapOpenWeatherToWeatherData(data, city);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error. Please check your connection.");
    }
  },

  // Get all weather cities (hardcoded)
  getCities: async (): Promise<WeatherCity[]> => {
    // Return hardcoded cities immediately (no API call needed)
    return Promise.resolve(CALABRIA_CITIES);
  },
};

