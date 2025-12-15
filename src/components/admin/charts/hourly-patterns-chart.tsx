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
import { useLanguage } from "@/providers/LanguageProvider";

interface HourlyPatternsChartProps {
  data: Array<{ hour: number; count: number }>;
}

export function HourlyPatternsChart({ data }: HourlyPatternsChartProps) {
  const { t, formatNumber, formatTime } = useLanguage();
  // Format hour for display (0-23 to 12-hour format)
  const formatHour = (hour: number) => {
    const date = new Date();
    date.setHours(hour, 0, 0, 0);
    return formatTime(date, "h a");
  };

  // Prepare chart data
  const chartData = data.map((item) => ({
    hour: formatHour(item.hour),
    count: item.count,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="hour"
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(value: number) => [
            formatNumber(value),
            t("admin.hourlyActivity"),
          ]}
        />
        <Legend />
        <Bar
          dataKey="count"
          fill="#3b82f6"
          name="Activity Count"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
