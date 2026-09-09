#!/usr/bin/env bash

cd /backend
python wait-for-postgres.py

./manage.py migrate||exit 1
#./manage.py collectstatic --no-input||exit 1
cp -avx static_tmp/* static/

gunicorn -b 127.0.0.1:${DJANGO_PORT:-8000} --workers=3 tba3_nk.wsgi||exit 1
