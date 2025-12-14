"use client";

import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useLanguage } from "@/providers/LanguageProvider";

export type DateRangePreset = "7d" | "30d" | "90d" | "custom";

interface DateRangeFilterProps {
  onRangeChange: (startDate: Date | null, endDate: Date | null) => void;
  preset?: DateRangePreset;
}

const getPresetDates = (preset: DateRangePreset, currentStart?: Date | null, currentEnd?: Date | null): { start: Date | null; end: Date | null } => {
  const today = new Date();
  let start: Date | null = null;
  let end: Date | null = today;

  switch (preset) {
    case "7d":
      start = new Date(today);
      start.setDate(start.getDate() - 7);
      break;
    case "30d":
      start = new Date(today);
      start.setDate(start.getDate() - 30);
      break;
    case "90d":
      start = new Date(today);
      start.setDate(start.getDate() - 90);
      break;
    case "custom":
      start = currentStart || null;
      end = currentEnd || null;
      break;
  }

  return { start, end };
};

export function DateRangeFilter({ onRangeChange, preset: initialPreset = "30d" }: DateRangeFilterProps) {
  const { language } = useLanguage();
  const initialDates = getPresetDates(initialPreset);
  const [preset, setPreset] = useState<DateRangePreset>(initialPreset);
  const [startDate, setStartDate] = useState<Date | null>(initialDates.start);
  const [endDate, setEndDate] = useState<Date | null>(initialDates.end);

  const applyPreset = (newPreset: DateRangePreset) => {
    setPreset(newPreset);
    const { start, end } = getPresetDates(newPreset, startDate, endDate);
    setStartDate(start);
    setEndDate(end);
    onRangeChange(start, end);
  };

  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date);
    if (date && endDate) {
      setPreset("custom");
      onRangeChange(date, endDate);
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    setEndDate(date);
    if (startDate && date) {
      setPreset("custom");
      onRangeChange(startDate, date);
    }
  };

  // Initialize with default preset on mount
  useEffect(() => {
    // Only apply if dates haven't been set yet
    if (!startDate && !endDate) {
      const { start, end } = getPresetDates(initialPreset);
      setStartDate(start);
      setEndDate(end);
      onRangeChange(start, end);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex gap-2">
        <button
          onClick={() => applyPreset("7d")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            preset === "7d"
              ? "bg-red-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {language === "it" ? "Ultimi 7 giorni" : "Last 7 days"}
        </button>
        <button
          onClick={() => applyPreset("30d")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            preset === "30d"
              ? "bg-red-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {language === "it" ? "Ultimi 30 giorni" : "Last 30 days"}
        </button>
        <button
          onClick={() => applyPreset("90d")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            preset === "90d"
              ? "bg-red-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {language === "it" ? "Ultimi 90 giorni" : "Last 90 days"}
        </button>
        <button
          onClick={() => applyPreset("custom")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            preset === "custom"
              ? "bg-red-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {language === "it" ? "Personalizzato" : "Custom"}
        </button>
      </div>

      {preset === "custom" && (
        <div className="flex gap-2 items-center">
          <DatePicker
            selected={startDate}
            onChange={handleStartDateChange}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            maxDate={endDate || new Date()}
            dateFormat="yyyy-MM-dd"
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
            placeholderText={language === "it" ? "Data inizio" : "Start date"}
          />
          <span className="text-gray-500">-</span>
          <DatePicker
            selected={endDate}
            onChange={handleEndDateChange}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            maxDate={new Date()}
            dateFormat="yyyy-MM-dd"
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
            placeholderText={language === "it" ? "Data fine" : "End date"}
          />
        </div>
      )}
    </div>
  );
}

