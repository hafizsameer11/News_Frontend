"use client";

import { useAdAnalytics } from "@/lib/hooks/useAnalytics";
import { useLanguage } from "@/providers/LanguageProvider";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface AdAnalyticsDetailProps {
  adId: string;
  startDate?: Date | null;
  endDate?: Date | null;
}

export function AdAnalyticsDetail({
  adId,
  startDate,
  endDate,
}: AdAnalyticsDetailProps) {
  const { formatNumber } = useLanguage();
  const { data, isLoading, error } = useAdAnalytics(adId);

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  const analytics = data?.data;
  if (!analytics) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No analytics data available</p>
      </div>
    );
  }

  // Filter data by date range
  const filterByDateRange = (items: { date: string; count: number }[]) => {
    if (!startDate || !endDate) return items;
    return items.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate >= startDate && itemDate <= endDate;
    });
  };

  const impressionsData = filterByDateRange(
    analytics.impressionsOverTime || []
  );
  const clicksData = filterByDateRange(analytics.clicksOverTime || []);

  // Calculate CTR
  const totalImpressions = impressionsData.reduce(
    (sum, item) => sum + item.count,
    0
  );
  const totalClicks = clicksData.reduce((sum, item) => sum + item.count, 0);
  const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            Total Impressions
          </h3>
          <p className="text-3xl font-bold text-blue-600">
            {formatNumber(analytics.impressions)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            Total Clicks
          </h3>
          <p className="text-3xl font-bold text-green-600">
            {formatNumber(analytics.clicks)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            Click-Through Rate (CTR)
          </h3>
          <p className="text-3xl font-bold text-red-600">
            {analytics.ctr.toFixed(2)}%
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            Filtered CTR
          </h3>
          <p className="text-3xl font-bold text-purple-600">
            {ctr.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Impressions Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Impressions Over Time
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={impressionsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#dc2626"
                strokeWidth={2}
                name="Impressions"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Clicks Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Clicks Over Time
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={clicksData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#22c55e"
                strokeWidth={2}
                name="Clicks"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
