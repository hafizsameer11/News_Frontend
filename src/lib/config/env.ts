/**
 * Environment variable validation and configuration
 * Validates required environment variables at build time
 */

interface EnvConfig {
  // Required
  NEXT_PUBLIC_API_URL: string;
  NEXT_PUBLIC_FRONTEND_URL: string;

  // Optional
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string;
  NEXT_PUBLIC_TINYMCE_API_KEY?: string;
  NEXT_PUBLIC_CDN_URL?: string;
  NEXT_PUBLIC_BYPASS_PAYMENT?: string;

  // Social Media URLs (optional)
  NEXT_PUBLIC_FACEBOOK_URL?: string;
  NEXT_PUBLIC_TWITTER_URL?: string;
  NEXT_PUBLIC_INSTAGRAM_URL?: string;
  NEXT_PUBLIC_YOUTUBE_URL?: string;
  NEXT_PUBLIC_LINKEDIN_URL?: string;

  // Contact Information (optional)
  NEXT_PUBLIC_CONTACT_EMAIL?: string;
  NEXT_PUBLIC_CONTACT_PHONE?: string;
}

function getEnvVar(key: keyof EnvConfig, required: boolean = false): string | undefined {
  const value = process.env[key];

  if (required && !value) {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
      `Please set this variable in your .env file or environment.`
    );
  }

  return value;
}

function validateEnv(): EnvConfig {
  return {
    NEXT_PUBLIC_API_URL: getEnvVar("NEXT_PUBLIC_API_URL", true) || "",
    NEXT_PUBLIC_FRONTEND_URL: getEnvVar("NEXT_PUBLIC_FRONTEND_URL", true) || "",
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: getEnvVar("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"),
    NEXT_PUBLIC_TINYMCE_API_KEY: getEnvVar("NEXT_PUBLIC_TINYMCE_API_KEY"),
    NEXT_PUBLIC_CDN_URL: getEnvVar("NEXT_PUBLIC_CDN_URL"),
    NEXT_PUBLIC_BYPASS_PAYMENT: getEnvVar("NEXT_PUBLIC_BYPASS_PAYMENT"),
    NEXT_PUBLIC_FACEBOOK_URL: getEnvVar("NEXT_PUBLIC_FACEBOOK_URL"),
    NEXT_PUBLIC_TWITTER_URL: getEnvVar("NEXT_PUBLIC_TWITTER_URL"),
    NEXT_PUBLIC_INSTAGRAM_URL: getEnvVar("NEXT_PUBLIC_INSTAGRAM_URL"),
    NEXT_PUBLIC_YOUTUBE_URL: getEnvVar("NEXT_PUBLIC_YOUTUBE_URL"),
    NEXT_PUBLIC_LINKEDIN_URL: getEnvVar("NEXT_PUBLIC_LINKEDIN_URL"),
    NEXT_PUBLIC_CONTACT_EMAIL: getEnvVar("NEXT_PUBLIC_CONTACT_EMAIL"),
    NEXT_PUBLIC_CONTACT_PHONE: getEnvVar("NEXT_PUBLIC_CONTACT_PHONE"),
  };
}

// Validate environment variables (only in production build)
if (typeof window === "undefined" && process.env.NODE_ENV === "production") {
  try {
    validateEnv();
  } catch (error) {
    console.error("Environment validation failed:", error);
    // In production, we want to fail the build if required vars are missing
    if (process.env.NODE_ENV === "production") {
      throw error;
    }
  }
}

export const env = validateEnv();

