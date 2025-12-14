"use client";

interface ScheduleTableProps {
  schedule: string;
  className?: string;
}

/**
 * Parse schedule string and display in table format
 * Supports various formats:
 * - Plain text
 * - Line-separated times
 * - Structured format (e.g., "Mon-Fri: 8:00-18:00")
 */
export function ScheduleTable({ schedule, className = "" }: ScheduleTableProps) {
  // Try to parse structured schedule
  const parseSchedule = (scheduleText: string) => {
    // Check if it's a structured format (e.g., "Mon-Fri: 8:00-18:00" or "Monday: 8:00-18:00")
    const structuredPattern = /([A-Za-z\s-]+):\s*([\d:-\s,]+)/gi;
    const matches = Array.from(scheduleText.matchAll(structuredPattern));

    if (matches.length > 0) {
      return matches.map((match) => ({
        day: match[1].trim(),
        times: match[2].trim(),
      }));
    }

    // Check if it's line-separated times
    const lines = scheduleText.split(/\n|,|;/).filter((line) => line.trim());
    if (lines.length > 1) {
      return lines.map((line) => ({
        day: "",
        times: line.trim(),
      }));
    }

    // Plain text - return as single entry
    return [{ day: "", times: scheduleText.trim() }];
  };

  const scheduleEntries = parseSchedule(schedule);

  if (scheduleEntries.length === 1 && !scheduleEntries[0].day) {
    // Simple format - just display as text
    return (
      <div className={`text-sm text-gray-600 ${className}`}>
        <span className="font-medium text-gray-700">Schedule: </span>
        {scheduleEntries[0].times}
      </div>
    );
  }

  // Table format for structured schedules
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            {scheduleEntries.some((entry) => entry.day) && (
              <th className="text-left py-2 px-3 font-medium text-gray-700">Day</th>
            )}
            <th className="text-left py-2 px-3 font-medium text-gray-700">Time</th>
          </tr>
        </thead>
        <tbody>
          {scheduleEntries.map((entry, index) => (
            <tr key={index} className="border-b border-gray-100">
              {scheduleEntries.some((e) => e.day) && (
                <td className="py-2 px-3 text-gray-700">{entry.day || "-"}</td>
              )}
              <td className="py-2 px-3 text-gray-600">{entry.times}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

