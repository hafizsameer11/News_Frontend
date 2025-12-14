import { format, formatDistanceToNow, parseISO } from "date-fns";

export const formatDate = (date: string | Date, formatStr: string = "PPP") => {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return format(dateObj, formatStr);
  } catch {
    return "";
  }
};

export const formatRelativeTime = (date: string | Date) => {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch {
    return "";
  }
};

