"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { CategoryPerformanceItem } from "@/types/stats.types";
import { useLanguage } from "@/providers/LanguageProvider";

interface CategoryDistributionChartProps {
  data: CategoryPerformanceItem[];
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

export function CategoryDistributionChart({ data }: CategoryDistributionChartProps) {
  const { t, language } = useLanguage();

  // Handle undefined or empty data
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500">
        <p>{t("admin.noCategoryData")}</p>
      </div>
    );
  }

  const chartData = data.slice(0, 8).map((item) => ({
    name: language === "it" ? (item.nameIt || item.nameEn || item.name || "Unknown") : (item.nameEn || item.name || "Unknown"),
    value: item.newsCount,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => [value, "News Count"]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

