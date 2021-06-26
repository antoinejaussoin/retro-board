#!/usr/bin/env sh
set -eu

envsubst '${BACKEND_HOST} ${BACKEND_PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Replacing Google Analytics and Sentry IDs. Separator is # because the sentry URL contains a /
sed -i "s#NO_GA#${GA_ID:-}#g" /usr/share/nginx/html/index.html
sed -i "s#NO_SENTRY#${SENTRY_URL:-}#g" /usr/share/nginx/html/index.html
sed -i "s#NO_GIPHY#${GIPHY_API_KEY:-}#g" /usr/share/nginx/html/index.html
sed -i "s#NO_STRIPE#${STRIPE_KEY:-}#g" /usr/share/nginx/html/index.html
sed -i "s#NO_DEFAULT_LANGUAGE#${DEFAULT_LANGUAGE:-en}#g" /usr/share/nginx/html/index.html

exec "$@"