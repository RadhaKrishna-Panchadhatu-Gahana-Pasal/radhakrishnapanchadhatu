import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/store/admin-guard';
import { notifyGiftCard } from '@/lib/notifications/dispatch';
import { issueGiftCard, listGiftCards, setGiftCardActive } from '@/lib/store/operations';
import { flushStore, hydrateStore } from '@/lib/store/repository';

export const dynamic = 'force-dynamic';

const IssueSchema = z.object({
  amountNpr: z.number().positive().max(500_000),
  note: z.string().max(200).optional(),
  code: z.string().max(40).optional(),
  email: z.string().email().optional().or(z.literal('')),
  recipientName: z.string().max(120).optional(),
});

export async function GET() {
  const guard = requireAdmin();
  if (!guard.ok) return guard.response;
  await hydrateStore();
  return NextResponse.json(
    { giftCards: listGiftCards() },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

export async function POST(req: NextRequest) {
  const guard = requireAdmin(['OWNER', 'MANAGER']);
  if (!guard.ok) return guard.response;

  const parsed = IssueSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Enter a value greater than zero.' }, { status: 400 });
  }

  await hydrateStore();
  const result = issueGiftCard({
    amountPaisa: Math.round(parsed.data.amountNpr * 100),
    note: parsed.data.note,
    code: parsed.data.code,
    actor: guard.session.name,
    role: guard.session.role,
  });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  await flushStore();

  let email: 'SENT' | 'FAILED' | 'SKIPPED' = 'SKIPPED';
  if (parsed.data.email) {
    email = await notifyGiftCard({
      email: parsed.data.email,
      code: result.giftCard.code,
      amountPaisa: result.giftCard.initialPaisa,
      note: result.giftCard.note,
      recipientName: parsed.data.recipientName,
    });
  }

  return NextResponse.json({ giftCard: result.giftCard, email }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const guard = requireAdmin(['OWNER', 'MANAGER']);
  if (!guard.ok) return guard.response;

  const body = (await req.json().catch(() => null)) as { code?: string; active?: boolean } | null;
  if (!body?.code || typeof body.active !== 'boolean') {
    return NextResponse.json({ error: 'Provide a gift card code and active flag.' }, { status: 400 });
  }

  await hydrateStore();
  const updated = setGiftCardActive(body.code, body.active);
  if (!updated) return NextResponse.json({ error: 'Gift card not found.' }, { status: 404 });
  await flushStore();
  return NextResponse.json({ giftCard: updated });
}
