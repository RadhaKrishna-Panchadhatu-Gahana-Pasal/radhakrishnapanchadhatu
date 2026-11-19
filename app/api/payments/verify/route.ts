import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyServerPayment } from '@/lib/store/repository';

const VerifySchema = z.object({
  orderNumber: z.string().min(3),
  trackingToken: z.string().min(3),
  providerReference: z.string().min(2).max(120),
  outcome: z.enum(['PAID', 'FAILED', 'CANCELLED']),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = VerifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payment verification payload.' }, { status: 400 });
    }

    const result = verifyServerPayment(parsed.data);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

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
