# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Install all dependencies (including dev dependencies for build)
COPY package.json package-lock.json* ./
RUN npm ci --prefer-offline --no-audit && \
    npm cache clean --force

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build arguments for environment variables (required for Dokploy)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_FRONTEND_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_FRONTEND_URL=$NEXT_PUBLIC_FRONTEND_URL

# Build the application with optimizations
# Using --no-lint to skip linting during build for faster builds
RUN npm run build && \
    npm cache clean --force && \
    rm -rf node_modules

# Stage 3: Production
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install curl for healthcheck (lightweight)
RUN apk add --no-cache curl

# Don't run as root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output from builder
# The standalone folder contains server.js and required node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Use node with optimizations
CMD ["node", "--max-old-space-size=512", "server.js"]
