#!/bin/sh

echo "==> Running migrations..."
python manage.py migrate --noinput || echo "WARNING: migrate failed, skipping"

echo "==> Seeding schemes..."
python manage.py seed_schemes || echo "WARNING: seed failed, skipping"

echo "==> Starting gunicorn..."
exec gunicorn backend.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 1 \
    --timeout 120 \
    --preload \
    --max-requests 500
