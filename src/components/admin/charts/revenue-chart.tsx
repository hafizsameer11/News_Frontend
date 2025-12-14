"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendData } from "@/types/stats.types";
import { formatDate } from "@/lib/helpers/formatDate";
import { useLanguage } from "@/providers/LanguageProvider";

interface RevenueChartProps {
  data: TrendData[];
  period: "daily" | "weekly" | "monthly";
}

export function RevenueChart({ data, period }: RevenueChartProps) {
  const { t, language } = useLanguage();
  
  const formatXAxis = (date: string) => {
    const d = new Date(date);
    if (period === "daily") {
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } else if (period === "weekly") {
      return `Week ${Math.ceil(d.getDate() / 7)}`;
    } else {
      return d.toLocaleDateString("en-US", { month: "short" });
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
    revenue: item.revenue !== undefined ? item.revenue : ((item.views || 0) * 0.01), // Use actual revenue or fallback calculation
  }));

  // Check if we have any actual revenue data
  const hasRevenueData = data.some(item => item.revenue !== undefined && item.revenue > 0);

  return (
    <>
      {!hasRevenueData && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
          {language === "it" 
            ? "I dati di ricavo provengono da transazioni. Nessuna transazione completata trovata per questo periodo."
            : "Revenue data comes from transactions. No completed transactions found for this period."}
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
            tickFormatter={(value) => `€${value.toFixed(2)}`}
          />
          <Tooltip
            labelFormatter={(value) => formatDate(value, "MMM dd, yyyy")}
            formatter={(value: number) => [`€${value.toFixed(2)}`, "Revenue"]}
          />
          <Legend />
          <Bar dataKey="revenue" fill="#10b981" name="Ad Revenue" />
        </BarChart>
      </ResponsiveContainer>
    </>
  );
}

