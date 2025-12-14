"use client";

import { ZodiacSign } from "@/types/horoscope.types";
import { useLanguage } from "@/providers/LanguageProvider";

interface SignInfoProps {
  sign: ZodiacSign;
}

export interface SignData {
  name: { en: string; it: string };
  symbol: string;
  element: string;
  dates: string;
  rulingPlanet: string;
  color: string;
  luckyNumber: string;
}

const signDataMap: Record<ZodiacSign, SignData> = {
  ARIES: {
    name: { en: "Aries", it: "Ariete" },
    symbol: "♈",
    element: "Fire",
    dates: "March 21 - April 19",
    rulingPlanet: "Mars",
    color: "Red",
    luckyNumber: "9",
  },
  TAURUS: {
    name: { en: "Taurus", it: "Toro" },
    symbol: "♉",
    element: "Earth",
    dates: "April 20 - May 20",
    rulingPlanet: "Venus",
    color: "Green",
    luckyNumber: "6",
  },
  GEMINI: {
    name: { en: "Gemini", it: "Gemelli" },
    symbol: "♊",
    element: "Air",
    dates: "May 21 - June 20",
    rulingPlanet: "Mercury",
    color: "Yellow",
    luckyNumber: "5",
  },
  CANCER: {
    name: { en: "Cancer", it: "Cancro" },
    symbol: "♋",
    element: "Water",
    dates: "June 21 - July 22",
    rulingPlanet: "Moon",
    color: "Silver",
    luckyNumber: "2",
  },
  LEO: {
    name: { en: "Leo", it: "Leone" },
    symbol: "♌",
    element: "Fire",
    dates: "July 23 - August 22",
    rulingPlanet: "Sun",
    color: "Gold",
    luckyNumber: "1",
  },
  VIRGO: {
    name: { en: "Virgo", it: "Vergine" },
    symbol: "♍",
    element: "Earth",
    dates: "August 23 - September 22",
    rulingPlanet: "Mercury",
    color: "Navy Blue",
    luckyNumber: "5",
  },
  LIBRA: {
    name: { en: "Libra", it: "Bilancia" },
    symbol: "♎",
    element: "Air",
    dates: "September 23 - October 22",
    rulingPlanet: "Venus",
    color: "Pink",
    luckyNumber: "6",
  },
  SCORPIO: {
    name: { en: "Scorpio", it: "Scorpione" },
    symbol: "♏",
    element: "Water",
    dates: "October 23 - November 21",
    rulingPlanet: "Pluto",
    color: "Black",
    luckyNumber: "4",
  },
  SAGITTARIUS: {
    name: { en: "Sagittarius", it: "Sagittario" },
    symbol: "♐",
    element: "Fire",
    dates: "November 22 - December 21",
    rulingPlanet: "Jupiter",
    color: "Purple",
    luckyNumber: "3",
  },
  CAPRICORN: {
    name: { en: "Capricorn", it: "Capricorno" },
    symbol: "♑",
    element: "Earth",
    dates: "December 22 - January 19",
    rulingPlanet: "Saturn",
    color: "Brown",
    luckyNumber: "8",
  },
  AQUARIUS: {
    name: { en: "Aquarius", it: "Acquario" },
    symbol: "♒",
    element: "Air",
    dates: "January 20 - February 18",
    rulingPlanet: "Uranus",
    color: "Blue",
    luckyNumber: "7",
  },
  PISCES: {
    name: { en: "Pisces", it: "Pesci" },
    symbol: "♓",
    element: "Water",
    dates: "February 19 - March 20",
    rulingPlanet: "Neptune",
    color: "Sea Green",
    luckyNumber: "11",
  },
};

export function SignInfo({ sign }: SignInfoProps) {
  const data = signDataMap[sign];
  const { language } = useLanguage();

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="text-6xl">{data.symbol}</div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            {language === "it" ? data.name.it : data.name.en}
          </h2>
          <p className="text-gray-600">{data.dates}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span className="text-gray-500 block mb-1">Element</span>
          <span className="font-medium text-gray-900">{data.element}</span>
        </div>
        <div>
          <span className="text-gray-500 block mb-1">Ruling Planet</span>
          <span className="font-medium text-gray-900">{data.rulingPlanet}</span>
        </div>
        <div>
          <span className="text-gray-500 block mb-1">Color</span>
          <span className="font-medium text-gray-900">{data.color}</span>
        </div>
        <div>
          <span className="text-gray-500 block mb-1">Lucky Number</span>
          <span className="font-medium text-gray-900">{data.luckyNumber}</span>
        </div>
      </div>
    </div>
  );
}

export { signDataMap };

