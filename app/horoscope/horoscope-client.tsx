"use client";

import { useState } from "react";
import { useDailyHoroscope, ALL_ZODIAC_SIGNS } from "@/lib/hooks/useHoroscope";
import { HoroscopeResponse } from "@/types/horoscope.types";
import { HoroscopeCard } from "@/components/horoscope/horoscope-card";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import { ZodiacSign } from "@/types/horoscope.types";
import { signDataMap } from "@/components/horoscope/sign-info";

export function HoroscopePageClient() {
  const [shouldFetch, setShouldFetch] = useState(false);
  const [selectedSigns, setSelectedSigns] = useState<ZodiacSign[]>([]);

  const {
    data: dailyData,
    isLoading,
    error,
    refetch,
  } = useDailyHoroscope(shouldFetch, selectedSigns.length > 0 ? selectedSigns : undefined);

  const horoscopes = (dailyData as HoroscopeResponse | undefined)?.data || [];

  const handleLoadHoroscopes = () => {
    setShouldFetch(true);
    refetch();
  };

  const toggleSignSelection = (sign: ZodiacSign) => {
    setSelectedSigns((prev) =>
      prev.includes(sign) ? prev.filter((s) => s !== sign) : [...prev, sign]
    );
  };

  const selectAllSigns = () => {
    setSelectedSigns(ALL_ZODIAC_SIGNS);
  };

  const clearSelection = () => {
    setSelectedSigns([]);
  };

  return (
    <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-gray-900">Horoscope</h1>
        </div>

        {/* Zodiac Sign Selection */}
        {!shouldFetch && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Select Zodiac Signs (Optional)
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={selectAllSigns}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
                >
                  Select All
                </button>
                <button
                  onClick={clearSelection}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
                >
                  Clear
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {selectedSigns.length === 0
                ? "Select specific signs to minimize API requests, or leave empty to load all signs."
                : `${selectedSigns.length} sign${selectedSigns.length > 1 ? "s" : ""} selected.`}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {ALL_ZODIAC_SIGNS.map((sign) => {
                const signData = signDataMap[sign];
                const isSelected = selectedSigns.includes(sign);
                return (
                  <button
                    key={sign}
                    onClick={() => toggleSignSelection(sign)}
                    className={`p-3 rounded-lg border-2 transition ${
                      isSelected
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-2xl mb-1">{signData.symbol}</div>
                    <div className="text-xs font-medium">{signData.name.en}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {error && <ErrorMessage error={error} className="mb-6" />}

        {!shouldFetch && horoscopes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600 mb-4">
              {selectedSigns.length === 0
                ? "Click the button below to load horoscopes for all zodiac signs."
                : `Click the button below to load horoscopes for ${selectedSigns.length} selected sign${selectedSigns.length > 1 ? "s" : ""}.`}
            </p>
            <button
              onClick={handleLoadHoroscopes}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Load Horoscopes
              {selectedSigns.length > 0 && ` (${selectedSigns.length} sign${selectedSigns.length > 1 ? "s" : ""})`}
            </button>
          </div>
        ) : isLoading ? (
          <Loading />
        ) : horoscopes && horoscopes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {horoscopes.map((horoscope) => (
              <HoroscopeCard key={horoscope.id} horoscope={horoscope} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600">No horoscope data available yet.</p>
            <button
              onClick={handleLoadHoroscopes}
              className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Try Loading Again
            </button>
          </div>
        )}
      </main>
  );
}
