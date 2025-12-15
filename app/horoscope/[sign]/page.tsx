import { Metadata } from "next";
import { HoroscopeSignPageClient } from "./horoscope-sign-client";

// Sign names mapping for server-side use (since signDataMap is in a client component)
const signNamesMap: Record<string, { name: string; element: string }> = {
  ARIES: { name: "Aries", element: "Fire" },
  TAURUS: { name: "Taurus", element: "Earth" },
  GEMINI: { name: "Gemini", element: "Air" },
  CANCER: { name: "Cancer", element: "Water" },
  LEO: { name: "Leo", element: "Fire" },
  VIRGO: { name: "Virgo", element: "Earth" },
  LIBRA: { name: "Libra", element: "Air" },
  SCORPIO: { name: "Scorpio", element: "Water" },
  SAGITTARIUS: { name: "Sagittarius", element: "Fire" },
  CAPRICORN: { name: "Capricorn", element: "Earth" },
  AQUARIUS: { name: "Aquarius", element: "Air" },
  PISCES: { name: "Pisces", element: "Water" },
};

// Validate and normalize sign parameter
function normalizeSign(sign: string): string | null {
  const upperSign = sign.toUpperCase();
  const validSigns = [
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
  return validSigns.includes(upperSign) ? upperSign : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sign: string }>;
}): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";
  const { sign } = await params;
  const normalizedSign = normalizeSign(sign);
  
  if (!normalizedSign) {
    return {
      title: "Horoscope | NEWS NEXT",
      description: "Horoscope page",
    };
  }

  // Get sign data from server-safe mapping
  const signData = signNamesMap[normalizedSign];
  const signName = signData?.name || normalizedSign;
  const element = signData?.element || "";

  return {
    title: `${signName} Horoscope | NEWS NEXT`,
    description: `Read your daily horoscope for ${signName}. Get insights, predictions, and guidance for ${signName} zodiac sign.`,
    keywords: `horoscope, ${signName}, zodiac sign, daily horoscope, astrology${element ? `, ${element}` : ""}`,
    openGraph: {
      title: `${signName} Horoscope | NEWS NEXT`,
      description: `Read your daily horoscope for ${signName}.`,
      type: "website",
      url: `${baseUrl}/horoscope/${sign.toLowerCase()}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${signName} Horoscope | NEWS NEXT`,
      description: `Read your daily horoscope for ${signName}.`,
    },
    alternates: {
      canonical: `${baseUrl}/horoscope/${sign.toLowerCase()}`,
    },
  };
}

export default async function HoroscopeSignPage({ params }: { params: Promise<{ sign: string }> }) {
  const { sign } = await params;
  return <HoroscopeSignPageClient sign={sign} />;
}

