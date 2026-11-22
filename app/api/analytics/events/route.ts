import { NextRequest, NextResponse } from 'next/server';
import { checkRequestRateLimit, RATE_LIMITS } from '@/lib/security/rate-limit';
import {
  hydrateStore,
  flushStore,
} from '@/lib/store/repository';
import { isAnalyticsEvent, recordAnalyticsEvent } from '@/lib/store/operations';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * First-party funnel counters. No cookies, no identifiers, no third parties:
 * the browser only calls this after the shopper consents to analytics, and the
 * server stores daily aggregate counts on the shop's own snapshot.
 */
export async function POST(req: NextRequest) {
  const limit = checkRequestRateLimit(req.headers, RATE_LIMITS.analytics);
  if (!limit.allowed) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  const body = (await req.json().catch(() => null)) as { name?: string; quantity?: number } | null;
  if (!body?.name || !isAnalyticsEvent(body.name)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  await hydrateStore();
  recordAnalyticsEvent(body.name, typeof body.quantity === 'number' ? body.quantity : 1);
  await flushStore();
  return new NextResponse(null, { status: 204 });
}
