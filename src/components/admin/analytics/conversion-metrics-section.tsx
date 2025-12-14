"use client";

import { ConversionMetrics } from "@/types/stats.types";
import { ConversionMetricsChart } from "@/components/admin/charts/conversion-metrics-chart";

interface ConversionMetricsSectionProps {
  data: ConversionMetrics;
}

export function ConversionMetricsSection({ data }: ConversionMetricsSectionProps) {
  // Use data directly (it's already ConversionMetrics type)
  const newsletterSubscriptions = data.newsletterSubscriptions ?? 0;
  const adClicks = data.adClicks ?? 0;
  const adImpressions = data.adImpressions ?? 0;
  const clickThroughRate = data.clickThroughRate ?? 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-6 text-gray-900">Conversion Metrics</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="text-lg font-semibold mb-4 text-gray-900">Metrics Overview</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Newsletter Subscriptions</span>
              <span className="text-2xl font-bold text-green-600">
                {newsletterSubscriptions.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Ad Clicks</span>
              <span className="text-2xl font-bold text-blue-600">
                {adClicks.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Ad Impressions</span>
              <span className="text-2xl font-bold text-purple-600">
                {adImpressions.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Click-Through Rate (CTR)</span>
              <span className="text-2xl font-bold text-orange-600">
                {clickThroughRate.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
        <div>
          <h4 className="text-lg font-semibold mb-4 text-gray-900">Visualization</h4>
          <ConversionMetricsChart data={{
            newsletterSubscriptions,
            adClicks,
            adImpressions,
            clickThroughRate,
          }} />
        </div>
      </div>
    </div>
  );
}

