"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { WizardFormData } from "../ad-creation-wizard";
import { calculateAdPrice, calculateDurationDays, formatPrice, getDailyRate, MIN_AD_DURATION_DAYS, MAX_AD_DURATION_DAYS } from "@/lib/helpers/ad-pricing";
import { adsApi } from "@/lib/api/modules/ads.api";
import { AdCalendarModal } from "@/components/admin/ad-calendar-modal";
import { useLanguage } from "@/providers/LanguageProvider";

interface PlacementStepProps {
  formData: WizardFormData;
  updateFormData: (updates: Partial<WizardFormData>) => void;
  errors: Record<string, string>;
  setConflictError?: (error: string) => void;
}

const SLOT_OPTIONS = [
  { value: "HEADER", label: "Header", labelIt: "Intestazione", compatibleTypes: ["BANNER_TOP"] },
  { value: "SIDEBAR", label: "Sidebar", labelIt: "Barra Laterale", compatibleTypes: ["BANNER_SIDE", "STICKY"] },
  { value: "INLINE", label: "Inline", labelIt: "In Linea", compatibleTypes: ["INLINE"] },
  { value: "FOOTER", label: "Footer", labelIt: "Piè di Pagina", compatibleTypes: ["FOOTER"] },
  { value: "MOBILE", label: "Mobile", labelIt: "Mobile", compatibleTypes: ["BANNER_SIDE", "STICKY"] },
];

