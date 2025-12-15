"use client";

import { useState, useEffect, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { WizardFormData } from "../ad-creation-wizard";
import { calculateAdPrice, calculateDurationDays, formatPrice, getDailyRate, MIN_AD_DURATION_DAYS, MAX_AD_DURATION_DAYS } from "@/lib/helpers/ad-pricing";

interface PlacementStepProps {
  formData: WizardFormData;
  updateFormData: (updates: Partial<WizardFormData>) => void;
  errors: Record<string, string>;
}

const SLOT_OPTIONS = [
  { value: "HEADER", label: "Header", labelIt: "Intestazione", compatibleTypes: ["BANNER_TOP"] },
  { value: "SIDEBAR", label: "Sidebar", labelIt: "Barra Laterale", compatibleTypes: ["BANNER_SIDE", "STICKY"] },
  { value: "INLINE", label: "Inline", labelIt: "In Linea", compatibleTypes: ["INLINE"] },
  { value: "FOOTER", label: "Footer", labelIt: "Piè di Pagina", compatibleTypes: ["FOOTER"] },
  { value: "MOBILE", label: "Mobile", labelIt: "Mobile", compatibleTypes: ["BANNER_SIDE", "STICKY"] },
];

export function PlacementStep({ formData, updateFormData, errors }: PlacementStepProps) {
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

  const handleStartDateChange = (date: Date | null) => {
    if (date) {
      updateFormData({ startDate: date.toISOString().split("T")[0] });
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    if (date) {
      updateFormData({ endDate: date.toISOString().split("T")[0] });
    }
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
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Placement & Schedule
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Select where your ad will be displayed and when it should run.
        </p>
      </div>

      {/* Slot Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ad Slot *
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
                onChange={(e) => updateFormData({ position: e.target.value })}
                className="mr-3"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">{slot.label}</div>
                <div className="text-xs text-gray-500">
                  Compatible with {formData.type}
                </div>
              </div>
            </label>
          ))}
        </div>
        {compatibleSlots.length === 0 && (
          <p className="text-sm text-yellow-600 mt-2">
            No compatible slots found for {formData.type}. Please select a different ad type.
          </p>
        )}
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date *
          </label>
          <DatePicker
            selected={startDate}
            onChange={handleStartDateChange}
            minDate={new Date()}
            dateFormat="yyyy-MM-dd"
            className={`w-full px-3 py-2 border ${
              errors.startDate ? "border-red-300" : "border-gray-300"
            } rounded-md text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500`}
            placeholderText="Select start date"
          />
          {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date *
          </label>
          <DatePicker
            selected={endDate}
            onChange={handleEndDateChange}
            minDate={startDate || new Date()}
            dateFormat="yyyy-MM-dd"
            className={`w-full px-3 py-2 border ${
              errors.endDate ? "border-red-300" : "border-gray-300"
            } rounded-md text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500`}
            placeholderText="Select end date"
          />
          {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
        </div>
      </div>

      {/* Duration Validation */}
      {durationDays > 0 && (
        <div className="text-sm text-gray-600">
          Duration: {durationDays} {durationDays === 1 ? "day" : "days"}
          {durationDays < MIN_AD_DURATION_DAYS && (
            <span className="text-red-600 ml-2">
              (Minimum {MIN_AD_DURATION_DAYS} day required)
            </span>
          )}
          {durationDays > MAX_AD_DURATION_DAYS && (
            <span className="text-red-600 ml-2">
              (Maximum {MAX_AD_DURATION_DAYS} days allowed)
            </span>
          )}
        </div>
      )}

      {/* Price Calculation */}
      {calculatedPrice > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Price Calculation
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Daily Rate:</span>
              <span className="font-medium">{formatPrice(dailyRate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Duration:</span>
              <span className="font-medium">{durationDays} days</span>
            </div>
            <div className="border-t border-gray-300 pt-2 mt-2">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900">Total Price:</span>
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

