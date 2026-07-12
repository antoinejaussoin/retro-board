FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock ./
RUN yarn --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED 1

ARG NEXT_PUBLIC_MEASUREMENT_ID=APP_NEXT_PUBLIC_MEASUREMENT_ID
ARG NEXT_PUBLIC_APP_URL=APP_NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_GOOGLE_AD_WORDS_ID=APP_NEXT_PUBLIC_GOOGLE_AD_WORDS_ID
ARG NEXT_PUBLIC_GOOGLE_AD_WORDS_CONVERSION_ID=APP_NEXT_PUBLIC_GOOGLE_AD_WORDS_CONVERSION_ID
ARG NEXT_PUBLIC_GOOGLE_AD_WORDS_DOMAINS=APP_NEXT_PUBLIC_GOOGLE_AD_WORDS_DOMAINS
ARG NEXT_PUBLIC_COOKIE_DOMAIN=APP_NEXT_PUBLIC_COOKIE_DOMAIN
RUN yarn build

# If using npm comment out above and use below instead
# RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/docker/entrypoint.sh ./entrypoint.sh

RUN ["chmod", "+x", "/app/entrypoint.sh"]
RUN ["chown", "nextjs:nodejs", "/app"]

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000

ENTRYPOINT ["/app/entrypoint.sh"]

CMD ["node", "server.js"]