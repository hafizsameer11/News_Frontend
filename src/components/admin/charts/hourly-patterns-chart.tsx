"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface HourlyPatternsChartProps {
  data: Array<{ hour: number; count: number }>;
}

export function HourlyPatternsChart({ data }: HourlyPatternsChartProps) {
  // Format hour for display (0-23 to 12-hour format)
  const formatHour = (hour: number) => {
    if (hour === 0) return "12 AM";
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return "12 PM";
    return `${hour - 12} PM`;
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
          formatter={(value: number) => [value.toLocaleString(), "Activity"]}
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

