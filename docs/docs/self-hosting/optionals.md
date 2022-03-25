# 🎚 Optional Settings

In addition to the basic `docker-compose.yml` file you can [build here](quick-start), you can also add optional configuration options.

These will allow you to add:

- [OAuth authentication](oauth) (logging via Google, GitHub, etc.)
- [SendGrid](sendgrid) (emails)
- Sentry (error reporting)
- Google Analytics
- Change the default language (for new users)
- Log SQL queries on the backend

:::info Pick & Choose!
You don't have to use all of these settings, just add the ones you actually need to your existing `docker-compose.yml` file.
:::

```yaml
version: '3'
services:
  backend:
    image: retrospected/backend:latest
    depends_on:
      - redis
    environment:
      # -- Change Recommended --
      LICENCE_KEY: # This must be provided if you self-host Retrospected. Obtain a licence at https://www.retrospected.com/subscribe?product=self-hosted.
      SELF_HOSTED: 'true' # This will make any account "Pro", but only works with a valid LICENCE_KEY
      SELF_HOSTED_ADMIN: your@email.com # Enter an admin email here. This person will be the only one able to reset passwords for your organisation.
      DB_USER: postgres # Must be the same as POSTGRES_USER above
      DB_PASSWORD: postgres # Must be the same as POSTGRES_PASSWORD above
      SESSION_SECRET: changeme # Session secret. Can be anything you want, but change the default value

      # -- Optional --
      REDIS_ENABLED: 'true' # Whether to enable Redis
      REDIS_FOR_SOCKETIO_ENABLED: 'false' # Whether Socket.IO uses Redis (set to true when using more than 1 backend replica)
      REDIS_PORT: 6379 # Should match the Redis port
      REDIS_HOST: redis # Must be the name of the Redis service above
      SENTRY_URL: '' # Optional, Sentry URL (https://1234567890abcdef12345@sentry.io/1234567)
      BASE_URL: http://localhost:80 # This must be the URL of the frontend app once deployed. Only useful if you need OAuth, SendGrid or Stripe
      SECURE_COOKIES: 'false' # You can set this to true if you are using HTTPS. This is more secure.
      DISABLE_ANONYMOUS_LOGIN: 'false' # Set to true to disable anonymous accounts

      # -- OAuth: Set these to enable OAuth authentication for one or more provider. This is optional. --
      TWITTER_KEY:
      TWITTER_SECRET:
      GOOGLE_KEY:
      GOOGLE_SECRET:
      GITHUB_KEY:
      GITHUB_SECRET:
      SLACK_KEY:
      SLACK_SECRET:
      MICROSOFT_KEY:
      MICROSOFT_SECRET:
      OKTA_AUDIENCE:
      OKTA_KEY:
      OKTA_SECRET:

      # -- Do not change --
      NODE_ENV: production
      DB_NAME: retroboard # Must be the same as POSTGRES_DB above
      DB_HOST: postgres # Must be the name of the Postgres service above
      DB_PORT: 5432 # Don't change this.
      BACKEND_PORT: 3201 # Don't change this (or change it in nginx.conf as well)
      SQL_LOG: 'false' # Whether to log SQL queries in the console
      SENDGRID_API_KEY: # Used for Sendgrid email reminders
      SENDGRID_SENDER: # Email to be used as the sender for emails
      SENDGRID_VERIFICATION_EMAIL_TID: # Verification email template ID
      SENDGRID_RESET_PASSWORD_TID: # Reset password email template ID
      SENDGRID_SELF_HOST_EMAIL_TID: # Self host welcome email template ID
      STRIPE_SECRET: # Stripe payment account secret
      STRIPE_WEBHOOK_SECRET: # Stripe webhook secret
      STRIPE_TEAM_PRODUCT: # Stripe product information
      STRIPE_TEAM_PRICE: # Stripe product information
      STRIPE_UNLIMITED_PRODUCT: # Stripe product information
      STRIPE_UNLIMITED_PRICE: # Stripe product information
      STRIPE_SELF_HOSTED_PRODUCT: # Stripe product information
      STRIPE_SELF_HOSTED_URL_GBP: # Stripe payment page for Self Hosting
      STRIPE_SELF_HOSTED_URL_EUR: # Stripe payment page for Self Hosting
      STRIPE_SELF_HOSTED_URL_USD: # Stripe payment page for Self Hosting
      RATE_LIMIT_WINDOW: 900000 # Rate Limiting window size for expensive requests (in ms)
      RATE_LIMIT_MAX: 500 # Rate Limiting max requests per window
      RATE_LIMIT_WS_POINTS: 600 # Websocket rate limiting, max messages per duration
      RATE_LIMIT_WS_DURATION: 60 # Websocket rate limiting, window duration (in seconds)
      WS_MAX_BUFFER_SIZE: 10000 # Max websocket message size in bytes

    restart: unless-stopped
    logging:
      driver: 'json-file'
      options:
        max-size: '50m'

  frontend:
    image: retrospected/frontend:latest
    depends_on:
      - backend
    ports:
      - '80:80' # Change the first 80 to whatever port you want to access Retrospected from
    environment:
      # -- Optional --
      GA_ID: '' # Optional, Google Analytics ID (UA-1234456-7)
      SENTRY_URL: '' # Optional, Sentry URL (https://1234567890abcdef12345@sentry.io/1234567)
      GIPHY_API_KEY: '' # Optional, can be obtained here: https://developers.giphy.com/
      DEFAULT_LANGUAGE: 'en' # Set the default language for new users

      # -- Do Not Change --
      BACKEND_HOST: backend # This should be the name of the backend service
      BACKEND_PORT: 3201 # This should be the same as BACKEND_PORT on backend
      STRIPE_KEY: '' # Stripe publishable key (for frontend)

    restart: unless-stopped
    logging:
      driver: 'json-file'
      options:
        max-size: '50m'

  redis:
    image: redis:latest
    depends_on:
      - postgres
    restart: unless-stopped
    logging:
      driver: 'json-file'
      options:
        max-size: '50m'

  postgres:
    image: postgres:11.6
    hostname: postgres
    environment:
      #  -- Change Recommended --
      POSTGRES_PASSWORD: postgres # Must be the same as DB_PASSWORD below

      # -- Optional --
      POSTGRES_USER: postgres # Must be the same as DB_USER below
      POSTGRES_DB: retroboard # Must be the same as DB_NAME below
    volumes:
      - database:/var/lib/postgresql/data
    restart: unless-stopped
    logging:
      driver: 'json-file'
      options:
        max-size: '50m'

  pgadmin:
    image: dpage/pgadmin4:4.15 # use biarms/pgadmin4 on ARM
    depends_on:
      - postgres
    ports:
      - '8080:80' # Change the first 8080 to whatever port you want to access pgAdmin from
    environment:
      # -- Change Recommended --
      PGADMIN_DEFAULT_EMAIL: admin@retrospected.com # Can be any email or username. This is used to access PGAdmin.
      PGADMIN_DEFAULT_PASSWORD: admin # Please change this!
    volumes:
      - pgadmin:/var/lib/pgadmin
    restart: unless-stopped
    logging:
      driver: 'json-file'
      options:
        max-size: '50m'

volumes:
  database:
  pgadmin:
```
