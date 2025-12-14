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

export interface Horoscope {
  id: string;
  sign: ZodiacSign;
  date: string;
  dailyContent?: string;
  weeklyContent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HoroscopeResponse {
  success: boolean;
  message: string;
  data: Horoscope[];
}

export interface HoroscopeDetailResponse {
  success: boolean;
  message: string;
  data: Horoscope;
}

