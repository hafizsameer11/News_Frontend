"use client";

import { useAdvertiserAnalytics } from "@/lib/hooks/useAnalytics";
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

interface AnalyticsChartsProps {
  startDate: Date | null;
  endDate: Date | null;
}

export function AnalyticsCharts({ startDate, endDate }: AnalyticsChartsProps) {
  const { data, isLoading, error } = useAdvertiserAnalytics();
  const { formatNumber } = useLanguage();

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

  // Backend doesn't return impressionsOverTime/clicksOverTime, so we'll create simple charts
  // from the ads data if available, or show a message
  const hasTimeSeriesData = analytics.ads?.some(
    (ad: any) => ad.impressionsOverTime || ad.clicksOverTime
  );

  // Filter data by date range
  const filterByDateRange = (items: { date: string; count: number }[]) => {
    if (!startDate || !endDate) return items;
    return items.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate >= startDate && itemDate <= endDate;
    });
  };

  // Prepare data for charts - check if time series data exists
  let impressionsData: Record<string, number> = {};
  let clicksData: Record<string, number> = {};

  if (hasTimeSeriesData && analytics.ads) {
    interface TimeSeriesItem {
      date: string;
      count: number;
    }

    impressionsData = analytics.ads
      .flatMap((ad) => (ad.impressionsOverTime || []) as TimeSeriesItem[])
      .reduce((acc: Record<string, number>, item: TimeSeriesItem) => {
        const date = item.date;
        acc[date] = (acc[date] || 0) + item.count;
        return acc;
      }, {});

    clicksData = analytics.ads
      .flatMap((ad) => (ad.clicksOverTime || []) as TimeSeriesItem[])
      .reduce((acc: Record<string, number>, item: TimeSeriesItem) => {
        const date = item.date;
        acc[date] = (acc[date] || 0) + item.count;
        return acc;
      }, {});
  }

  const impressionsChartData = hasTimeSeriesData
    ? filterByDateRange(
        Object.entries(impressionsData)
          .map(([date, count]) => ({ date, impressions: count }))
          .sort((a, b) => a.date.localeCompare(b.date))
      )
    : [];

  const clicksChartData = hasTimeSeriesData
    ? filterByDateRange(
        Object.entries(clicksData)
          .map(([date, count]) => ({ date, clicks: count }))
          .sort((a, b) => a.date.localeCompare(b.date))
      )
    : [];

  // Calculate CTR from analytics data
  const totalImpressions = analytics.totalImpressions || 0;
  const totalClicks = analytics.totalClicks || 0;
  const ctr =
    analytics.averageCTR ||
    (totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            Total Impressions
          </h3>
          <p className="text-3xl font-bold text-blue-600">
            {formatNumber(totalImpressions)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            Total Clicks
          </h3>
          <p className="text-3xl font-bold text-green-600">
            {formatNumber(totalClicks)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            Click-Through Rate (CTR)
          </h3>
          <p className="text-3xl font-bold text-red-600">{ctr.toFixed(2)}%</p>
        </div>
      </div>

      {/* Charts */}
      {hasTimeSeriesData &&
      impressionsChartData.length > 0 &&
      clicksChartData.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Impressions Chart */}
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

          {/* Clicks Chart */}
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
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-center text-gray-500">
            Time series data is not available. Charts will be displayed when
            historical data is collected.
          </p>
        </div>
      )}
    </div>
  );
}
