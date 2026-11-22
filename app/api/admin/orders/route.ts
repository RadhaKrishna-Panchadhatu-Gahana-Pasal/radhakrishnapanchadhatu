import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/store/auth';
import { flushStore, getStore, hydrateStore, updateOrderAdmin } from '@/lib/store/repository';
import type { FulfilmentStatus, PaymentStatus } from '@/lib/store/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const paymentStatus = searchParams.get('paymentStatus');
  const q = searchParams.get('q')?.trim().toLowerCase();

  await hydrateStore();
  let orders = getStore().orders;
  if (status && status !== 'ALL') {
    orders = orders.filter((o) => o.fulfilmentStatus === status);
  }
  if (paymentStatus && paymentStatus !== 'ALL') {
    orders = orders.filter((o) => o.paymentStatus === paymentStatus);
  }
  if (q) {
    orders = orders.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q)
    );
  }

  return NextResponse.json({ orders });
}

export async function PATCH(req: NextRequest) {
  const session = getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await req.json()) as {
    orderId: string;
    fulfilmentStatus?: FulfilmentStatus;
    paymentStatus?: PaymentStatus;
    courierName?: string;
    trackingReference?: string;
    publicNote?: string;
    internalNote?: string;
  };

  const updated = updateOrderAdmin({
    ...body,
    actor: session.name,
    role: session.role,
  });

  if (!updated) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  await flushStore();
  return NextResponse.json({ order: updated });
}
