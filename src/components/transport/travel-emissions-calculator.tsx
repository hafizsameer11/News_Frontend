"use client";

import { useState } from "react";
import { climatiqApi, TravelMode, CarType, CarSize, AirClass, LocationInput, ClimatiqResponse } from "@/lib/api/modules/climatiq.api";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";

interface TravelEmissionsCalculatorProps {
  onResult?: (result: ClimatiqResponse) => void;
}

export function TravelEmissionsCalculator({ onResult }: TravelEmissionsCalculatorProps) {
  const [travelMode, setTravelMode] = useState<TravelMode>("car");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [distance, setDistance] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  
  // Car details
  const [carType, setCarType] = useState<CarType>("average");
  const [carSize, setCarSize] = useState<CarSize>("average");
  
  // Air details
  const [airClass, setAirClass] = useState<AirClass>("economy");
  
  // State
  const [result, setResult] = useState<ClimatiqResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setIsLoading(true);

    try {
      const originLocation: LocationInput = { query: origin };
      const destinationLocation: LocationInput = { query: destination };

      const request: any = {
        travel_mode: travelMode,
        origin: originLocation,
        destination: destinationLocation,
        year: year ? parseInt(year) : undefined,
      };

      if (distance) {
        request.distance_km = parseFloat(distance);
      }

      if (travelMode === "car") {
        request.car_details = {
          car_type: carType,
          car_size: carSize,
        };
      }

      if (travelMode === "air") {
        request.air_details = {
          class: airClass,
        };
      }

      const response = await climatiqApi.calculateDistance(request);
      setResult(response);
      if (onResult) {
        onResult(response);
      }
    } catch (err: any) {
      setError(err.message || "Failed to calculate emissions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">Calculate Travel Emissions</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Travel Mode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Travel Mode <span className="text-red-500">*</span>
          </label>
          <select
            value={travelMode}
            onChange={(e) => setTravelMode(e.target.value as TravelMode)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="car">Car</option>
            <option value="air">Air</option>
            <option value="rail">Rail</option>
          </select>
        </div>

        {/* Origin */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Origin <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder="e.g., Hamburg, Berlin, New York"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Destination */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Destination <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g., Berlin, London, Paris"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Distance (optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Distance (km) <span className="text-gray-500 text-xs">(optional)</span>
          </label>
          <input
            type="number"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            placeholder="Leave empty for automatic calculation"
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        {/* Car Details */}
        {travelMode === "car" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Car Type
              </label>
              <select
                value={carType}
                onChange={(e) => setCarType(e.target.value as CarType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="average">Average</option>
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="plugin_hybrid">Plugin Hybrid</option>
                <option value="battery_electric">Battery Electric</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Car Size
              </label>
              <select
                value={carSize}
                onChange={(e) => setCarSize(e.target.value as CarSize)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="average">Average</option>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </>
        )}

        {/* Air Details */}
        {travelMode === "air" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class
            </label>
            <select
              value={airClass}
              onChange={(e) => setAirClass(e.target.value as AirClass)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="economy">Economy</option>
              <option value="business">Business</option>
              <option value="first">First</option>
            </select>
          </div>
        )}

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
            {result.distance_km && (
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Distance:</span>
                <span className="text-gray-600">{result.distance_km.toFixed(2)} km</span>
              </div>
            )}
            {result.origin && (
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Origin:</span>
                <span className="text-gray-600">{result.origin.name}</span>
              </div>
            )}
            {result.destination && (
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Destination:</span>
                <span className="text-gray-600">{result.destination.name}</span>
              </div>
            )}
            {result.direct_emissions && (
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Direct Emissions:</span>
                <span className="text-gray-600">{result.direct_emissions.co2e.toFixed(2)} {result.direct_emissions.co2e_unit}</span>
              </div>
            )}
            {result.indirect_emissions && (
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Indirect Emissions:</span>
                <span className="text-gray-600">{result.indirect_emissions.co2e.toFixed(2)} {result.indirect_emissions.co2e_unit}</span>
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

