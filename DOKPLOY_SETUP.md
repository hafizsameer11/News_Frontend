# Dokploy Setup Guide

This guide explains how to deploy the News Frontend application on Dokploy.

## Performance Optimizations Applied

The following performance optimizations have been implemented:

1. **Next.js Configuration**:
   - Compression enabled (gzip)
   - SWC minification
   - Optimized CSS
   - Package import optimization
   - Aggressive caching headers for static assets

2. **Font Loading**:
   - Font display swap to prevent invisible text
   - Fallback fonts configured
   - Only primary font preloaded

3. **Docker Optimizations**:
   - Multi-stage build for smaller image size
   - Node memory optimization
   - Healthcheck with curl

4. **Caching Strategy**:
   - Static assets cached for 1 year
   - Images cached for 1 year
   - API responses cached with ISR (60s-1h revalidation)

## Deployment on Dokploy

**Important**: Dokploy only uses the `Dockerfile` (not docker-compose.yml). The `docker-compose.yml` file is only for local development.

### Using Dockerfile with Dokploy

Dokploy will automatically use the `Dockerfile` and `dokploy.json` configuration.

**Required Environment Variables** (set in Dokploy dashboard):
- `NEXT_PUBLIC_API_URL` - Your backend API URL (e.g., `https://news-backend.hmstech.org/api/v1`)
- `NEXT_PUBLIC_FRONTEND_URL` - Your frontend URL (e.g., `https://www.pehoxu.cc`)

These are used as both **build arguments** (during Docker build) and **runtime environment variables**.

**Optional Environment Variables**:
- `NEXT_PUBLIC_CDN_URL` - CDN URL for images (if using CDN)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe key
- `NEXT_PUBLIC_TINYMCE_API_KEY` - TinyMCE key
- Other social media and contact URLs

## Dokploy Configuration

The `dokploy.json` file contains the configuration for Dokploy:

```json
{
  "name": "news-frontend",
  "type": "dockerfile",
  "dockerfile": "Dockerfile",
  "buildContext": ".",
  "port": 3000,
  "env": {
    "NODE_ENV": "production",
    "NEXT_TELEMETRY_DISABLED": "1"
  },
  "buildArgs": {
    "NEXT_PUBLIC_API_URL": "${NEXT_PUBLIC_API_URL}",
    "NEXT_PUBLIC_FRONTEND_URL": "${NEXT_PUBLIC_FRONTEND_URL}"
  },
  "healthcheck": {
    "path": "/",
    "interval": 30,
    "timeout": 10,
    "retries": 3,
    "startPeriod": 40
  },
  "restartPolicy": "unless-stopped"
}
```

## Performance Monitoring

After deployment, monitor these metrics:

1. **First Contentful Paint (FCP)**: Should be < 1.8s
2. **Largest Contentful Paint (LCP)**: Should be < 2.5s
3. **Total Blocking Time (TBT)**: Should be < 200ms
4. **Cumulative Layout Shift (CLS)**: Should be < 0.1
5. **Server Response Time**: Should be < 600ms

## Troubleshooting

### Slow Server Response

If server response time is high (> 1s):

1. Check backend API response times
2. Ensure proper caching is enabled
3. Verify CDN is configured (if using)
4. Check server resources (CPU/Memory)

### High Layout Shift (CLS)

1. Ensure images have width/height attributes
2. Check for dynamically injected content
3. Verify font loading is optimized

### Poor Performance Score

1. Enable compression (already done in next.config.ts)
2. Minimize JavaScript bundles (already optimized)
3. Optimize images (WebP/AVIF enabled)
4. Use CDN for static assets
5. Enable HTTP/2 or HTTP/3

## Additional Optimizations

For even better performance:

1. **Use a CDN**: Configure `NEXT_PUBLIC_CDN_URL` for image CDN
2. **Enable HTTP/2**: Configure at reverse proxy level (Nginx/Traefik)
3. **Use Edge Functions**: For API routes that can be edge-cached
4. **Database Connection Pooling**: Optimize backend API connections
5. **Redis Caching**: Add Redis for API response caching

## Build and Deploy

### On Dokploy

1. Upload your project to Dokploy
2. Set environment variables in Dokploy dashboard
3. Dokploy will automatically use `Dockerfile` and `dokploy.json`
4. Deploy!

### Local Testing (Before Deploying)

```bash
# Build the Docker image with build args
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://your-backend-api.com/api/v1 \
  --build-arg NEXT_PUBLIC_FRONTEND_URL=https://your-frontend-domain.com \
  -t news-frontend .

# Run locally for testing
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://your-backend-api.com/api/v1 \
  -e NEXT_PUBLIC_FRONTEND_URL=https://your-frontend-domain.com \
  news-frontend
```

## Notes

- **Dokploy only uses Dockerfile** - The app is served via Node.js server (NOT static files)
- **Serving Method**: Node.js server enables SSR/ISR, API routes, and dynamic routes
- **NOT static export**: Uses `output: "standalone"` which creates a Node.js server
- The Dockerfile uses multi-stage builds for optimal image size (~200MB final image)
- Standalone output is enabled for minimal runtime dependencies
- Healthcheck uses curl (included in Alpine image)
- Node memory is limited to 512MB to prevent OOM issues
- All performance optimizations are baked into the build via `next.config.ts`

