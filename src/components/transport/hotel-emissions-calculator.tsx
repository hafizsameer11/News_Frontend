"use client";

import { useState } from "react";
import { climatiqApi, LocationInput, ClimatiqResponse } from "@/lib/api/modules/climatiq.api";
import { ErrorMessage } from "@/components/ui/error-message";

interface HotelEmissionsCalculatorProps {
  onResult?: (result: ClimatiqResponse) => void;
}

export function HotelEmissionsCalculator({ onResult }: HotelEmissionsCalculatorProps) {
  const [hotelNights, setHotelNights] = useState("");
  const [location, setLocation] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  
  const [result, setResult] = useState<ClimatiqResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setIsLoading(true);

    try {
      const locationInput: LocationInput = { query: location };

      const response = await climatiqApi.calculateHotel({
        hotel_nights: parseInt(hotelNights),
        location: locationInput,
        year: year ? parseInt(year) : undefined,
      });

      setResult(response);
      if (onResult) {
        onResult(response);
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "Failed to calculate emissions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">Calculate Hotel Stay Emissions</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Hotel Nights */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number of Nights <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={hotelNights}
            onChange={(e) => setHotelNights(e.target.value)}
            placeholder="5"
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hotel Location <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., San Francisco, London, Berlin"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Year */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Year <span className="text-gray-500 text-xs">(optional)</span>
          </label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            min="2000"
            max={new Date().getFullYear()}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
        >
          {isLoading ? "Calculating..." : "Calculate Emissions"}
        </button>
      </form>

      {error && <ErrorMessage error={error} className="mt-4" />}

      {result && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Emissions Result</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Total CO2e:</span>
              <span className="font-bold text-green-700">{result.co2e.toFixed(2)} {result.co2e_unit}</span>
            </div>
            {result.location && (
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Location:</span>
                <span className="text-gray-600">{result.location.name}</span>
              </div>
            )}
            {result.notices && result.notices.length > 0 && (
              <div className="mt-3 pt-3 border-t border-green-200">
                <p className="text-sm font-medium text-gray-700 mb-1">Notices:</p>
                {result.notices.map((notice, index) => (
                  <div key={index} className={`text-xs ${notice.severity === "warning" ? "text-yellow-700" : "text-blue-700"}`}>
                    {notice.severity === "warning" ? "⚠️" : "ℹ️"} {notice.message}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

