"use client";

import { useState } from "react";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { useTransport } from "@/lib/hooks/useTransport";
import { TransportCard } from "@/components/transport/transport-card";
import { TransportType } from "@/types/transport.types";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";

export function TransportPageClient() {
  const [typeFilter, setTypeFilter] = useState<TransportType | "">("");
  const [cityFilter, setCityFilter] = useState<string>("");
  const [search, setSearch] = useState("");

  const { data, isLoading, error } = useTransport({
    type: typeFilter || undefined,
    city: cityFilter || undefined,
    search: search || undefined,
    limit: 50,
  });

  const transports = data?.data?.transports || [];

  // Get unique cities from transports for filter dropdown
  const availableCities = Array.from(
    new Set(transports.map((t) => t.city).filter((city): city is string => !!city))
  ).sort();

  const transportsByType = {
    TRAIN: transports.filter((t) => t.type === "TRAIN"),
    BUS: transports.filter((t) => t.type === "BUS"),
    TAXI: transports.filter((t) => t.type === "TAXI"),
    RENTAL: transports.filter((t) => t.type === "RENTAL"),
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-6 text-gray-900">Transport Information</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as TransportType | "")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="TRAIN">Trains</option>
                <option value="BUS">Buses</option>
                <option value="TAXI">Taxis</option>
                <option value="RENTAL">Rentals</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by City</label>
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Cities</option>
                {availableCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, city, or route..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {error && <ErrorMessage error={error} className="mb-6" />}

        {isLoading ? (
          <Loading />
        ) : typeFilter ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {transports.map((transport) => (
              <TransportCard key={transport.id} transport={transport} />
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {transportsByType.TRAIN.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Trains</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {transportsByType.TRAIN.map((transport) => (
                    <TransportCard key={transport.id} transport={transport} />
                  ))}
                </div>
              </div>
            )}

            {transportsByType.BUS.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Buses</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {transportsByType.BUS.map((transport) => (
                    <TransportCard key={transport.id} transport={transport} />
                  ))}
                </div>
              </div>
            )}

            {transportsByType.TAXI.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Taxis</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {transportsByType.TAXI.map((transport) => (
                    <TransportCard key={transport.id} transport={transport} />
                  ))}
                </div>
              </div>
            )}

            {transportsByType.RENTAL.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Rentals</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {transportsByType.RENTAL.map((transport) => (
                    <TransportCard key={transport.id} transport={transport} />
                  ))}
                </div>
              </div>
            )}

            {transports.length === 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-600">No transport information available.</p>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
