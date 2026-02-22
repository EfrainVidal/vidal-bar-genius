# Stripe webhook (local)

Use Stripe CLI:

1) Install and login:
   stripe login

2) Forward events to your local webhook:
   stripe listen --forward-to localhost:3000/api/billing/webhook

3) Copy the whsec_... into STRIPE_WEBHOOK_SECRET in your .env