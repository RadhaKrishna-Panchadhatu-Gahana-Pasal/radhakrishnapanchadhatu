import crypto from 'crypto';

/**
 * Fonepay Payment Gateway (clientapi) — signed redirect + server verification.
 *
 * Flow:
 *   1. buildFonepayPaymentUrl() signs the payment request and the shopper is
 *      redirected to Fonepay's hosted page.
 *   2. Fonepay redirects back to our return URL with PRN/BID/UID. Those query
 *      parameters are NOT proof of payment.
 *   3. verifyFonepayTransaction() asks Fonepay server-to-server and only that
 *      XML answer decides the order status.
 *
 * Signing rules (from the merchant integration spec):
 *   request:      PID,MD,PRN,AMT,CRN,DT,R1,R2,RU
 *   verification: PID,AMT,PRN,BID,UID
 * Fields are joined with "," in that exact order, hashed with HMAC-SHA512
 * using the merchant shared secret, and hex encoded. Values are signed raw and
 * only URL-encoded afterwards.
 */

export const FONEPAY_SANDBOX_BASE_URL = 'https://dev-clientapi.fonepay.com';
export const FONEPAY_LIVE_BASE_URL = 'https://clientapi.fonepay.com';

export interface FonepayConfig {
  merchantCode: string;
  secret: string;
  baseUrl: string;
  returnUrl: string;
  sandbox: boolean;
}

export interface FonepayVerification {
  success: boolean;
  responseCode: string;
  message: string;
  amountPaisa: number | null;
  transactionId: string;
}

function env(name: string): string {
  return process.env[name]?.trim() ?? '';
}

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

export function getFonepayReturnUrl(): string {
  const explicit = env('FONEPAY_RETURN_URL');
  if (explicit) return explicit;
  const origin = stripTrailingSlash(env('APP_URL') || env('NEXT_PUBLIC_APP_URL'));
  return origin ? `${origin}/api/payments/fonepay/callback` : '';
}

/**
 * Public origin of the incoming request, used when APP_URL is not configured
 * (Vercel sets x-forwarded-host to the domain the shopper used).
 */
export function getRequestOrigin(req: {
  headers: { get(name: string): string | null };
  nextUrl: { origin: string };
}): string {
  const forwardedHost = req.headers.get('x-forwarded-host');
  const host = forwardedHost ?? req.headers.get('host');
  const proto = req.headers.get('x-forwarded-proto')?.split(',')[0]?.trim() || 'https';
  if (host) return `${proto}://${host.split(',')[0].trim()}`;
  return req.nextUrl.origin;
}

/** Returns null when the merchant credentials (or a public return URL) are missing. */
export function getFonepayConfig(returnUrlOverride?: string): FonepayConfig | null {
  const merchantCode = env('FONEPAY_MERCHANT_ID');
  const secret = env('FONEPAY_SECRET_KEY');
  const returnUrl = returnUrlOverride?.trim() || getFonepayReturnUrl();
  if (!merchantCode || !secret || !returnUrl) return null;

  const sandbox = env('FONEPAY_ENV') !== 'production';
  const configuredBase = env('FONEPAY_PG_URL');
  const baseUrl = stripTrailingSlash(
    configuredBase || (sandbox ? FONEPAY_SANDBOX_BASE_URL : FONEPAY_LIVE_BASE_URL)
  );

  return { merchantCode, secret, baseUrl, returnUrl, sandbox };
}

/** HMAC-SHA512 hex signature (uppercase, matching Fonepay's Java samples). */
export function signFonepayFields(secret: string, fields: Array<string | number>): string {
  return crypto
    .createHmac('sha512', secret)
    .update(fields.map((field) => String(field)).join(','), 'utf8')
    .digest('hex')
    .toUpperCase();
}

export function formatFonepayAmount(amountPaisa: number): string {
  return (Math.max(0, Math.round(amountPaisa)) / 100).toFixed(2);
}

/** Fonepay expects MM/DD/YYYY in Nepal time. */
export function formatFonepayDate(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kathmandu',
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  }).formatToParts(date);
  const part = (type: string) => parts.find((entry) => entry.type === type)?.value ?? '';
  return `${part('month')}/${part('day')}/${part('year')}`;
}

