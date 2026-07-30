#!/bin/sh
set -e

echo "==> Running migrations..."
python manage.py migrate --noinput

echo "==> Seeding schemes..."
python manage.py seed_schemes

echo "==> Starting gunicorn..."
exec gunicorn backend.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 1 \
    --timeout 120 \
    --preload \
    --max-requests 500
