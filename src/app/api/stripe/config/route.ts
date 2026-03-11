import { ok } from '@/lib/api/responses';
import {
  isStripeCheckoutConfigured,
  isStripeWebhookConfigured,
} from '@/lib/stripe/server';

export async function GET() {
  return ok({
    checkoutEnabled: isStripeCheckoutConfigured(),
    webhookEnabled: isStripeWebhookConfigured(),
    defaultPriceConfigured: Boolean(process.env.STRIPE_PRICE_ID),
  });
}
