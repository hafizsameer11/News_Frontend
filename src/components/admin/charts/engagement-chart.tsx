"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendData } from "@/types/stats.types";

import { useLanguage } from "@/providers/LanguageProvider";

interface EngagementChartProps {
  data: TrendData[];
  period: "daily" | "weekly" | "monthly";
}

export function EngagementChart({ data, period }: EngagementChartProps) {
  const { t, language, formatDate, formatNumber } = useLanguage();

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
        <p>{t("admin.noEngagementData")}</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickFormatter={formatXAxis}
          style={{ fontSize: "12px" }}
        />
        <YAxis style={{ fontSize: "12px" }} />
        <Tooltip
          labelFormatter={(value) =>
            formatDate(value, "MMM dd, yyyy")
          }
          formatter={(value: number) => [formatNumber(value), t("admin.user")]}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey="users"
          stroke="#3b82f6"
          fillOpacity={1}
          fill="url(#colorUsers)"
          name="New Users"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
