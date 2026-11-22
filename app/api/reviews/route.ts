import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { reportError } from '@/lib/observability/errors';
import { checkRequestRateLimit, RATE_LIMITS } from '@/lib/security/rate-limit';
import { flushStore, getStore, hydrateStore, submitVerifiedReview } from '@/lib/store/repository';

export const dynamic = 'force-dynamic';

const ReviewSchema = z.object({
  productId: z.string().min(1),
  orderNumber: z.string().min(3).max(64),
  customerPhone: z.string().min(7).max(25),
  customerName: z.string().min(2).max(120),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(2).max(160),
  content: z.string().min(5).max(2000),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('productId');
  await hydrateStore();
  const store = getStore();
  const reviews = store.reviews.filter(
    (r) => r.status === 'APPROVED' && (!productId || r.productId === productId)
  );
  return NextResponse.json({ reviews });
}

export async function POST(req: NextRequest) {
  const limit = checkRequestRateLimit(req.headers, RATE_LIMITS.reviews);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many review submissions. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
    );
  }

  try {
    const body = await req.json();
    const parsed = ReviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Please complete all review fields.' },
        { status: 400 }
      );
    }
    const result = submitVerifiedReview(parsed.data);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    await flushStore();
    return NextResponse.json({ review: result.review }, { status: 201 });
  } catch (error) {
    reportError('reviews', error, { path: '/api/reviews' });
    return NextResponse.json({ error: 'Unable to submit review.' }, { status: 500 });
  }
}
