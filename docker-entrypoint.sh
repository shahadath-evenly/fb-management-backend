#!/bin/sh
set -e

echo "Applying database migrations (prisma migrate deploy)..."
npx prisma migrate deploy

echo "Ensuring the initial HQ admin account exists..."
npx prisma db seed

echo "Starting application..."
exec "$@"
