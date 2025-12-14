"use client";

import { useState } from "react";
import { Transport } from "@/types/transport.types";
import { ScheduleTable } from "./schedule-table";

interface TransportCardProps {
  transport: Transport;
  className?: string;
}

const typeLabels: Record<Transport["type"], { en: string; it: string }> = {
  BUS: { en: "Bus", it: "Autobus" },
  TRAIN: { en: "Train", it: "Treno" },
  TAXI: { en: "Taxi", it: "Taxi" },
  RENTAL: { en: "Rental", it: "Noleggio" },
};

export function TransportCard({ transport, className = "" }: TransportCardProps) {
  const typeLabel = typeLabels[transport.type];
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded mb-2 inline-block">
            {typeLabel.en}
          </span>
          <h3 className="text-xl font-bold text-gray-900">{transport.name}</h3>
          {transport.city && (
            <p className="text-sm text-gray-500 mt-1">{transport.city}</p>
          )}
        </div>
      </div>

      {transport.description && (
        <p className="text-gray-600 mb-4">{transport.description}</p>
      )}

      {transport.route && (
        <div className="mb-3">
          <span className="text-sm font-medium text-gray-700">Route: </span>
          <span className="text-sm text-gray-600">{transport.route}</span>
        </div>
      )}

      {transport.schedule && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Schedule</span>
            {transport.schedule.length > 50 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                {isExpanded ? "Show Less" : "Show More"}
              </button>
            )}
          </div>
          {isExpanded || transport.schedule.length <= 50 ? (
            <ScheduleTable schedule={transport.schedule} />
          ) : (
            <div className="text-sm text-gray-600">
              {transport.schedule.substring(0, 50)}...
            </div>
          )}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
        {transport.contactPhone && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Phone:</span>
            <a
              href={`tel:${transport.contactPhone}`}
              className="text-blue-600 hover:underline flex items-center gap-1"
            >
              {transport.contactPhone}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </a>
          </div>
        )}
        {transport.contactEmail && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Email:</span>
            <a
              href={`mailto:${transport.contactEmail}`}
              className="text-blue-600 hover:underline flex items-center gap-1"
            >
              {transport.contactEmail}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </a>
          </div>
        )}
        {transport.website && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Website:</span>
            <a
              href={transport.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center gap-1"
            >
              Visit Website
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

