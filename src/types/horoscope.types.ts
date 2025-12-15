// Horoscope Types
export type ZodiacSign =
  | "ARIES"
  | "TAURUS"
  | "GEMINI"
  | "CANCER"
  | "LEO"
  | "VIRGO"
  | "LIBRA"
  | "SCORPIO"
  | "SAGITTARIUS"
  | "CAPRICORN"
  | "AQUARIUS"
  | "PISCES";

// API Response from api-ninjas
export interface HoroscopeApiResponse {
  date: string;
  zodiac: string;
  horoscope: string;
}

export interface Horoscope {
  id: string;
  sign: ZodiacSign;
  date: string;
  dailyContent?: string;
  weeklyContent?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface HoroscopeResponse {
  success: boolean;
  message?: string;
  data: Horoscope[];
}

export interface HoroscopeDetailResponse {
  success: boolean;
  message?: string;
  data: Horoscope;
}

