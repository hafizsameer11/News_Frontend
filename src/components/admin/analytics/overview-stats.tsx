"use client";

import { StatsCard } from "@/components/admin/stats-card";
import { AdminStats } from "@/types/stats.types";

interface OverviewStatsProps {
  data: AdminStats;
}

export function OverviewStats({ data }: OverviewStatsProps) {
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title="Total News"
        value={formatNumber(data.counts.news.total)}
        icon="📰"
      />
      <StatsCard
        title="Pending News"
        value={formatNumber(data.counts.news.pending)}
        icon="⏳"
      />
      <StatsCard
        title="Total Users"
        value={formatNumber(data.counts.users)}
        icon="👥"
      />
      <StatsCard
        title="Active Ads"
        value={formatNumber(data.counts.ads.active)}
        icon="📢"
      />
      <StatsCard
        title="Total Ads"
        value={formatNumber(data.counts.ads.total)}
        icon="📊"
      />
      <StatsCard
        title="Pending Reports"
        value={formatNumber(data.counts.reports.pending)}
        icon="⚠️"
      />
      <StatsCard
        title="Total Reports"
        value={formatNumber(data.counts.reports.total)}
        icon="📋"
      />
    </div>
  );
}

