import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRequestRateLimit, RATE_LIMITS } from '@/lib/security/rate-limit';
import { captureAbandonedCart } from '@/lib/store/operations';
import { flushStore, hydrateStore } from '@/lib/store/repository';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CartSchema = z.object({
  email: z.string().email(),
  customerName: z.string().max(120).optional(),
  phone: z.string().max(25).optional(),
  items: z
    .array(
      z.object({
        productId: z.string().max(80),
        name: z.string().max(200),
        quantity: z.number().int().min(1).max(25),
        unitPricePaisa: z.number().int().min(0),
      })
    )
    .min(1)
    .max(50),
  subtotalPaisa: z.number().int().min(0),
});

/**
 * Called when a shopper has entered an email at checkout but not finished.
 * The cart is only ever used for one reminder email, and it is marked recovered
 * the moment a real order is placed with that address.
 */
export async function POST(req: NextRequest) {
  const limit = checkRequestRateLimit(req.headers, RATE_LIMITS.abandonedCart);
  if (!limit.allowed) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  const parsed = CartSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Invalid cart payload.' }, { status: 400 });
  }

  await hydrateStore();
  const cart = captureAbandonedCart(parsed.data);
  await flushStore();
  return NextResponse.json({ ok: Boolean(cart) });
}
