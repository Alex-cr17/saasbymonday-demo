import type { CreateCheckoutSessionInput } from '@/lib/validation/stripeSchemas';

export type StripeConfig = {
  checkoutEnabled: boolean;
  webhookEnabled: boolean;
  defaultPriceConfigured: boolean;
};

export async function fetchStripeConfig(): Promise<StripeConfig> {
  const res = await fetch('/api/stripe/config', { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('FAILED_TO_FETCH_STRIPE_CONFIG');
  }
  const json = await res.json();
  return json.data as StripeConfig;
}

export async function createCheckoutSession(input: CreateCheckoutSessionInput) {
  const res = await fetch('/api/stripe/checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const json = await res.json().catch(() => null);
    const errorCode =
      typeof json?.error?.code === 'string'
        ? json.error.code
        : 'FAILED_TO_CREATE_STRIPE_CHECKOUT_SESSION';
    throw new Error(errorCode);
  }

  const json = await res.json();
  const url = json?.data?.url;

  if (!url || typeof url !== 'string') {
    throw new Error('STRIPE_CHECKOUT_URL_MISSING');
  }

  return { sessionId: json.data.sessionId as string, url };
}

export async function redirectToStripeCheckout(input: CreateCheckoutSessionInput) {
  const { url } = await createCheckoutSession(input);
  window.location.assign(url);
}
