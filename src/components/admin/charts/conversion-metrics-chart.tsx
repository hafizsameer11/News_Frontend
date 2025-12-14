"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ConversionMetrics } from "@/types/stats.types";

interface ConversionMetricsChartProps {
  data: ConversionMetrics;
}

export function ConversionMetricsChart({ data }: ConversionMetricsChartProps) {
  const chartData = [
    {
      name: "Newsletter Subscriptions",
      value: data.newsletterSubscriptions,
    },
    {
      name: "Ad Clicks",
      value: data.adClicks,
    },
    {
      name: "Ad Impressions",
      value: data.adImpressions,
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(value: number) => [value.toLocaleString(), "Count"]}
        />
        <Legend />
        <Bar
          dataKey="value"
          fill="#10b981"
          name="Count"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

