"use client";

import { useState } from "react";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { useDailyHoroscope, useWeeklyHoroscope } from "@/lib/hooks/useHoroscope";
import { HoroscopeCard } from "@/components/horoscope/horoscope-card";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";

export function HoroscopePageClient() {
  const [viewType, setViewType] = useState<"daily" | "weekly">("daily");

  const {
    data: dailyData,
    isLoading: dailyLoading,
    error: dailyError,
  } = useDailyHoroscope();
  const {
    data: weeklyData,
    isLoading: weeklyLoading,
    error: weeklyError,
  } = useWeeklyHoroscope();

  const horoscopes = viewType === "daily" ? dailyData?.data : weeklyData?.data;
  const isLoading = viewType === "daily" ? dailyLoading : weeklyLoading;
  const error = viewType === "daily" ? dailyError : weeklyError;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-gray-900">Horoscope</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setViewType("daily")}
              className={`px-4 py-2 rounded-md transition ${
                viewType === "daily"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setViewType("weekly")}
              className={`px-4 py-2 rounded-md transition ${
                viewType === "weekly"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Weekly
            </button>
          </div>
        </div>

        {error && <ErrorMessage error={error} className="mb-6" />}

        {isLoading ? (
          <Loading />
        ) : horoscopes && horoscopes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {horoscopes.map((horoscope) => (
              <HoroscopeCard key={horoscope.id} horoscope={horoscope} type={viewType} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600">No horoscope data available yet.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
