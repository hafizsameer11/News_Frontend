"use client";

import { Horoscope, ZodiacSign } from "@/types/horoscope.types";
import { SignInfo, signDataMap } from "./sign-info";
import { HoroscopeShare } from "./horoscope-share";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";

interface SignDetailProps {
  horoscope: Horoscope | null;
  isLoading: boolean;
  error: Error | null;
  viewType: "daily" | "weekly";
  onViewTypeChange: (type: "daily" | "weekly") => void;
}

export function SignDetail({
  horoscope,
  isLoading,
  error,
  viewType,
  onViewTypeChange,
}: SignDetailProps) {
  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  if (!horoscope) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600">Horoscope data not available.</p>
      </div>
    );
  }

  const content = viewType === "daily" ? horoscope.dailyContent : horoscope.weeklyContent;
  const signData = signDataMap[horoscope.sign];

  return (
    <div className="space-y-6">
      <SignInfo sign={horoscope.sign} />

      {/* View Type Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => onViewTypeChange("daily")}
          className={`px-4 py-2 rounded-md transition ${
            viewType === "daily"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Daily
        </button>
        <button
          onClick={() => onViewTypeChange("weekly")}
          className={`px-4 py-2 rounded-md transition ${
            viewType === "weekly"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Weekly
        </button>
      </div>

      {/* Horoscope Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{signData.symbol}</span>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{signData.name.en}</h2>
              <p className="text-sm text-gray-500">
                {viewType === "daily" ? "Daily" : "Weekly"} Horoscope -{" "}
                {new Date(horoscope.date).toLocaleDateString()}
              </p>
            </div>
          </div>
          <HoroscopeShare sign={horoscope.sign} date={horoscope.date} type={viewType} />
        </div>

        {content ? (
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{content}</p>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400 italic">
              No {viewType} horoscope available for {signData.name.en} yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

