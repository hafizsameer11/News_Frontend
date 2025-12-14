"use client";

import { Horoscope, ZodiacSign } from "@/types/horoscope.types";
import Link from "next/link";
import { signDataMap } from "./sign-info";
import { HoroscopeShare } from "./horoscope-share";

interface HoroscopeCardProps {
  horoscope: Horoscope;
  type?: "daily" | "weekly";
  className?: string;
}

const signNames: Record<ZodiacSign, { en: string; it: string }> = {
  ARIES: { en: "Aries", it: "Ariete" },
  TAURUS: { en: "Taurus", it: "Toro" },
  GEMINI: { en: "Gemini", it: "Gemelli" },
  CANCER: { en: "Cancer", it: "Cancro" },
  LEO: { en: "Leo", it: "Leone" },
  VIRGO: { en: "Virgo", it: "Vergine" },
  LIBRA: { en: "Libra", it: "Bilancia" },
  SCORPIO: { en: "Scorpio", it: "Scorpione" },
  SAGITTARIUS: { en: "Sagittarius", it: "Sagittario" },
  CAPRICORN: { en: "Capricorn", it: "Capricorno" },
  AQUARIUS: { en: "Aquarius", it: "Acquario" },
  PISCES: { en: "Pisces", it: "Pesci" },
};

export function HoroscopeCard({ horoscope, type = "daily", className = "" }: HoroscopeCardProps) {
  const content = type === "daily" ? horoscope.dailyContent : horoscope.weeklyContent;
  const signName = signNames[horoscope.sign];
  const signData = signDataMap[horoscope.sign];

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <Link href={`/horoscope/${horoscope.sign.toLowerCase()}`} className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{signData.symbol}</span>
            <h3 className="text-2xl font-bold text-gray-900">{signName.en}</h3>
          </div>
        </Link>
        <div onClick={(e) => e.stopPropagation()}>
          <HoroscopeShare sign={horoscope.sign} date={horoscope.date} type={type} />
        </div>
      </div>
      
      <Link href={`/horoscope/${horoscope.sign.toLowerCase()}`}>
        {content ? (
          <p className="text-gray-600 line-clamp-3 mb-4">{content}</p>
        ) : (
          <p className="text-gray-400 italic mb-4">No {type} horoscope available yet.</p>
        )}
        <p className="text-sm text-gray-500">
          {new Date(horoscope.date).toLocaleDateString()}
        </p>
      </Link>
    </div>
  );
}

