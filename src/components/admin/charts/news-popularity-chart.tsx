"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { NewsPopularityItem } from "@/types/stats.types";

interface NewsPopularityChartProps {
  data: NewsPopularityItem[];
  limit?: number;
}

export function NewsPopularityChart({ data, limit = 10 }: NewsPopularityChartProps) {
  // Prepare chart data - truncate titles for display
  const chartData = data.slice(0, limit).map((item) => ({
    title: item.title.length > 30 ? `${item.title.substring(0, 30)}...` : item.title,
    views: item.views,
    fullTitle: item.title,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" tick={{ fontSize: 12 }} />
        <YAxis
          type="category"
          dataKey="title"
          tick={{ fontSize: 11 }}
          width={200}
        />
        <Tooltip
          formatter={(value: number) => [value.toLocaleString(), "Views"]}
          labelFormatter={(value, payload) => {
            const data = payload?.[0]?.payload;
            return data?.fullTitle || value;
          }}
        />
        <Legend />
        <Bar
          dataKey="views"
          fill="#ef4444"
          name="Views"
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

