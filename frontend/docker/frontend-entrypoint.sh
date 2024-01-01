#!/usr/bin/env sh
set -eu

# Configure Nginx with backend host and port
BACKEND_HOST="${BACKEND_HOST:-backend}" \
BACKEND_PORT="${BACKEND_PORT:-3201}" \
envsubst '${BACKEND_HOST} ${BACKEND_PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Configure the frontend with environment variables
CONFIG_FILE='/usr/share/nginx/html/config.tmp'
HTML_FILE='/usr/share/nginx/html/index.html'
WPCC_FILE='./wpcc.html'
PREFIX='FRONTEND_'
FRONTEND_SELF_HOSTED="${FRONTEND_SELF_HOSTED:-true}"

echo "Self hosted: ${FRONTEND_SELF_HOSTED}"

if [ "${FRONTEND_SELF_HOSTED}" = "false" ]; then
		echo "Inserting WPCC"
		sed -i -e "/WPCC/r ${WPCC_FILE}" ${HTML_FILE}
fi

# Creates a file with the environment variables that start with FRONTEND_
echo "    window.__env__ = {" > "${CONFIG_FILE}"
jq -n 'env' | { grep "\"$PREFIX" || true; }>> "${CONFIG_FILE}"
echo "    };" >> "${CONFIG_FILE}"

# Removes the prefix from the environment variables
sed -i "s#\"${PREFIX}#    \"#g" "${CONFIG_FILE}"

# Injects the configuration file into the HTML file
sed -i -e "/RUN-TIME CONFIGURATION/r ${CONFIG_FILE}" ${HTML_FILE}

# Removes the temporary configuration file
rm $CONFIG_FILE

exec "$@"
