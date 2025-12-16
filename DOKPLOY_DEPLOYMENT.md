# Dokploy Deployment Guide

Since Dokploy only uses the Dockerfile (not docker-compose), this guide focuses on Dockerfile-based deployment.

## Quick Start

1. **Upload your project** to Dokploy
2. **Set environment variables** in Dokploy dashboard:
   - `NEXT_PUBLIC_API_URL` (required) - e.g., `https://news-backend.hmstech.org/api/v1`
   - `NEXT_PUBLIC_FRONTEND_URL` (required) - e.g., `https://www.pehoxu.cc`
3. **Configure build arguments** (Dokploy will use `dokploy.json`):
   - These are passed as build args to Dockerfile
   - Same values as environment variables above
4. **Deploy** - Dokploy will build using the Dockerfile

## Dockerfile Optimizations

The Dockerfile is optimized for performance:

✅ **Multi-stage build** - Smaller final image (~200MB vs ~1GB)
✅ **Alpine Linux** - Minimal base image
✅ **Standalone output** - Only production dependencies
✅ **Memory optimization** - Node.js limited to 512MB
✅ **Healthcheck ready** - Includes curl for health checks
✅ **Non-root user** - Runs as `nextjs` user for security

## Environment Variables

### Required (Build Args + Runtime Env)
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_FRONTEND_URL` - Frontend URL

### Optional (Runtime Env)
- `NEXT_PUBLIC_CDN_URL` - CDN URL for images
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe key
- `NEXT_PUBLIC_TINYMCE_API_KEY` - TinyMCE key
- Other social media/contact URLs

## Dokploy Configuration

The `dokploy.json` file is automatically used by Dokploy:

```json
{
  "name": "news-frontend",
  "type": "dockerfile",
  "dockerfile": "Dockerfile",
  "buildContext": ".",
  "port": 3000,
  "env": {
    "NODE_ENV": "production",
    "NEXT_TELEMETRY_DISABLED": "1",
    "PORT": "3000",
    "HOSTNAME": "0.0.0.0"
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

## Build Process

When Dokploy builds your app:

1. **Stage 1 (deps)**: Installs all npm dependencies
2. **Stage 2 (builder)**: Builds Next.js app with optimizations
3. **Stage 3 (runner)**: Creates minimal production image

The final image only contains:
- Node.js runtime
- Standalone Next.js server
- Static assets
- Public files

## Performance Features

All performance optimizations are baked into the build:

- ✅ Compression (gzip)
- ✅ SWC minification
- ✅ CSS optimization
- ✅ Package tree-shaking
- ✅ Image optimization (WebP/AVIF)
- ✅ Aggressive caching headers
- ✅ Font optimization

## Health Check

Dokploy will use the healthcheck configuration:
- **Path**: `/`
- **Interval**: 30 seconds
- **Timeout**: 10 seconds
- **Retries**: 3
- **Start Period**: 40 seconds (allows time for initial startup)

The Dockerfile includes `curl` for health checks.

## Troubleshooting

### Build Fails

1. Check build logs in Dokploy
2. Verify environment variables are set
3. Ensure `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_FRONTEND_URL` are provided

### App Won't Start

1. Check container logs in Dokploy
2. Verify port 3000 is exposed
3. Check environment variables are correct
4. Verify backend API is accessible

### Slow Performance

1. Check backend API response times
2. Verify CDN is configured (if using)
3. Monitor server resources (CPU/Memory)
4. Check Dockerfile build cache is working

### Health Check Fails

1. Verify app is listening on port 3000
2. Check if app is fully started (wait for start period)
3. Verify healthcheck path is correct (`/`)

## Manual Testing

Test the Dockerfile locally before deploying:

```bash
# Build with build args
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://news-backend.hmstech.org/api/v1 \
  --build-arg NEXT_PUBLIC_FRONTEND_URL=https://www.pehoxu.cc \
  -t news-frontend .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://news-backend.hmstech.org/api/v1 \
  -e NEXT_PUBLIC_FRONTEND_URL=https://www.pehoxu.cc \
  news-frontend

# Test healthcheck
curl http://localhost:3000/
```

## Notes

- **docker-compose.yml** is not used by Dokploy - it's only for local development
- The Dockerfile is optimized for production
- All performance optimizations are in `next.config.ts` and applied during build
- The final image is minimal (~200MB) for faster deployments

## Expected Performance

After deployment, you should see:
- Performance score: 70-85 (up from 35)
- Server response: < 600ms (down from 1072ms)
- FCP: < 1.8s (down from 3.0s)
- LCP: < 2.5s (down from 3.4s)

