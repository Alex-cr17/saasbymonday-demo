import { fail, ok } from '@/lib/api/responses';
import { requireUser } from '@/lib/auth/requireUser';
import { hasTenantAccess } from '@/lib/db/queries/tenants';
import { withAuthDb } from '@/lib/db/withAuthDb';
import {
  getStripeServerClient,
  isStripeCheckoutConfigured,
} from '@/lib/stripe/server';
import { getActiveTenantId } from '@/lib/tenants/activeTenant';
import { createCheckoutSessionSchema } from '@/lib/validation/stripeSchemas';
import Stripe from 'stripe';
import { isDemoUserEmail } from '@/lib/auth/demoUser';

export const runtime = 'nodejs';

function getSafeRelativePath(path: string, fallback: string): string {
  if (!path.startsWith('/') || path.startsWith('//')) return fallback;
  return path;
}

function getAppBaseUrl(request: Request): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) return appUrl;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('NEXT_PUBLIC_APP_URL is required in production for Stripe checkout');
  }
  return new URL(request.url).origin;
}

export async function POST(req: Request) {
  if (!isStripeCheckoutConfigured()) {
    return fail(
      'FEATURE_DISABLED',
      'Stripe is not configured. Add STRIPE_SECRET_KEY to enable billing.',
      503,
    );
  }

  const { user, session } = await requireUser();

  if (!user || !session) {
    return fail('UNAUTHENTICATED', 'Authentication required', 401);
  }
  if (isDemoUserEmail(user.email)) {
    return fail('FORBIDDEN', 'Demo mode is read-only for billing actions.', 403);
  }

  const activeTenantId = await getActiveTenantId();
  if (!activeTenantId) {
    return fail('BAD_REQUEST', 'No active tenant selected', 400);
  }

  let hasAccess = false;
  try {
    hasAccess = await withAuthDb(session.access_token, (db) =>
      hasTenantAccess(db, user.id, activeTenantId),
    );
  } catch (error) {
    console.error('[POST /api/stripe/checkout-session] tenant access check failed', error);
    return fail('INTERNAL_SERVER_ERROR', 'Failed to validate tenant access', 500);
  }

  if (!hasAccess) {
    return fail('FORBIDDEN', 'You do not have access to this tenant.', 403);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail('INVALID_JSON', 'Invalid JSON body', 400);
  }

  const parsed = createCheckoutSessionSchema.safeParse(body);
  if (!parsed.success) {
    return fail('VALIDATION_ERROR', 'Invalid request body', 400);
  }

  let baseUrl = '';
  try {
    baseUrl = getAppBaseUrl(req);
  } catch {
    return fail(
      'FEATURE_DISABLED',
      'Stripe is not fully configured. Add NEXT_PUBLIC_APP_URL for production checkout redirects.',
      503,
    );
  }
  const successPath = getSafeRelativePath(
    parsed.data.successPath,
    '/dashboard?checkout=success',
  );
  const cancelPath = getSafeRelativePath(
    parsed.data.cancelPath,
    '/dashboard?checkout=cancel',
  );
  const priceId = parsed.data.priceId ?? process.env.STRIPE_PRICE_ID;
  if (!priceId) {
    return fail(
      'FEATURE_DISABLED',
      'Stripe price is not configured. Provide priceId or STRIPE_PRICE_ID.',
      503,
    );
  }

  try {
    const session = await getStripeServerClient().checkout.sessions.create({
      mode: parsed.data.mode,
      line_items: [
        {
          price: priceId,
          quantity: parsed.data.quantity,
        },
      ],
      success_url: `${baseUrl}${successPath}`,
      cancel_url: `${baseUrl}${cancelPath}`,
      customer_email: parsed.data.customerEmail ?? user.email ?? undefined,
      client_reference_id: activeTenantId,
      metadata: {
        ...(parsed.data.metadata ?? {}),
        tenantId: activeTenantId,
        userId: user.id,
      },
    });

    if (!session.url) {
      return fail('STRIPE_ERROR', 'Checkout session URL is missing', 500);
    }

    return ok({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('[POST /api/stripe/checkout-session]', error);

    if (error instanceof Stripe.errors.StripeError) {
      return fail('STRIPE_ERROR', error.message, 400);
    }

    return fail('INTERNAL_SERVER_ERROR', 'Failed to create checkout session', 500);
  }
}
