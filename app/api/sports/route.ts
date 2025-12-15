import { NextRequest, NextResponse } from "next/server";

const API_KEY = "b7643e32454512f0407c2d4655eca14f7c7cb3d2ee145c9821f6723be7750aa5";
const BASE_URL = "https://apiv2.allsportsapi.com/football";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const method = searchParams.get("met");
    const eventId = searchParams.get("eventId");
    const leagueId = searchParams.get("leagueId");
    const countryId = searchParams.get("countryId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (!method) {
      return NextResponse.json(
        { success: 0, error: "Method parameter (met) is required" },
        { status: 400 }
      );
    }

    // Build the API URL
    let url = `${BASE_URL}/?met=${method}&APIkey=${API_KEY}`;

    if (eventId) {
      url += `&eventId=${eventId}`;
    }
    if (leagueId) {
      url += `&leagueId=${leagueId}`;
    }
    if (countryId) {
      url += `&countryId=${countryId}`;
    }
    if (from) {
      url += `&from=${from}`;
    }
    if (to) {
      url += `&to=${to}`;
    }

    // Make the request to AllSportsAPI
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0",
      },
      // Add cache control to avoid rate limiting
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AllSportsAPI Error:", response.status, errorText);
      return NextResponse.json(
        {
          success: 0,
          error: `API request failed: ${response.status} ${response.statusText}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Return the data with CORS headers
    return NextResponse.json(data, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error: any) {
    console.error("Sports API Proxy Error:", error);
    return NextResponse.json(
      {
        success: 0,
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

