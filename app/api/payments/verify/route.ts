import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDeploymentStage } from '@/lib/payments/availability';
import {
  flushStore,
  getStore,
  hydrateStore,
  verifyServerPayment,
} from '@/lib/store/repository';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Sandbox settlement for wallets that are not wired to a real gateway yet
 * (eSewa / Khalti). It exists so the test flow can finish locally.
 *
 * It is deliberately disabled in production, and it refuses Fonepay: Fonepay
 * orders are only ever settled by /api/payments/fonepay/callback after
 * Fonepay's own server-to-server verification.
 */

const VerifySchema = z.object({
  orderNumber: z.string().min(3),
  trackingToken: z.string().min(3),
  providerReference: z.string().min(2).max(120),
  outcome: z.enum(['PAID', 'FAILED', 'CANCELLED']),
});

export async function POST(req: NextRequest) {
  if (getDeploymentStage() === 'production') {
    return NextResponse.json(
      { error: 'Manual payment confirmation is disabled in production.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const parsed = VerifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payment verification payload.' }, { status: 400 });
    }

    await hydrateStore();
    const store = getStore();
    const order = store.orders.find(
      (o) =>
        o.orderNumber === parsed.data.orderNumber &&
        o.trackingToken === parsed.data.trackingToken
    );

    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    if (order.paymentMethod === 'FONEPAY') {
      return NextResponse.json(
        { error: 'Fonepay orders are confirmed by the Fonepay gateway callback only.' },
        { status: 400 }
      );
    }

    const result = verifyServerPayment(parsed.data);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }
    await flushStore();

    return NextResponse.json({
      orderNumber: result.order.orderNumber,
      trackingToken: result.order.trackingToken,
      paymentStatus: result.order.paymentStatus,
      fulfilmentStatus: result.order.fulfilmentStatus,
      providerReference: result.order.payment.providerReference,
      idempotentReplay: result.idempotentReplay,
    });
  } catch {
    return NextResponse.json({ error: 'Payment verification failed.' }, { status: 500 });
  }
}
