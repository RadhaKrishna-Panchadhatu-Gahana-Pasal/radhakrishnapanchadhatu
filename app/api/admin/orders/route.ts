import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/store/admin-guard';
import { notifyOrderStatus } from '@/lib/notifications/dispatch';
import { reportError } from '@/lib/observability/errors';
import {
  cancelOrder,
  reconcilePayments,
  recordRefund,
  releaseExpiredReservations,
} from '@/lib/store/operations';
import {
  flushStore,
  getStore,
  hydrateStore,
  updateOrderAdmin,
} from '@/lib/store/repository';
import type { FulfilmentStatus, PaymentStatus } from '@/lib/store/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const guard = requireAdmin();
  if (!guard.ok) return guard.response;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const paymentStatus = searchParams.get('paymentStatus');
  const q = searchParams.get('q')?.trim().toLowerCase();

  await hydrateStore();
  // Show stock/expiry as it is now, not as it was before the hold window passed.
  releaseExpiredReservations();

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

  return NextResponse.json(
    { orders, notificationsEnabled: Boolean(process.env.RESEND_API_KEY) },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

type ActionBody = {
  orderId: string;
  action?: 'update' | 'refund' | 'reconcile' | 'cancel';
  fulfilmentStatus?: FulfilmentStatus;
  paymentStatus?: PaymentStatus;
  courierName?: string;
  trackingReference?: string;
  publicNote?: string;
  internalNote?: string;
  amountPaisa?: number;
  reason?: string;
};

export async function PATCH(req: NextRequest) {
  const guard = requireAdmin(['OWNER', 'MANAGER', 'ORDER_STAFF']);
  if (!guard.ok) return guard.response;
  const { session } = guard;

  try {
    const body = (await req.json()) as ActionBody;

    if (body.action === 'refund') {
      const result = recordRefund({
        orderId: body.orderId,
        amountPaisa: Number(body.amountPaisa ?? 0),
        reason: body.reason ?? 'Admin refund',
        actor: session.name,
        role: session.role,
      });
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      await flushStore();
      return NextResponse.json({ order: result.order });
    }

    if (body.action === 'reconcile') {
      const report = reconcilePayments();
      await flushStore();
      return NextResponse.json({ report, orders: getStore().orders });
    }

    if (body.action === 'cancel') {
      const cancelled = cancelOrder({
        orderId: body.orderId,
        reason: body.reason,
        actor: session.name,
        role: session.role,
      });
      if (!cancelled) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      await flushStore();
      await notifyOrderStatus(cancelled, body.reason);
      return NextResponse.json({ order: cancelled });
    }

    // Default: status/courier update
    const before = getStore().orders.find((order) => order.id === body.orderId);
    const previousStatus = before?.fulfilmentStatus;

    const updated = updateOrderAdmin({
      orderId: body.orderId,
      fulfilmentStatus: body.fulfilmentStatus,
      paymentStatus: body.paymentStatus,
      courierName: body.courierName,
      trackingReference: body.trackingReference,
      publicNote: body.publicNote,
      internalNote: body.internalNote,
      actor: session.name,
      role: session.role,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    await flushStore();

    // Tell the customer once, only when the fulfilment stage actually changed.
    let notifications: { email: string; whatsapp: string } | null = null;
    if (body.fulfilmentStatus && previousStatus !== updated.fulfilmentStatus) {
      const outcome = await notifyOrderStatus(updated, body.publicNote);
      notifications = { email: outcome.email, whatsapp: outcome.whatsapp };
    }

    return NextResponse.json({ order: updated, notifications });
  } catch (error) {
    reportError('admin.orders', error, { path: '/api/admin/orders' });
    return NextResponse.json({ error: 'Could not update the order.' }, { status: 500 });
  }
}
