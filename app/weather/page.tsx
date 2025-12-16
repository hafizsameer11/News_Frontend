import { Metadata } from "next";
import { WeatherPageClient } from "./weather-client";

// ISR: Revalidate weather page every 300 seconds (5 minutes)
// Weather data updates frequently, so shorter cache is needed
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";
  
  return {
    title: "Weather - Calabria Cities | NEWS NEXT",
    description: "Get current weather information for all cities in Calabria. Real-time temperature, humidity, wind speed, and weather conditions.",
    openGraph: {
      title: "Weather - Calabria Cities | NEWS NEXT",
      description: "Get current weather information for all cities in Calabria. Real-time temperature, humidity, wind speed, and weather conditions.",
      type: "website",
      url: `${baseUrl}/weather`,
    },
    twitter: {
      card: "summary_large_image",
      title: "Weather - Calabria Cities | NEWS NEXT",
      description: "Get current weather information for all cities in Calabria.",
    },
    alternates: {
      canonical: `${baseUrl}/weather`,
    },
  };
}

export default function WeatherPage() {
  return <WeatherPageClient />;
}

