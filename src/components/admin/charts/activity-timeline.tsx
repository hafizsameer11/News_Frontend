"use client";

import { formatDate, formatRelativeTime } from "@/lib/helpers/formatDate";

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  user?: {
    name: string;
    email: string;
  };
}

interface ActivityTimelineProps {
  activities: ActivityItem[];
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div
          key={activity.id || index}
          className="flex items-start gap-4 pb-4 border-b border-gray-200 last:border-b-0 last:pb-0"
        >
          <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-600 mt-2" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium text-gray-900">
                {activity.description}
              </p>
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {formatRelativeTime(activity.timestamp)}
              </span>
            </div>
            {activity.user && (
              <p className="text-xs text-gray-600 mt-1">
                by {activity.user.name} ({activity.user.email})
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {formatDate(activity.timestamp, "MMM dd, yyyy HH:mm")}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

