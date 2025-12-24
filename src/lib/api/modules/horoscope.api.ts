import { HoroscopeResponse, HoroscopeDetailResponse, ZodiacSign, HoroscopeApiResponse, Horoscope } from "@/types/horoscope.types";

// All zodiac signs
const ALL_SIGNS: ZodiacSign[] = [
  "ARIES",
  "TAURUS",
  "GEMINI",
  "CANCER",
  "LEO",
  "VIRGO",
  "LIBRA",
  "SCORPIO",
  "SAGITTARIUS",
  "CAPRICORN",
  "AQUARIUS",
  "PISCES",
];

// Convert API response to our Horoscope format
const mapApiResponseToHoroscope = (apiData: HoroscopeApiResponse, sign: ZodiacSign): Horoscope => {
  return {
    id: `${sign}-${apiData.date}`,
    sign: sign,
    date: apiData.date,
    dailyContent: apiData.horoscope,
    weeklyContent: apiData.horoscope, // API only provides daily, so use same for weekly
  };
};

export const horoscopeApi = {
  // Get daily horoscope for selected signs (or all if none selected)
  getDaily: async (selectedSigns?: ZodiacSign[]): Promise<HoroscopeResponse> => {
    try {
      const signsToFetch = selectedSigns && selectedSigns.length > 0 ? selectedSigns : ALL_SIGNS;
      
      const promises = signsToFetch.map(async (sign) => {
        const response = await fetch(`/api/horoscope?zodiac=${sign}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch horoscope for ${sign}`);
        }
        const result = await response.json();
        if (result.success && result.data) {
          return mapApiResponseToHoroscope(result.data, sign);
        }
        return null;
      });

      const horoscopes = (await Promise.all(promises)).filter((h): h is Horoscope => h !== null);

      return {
        success: true,
        data: horoscopes,
      };
    } catch (error: unknown) {
      console.error("Error fetching daily horoscopes:", error);
      return {
        success: false,
        data: [],
      };
    }
  },

  // Get weekly horoscope for selected signs (or all if none selected)
  getWeekly: async (selectedSigns?: ZodiacSign[]): Promise<HoroscopeResponse> => {
    // API doesn't support weekly, so we'll use daily for now
    // In the future, you could fetch for different dates to simulate weekly
    return horoscopeApi.getDaily(selectedSigns);
  },

  // Get horoscope for a specific sign
  getBySign: async (sign: ZodiacSign, _type: "daily" | "weekly" = "daily"): Promise<HoroscopeDetailResponse> => {
    try {
      const response = await fetch(`/api/horoscope?zodiac=${sign}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch horoscope for ${sign}`);
      }
      const result = await response.json();
      if (result.success && result.data) {
        const horoscope = mapApiResponseToHoroscope(result.data, sign);
        return {
          success: true,
          data: horoscope,
        };
      }
      throw new Error("Invalid response from API");
    } catch (error: unknown) {
      console.error(`Error fetching horoscope for ${sign}:`, error);
      return {
        success: false,
        data: {
          id: `${sign}-${new Date().toISOString().split("T")[0]}`,
          sign: sign,
          date: new Date().toISOString().split("T")[0],
        },
      };
    }
  },
};

