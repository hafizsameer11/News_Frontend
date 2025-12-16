import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone", // Enable standalone output for Docker (required for Dokploy)
  typescript: {
    // Ignore TypeScript errors during build
    ignoreBuildErrors: true,
  },
  // Performance optimizations (only in production)
  compress: true, // Enable gzip compression (always enabled for production builds)
  poweredByHeader: false, // Remove X-Powered-By header
  reactStrictMode: !isDev, // Disable in dev to avoid double renders (slower)
  // Note: swcMinify is deprecated in Next.js 16 - SWC minification is enabled by default
  
  // Experimental optimizations (only in production)
  ...(!isDev && {
    experimental: {
      optimizeCss: true, // Optimize CSS (disabled in dev)
      optimizePackageImports: [
        "@tanstack/react-query",
        "recharts",
        "@dnd-kit/core",
        "@dnd-kit/sortable",
        "@dnd-kit/utilities",
      ], // Tree-shake unused exports from these packages
    },
  }),

  // Headers for caching and performance (only in production)
  ...(!isDev && {
    async headers() {
      return [
        {
          source: "/:path*",
          headers: [
            {
              key: "X-DNS-Prefetch-Control",
              value: "on",
            },
            {
              key: "X-Frame-Options",
              value: "SAMEORIGIN",
            },
            {
              key: "X-Content-Type-Options",
              value: "nosniff",
            },
            {
              key: "Referrer-Policy",
              value: "origin-when-cross-origin",
            },
          ],
        },
        {
          // Cache static assets aggressively
          source: "/_next/static/:path*",
          headers: [
            {
              key: "Cache-Control",
              value: "public, max-age=31536000, immutable",
            },
          ],
        },
        {
          // Cache images
          source: "/_next/image/:path*",
          headers: [
            {
              key: "Cache-Control",
              value: "public, max-age=31536000, immutable",
            },
          ],
        },
        {
          // Cache public assets
          source: "/:path*\\.(ico|png|jpg|jpeg|svg|gif|webp|avif|woff|woff2|ttf|eot)",
          headers: [
            {
              key: "Cache-Control",
              value: "public, max-age=31536000, immutable",
            },
          ],
        },
      ];
    },
  }),

  images: {
    // Enable automatic WebP conversion (default in Next.js 16)
    formats: ["image/avif", "image/webp"],
    // Image quality (1-100, default is 75)
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Supported quality values (must include all qualities used in Image components)
    qualities: [75, 85, 90],
    // Minimum quality for optimized images
    minimumCacheTTL: isDev ? 60 : 3600, // Shorter cache in dev, longer in production
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
      // Backend API domain
      {
        protocol: "https",
        hostname: "news-backend.hmstech.org",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "news-backend.hmstech.org",
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
