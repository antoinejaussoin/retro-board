#!/usr/bin/env sh
./node_modules/.bin/typeorm-ts-node-commonjs -d src/db/index.ts migration:create src/db/migrations/$1