# Fixing MIME Type Errors for Next.js Static Assets

## Problem
The browser is reporting MIME type errors:
- CSS files served as `text/plain` instead of `text/css`
- JavaScript files served as `text/plain` instead of `application/javascript`
- 500 Internal Server Errors when loading chunks

## Root Cause
This is typically caused by a reverse proxy (nginx/Apache) that is:
1. Not configured with correct MIME types
2. Overriding the Content-Type headers from Next.js
3. Missing the proper MIME type mappings

## Solution

### Option 1: Fix Nginx Configuration (Recommended)

If you're using nginx as a reverse proxy, update your nginx configuration:

1. **Add MIME type mappings** in your nginx config:
```nginx
types {
    text/css css;
    application/javascript js;
    application/json json;
    image/svg+xml svg;
    font/woff2 woff2;
    font/woff woff;
    font/ttf ttf;
    font/eot eot;
}

default_type application/octet-stream;
```

2. **Ensure static assets are proxied correctly**:
```nginx
location /_next/static/ {
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
    
    # Don't override Content-Type - let Next.js set it
    proxy_hide_header Content-Type;
    proxy_pass_header Content-Type;
}
```

3. **Or explicitly set Content-Type for specific file types**:
```nginx
location ~ \.css$ {
    add_header Content-Type "text/css; charset=utf-8" always;
    proxy_pass http://localhost:3000;
}

location ~ \.js$ {
    add_header Content-Type "application/javascript; charset=utf-8" always;
    proxy_pass http://localhost:3000;
}
```

See `nginx.conf.example` for a complete configuration example.

### Option 2: Fix Apache Configuration

If you're using Apache, add to your `.htaccess` or virtual host config:

```apache
<IfModule mod_mime.c>
    AddType text/css .css
    AddType application/javascript .js
    AddType application/json .json
    AddType image/svg+xml .svg
    AddType font/woff2 .woff2
    AddType font/woff .woff
    AddType font/ttf .ttf
</IfModule>

# Don't override Content-Type headers from Next.js
Header unset Content-Type
Header append Content-Type "text/css" env=CSS
Header append Content-Type "application/javascript" env=JS
```

### Option 3: Check Next.js Server

If you're running Next.js directly (no reverse proxy), the issue might be:

1. **Rebuild the application**:
```bash
cd /var/www/frontend
npm run build
```

2. **Restart the server**:
```bash
# If using PM2
pm2 restart nextjs

# If using Docker
docker-compose restart frontend

# If using systemd
sudo systemctl restart nextjs
```

3. **Clear Next.js cache**:
```bash
rm -rf .next
npm run build
```

### Option 4: Check Dokploy/Server Configuration

If using Dokploy or a similar platform:

1. **Check if there's a reverse proxy** in front of your Docker container
2. **Verify the Docker container** is exposing port 3000 correctly
3. **Check Dokploy's nginx configuration** (if it uses nginx)
4. **Review server logs** for errors:
```bash
# Docker logs
docker logs <container-name>

# Next.js logs
# Check your deployment platform's logs
```

## Verification

After applying the fix:

1. **Clear browser cache** (Ctrl+Shift+Delete or Cmd+Shift+Delete)
2. **Hard refresh** the page (Ctrl+F5 or Cmd+Shift+R)
3. **Check browser console** - MIME type errors should be gone
4. **Check Network tab** - verify Content-Type headers are correct:
   - CSS files should show `text/css`
   - JS files should show `application/javascript`

## Testing

Test the static assets directly:
```bash
# Test CSS file
curl -I https://tgcalabriareport.com/_next/static/chunks/0a0050964526ce71.css

# Should return:
# Content-Type: text/css; charset=utf-8

# Test JS file
curl -I https://tgcalabriareport.com/_next/static/chunks/1985be302c0aff22.js

# Should return:
# Content-Type: application/javascript; charset=utf-8
```

## Next.js Configuration

The `next.config.ts` already includes Content-Type headers, but these might be overridden by the reverse proxy. The headers configuration has been updated to prioritize CSS and JS files.

## Additional Notes

- **500 Internal Server Errors**: These might be caused by the MIME type issues preventing proper chunk loading
- **Font preload warnings**: These are less critical but can be fixed by ensuring proper MIME types for font files
- **Cache issues**: After fixing MIME types, you may need to clear CDN/proxy cache if using one

