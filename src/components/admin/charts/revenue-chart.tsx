"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendData } from "@/types/stats.types";

import { useLanguage } from "@/providers/LanguageProvider";

interface RevenueChartProps {
  data: TrendData[];
  period: "daily" | "weekly" | "monthly";
}

export function RevenueChart({ data, period }: RevenueChartProps) {
  const { t, formatDate, formatCurrency } = useLanguage();

  const formatXAxis = (date: string) => {
    const d = new Date(date);
    if (period === "daily") {
      return formatDate(d, "MMM dd");
    } else if (period === "weekly") {
      return `${t("admin.weekly")} ${Math.ceil(d.getDate() / 7)}`;
    } else {
      return formatDate(d, "MMM");
    }
  };

  // Handle undefined or empty data
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500">
        <p>{t("admin.noRevenueData")}</p>
      </div>
    );
  }

  // Use actual revenue data from transactions, or calculate from views if not available
  const chartData = data.map((item) => ({
    ...item,
    revenue:
      item.revenue !== undefined ? item.revenue : (item.views || 0) * 0.01, // Use actual revenue or fallback calculation
  }));

  // Check if we have any actual revenue data
  const hasRevenueData = data.some(
    (item) => item.revenue !== undefined && item.revenue > 0
  );

  return (
    <>
      {!hasRevenueData && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
          {t("admin.noRevenueData")}
        </div>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={formatXAxis}
            style={{ fontSize: "12px" }}
          />
          <YAxis
            style={{ fontSize: "12px" }}
            tickFormatter={(value) =>
              formatCurrency(value, "EUR", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })
            }
          />
          <Tooltip
            labelFormatter={(value) =>
              formatDate(value, "MMM dd, yyyy")
            }
            formatter={(value: number) => [
              formatCurrency(value, "EUR"),
              t("admin.adRevenue"),
            ]}
          />
          <Legend />
          <Bar dataKey="revenue" fill="#10b981" name="Ad Revenue" />
        </BarChart>
      </ResponsiveContainer>
    </>
  );
}
