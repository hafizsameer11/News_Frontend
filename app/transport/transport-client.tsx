"use client";

import { useState } from "react";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { TravelEmissionsCalculator } from "@/components/transport/travel-emissions-calculator";
import { SpendEmissionsCalculator } from "@/components/transport/spend-emissions-calculator";
import { HotelEmissionsCalculator } from "@/components/transport/hotel-emissions-calculator";
import { ClimatiqResponse } from "@/lib/api/modules/climatiq.api";

export function TransportPageClient() {
  const [selectedType, setSelectedType] = useState<"distance" | "spend" | "hotel">("distance");
  const [calculationHistory, setCalculationHistory] = useState<ClimatiqResponse[]>([]);

  const handleCalculationResult = (result: ClimatiqResponse) => {
    setCalculationHistory((prev) => [result, ...prev].slice(0, 10)); // Keep last 10 calculations
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-6 text-gray-900">Transport Information</h1>

        {/* Method Selection */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedType("distance")}
              className={`px-4 py-2 rounded-md transition font-medium ${
                selectedType === "distance"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Distance-Based
            </button>
            <button
              onClick={() => setSelectedType("spend")}
              className={`px-4 py-2 rounded-md transition font-medium ${
                selectedType === "spend"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Spend-Based
            </button>
            <button
              onClick={() => setSelectedType("hotel")}
              className={`px-4 py-2 rounded-md transition font-medium ${
                selectedType === "hotel"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Hotel Stays
            </button>
          </div>
        </div>

        {/* Calculator */}
        <div className="mb-8">
          {selectedType === "distance" && (
            <TravelEmissionsCalculator onResult={handleCalculationResult} />
          )}
          {selectedType === "spend" && (
            <SpendEmissionsCalculator onResult={handleCalculationResult} />
          )}
          {selectedType === "hotel" && (
            <HotelEmissionsCalculator onResult={handleCalculationResult} />
          )}
        </div>

        {/* Calculation History */}
        {calculationHistory.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Recent Calculations</h2>
            <div className="space-y-4">
              {calculationHistory.map((calc, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      {calc.origin && calc.destination && (
                        <p className="font-medium text-gray-900">
                          {calc.origin.name} → {calc.destination.name}
                        </p>
                      )}
                      {calc.distance_km && (
                        <p className="text-sm text-gray-600">Distance: {calc.distance_km.toFixed(2)} km</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-700">
                        {calc.co2e.toFixed(2)} {calc.co2e_unit}
                      </p>
                    </div>
                  </div>
                  {calc.notices && calc.notices.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      {calc.notices.map((notice, noticeIndex) => (
                        <p key={noticeIndex} className={`text-xs ${notice.severity === "warning" ? "text-yellow-700" : "text-blue-700"}`}>
                          {notice.severity === "warning" ? "⚠️" : "ℹ️"} {notice.message}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
