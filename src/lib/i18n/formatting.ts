import { format, formatDistanceToNow, parseISO } from "date-fns";
import { enUS, it } from "date-fns/locale";
import type { Language } from "./translations";

// Map language codes to date-fns locales
const localeMap = {
  en: enUS,
  it: it,
} as const;

// Map language codes to Intl locale codes
const intlLocaleMap = {
  en: "en-US",
  it: "it-IT",
} as const;

/**
 * Get date-fns locale for a given language
 */
export function getDateLocale(language: Language) {
  return localeMap[language];
}

/**
 * Get Intl locale code for a given language
 */
export function getIntlLocale(language: Language): string {
  return intlLocaleMap[language];
}

/**
 * Format a date with locale support
 */
export function formatDate(
  date: string | Date,
  formatStr: string = "PPP",
  language: Language = "en"
): string {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    const locale = getDateLocale(language);
    return format(dateObj, formatStr, { locale });
  } catch {
    return "";
  }
}

/**
 * Format relative time (e.g., "2 hours ago")
 * After 1 hour, shows the actual date instead of "X hours ago"
 */
export function formatRelativeTime(
  date: string | Date,
  language: Language = "en"
): string {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    const now = new Date();
    const diffInMs = now.getTime() - dateObj.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    
    // If more than 1 hour has passed, show the actual date instead of "X hours ago"
    if (diffInHours >= 1) {
      const locale = getDateLocale(language);
      // Use a short date format (e.g., "Jan 1" or "1 gen" in Italian)
      return format(dateObj, "MMM dd", { locale });
    }
    
    // Less than 1 hour: show relative time (e.g., "5 minutes ago")
    const locale = getDateLocale(language);
    return formatDistanceToNow(dateObj, { addSuffix: true, locale });
  } catch {
    return "";
  }
}

/**
 * Format a number with locale support
 */
export function formatNumber(
  number: number,
  language: Language = "en",
  options?: Intl.NumberFormatOptions
): string {
  try {
    const locale = getIntlLocale(language);
    return new Intl.NumberFormat(locale, options).format(number);
  } catch {
    return String(number);
  }
}

/**
 * Format currency with locale support
 */
export function formatCurrency(
  amount: number,
  language: Language = "en",
  currency: string = "EUR",
  options?: Intl.NumberFormatOptions
): string {
  try {
    const locale = getIntlLocale(language);
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      ...options,
    }).format(amount);
  } catch {
    return String(amount);
  }
}

/**
 * Format date and time together
 */
export function formatDateTime(
  date: string | Date,
  language: Language = "en",
  options?: {
    dateFormat?: string;
    timeFormat?: string;
    separator?: string;
  }
): string {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    const locale = getDateLocale(language);
    const {
      dateFormat = "PPP",
      timeFormat = "p",
      separator = " ",
    } = options || {};

    const dateStr = format(dateObj, dateFormat, { locale });
    const timeStr = format(dateObj, timeFormat, { locale });
    return `${dateStr}${separator}${timeStr}`;
  } catch {
    return "";
  }
}

/**
 * Format time only
 */
export function formatTime(
  date: string | Date,
  language: Language = "en",
  formatStr: string = "p"
): string {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    const locale = getDateLocale(language);
    return format(dateObj, formatStr, { locale });
  } catch {
    return "";
  }
}

/**
 * Common date format presets
 */
export const dateFormats = {
  short: "PP", // e.g., "Jan 1, 2025"
  medium: "PPP", // e.g., "January 1st, 2025"
  long: "PPPP", // e.g., "Wednesday, January 1st, 2025"
  time: "p", // e.g., "3:45 PM"
  dateTime: "PPp", // e.g., "Jan 1, 2025, 3:45 PM"
  relative: "relative", // Use formatRelativeTime instead
} as const;
