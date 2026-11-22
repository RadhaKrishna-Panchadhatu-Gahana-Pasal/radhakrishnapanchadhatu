import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/store/admin-guard';
import { getCapturedErrors } from '@/lib/observability/errors';
import { getDatabaseStatus } from '@/lib/store/postgres';
import {
  createStoreBackup,
  getAnalyticsSummary,
  listAbandonedCarts,
  listBackups,
  listNotifications,
  listSystemEvents,
} from '@/lib/store/operations';
import { hydrateStore, isStoreHydrated, getStoreStorage } from '@/lib/store/repository';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Operational dashboard: errors, backups, funnel, notification log. */
export async function GET() {
  const guard = requireAdmin(['OWNER', 'MANAGER']);
  if (!guard.ok) return guard.response;

  await hydrateStore();
  const database = await getDatabaseStatus();

  return NextResponse.json(
    {
      storage: getStoreStorage(),
      hydrated: isStoreHydrated(),
      database,
      errors: [...getCapturedErrors(), ...listSystemEvents(40)]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 40),
      backups: listBackups(),
      analytics: getAnalyticsSummary(30),
      notifications: listNotifications(30),
      abandonedCarts: listAbandonedCarts(10),
      emailConfigured: Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM),
      whatsappConfigured: Boolean(
        process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID
      ),
      cronConfigured: Boolean(process.env.CRON_SECRET),
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

/** Manual backup trigger ("Back up now"). */
export async function POST(req: NextRequest) {
  const guard = requireAdmin(['OWNER', 'MANAGER']);
  if (!guard.ok) return guard.response;

  await hydrateStore();
  const body = (await req.json().catch(() => ({}))) as { reason?: string };
  const record = await createStoreBackup(body.reason?.slice(0, 80) || 'manual-admin');
  return NextResponse.json({ backup: record }, { status: 201 });
}
