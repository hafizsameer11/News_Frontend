"use client";

import { useAdvertiserAnalytics } from "@/lib/hooks/useAnalytics";
import { useLanguage } from "@/providers/LanguageProvider";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#dc2626",
  "#ea580c",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
];

export function DashboardCharts() {
  const { formatNumber } = useLanguage();
  const { data, isLoading, error } = useAdvertiserAnalytics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loading />
      </div>
    );
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

  // Backend doesn't return impressionsOverTime/clicksOverTime by default
  // Check if time series data exists
  const hasTimeSeriesData = analytics.ads?.some(
    (ad: any) => ad.impressionsOverTime || ad.clicksOverTime
  );

  // Prepare data for charts - only if time series data exists
  let impressionsData: Record<string, number> = {};
  let clicksData: Record<string, number> = {};

  if (hasTimeSeriesData && analytics.ads) {
    impressionsData = analytics.ads
      .flatMap((ad: any) => ad.impressionsOverTime || [])
      .reduce((acc: Record<string, number>, item: any) => {
        const date = item.date;
        acc[date] = (acc[date] || 0) + item.count;
        return acc;
      }, {});

    clicksData = analytics.ads
      .flatMap((ad: any) => ad.clicksOverTime || [])
      .reduce((acc: Record<string, number>, item: any) => {
        const date = item.date;
        acc[date] = (acc[date] || 0) + item.count;
        return acc;
      }, {});
  }

  const impressionsChartData = hasTimeSeriesData
    ? Object.entries(impressionsData)
        .map(([date, count]) => ({ date, impressions: count }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-30) // Last 30 days
    : [];

  const clicksChartData = hasTimeSeriesData
    ? Object.entries(clicksData)
        .map(([date, count]) => ({ date, clicks: count }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-30) // Last 30 days
    : [];

  const adTypeDistribution = analytics.ads.reduce(
    (acc: Record<string, number>, ad) => {
      // We need to get ad type from somewhere - for now using a placeholder
      acc["Total"] = (acc["Total"] || 0) + 1;
      return acc;
    },
    {}
  );

  const pieData = Object.entries(adTypeDistribution).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Impressions Chart */}
      {hasTimeSeriesData && impressionsChartData.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Impressions Over Time
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={impressionsChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="impressions"
                stroke="#dc2626"
                strokeWidth={2}
                name="Impressions"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Impressions Over Time
          </h3>
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            <p>Time series data not available</p>
          </div>
        </div>
      )}

      {/* Clicks Chart */}
      {hasTimeSeriesData && clicksChartData.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Clicks Over Time
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={clicksChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="clicks"
                stroke="#22c55e"
                strokeWidth={2}
                name="Clicks"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Clicks Over Time
          </h3>
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            <p>Time series data not available</p>
          </div>
        </div>
      )}

      {/* CTR Display */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Performance Metrics
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Impressions:</span>
            <span className="font-bold text-lg">
              {formatNumber(analytics.totalImpressions)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Clicks:</span>
            <span className="font-bold text-lg">
              {formatNumber(analytics.totalClicks)}
            </span>
          </div>
          <div className="flex justify-between items-center border-t pt-4">
            <span className="text-gray-600">Average CTR:</span>
            <span className="font-bold text-lg text-red-600">
              {(analytics.averageCTR || 0).toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* Ad Distribution */}
      {pieData.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Ad Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({
                  name,
                  percent,
                }: {
                  name: string;
                  percent?: number;
                }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
