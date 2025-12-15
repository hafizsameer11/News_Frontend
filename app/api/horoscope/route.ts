import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.HOROSCOPE_API_KEY || "A/E7Q95lJMv5sqg1Jyy7BQ==pdqob2kVwlKfOV0w";
const BASE_URL = "https://api.api-ninjas.com/v1/horoscope";

// Map our ZodiacSign enum to API format
const zodiacMap: Record<string, string> = {
  ARIES: "aries",
  TAURUS: "taurus",
  GEMINI: "gemini",
  CANCER: "cancer",
  LEO: "leo",
  VIRGO: "virgo",
  LIBRA: "libra",
  SCORPIO: "scorpio",
  SAGITTARIUS: "sagittarius",
  CAPRICORN: "capricorn",
  AQUARIUS: "aquarius",
  PISCES: "pisces",
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const zodiac = searchParams.get("zodiac");
    const date = searchParams.get("date"); // Optional: YYYY-MM-DD format

    if (!zodiac) {
      return NextResponse.json(
        { success: false, error: "Zodiac sign parameter is required" },
        { status: 400 }
      );
    }

    // Convert to API format (lowercase)
    const apiZodiac = zodiacMap[zodiac.toUpperCase()] || zodiac.toLowerCase();

    // Build the API URL
    let url = `${BASE_URL}?zodiac=${apiZodiac}`;
    if (date) {
      url += `&date=${date}`;
    }

    // Make the request to Horoscope API
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-Api-Key": API_KEY,
        "Content-Type": "application/json",
      },
      cache: "no-store", // Don't cache to get fresh data
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Horoscope API Error:", response.status, errorText);
      return NextResponse.json(
        {
          success: false,
          error: `API request failed: ${response.status} ${response.statusText}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Return the data with CORS headers
    return NextResponse.json(
      {
        success: true,
        data: data,
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  } catch (error: any) {
    console.error("Horoscope API Proxy Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

