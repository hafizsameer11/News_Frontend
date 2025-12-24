"use client";

import { useState, useEffect } from "react";
import { adsApi } from "@/lib/api/modules/ads.api";
import { useLanguage } from "@/providers/LanguageProvider";
import { Loading } from "@/components/ui/loading";

interface AdCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BookedDate {
  position: string | null;
  type: string;
  title: string;
  id: string;
  status: string;
}

export function AdCalendarModal({ isOpen, onClose }: AdCalendarModalProps) {
  const { t, language } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<Record<string, BookedDate[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    if (isOpen) {
      console.log(`Fetching calendar for year: ${year}, month: ${month} (0-indexed)`);
      fetchCalendarData();
    }
  }, [isOpen, year, month]);

  const fetchCalendarData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adsApi.getCalendar(year, month);
      console.log("Full calendar response:", response); // Debug log
      const data = response.data?.data || response.data || {};
      console.log("Calendar data received:", data); // Debug log
      console.log("Number of booked days:", Object.keys(data).length); // Debug log
      const totalAds = Object.values(data).reduce((sum: number, ads: any) => sum + (Array.isArray(ads) ? ads.length : 0), 0);
      console.log("Total ads in calendar:", totalAds); // Debug log
      setCalendarData(data);
    } catch (err) {
      console.error("Error fetching calendar:", err);
      setError(err instanceof Error ? err.message : "Failed to load calendar");
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, firstDay, lastDay };
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const formatDateKey = (day: number) => {
    // Format date key as YYYY-MM-DD (local date, not UTC) to match backend
    const date = new Date(year, month, day);
    const yearStr = date.getFullYear();
    const monthStr = String(date.getMonth() + 1).padStart(2, "0");
    const dayStr = String(date.getDate()).padStart(2, "0");
    return `${yearStr}-${monthStr}-${dayStr}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-500";
      case "PENDING":
        return "bg-yellow-500";
      case "PAUSED":
        return "bg-gray-500";
      default:
        return "bg-blue-500";
    }
  };

  const getPositionLabel = (position: string | null) => {
    if (!position) return "Any Position";
    return position.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (!isOpen) return null;

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const monthNames = language === "it" 
    ? ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"]
    : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const dayNames = language === "it"
    ? ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"]
    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {language === "it" ? "Calendario Pubblicità" : "Ad Calendar"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loading />
            </div>
          ) : error ? (
            <div className="text-red-600 text-center py-12">{error}</div>
          ) : (
            <>
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => navigateMonth("prev")}
                  className="p-2 hover:bg-gray-100 rounded transition"
                  aria-label="Previous month"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h3 className="text-xl font-semibold text-gray-900">
                  {monthNames[month]} {year}
                </h3>
                <button
                  onClick={() => navigateMonth("next")}
                  className="p-2 hover:bg-gray-100 rounded transition"
                  aria-label="Next month"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Summary */}
              {(() => {
                const totalBookings = Object.values(calendarData).reduce((sum, ads) => sum + ads.length, 0);
                const bookedDays = Object.keys(calendarData).length;
                return (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 font-medium">
                        {language === "it" ? "Riepilogo:" : "Summary:"}
                      </span>
                      <div className="flex gap-4">
                        <span className="text-gray-600">
                          <span className="font-semibold text-blue-700">{bookedDays}</span>{" "}
                          {language === "it" ? "giorni prenotati" : "booked days"}
                        </span>
                        <span className="text-gray-600">
                          <span className="font-semibold text-blue-700">{totalBookings}</span>{" "}
                          {language === "it" ? "annunci totali" : "total ads"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {dayNames.map((day) => (
                  <div key={day} className="text-center text-sm font-bold text-gray-700 py-2 bg-gray-100 rounded">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2 mb-4">
                {/* Empty cells for days before month starts */}
                {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                  <div key={`empty-${index}`} className="aspect-square" />
                ))}

                {/* Days of the month */}
                {Array.from({ length: daysInMonth }).map((_, index) => {
                  const day = index + 1;
                  const dateKey = formatDateKey(day);
                  const bookedAds = calendarData[dateKey] || [];
                  const isPast = new Date(year, month, day) < today;
                  const isToday = new Date(year, month, day).getTime() === today.getTime();
                  const hasBookings = bookedAds.length > 0;

                  return (
                    <div
                      key={day}
                      className={`min-h-[120px] border-2 rounded-lg p-2 flex flex-col ${
                        isPast 
                          ? "bg-gray-50 opacity-60 border-gray-200" 
                          : hasBookings 
                          ? "bg-blue-50 border-blue-300" 
                          : "bg-white border-gray-200"
                      } ${isToday ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
                    >
                      <div className={`text-sm font-bold mb-2 ${isToday ? "text-blue-600" : hasBookings ? "text-blue-700" : "text-gray-900"}`}>
                        {day}
                        {hasBookings && (
                          <span className="ml-1 text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded-full">
                            {bookedAds.length}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 space-y-1 overflow-y-auto min-h-0">
                        {bookedAds.length === 0 ? (
                          <div className="text-xs text-gray-400 text-center py-1">No ads</div>
                        ) : (
                          bookedAds.map((ad, adIndex) => (
                            <div
                              key={`${ad.id}-${adIndex}`}
                              className={`text-xs p-1.5 rounded shadow-sm ${getStatusColor(ad.status)} text-white`}
                              title={`${ad.title} - ${getPositionLabel(ad.position)} (${ad.status})`}
                            >
                              <div className="font-semibold truncate mb-0.5">{ad.title}</div>
                              <div className="text-[10px] opacity-90 truncate">{getPositionLabel(ad.position)}</div>
                              <div className="text-[10px] opacity-75 mt-0.5">{ad.status}</div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  {language === "it" ? "Legenda" : "Legend"}
                </h4>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-sm text-gray-600">Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span className="text-sm text-gray-600">Pending</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-500 rounded"></div>
                    <span className="text-sm text-gray-600">Paused</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

