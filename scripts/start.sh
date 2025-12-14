#!/bin/sh
set -e

echo "🚀 Starting NEWS NEXT Backend..."

# Wait for database to be ready (optional, useful for Docker Compose)
if [ -n "$WAIT_FOR_DB" ]; then
  echo "⏳ Waiting for database to be ready..."
  until nc -z ${DB_HOST:-db} ${DB_PORT:-3306}; do
    echo "⏳ Database is unavailable - sleeping"
    sleep 1
  done
  echo "✅ Database is ready!"
fi

# Generate Prisma Client first (required for app to run)
echo "📦 Generating Prisma Client..."
npx prisma generate || {
  echo "⚠️  Failed to generate Prisma Client, continuing anyway..."
}

# Run Prisma migrations (non-blocking - app will retry connection)
echo "📦 Running database migrations..."
npx prisma migrate deploy || {
  echo "⚠️  Migration deploy failed (this is OK if migrations already applied or DB not ready)"
}

# Start the application with path alias resolution
echo "🚀 Starting application..."
exec node -r tsconfig-paths/register dist/server.js

