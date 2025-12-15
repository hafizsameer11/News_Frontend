"use client";

import { UserEngagement } from "@/types/stats.types";
import { useLanguage } from "@/providers/LanguageProvider";

interface UserEngagementSectionProps {
  data: UserEngagement;
}

export function UserEngagementSection({ data }: UserEngagementSectionProps) {
  const { formatNumber } = useLanguage();
  // Handle undefined/null values safely
  const totalUsers = data?.totalUsers ?? 0;
  const activeUsers = data?.activeUsers ?? 0;
  const newRegistrations = data?.newRegistrations ?? 0;
  const activeUsersPercentage = data?.activeUsersPercentage ?? 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-6 text-gray-900">
        User Engagement
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Total Users</p>
          <p className="text-3xl font-bold text-blue-600">
            {formatNumber(totalUsers)}
          </p>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Active Users</p>
          <p className="text-3xl font-bold text-green-600">
            {formatNumber(activeUsers)}
          </p>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">New Registrations</p>
          <p className="text-3xl font-bold text-purple-600">
            {formatNumber(newRegistrations)}
          </p>
        </div>
        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Active Percentage</p>
          <p className="text-3xl font-bold text-orange-600">
            {activeUsersPercentage.toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
}
