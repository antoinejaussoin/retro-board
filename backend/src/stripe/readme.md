# How to test Stripe locally

https://ngrok.com/docs/integrations/stripe/webhooks/

1. Install ngrok
1. Run `ngrok http 3000`
1. Copy the https URL
1. Go to the Stripe dashboard
1. Add the (URL to the webhook)[https://dashboard.stripe.com/test/webhooks/]
1. The url should be `https://<ngrok-url>/api/stripe/webhook`
1. Get the Stripe Webhook secret (Signing Secret)
1. Copy it into `.env` under `STRIPE_WEBHOOK_SECRET`. The file is at the root of retro-board
1. Run the backend
1. Run the frontend
1. Make a payment
1. Check the Stripe dashboard
