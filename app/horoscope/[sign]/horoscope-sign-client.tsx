"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { SignDetail } from "@/components/horoscope/sign-detail";
import { useHoroscopeBySign } from "@/lib/hooks/useHoroscope";
import { ZodiacSign, HoroscopeDetailResponse, Horoscope } from "@/types/horoscope.types";

// Validate and normalize sign parameter
function normalizeSign(sign: string | undefined): ZodiacSign | null {
  if (!sign) return null;
  const upperSign = sign.toUpperCase() as ZodiacSign;
  const validSigns: ZodiacSign[] = [
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

interface HoroscopeSignPageClientProps {
  sign: string;
}

export function HoroscopeSignPageClient({ sign }: HoroscopeSignPageClientProps) {
  const router = useRouter();
  const [shouldFetch, setShouldFetch] = useState(false);

  const normalizedSign = normalizeSign(sign);

  // Redirect to horoscope page if invalid sign
  useEffect(() => {
    if (!normalizedSign) {
      router.push("/horoscope");
    }
  }, [normalizedSign, router]);

  const {
    data: horoscopeData,
    isLoading,
    error,
    refetch,
  } = useHoroscopeBySign(normalizedSign || "ARIES", "daily", shouldFetch);

  if (!normalizedSign) {
    return null; // Will redirect
  }

  const horoscope = (horoscopeData as HoroscopeDetailResponse | undefined)?.data || null;

  const handleLoadHoroscope = () => {
    setShouldFetch(true);
    refetch();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => router.push("/horoscope")}
            className="text-blue-600 hover:text-blue-800 text-sm mb-4 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to All Horoscopes
          </button>
        </div>

        {!shouldFetch && !horoscope ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600 mb-4">Click the button below to load the horoscope for this zodiac sign.</p>
            <button
              onClick={handleLoadHoroscope}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Load Horoscope
            </button>
          </div>
        ) : (
          <SignDetail
            horoscope={horoscope}
            isLoading={isLoading}
            error={error as Error | null}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}

