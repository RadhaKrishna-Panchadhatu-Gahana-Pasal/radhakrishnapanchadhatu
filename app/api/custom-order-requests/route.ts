import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { reportError } from '@/lib/observability/errors';
import { checkRequestRateLimit, RATE_LIMITS } from '@/lib/security/rate-limit';
import { createCustomOrderLead, flushStore, getStore, hydrateStore } from '@/lib/store/repository';
import { buildCustomOrderWhatsAppUrl } from '@/lib/store/whatsapp';

const CustomOrderSchema = z.object({
  customerName: z.string().min(2).max(120),
  customerPhone: z.string().min(7).max(25),
  preferredMaterial: z.string().min(2).max(80),
  budgetNote: z.string().max(120).optional(),
  description: z.string().min(10).max(2000),
  referenceImageUrl: z.string().max(500).optional(),
  consentAccepted: z.literal(true),
});

export async function POST(req: NextRequest) {
  const limit = checkRequestRateLimit(req.headers, RATE_LIMITS.customOrder);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many custom order requests. Please wait a few minutes.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
    );
  }

  try {
    const body = await req.json();
    const parsed = CustomOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Please complete all required fields and accept the contact consent notice.' },
        { status: 400 }
      );
    }

    await hydrateStore();
    const requestRecord = createCustomOrderLead(parsed.data);
    await flushStore();
    const whatsappUrl = buildCustomOrderWhatsAppUrl({
      whatsappDigits: getStore().settings.whatsappDigits,
      referenceCode: requestRecord.referenceCode,
      customerName: requestRecord.customerName,
      preferredMaterial: requestRecord.preferredMaterial,
      description: requestRecord.description,
    });

    return NextResponse.json({ request: requestRecord, whatsappUrl }, { status: 201 });
  } catch (error) {
    reportError('custom-order', error, { path: '/api/custom-order-requests' });
    return NextResponse.json({ error: 'Unable to save custom order request.' }, { status: 500 });
  }
}
