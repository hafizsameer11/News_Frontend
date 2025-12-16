import { Metadata } from "next";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { HoroscopePageClient } from "./horoscope-client";

// ISR: Revalidate horoscope page every 3600 seconds (1 hour)
// Horoscope content updates daily, so hourly refresh is sufficient
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";
  
  return {
    title: "Horoscope - Daily & Weekly Zodiac Signs | NEWS NEXT",
    description: "Read your daily and weekly horoscope for all 12 zodiac signs. Get insights and predictions for Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, and Pisces.",
    keywords: "horoscope, zodiac signs, daily horoscope, weekly horoscope, astrology, Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces",
    openGraph: {
      title: "Horoscope - Daily & Weekly Zodiac Signs | NEWS NEXT",
      description: "Read your daily and weekly horoscope for all 12 zodiac signs.",
      type: "website",
      url: `${baseUrl}/horoscope`,
    },
    twitter: {
      card: "summary_large_image",
      title: "Horoscope - Daily & Weekly Zodiac Signs | NEWS NEXT",
      description: "Read your daily and weekly horoscope for all 12 zodiac signs.",
    },
    alternates: {
      canonical: `${baseUrl}/horoscope`,
    },
  };
}

export default function HoroscopePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <HoroscopePageClient />
      <Footer />
    </div>
  );
}

