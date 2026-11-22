import { NextRequest, NextResponse } from 'next/server';
import {
  getFonepayConfig,
  getRequestOrigin,
  readFonepayReturnParams,
  verifyFonepayReturnSignature,
  verifyFonepayTransaction,
  type FonepayVerification,
} from '@/lib/payments/fonepay';
import {
  findOrderForPaymentReference,
  flushStore,
  hydrateStore,
  verifyServerPayment,
} from '@/lib/store/repository';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Fonepay return URL (RU).
 *
 * Fonepay sends the shopper back here with PRN/BID/UID. Those values only say
 * which transaction to check, so nothing is marked paid until Fonepay's
 * server-to-server verification confirms the transaction and the amount.
 */

function resolveOrigin(req: NextRequest): string {
  const configured = (process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || '').replace(
    /\/+$/,
    ''
  );
  if (configured && !/^https?:\/\/(localhost|127\.0\.0\.1)/i.test(configured)) return configured;
  return getRequestOrigin(req);
}

function absolute(origin: string, path: string): string {
  return `${origin}${path}`;
}

function trackPath(origin: string, token: string, reason: string): string {
  return absolute(
    origin,
    `/track-order/${encodeURIComponent(token)}?payment=${encodeURIComponent(reason)}`
  );
}

async function collectParams(req: NextRequest): Promise<URLSearchParams> {
  const params = new URLSearchParams(req.nextUrl.searchParams);
  if (req.method === 'POST') {
    try {
      const form = await req.formData();
      form.forEach((value, key) => {
        if (typeof value === 'string' && !params.has(key)) params.set(key, value);
      });
    } catch {
      // JSON or empty body: query params are enough
      try {
        const body = (await req.json()) as Record<string, unknown>;
        for (const [key, value] of Object.entries(body ?? {})) {
          if (typeof value === 'string' && !params.has(key)) params.set(key, value);
        }
      } catch {
        // ignore unparseable bodies
      }
    }
  }
  return params;
}

async function handleReturn(req: NextRequest): Promise<NextResponse> {
  const origin = resolveOrigin(req);
  const params = await collectParams(req);
  const { reference, bankCode, transactionId } = readFonepayReturnParams(params);

  if (!reference) {
    return NextResponse.redirect(absolute(origin, '/checkout?payment=missing-reference'));
  }

  await hydrateStore();
  const order = findOrderForPaymentReference(reference);
  if (!order) {
    return NextResponse.redirect(absolute(origin, '/checkout?payment=unknown-order'));
  }

  const successPath = absolute(
    origin,
    `/order/success?orderNumber=${encodeURIComponent(order.orderNumber)}&token=${encodeURIComponent(
      order.trackingToken
    )}`
  );

  // Refreshed tab or repeated callback: never fulfil twice.
  if (order.paymentStatus === 'PAID') {
    return NextResponse.redirect(successPath);
  }

  if (order.paymentMethod !== 'FONEPAY') {
    return NextResponse.redirect(trackPath(origin, order.trackingToken, 'unexpected-method'));
  }

  const config = getFonepayConfig(`${origin}/api/payments/fonepay/callback`);
  if (!config) {
    return NextResponse.redirect(trackPath(origin, order.trackingToken, 'gateway-not-configured'));
  }

  if (!verifyFonepayReturnSignature(config, params)) {
    verifyServerPayment({
      orderNumber: order.orderNumber,
      trackingToken: order.trackingToken,
      providerReference: reference,
      outcome: 'FAILED',
    });
    await flushStore();
    return NextResponse.redirect(trackPath(origin, order.trackingToken, 'signature-mismatch'));
  }

  let verification: FonepayVerification;
  try {
    verification = await verifyFonepayTransaction(config, {
      reference,
      bankCode,
      transactionId,
      amountPaisa: order.totalPaisa,
    });
  } catch (error) {
    console.error(
      '[fonepay] Could not verify the transaction. The order stays INITIATED for reconciliation.',
      error instanceof Error ? error.message : error
    );
    return NextResponse.redirect(trackPath(origin, order.trackingToken, 'not-verified'));
  }

  if (!verification.success) {
    verifyServerPayment({
      orderNumber: order.orderNumber,
      trackingToken: order.trackingToken,
      providerReference: reference,
      outcome: 'FAILED',
    });
    await flushStore();
    return NextResponse.redirect(trackPath(origin, order.trackingToken, 'failed'));
  }

  // Never trust the gateway's amount blindly: it must match what we stored.
  if (verification.amountPaisa !== null && verification.amountPaisa !== order.totalPaisa) {
    verifyServerPayment({
      orderNumber: order.orderNumber,
      trackingToken: order.trackingToken,
      providerReference: reference,
      outcome: 'FAILED',
    });
    await flushStore();
    console.error(
      `[fonepay] Amount mismatch on ${order.orderNumber}: paid ${verification.amountPaisa} paisa, expected ${order.totalPaisa}.`
    );
    return NextResponse.redirect(trackPath(origin, order.trackingToken, 'amount-mismatch'));
  }

  const settled = verifyServerPayment({
    orderNumber: order.orderNumber,
    trackingToken: order.trackingToken,
    providerReference: reference,
    outcome: 'PAID',
    gatewayReference: verification.transactionId,
  });
  await flushStore();

  if (!settled.ok) {
    return NextResponse.redirect(trackPath(origin, order.trackingToken, 'not-verified'));
  }

  return NextResponse.redirect(successPath);
}

export async function GET(req: NextRequest) {
  try {
    return await handleReturn(req);
  } catch (error) {
    console.error('[fonepay] Return handler failed.', error instanceof Error ? error.message : error);
    return NextResponse.redirect(absolute(resolveOrigin(req), '/checkout?payment=error'));
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