/** Constant-time comparison of two hex signatures, ignoring case. */
export function fonepaySignaturesMatch(expected: string, received: string): boolean {
  if (!expected || !received) return false;
  const a = Buffer.from(expected.trim(), 'hex');
  const b = Buffer.from(received.trim(), 'hex');
  if (a.length === 0 || a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function buildFonepayPaymentUrl(
  config: FonepayConfig,
  input: { reference: string; amountPaisa: number; remark: string; remarks2?: string }
): string {
  const params = {
    PID: config.merchantCode,
    MD: 'P',
    PRN: input.reference,
    AMT: formatFonepayAmount(input.amountPaisa),
    CRN: 'NPR',
    DT: formatFonepayDate(),
    R1: input.remark.slice(0, 160),
    R2: (input.remarks2 ?? 'N/A').slice(0, 50),
    RU: config.returnUrl,
  };

  const dv = signFonepayFields(config.secret, [
    params.PID,
    params.MD,
    params.PRN,
    params.AMT,
    params.CRN,
    params.DT,
    params.R1,
    params.R2,
    params.RU,
  ]);

  const search = new URLSearchParams({ ...params, DV: dv });
  return `${config.baseUrl}/api/merchantRequest?${search.toString()}`;
}

/**
 * Validates the optional DV that some Fonepay contracts include on the return
 * redirect. Signed fields: PRN,PID,PS,RC,UID,BC,INI,P_AMT,R_AMT.
 *
 * Returns true when there is nothing to check (contract without a return DV).
 */
/** Fonepay returns either upper-case or lower-case keys depending on the bank. */
function pickParam(params: URLSearchParams, ...keys: string[]): string {
  for (const key of keys) {
    const value = params.get(key);
    if (value !== null && value !== undefined) return value;
  }
  return '';
}

export function verifyFonepayReturnSignature(config: FonepayConfig, params: URLSearchParams): boolean {
  const received = pickParam(params, 'DV', 'dv').trim();
  if (!received) return true;
  const fields = ['PRN', 'PID', 'PS', 'RC', 'UID', 'BC', 'INI', 'P_AMT', 'R_AMT'].map((key) =>
    pickParam(params, key, key.toLowerCase())
  );
  return fonepaySignaturesMatch(signFonepayFields(config.secret, fields), received);
}

function readXmlField(xml: string, name: string): string {
  const match = xml.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`, 'i'));
  if (!match) return '';
  return match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
}

/**
 * Server-to-server verification. The amount is the one we stored for the order,
 * never anything the browser sent.
 */
export async function verifyFonepayTransaction(
  config: FonepayConfig,
  input: { reference: string; bankCode: string; transactionId: string; amountPaisa: number }
): Promise<FonepayVerification> {
  const amount = formatFonepayAmount(input.amountPaisa);
  const dv = signFonepayFields(config.secret, [
    config.merchantCode,
    amount,
    input.reference,
    input.bankCode,
    input.transactionId,
  ]);

  const search = new URLSearchParams({
    PRN: input.reference,
    PID: config.merchantCode,
    BID: input.bankCode,
    AMT: amount,
    UID: input.transactionId,
    DV: dv,
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  let response: Response | null = null;
  try {
    response = await fetch(
      `${config.baseUrl}/api/merchantRequest/verificationMerchant?${search.toString()}`,
      {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal,
        headers: { Accept: 'application/xml, text/xml, */*' },
      }
    );
  } finally {
    clearTimeout(timeout);
  }

  if (!response) {
    throw new Error('Fonepay verification could not be completed.');
  }

  if (!response.ok) {
    throw new Error(`Fonepay verification failed with HTTP ${response.status}.`);
  }

  const xml = await response.text();
  const succeeded = readXmlField(xml, 'success').toLowerCase() === 'true';
  const responseCode = readXmlField(xml, 'response_code');
  const rawAmount = readXmlField(xml, 'amount') || readXmlField(xml, 'txnAmount');
  const parsedAmount = rawAmount ? Number(rawAmount) : NaN;

  return {
    success: succeeded && (!responseCode || responseCode.toLowerCase() === 'successful'),
    responseCode: responseCode || (succeeded ? 'successful' : 'failed'),
    message: readXmlField(xml, 'message'),
    amountPaisa: Number.isFinite(parsedAmount) ? Math.round(parsedAmount * 100) : null,
    transactionId: readXmlField(xml, 'uniqueId') || input.transactionId,
  };
}

/** Reads the reference / bank / transaction ids from Fonepay's return redirect. */
export function readFonepayReturnParams(params: URLSearchParams): {
  reference: string;
  bankCode: string;
  transactionId: string;
  status: string;
  dvPresent: boolean;
} {
  return {
    reference: pickParam(params, 'PRN', 'prn').trim(),
    bankCode: pickParam(params, 'BID', 'bid', 'BC', 'bc').trim(),
    transactionId: pickParam(params, 'UID', 'uid').trim(),
    status: pickParam(params, 'PS', 'ps', 'RC', 'rc').trim(),
    dvPresent: Boolean(pickParam(params, 'DV', 'dv')),
  };
}
