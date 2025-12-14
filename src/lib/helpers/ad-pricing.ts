/**
 * Ad Pricing Utility
 * Calculates ad prices based on type and duration
 * Matches backend pricing configuration
 */

export interface AdPricingRates {
  [key: string]: number; // Daily rate in EUR
}

/**
 * Default pricing rates per ad type (EUR per day)
 * Matches backend/src/config/ad-pricing.ts
 */
export const AD_PRICING_RATES: AdPricingRates = {
  BANNER_TOP: 50,
  BANNER_SIDE: 25,
  INLINE: 15,
  FOOTER: 20,
  SLIDER: 30,
  TICKER: 10,
  POPUP: 40,
  STICKY: 35,
};

/**
 * Minimum ad duration in days
 */
export const MIN_AD_DURATION_DAYS = 1;

/**
 * Maximum ad duration in days
 */
export const MAX_AD_DURATION_DAYS = 365;

/**
 * Calculate ad price based on type and duration
 * @param adType - Type of ad
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Calculated price in EUR
 */
export function calculateAdPrice(
  adType: string,
  startDate: Date,
  endDate: Date
): number {
  const dailyRate = AD_PRICING_RATES[adType] || AD_PRICING_RATES.INLINE;
  const days = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)
  );

  return days * dailyRate;
}

/**
 * Get daily rate for an ad type
 * @param adType - Type of ad
 * @returns Daily rate in EUR
 */
export function getDailyRate(adType: string): number {
  return AD_PRICING_RATES[adType] || AD_PRICING_RATES.INLINE;
}

/**
 * Calculate duration in days between two dates
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Number of days
 */
export function calculateDurationDays(startDate: Date, endDate: Date): number {
  return Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)
  );
}

/**
 * Convert Prisma Decimal or BigInt to number
 * Handles Decimal format: { s: 1, e: 0, d: [1] }
 * @param value - Price value (number, Decimal object, BigInt, or null/undefined)
 * @returns Number or null if invalid
 */
export function convertPriceToNumber(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  // If already a number, return it
  if (typeof value === "number") {
    return isNaN(value) ? null : value;
  }

  // If it's a Decimal object (Prisma format)
  if (typeof value === "object" && value !== null) {
    // Try toNumber first if available (most reliable for Decimal.js)
    if (typeof value.toNumber === "function") {
      const num = value.toNumber();
      if (!isNaN(num)) {
        return num;
      }
    }

    // Try toString as fallback (should work for Prisma Decimal)
    if (typeof value.toString === "function") {
      const str = value.toString();
      const num = parseFloat(str);
      if (!isNaN(num)) {
        return num;
      }
    }

    // Manual conversion for Prisma Decimal format: { s: sign, e: exponent, d: [digits] }
    if ("s" in value && "e" in value && "d" in value) {
      const sign = value.s || 1;
      const exponent = value.e || 0;
      const digits = value.d || [];

      if (digits.length === 0) {
        return null;
      }

      // Convert digits array to integer
      const numStr = digits.join("");
      const integerValue = parseFloat(numStr);

      // Prisma Decimal format (decimal.js internal representation):
      // The exponent represents the position relative to the first digit
      // Formula: value = sign * integerValue * 10^(exponent - digits.length)
      //
      // However, there's a known issue: if the value is stored as a whole number
      // but with trailing zeros, the exponent might be 0.
      // Example: 1.00 might be stored as { s: 1, e: 0, d: [1,0,0] } = 0.100 (WRONG)
      // Or as { s: 1, e: 1, d: [1,0,0] } = 1.00 (CORRECT)
      //
      // To handle this, we need to check: if exponent is 0 and digits.length > 1,
      // and the first digit is non-zero, it might actually be a whole number.
      // But this is unreliable, so we'll use the formula as-is.
      //
      // Actually, the correct interpretation is:
      // - exponent tells us how many digits are before the decimal point
      // - So if e = 1 and d = [1], that's "1" (1 digit before decimal)
      // - If e = 0 and d = [1,0], that's "0.10" (0 digits before decimal, so it's 0.10)
      //
      // The formula: value = sign * integerValue * 10^(exponent - digits.length)
      const decimalShift = exponent - digits.length;
      let num = integerValue * Math.pow(10, decimalShift) * sign;

      // Round to 2 decimal places to avoid floating point issues
      num = Math.round(num * 100) / 100;

      return isNaN(num) ? null : num;
    }

    // If it has a toNumber method (Decimal.js)
    if (typeof value.toNumber === "function") {
      return value.toNumber();
    }

    // If it has a toString method, try parsing
    if (typeof value.toString === "function") {
      const str = value.toString();
      const num = parseFloat(str);
      return isNaN(num) ? null : num;
    }
  }

  // If it's a BigInt
  if (typeof value === "bigint") {
    return Number(value);
  }

  // If it's a string, try parsing
  if (typeof value === "string") {
    const num = parseFloat(value);
    return isNaN(num) ? null : num;
  }

  return null;
}

/**
 * Format price as currency (EUR)
 * Handles Decimal/BigInt conversion automatically
 * @param price - Price in EUR (number, Decimal, BigInt, or null/undefined)
 * @returns Formatted price string or "-" if invalid
 */
export function formatPrice(price: number | unknown): string {
  const numPrice = typeof price === "number" ? price : convertPriceToNumber(price);

  if (numPrice === null || numPrice === undefined || isNaN(numPrice)) {
    return "-";
  }

  // Format with period as decimal separator (US format) instead of comma (IT format)
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numPrice);
}

