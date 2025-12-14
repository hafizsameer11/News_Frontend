import { Metadata } from "next";
import { HoroscopeSignPageClient } from "./horoscope-sign-client";
import { signDataMap } from "@/components/horoscope/sign-info";

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
  params: { sign: string };
}): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";
  const normalizedSign = normalizeSign(params.sign);
  
  if (!normalizedSign) {
    return {
      title: "Horoscope | NEWS NEXT",
      description: "Horoscope page",
    };
  }

  const signData = signDataMap[normalizedSign as keyof typeof signDataMap];
  const signName = signData.name.en;

  return {
    title: `${signName} Horoscope - Daily & Weekly | NEWS NEXT`,
    description: `Read your daily and weekly horoscope for ${signName}. Get insights, predictions, and guidance for ${signName} zodiac sign.`,
    keywords: `horoscope, ${signName}, zodiac sign, daily horoscope, weekly horoscope, astrology, ${signData.element}`,
    openGraph: {
      title: `${signName} Horoscope - Daily & Weekly | NEWS NEXT`,
      description: `Read your daily and weekly horoscope for ${signName}.`,
      type: "website",
      url: `${baseUrl}/horoscope/${params.sign.toLowerCase()}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${signName} Horoscope - Daily & Weekly | NEWS NEXT`,
      description: `Read your daily and weekly horoscope for ${signName}.`,
    },
    alternates: {
      canonical: `${baseUrl}/horoscope/${params.sign.toLowerCase()}`,
    },
  };
}

export default function HoroscopeSignPage({ params }: { params: { sign: string } }) {
  return <HoroscopeSignPageClient sign={params.sign} />;
}

