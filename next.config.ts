import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // Ignore TypeScript errors during build
    ignoreBuildErrors: true,
  },
  images: {
    // Enable automatic WebP conversion (default in Next.js 16)
    formats: ["image/avif", "image/webp"],
    // Image quality (1-100, default is 75)
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Supported quality values (must include all qualities used in Image components)
    qualities: [75, 85, 90],
    // Minimum quality for optimized images
    minimumCacheTTL: 60,
    // CDN configuration (if CDN_URL is set in environment)
    ...(process.env.NEXT_PUBLIC_CDN_URL && {
      loader: "custom",
      loaderFile: "./src/lib/utils/imageLoader.ts",
    }),
    remotePatterns: [
      // Local development - localhost with port (must be first for proper matching)
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
        pathname: "/uploads/**",
      },
      // Local development - 127.0.0.1 with port
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "3001",
        pathname: "/uploads/**",
      },
      // Production domain
      {
        protocol: "https",
        hostname: "www.pehoxu.cc",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "www.pehoxu.cc",
        pathname: "/**",
      },
      // Allow any external image (for flexibility - you can restrict this in production)
      // Note: These wildcard patterns are at the end to avoid interfering with specific patterns
      {
        protocol: "https",
        hostname: "**",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "**",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
