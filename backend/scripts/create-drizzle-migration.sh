#!/usr/bin/env sh
# Create a new Drizzle migration
# Usage: yarn create-migration <migration-name>
./node_modules/.bin/drizzle-kit generate --name $1
