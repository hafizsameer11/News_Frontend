"use client";

import { HourlyPatternsChart } from "@/components/admin/charts/hourly-patterns-chart";

interface HourlyPatternsSectionProps {
  data: Array<{ hour: number; count: number }>;
}

export function HourlyPatternsSection({ data }: HourlyPatternsSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-6 text-gray-900">Hourly Activity Patterns</h3>
      <HourlyPatternsChart data={data} />
    </div>
  );
}

