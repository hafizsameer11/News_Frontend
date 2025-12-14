"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendData } from "@/types/stats.types";
import { formatDate } from "@/lib/helpers/formatDate";
import { useLanguage } from "@/providers/LanguageProvider";

interface ViewsChartProps {
  data: TrendData[];
  period: "daily" | "weekly" | "monthly";
}

export function ViewsChart({ data, period }: ViewsChartProps) {
  const { t } = useLanguage();
  
  const formatXAxis = (date: string) => {
    const d = new Date(date);
    if (period === "daily") {
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } else if (period === "weekly") {
      const weekNumber = Math.ceil(d.getDate() / 7);
      return `Week ${weekNumber}`;
    } else {
      return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    }
  };

  // Handle undefined or empty data
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500">
        <p>{t("admin.noViewsData")}</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickFormatter={formatXAxis}
          style={{ fontSize: "12px" }}
        />
        <YAxis style={{ fontSize: "12px" }} />
        <Tooltip
          labelFormatter={(value) => formatDate(value, "MMM dd, yyyy")}
          formatter={(value: number) => [value.toLocaleString(), "Views"]}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="views"
          stroke="#3b82f6"
          strokeWidth={2}
          name="Views"
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

