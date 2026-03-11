import { fail, ok } from '@/lib/api/responses';
import {
  getStripeServerClient,
  getStripeWebhookSecret,
  isStripeWebhookConfigured,
} from '@/lib/stripe/server';
import Stripe from 'stripe';

export const runtime = 'nodejs';

async function handleStripeEvent(event: Stripe.Event) {
  // Starter template behavior:
  // events are verified and accepted, but billing state persistence is intentionally left to app-specific implementation.
  switch (event.type) {
    case 'checkout.session.completed':
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
    case 'invoice.payment_succeeded':
    case 'invoice.payment_failed':
      return;
    default:
      return;
  }
}

export async function POST(req: Request) {
  if (!isStripeWebhookConfigured()) {
    return fail(
      'FEATURE_DISABLED',
      'Stripe webhook is not configured. Add STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET.',
      503,
    );
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return fail('BAD_REQUEST', 'Missing Stripe signature', 400);
  }

  const payload = await req.text();
  let event: Stripe.Event;

  try {
    event = getStripeServerClient().webhooks.constructEvent(
      payload,
      signature,
      getStripeWebhookSecret(),
    );
  } catch (error) {
    console.error('[POST /api/stripe/webhook] signature verification failed', error);
    if (error instanceof Stripe.errors.StripeSignatureVerificationError) {
      return fail('BAD_REQUEST', 'Invalid Stripe signature', 400);
    }
    return fail('INTERNAL_SERVER_ERROR', 'Failed to initialize Stripe webhook', 500);
  }

  try {
    await handleStripeEvent(event);
    return ok({ received: true });
  } catch (error) {
    console.error('[POST /api/stripe/webhook] handler failed', error);
    return fail('INTERNAL_SERVER_ERROR', 'Failed to process webhook event', 500);
  }
}
