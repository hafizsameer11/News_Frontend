# Troubleshooting 500 Errors for Next.js Chunks

## Problem
Getting 500 Internal Server Errors when loading Next.js static chunks:
- `/_next/static/chunks/534cec8a3ed577ee.js` - 500 error
- `/_next/static/chunks/4c90138759070e2b.js` - 500 error
- MIME type errors (text/plain instead of application/javascript)

## Root Causes

### 1. Server Configuration Issue
The reverse proxy (nginx/Apache) might be:
- Not properly proxying requests to Next.js server
- Returning 500 errors for chunk files
- Not configured to handle Next.js static assets

### 2. Next.js Server Not Running
The Next.js server might not be running or crashed.

### 3. Build Cache Issues
The `.next` folder might have corrupted cache.

## Solutions

### Solution 1: Check Next.js Server Status

```bash
# Check if the server is running
docker ps | grep frontend
# or
pm2 list
# or
systemctl status nextjs
```

### Solution 2: Restart the Server

```bash
# If using Docker
docker restart <container-name>

# If using PM2
pm2 restart nextjs

# If using systemd
sudo systemctl restart nextjs

# If running directly
cd /var/www/frontend
npm start
```

### Solution 3: Rebuild the Application

```bash
cd /var/www/frontend

# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build

# Restart server
npm start
# or restart your process manager
```

### Solution 4: Check Server Logs

```bash
# Docker logs
docker logs <container-name> --tail 100

# PM2 logs
pm2 logs nextjs --lines 100

# Systemd logs
journalctl -u nextjs -n 100

# Next.js server logs (if running directly)
# Check the terminal where npm start is running
```

### Solution 5: Verify Nginx/Apache Configuration

If using a reverse proxy, ensure it's properly configured:

**Nginx:**
```nginx
location /_next/static/ {
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # Don't override Content-Type
    proxy_pass_header Content-Type;
    
    # Cache headers
    add_header Cache-Control "public, max-age=31536000, immutable" always;
}
```

**Apache:**
```apache
<Location "/_next/static/">
    ProxyPass http://localhost:3000/_next/static/
    ProxyPassReverse http://localhost:3000/_next/static/
    ProxyPreserveHost On
</Location>
```

### Solution 6: Check File Permissions

```bash
# Ensure Next.js has read access to .next folder
cd /var/www/frontend
chmod -R 755 .next
chown -R $(whoami) .next
```

### Solution 7: Check Disk Space

```bash
# Check if disk is full
df -h

# Check .next folder size
du -sh /var/www/frontend/.next
```

### Solution 8: Verify Environment Variables

```bash
# Check if required env vars are set
echo $NEXT_PUBLIC_API_URL
echo $NEXT_PUBLIC_FRONTEND_URL

# If using Docker, check env vars in container
docker exec <container-name> env | grep NEXT_PUBLIC
```

### Solution 9: Test Direct Access

Test if the Next.js server is responding:

```bash
# Test if server is accessible
curl -I http://localhost:3000/_next/static/chunks/534cec8a3ed577ee.js

# Check response headers
curl -v http://localhost:3000/_next/static/chunks/534cec8a3ed577ee.js 2>&1 | grep -i "content-type\|http"
```

### Solution 10: Clear Browser Cache

Sometimes the browser cache can cause issues:
1. Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
2. Clear browser cache completely
3. Try in incognito/private mode

## Quick Fix Checklist

1. ✅ **Rebuild the application**: `npm run build`
2. ✅ **Restart the server**: Restart your Docker container/PM2/systemd service
3. ✅ **Check server logs**: Look for errors in server logs
4. ✅ **Verify reverse proxy**: Ensure nginx/Apache is properly configured
5. ✅ **Test direct access**: Try accessing chunks directly on port 3000
6. ✅ **Check file permissions**: Ensure .next folder is readable
7. ✅ **Clear browser cache**: Hard refresh or clear cache

## Common Issues

### Issue: Chunks return 404
**Solution**: Rebuild the application - chunks might be missing

### Issue: Chunks return 500 with "Cannot GET"
**Solution**: Next.js server might not be running or crashed

### Issue: Chunks return 500 with MIME type errors
**Solution**: Server configuration issue - see nginx.conf.example

### Issue: Chunks load but application doesn't work
**Solution**: Browser cache issue - clear cache and hard refresh

## Next Steps

If none of these solutions work:
1. Check the server logs for specific error messages
2. Verify the Next.js server is actually running and accessible
3. Test accessing the chunks directly (bypassing reverse proxy)
4. Check if there are any firewall or network issues
5. Review the deployment platform (Dokploy) logs if applicable

