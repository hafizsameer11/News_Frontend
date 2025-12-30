"use client";

import { Horoscope } from "@/types/horoscope.types";
import { SignInfo, signDataMap } from "./sign-info";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import { useLanguage } from "@/providers/LanguageProvider";

interface SignDetailProps {
  horoscope: Horoscope | null;
  isLoading: boolean;
  error: Error | null;
}

export function SignDetail({
  horoscope,
  isLoading,
  error,
}: SignDetailProps) {
  const { t, formatDate } = useLanguage();

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  if (!horoscope) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600">{t("horoscope.noHoroscopeData")}</p>
      </div>
    );
  }

  const content = horoscope.dailyContent;
  const signData = signDataMap[horoscope.sign];

  return (
    <div className="space-y-6">
      <SignInfo sign={horoscope.sign} />

      {/* Horoscope Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">{signData.symbol}</span>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {signData.name.en}
            </h2>
            <p className="text-sm text-gray-500">
              {t("horoscope.dailyHoroscope")} - {formatDate(new Date(horoscope.date), "PP")}
            </p>
          </div>
        </div>

        {content ? (
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {content}
            </p>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400 italic">
              {t("horoscope.noHoroscopeData")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
