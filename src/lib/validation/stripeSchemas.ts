import { z } from 'zod';

export const createCheckoutSessionSchema = z.object({
  priceId: z.string().min(1).optional(),
  quantity: z.number().int().positive().optional().default(1),
  mode: z.enum(['payment', 'subscription']).optional().default('subscription'),
  successPath: z.string().optional().default('/dashboard?checkout=success'),
  cancelPath: z.string().optional().default('/dashboard?checkout=cancel'),
  customerEmail: z.string().email().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
});

export type CreateCheckoutSessionInput = z.infer<typeof createCheckoutSessionSchema>;
