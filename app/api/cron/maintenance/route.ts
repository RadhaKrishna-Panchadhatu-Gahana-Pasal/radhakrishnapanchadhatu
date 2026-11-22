import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { notifyAbandonedCart } from '@/lib/notifications/dispatch';
import { reportError } from '@/lib/observability/errors';
import {
  cartsDueForReminder,
  createStoreBackup,
  markAbandonedCartReminded,
  reconcilePayments,
} from '@/lib/store/operations';
import { flushStore, hydrateStore } from '@/lib/store/repository';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Daily maintenance job (Vercel Cron → /api/cron/maintenance).
 *
 * - releases stock held by unpaid orders past the reservation window
 * - reconciles payment status and flags orders that need a human
 * - sends one abandoned-bag reminder per captured cart
 * - writes an independent snapshot backup
 *
 * Protected by CRON_SECRET. Vercel Cron sends it automatically as
 * `Authorization: Bearer $CRON_SECRET` when the variable is configured.
 */
function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return process.env.NODE_ENV !== 'production';
  const header = req.headers.get('authorization') || '';
  const provided = header.replace(/^Bearer\s+/i, '').trim();
  if (!provided) return false;
  const a = crypto.createHash('sha256').update(provided).digest();
  const b = crypto.createHash('sha256').update(secret).digest();
  return crypto.timingSafeEqual(a, b);
}

async function run() {
  await hydrateStore();
  const report = reconcilePayments();

  const dueCarts = cartsDueForReminder(60, 20);
  const reminders: { email: string; outcome: string }[] = [];
  for (const cart of dueCarts) {
    const outcome = await notifyAbandonedCart({
      id: cart.id,
      email: cart.email,
      customerName: cart.customerName,
      items: cart.items,
      subtotalPaisa: cart.subtotalPaisa,
      recoveryToken: cart.recoveryToken,
    });
    if (outcome === 'SENT' || outcome === 'DUPLICATE') {
      markAbandonedCartReminded(cart.id);
    }
    reminders.push({ email: cart.email, outcome });
  }

  const backup = await createStoreBackup('daily-cron');
  await flushStore();

  return {
    ok: true,
    ranAt: new Date().toISOString(),
    reconciliation: report,
    remindersSent: reminders.filter((entry) => entry.outcome === 'SENT').length,
    reminders,
    backup: { id: backup.id, orders: backup.orders, products: backup.products, sizeBytes: backup.sizeBytes },
  };
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    return NextResponse.json(await run());
  } catch (error) {
    reportError('cron.maintenance', error, { path: '/api/cron/maintenance' });
    return NextResponse.json({ error: 'Maintenance job failed.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
