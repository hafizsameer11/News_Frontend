"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { SignDetail } from "@/components/horoscope/sign-detail";
import { useHoroscopeBySign } from "@/lib/hooks/useHoroscope";
import { ZodiacSign } from "@/types/horoscope.types";

// Validate and normalize sign parameter
function normalizeSign(sign: string): ZodiacSign | null {
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
  const [viewType, setViewType] = useState<"daily" | "weekly">("daily");

  const signParam = sign;
  const normalizedSign = normalizeSign(signParam);

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
  } = useHoroscopeBySign(normalizedSign || "ARIES", viewType);

  if (!normalizedSign) {
    return null; // Will redirect
  }

  const horoscope = horoscopeData?.data || null;

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

        <SignDetail
          horoscope={horoscope}
          isLoading={isLoading}
          error={error as Error | null}
          viewType={viewType}
          onViewTypeChange={setViewType}
        />
      </main>
      <Footer />
    </div>
  );
}

