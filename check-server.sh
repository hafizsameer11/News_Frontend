#!/bin/bash

# Quick diagnostic script for Next.js chunk loading issues

echo "=== Next.js Server Diagnostic ==="
echo ""

# Check if .next folder exists
echo "1. Checking .next folder..."
if [ -d ".next" ]; then
    echo "   ✅ .next folder exists"
    echo "   📁 Size: $(du -sh .next | cut -f1)"
else
    echo "   ❌ .next folder not found - need to run 'npm run build'"
    exit 1
fi

# Check if chunks folder exists
echo ""
echo "2. Checking static chunks..."
if [ -d ".next/static/chunks" ]; then
    CHUNK_COUNT=$(ls -1 .next/static/chunks/*.js 2>/dev/null | wc -l)
    echo "   ✅ Chunks folder exists"
    echo "   📦 Found $CHUNK_COUNT chunk files"
    
    # Check a specific chunk file
    if [ -f ".next/static/chunks/534cec8a3ed577ee.js" ]; then
        echo "   ✅ Specific chunk file exists: 534cec8a3ed577ee.js"
    else
        echo "   ⚠️  Specific chunk file not found (might be from old build)"
    fi
else
    echo "   ❌ Chunks folder not found"
    exit 1
fi

# Check if server is running (if using Docker)
echo ""
echo "3. Checking Docker containers..."
if command -v docker &> /dev/null; then
    DOCKER_CONTAINERS=$(docker ps --filter "name=frontend" --format "{{.Names}}" 2>/dev/null)
    if [ -n "$DOCKER_CONTAINERS" ]; then
        echo "   ✅ Docker containers running:"
        echo "$DOCKER_CONTAINERS" | sed 's/^/      /'
    else
        echo "   ⚠️  No frontend Docker containers found"
    fi
fi

# Check if PM2 is running
echo ""
echo "4. Checking PM2 processes..."
if command -v pm2 &> /dev/null; then
    PM2_PROCESSES=$(pm2 list 2>/dev/null | grep -E "next|frontend" || echo "")
    if [ -n "$PM2_PROCESSES" ]; then
        echo "   ✅ PM2 processes found:"
        echo "$PM2_PROCESSES" | sed 's/^/      /'
    else
        echo "   ⚠️  No PM2 processes found"
    fi
fi

# Check if port 3000 is in use
echo ""
echo "5. Checking port 3000..."
if command -v netstat &> /dev/null; then
    PORT_CHECK=$(netstat -tuln 2>/dev/null | grep ":3000" || echo "")
    if [ -n "$PORT_CHECK" ]; then
        echo "   ✅ Port 3000 is in use:"
        echo "$PORT_CHECK" | sed 's/^/      /'
    else
        echo "   ⚠️  Port 3000 is not in use (server might not be running)"
    fi
elif command -v ss &> /dev/null; then
    PORT_CHECK=$(ss -tuln 2>/dev/null | grep ":3000" || echo "")
    if [ -n "$PORT_CHECK" ]; then
        echo "   ✅ Port 3000 is in use:"
        echo "$PORT_CHECK" | sed 's/^/      /'
    else
        echo "   ⚠️  Port 3000 is not in use (server might not be running)"
    fi
fi

# Check file permissions
echo ""
echo "6. Checking file permissions..."
if [ -r ".next/static/chunks" ]; then
    echo "   ✅ Chunks folder is readable"
else
    echo "   ❌ Chunks folder is not readable - check permissions"
fi

# Test if we can read a chunk file
if [ -f ".next/static/chunks/00058374344d51b7.js" ]; then
    if [ -r ".next/static/chunks/00058374344d51b7.js" ]; then
        echo "   ✅ Can read chunk files"
    else
        echo "   ❌ Cannot read chunk files - permission issue"
    fi
fi

echo ""
echo "=== Recommendations ==="
echo ""
echo "If chunks exist but server returns 500:"
echo "1. Restart the Next.js server"
echo "2. Check server logs for errors"
echo "3. Verify reverse proxy configuration"
echo "4. Check if reverse proxy is properly forwarding to Next.js"
echo ""
echo "To rebuild:"
echo "  npm run build"
echo ""
echo "To restart (Docker):"
echo "  docker restart <container-name>"
echo ""
echo "To restart (PM2):"
echo "  pm2 restart nextjs"
echo ""