export function PlacementStep({ formData, updateFormData, errors, setConflictError: setParentConflictError }: PlacementStepProps) {
  const { language } = useLanguage();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isCheckingConflict, setIsCheckingConflict] = useState(false);
  const [conflictError, setConflictError] = useState<string>("");

  // Derive dates from formData instead of using effects
  const startDate = useMemo(() => {
    return formData.startDate ? new Date(formData.startDate) : null;
  }, [formData.startDate]);

  const endDate = useMemo(() => {
    return formData.endDate ? new Date(formData.endDate) : null;
  }, [formData.endDate]);

  const { durationDays, calculatedPrice } = useMemo(() => {
    if (startDate && endDate && startDate < endDate) {
      const days = calculateDurationDays(startDate, endDate);
      const price = calculateAdPrice(formData.type, startDate, endDate);
      return { durationDays: days, calculatedPrice: price };
    }
    return { durationDays: 0, calculatedPrice: 0 };
  }, [startDate, endDate, formData.type]);

  // Check for booking conflicts
  const checkBookingConflict = useCallback(async () => {
    if (!formData.startDate || !formData.endDate) {
      setConflictError("");
      return;
    }

    const start = new Date(formData.startDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Don't check if start date is in the past (will be caught by validation)
    if (start < now) {
      setConflictError("");
      return;
    }

    // Only check conflicts if position is specified (slider ads can have multiple on same date)
    if (!formData.position) {
      setConflictError("");
      return;
    }

    setIsCheckingConflict(true);
    setConflictError("");
    
    try {
      const response = await adsApi.checkConflict({
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        position: formData.position || null,
      });

      if (response.data.data.isConflict && response.data.data.conflictingAd) {
        const errorMsg = language === "it"
          ? `Questa data e posizione sono già prenotate dall'annuncio: "${response.data.data.conflictingAd.title}". Seleziona una data o posizione diversa.`
          : `This date and position are already booked by ad: "${response.data.data.conflictingAd.title}". Please select a different date or position.`;
        setConflictError(errorMsg);
        setParentConflictError?.(errorMsg);
      } else {
        setConflictError("");
        setParentConflictError?.("");
      }
    } catch (error) {
      // Silently fail conflict check - don't block form submission
      console.error("Failed to check booking conflict:", error);
      setConflictError("");
    } finally {
      setIsCheckingConflict(false);
    }
  }, [formData.startDate, formData.endDate, formData.position, language, setParentConflictError]);

  // Check for conflicts when dates or position change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      checkBookingConflict();
    }, 500); // Debounce conflict check

    return () => clearTimeout(timeoutId);
  }, [checkBookingConflict]);

  const handleStartDateChange = (date: Date | null) => {
    if (date) {
      const dateStr = date.toISOString().split("T")[0];
      updateFormData({ startDate: dateStr });
      setConflictError(""); // Clear conflict error when date changes
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    if (date) {
      const dateStr = date.toISOString().split("T")[0];
      updateFormData({ endDate: dateStr });
      setConflictError(""); // Clear conflict error when date changes
    }
  };

  const handlePositionChange = (position: string) => {
    updateFormData({ position });
    setConflictError(""); // Clear conflict error when position changes
  };

  const getCompatibleSlots = () => {
    return SLOT_OPTIONS.filter((slot) =>
      slot.compatibleTypes.includes(formData.type)
    );
  };

  const compatibleSlots = getCompatibleSlots();
  const defaultSlot = compatibleSlots[0]?.value || "HEADER";
  const selectedSlot = formData.position || defaultSlot;

  const dailyRate = getDailyRate(formData.type);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {language === "it" ? "Posizionamento e Programma" : "Placement & Schedule"}
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            {language === "it"
              ? "Seleziona dove verrà visualizzato il tuo annuncio e quando dovrebbe essere eseguito."
              : "Select where your ad will be displayed and when it should run."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsCalendarOpen(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition whitespace-nowrap flex items-center gap-2 text-sm font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {language === "it" ? "Calendario" : "Calendar"}
        </button>
      </div>

      {/* Calendar Modal */}
      <AdCalendarModal isOpen={isCalendarOpen} onClose={() => setIsCalendarOpen(false)} />

      {/* Slot Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {language === "it" ? "Slot Annuncio" : "Ad Slot"} *
        </label>
        <div className="space-y-2">
          {compatibleSlots.map((slot) => (
            <label
              key={slot.value}
              className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition"
            >
              <input
                type="radio"
                name="slot"
                value={slot.value}
                checked={selectedSlot === slot.value}
                onChange={(e) => handlePositionChange(e.target.value)}
                className="mr-3"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {language === "it" ? slot.labelIt : slot.label}
                </div>
                <div className="text-xs text-gray-500">
                  {language === "it"
                    ? `Compatibile con ${formData.type}`
                    : `Compatible with ${formData.type}`}
                </div>
              </div>
            </label>
          ))}
        </div>
        {compatibleSlots.length === 0 && (
          <p className="text-sm text-yellow-600 mt-2">
            {language === "it"
              ? `Nessuno slot compatibile trovato per ${formData.type}. Seleziona un tipo di annuncio diverso.`
              : `No compatible slots found for ${formData.type}. Please select a different ad type.`}
          </p>
        )}
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === "it" ? "Data di Inizio" : "Start Date"} *
          </label>
          <DatePicker
            selected={startDate}
            onChange={handleStartDateChange}
            minDate={new Date()}
            dateFormat="yyyy-MM-dd"
            className={`w-full px-3 py-2 border ${
              errors.startDate || conflictError ? "border-red-300" : "border-gray-300"
            } rounded-md text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500`}
            placeholderText={language === "it" ? "Seleziona data di inizio" : "Select start date"}
            disabled={isCheckingConflict}
          />
          {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
          {isCheckingConflict && (
            <p className="mt-1 text-xs text-gray-500">
              {language === "it" ? "Verifica conflitti..." : "Checking conflicts..."}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === "it" ? "Data di Fine" : "End Date"} *
          </label>
          <DatePicker
            selected={endDate}
            onChange={handleEndDateChange}
            minDate={startDate || new Date()}
            dateFormat="yyyy-MM-dd"
            className={`w-full px-3 py-2 border ${
              errors.endDate || conflictError ? "border-red-300" : "border-gray-300"
            } rounded-md text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500`}
            placeholderText={language === "it" ? "Seleziona data di fine" : "Select end date"}
            disabled={isCheckingConflict}
          />
          {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
        </div>
      </div>

      {/* Conflict Error */}
      {conflictError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-800">{conflictError}</p>
          </div>
        </div>
      )}

      {/* Duration Validation */}
      {durationDays > 0 && (
        <div className="text-sm text-gray-600">
          {language === "it" ? "Durata" : "Duration"}: {durationDays} {durationDays === 1 ? (language === "it" ? "giorno" : "day") : (language === "it" ? "giorni" : "days")}
          {durationDays < MIN_AD_DURATION_DAYS && (
            <span className="text-red-600 ml-2">
              ({language === "it" ? "Minimo" : "Minimum"} {MIN_AD_DURATION_DAYS} {language === "it" ? "giorno richiesto" : "day required"})
            </span>
          )}
          {durationDays > MAX_AD_DURATION_DAYS && (
            <span className="text-red-600 ml-2">
              ({language === "it" ? "Massimo" : "Maximum"} {MAX_AD_DURATION_DAYS} {language === "it" ? "giorni consentiti" : "days allowed"})
            </span>
          )}
        </div>
      )}

      {/* Price Calculation */}
      {calculatedPrice > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            {language === "it" ? "Calcolo Prezzo" : "Price Calculation"}
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">{language === "it" ? "Tariffa Giornaliera" : "Daily Rate"}:</span>
              <span className="font-medium">{formatPrice(dailyRate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{language === "it" ? "Durata" : "Duration"}:</span>
              <span className="font-medium">{durationDays} {durationDays === 1 ? (language === "it" ? "giorno" : "day") : (language === "it" ? "giorni" : "days")}</span>
            </div>
            <div className="border-t border-gray-300 pt-2 mt-2">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900">{language === "it" ? "Prezzo Totale" : "Total Price"}:</span>
                <span className="font-bold text-lg text-red-600">
                  {formatPrice(calculatedPrice)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

