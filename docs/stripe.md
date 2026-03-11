# Stripe (base integration)

This template includes a minimal server-side Stripe setup that you can extend for your own billing logic.

## Environment variables

Add these values to `.env`:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID` (optional convenience variable)
- `NEXT_PUBLIC_APP_URL` (required in production for Stripe redirect URLs)

## Implemented endpoints

- `POST /api/stripe/checkout-session`
  - Requires authenticated user
  - Resolves active tenant from cookie (`getActiveTenantId()`)
  - Verifies user membership in active tenant via DB + RLS context
  - Uses `priceId` from request or fallback `STRIPE_PRICE_ID`
  - Creates Stripe Checkout Session
  - Returns `{ sessionId, url }`
  - Returns `FEATURE_DISABLED` (`503`) when Stripe is not configured

- `POST /api/stripe/webhook`
  - Verifies webhook signature using `STRIPE_WEBHOOK_SECRET`
  - Includes base event switch for common billing events
  - Starter template behavior is stub/no-op after signature verification (you must persist subscription state in your app)
  - Returns `FEATURE_DISABLED` (`503`) when webhook keys are not configured

- `GET /api/stripe/config`
  - Returns Stripe feature flags for UI (`checkoutEnabled`, `webhookEnabled`, `defaultPriceConfigured`)

## Client helper

`src/lib/api/client/stripe.ts` provides:

- `createCheckoutSession(input)`
- `redirectToStripeCheckout(input)`
- `fetchStripeConfig()`

## Extend points

1. Persist Stripe customer/subscription IDs in your own DB tables.
2. Add domain-specific logic inside `handleStripeEvent` in webhook route.
3. Replace direct `priceId` usage with server-side plan catalog mapping.
4. Gate product features based on subscription state in your app.
