import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_COOKIE_NAME,
  createAdminSessionCookieValue,
  getAdminSession,
} from '@/lib/store/auth';
import { appendAuditLog } from '@/lib/store/repository';
import { reportWarning } from '@/lib/observability/errors';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/security/rate-limit';
import type { AdminRole } from '@/lib/store/types';

export const dynamic = 'force-dynamic';

const ALLOWED_ADMINS: Record<string, { name: string; role: AdminRole }> = {
  'itsuniquebhattarai@gmail.com': { name: 'Store Owner', role: 'OWNER' },
  'owner@radhakrishna.com.np': { name: 'Store Owner', role: 'OWNER' },
  'manager@radhakrishna.com.np': { name: 'Store Manager', role: 'MANAGER' },
  'orders@radhakrishna.com.np': { name: 'Order Staff', role: 'ORDER_STAFF' },
  'editor@radhakrishna.com.np': { name: 'Content Editor', role: 'CONTENT_EDITOR' },
};

const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';

/**
 * The passcode is a shared secret, so it must come from the environment.
 * A hardcoded fallback is allowed only outside production, and only so local
 * development keeps working; production without ADMIN_PASSCODE refuses to sign
 * anyone in rather than silently accepting a known string.
 */
function expectedPasscode(): string | null {
  const configured = process.env.ADMIN_PASSCODE?.trim();
  if (configured) return configured;
  if (isProduction) return null;
  return 'RKP-ADMIN-2026';
}

/** Constant-time comparison over SHA-256 digests (length-independent). */
function passcodeMatches(received: string, expected: string): boolean {
  const a = crypto.createHash('sha256').update(received, 'utf8').digest();
  const b = crypto.createHash('sha256').update(expected, 'utf8').digest();
  return crypto.timingSafeEqual(a, b);
}

export async function GET() {
  const session = getAdminSession();
  if (!session) {
    return NextResponse.json(
      { authenticated: false },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    );
  }
  return NextResponse.json(
    { authenticated: true, session },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  try {
    const body = (await req.json()) as { email?: string; passcode?: string };
    const email = (body.email || '').trim().toLowerCase();

    // Brute-force protection: per IP and per targeted admin account.
    const ipLimit = checkRateLimit(ip, RATE_LIMITS.adminLogin);
    const accountLimit = checkRateLimit(`acct:${email}`, {
      ...RATE_LIMITS.adminLogin,
      limit: 8,
    });
    if (!ipLimit.allowed || !accountLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Too many sign-in attempts. Please wait 10 minutes before trying again.',
        },
        { status: 429, headers: { 'Retry-After': String(Math.max(ipLimit.retryAfterSeconds, accountLimit.retryAfterSeconds)) } }
      );
    }

    const expected = expectedPasscode();
    if (!expected) {
      return NextResponse.json(
        {
          error:
            'Admin sign-in is not configured on this deployment. Set the ADMIN_PASSCODE environment variable first.',
        },
        { status: 503 }
      );
    }

    const passcode = (body.passcode || '').trim();
    const adminUser = ALLOWED_ADMINS[email];

    // Same generic answer for unknown email and wrong passcode so the endpoint
    // cannot be used to enumerate the admin allowlist.
    if (!adminUser) {
      appendAuditLog({
        actor: 'Unknown',
        role: 'REVIEWER',
        action: 'ADMIN_SIGN_IN_FAILED',
        entityType: 'AdminSession',
        entityId: email || '(blank)',
        summary: `Rejected admin sign-in for a non-allowlisted email from ${ip}.`,
      });
      return NextResponse.json({ error: 'Invalid admin credentials.' }, { status: 401 });
    }

    if (!passcode || !passcodeMatches(passcode, expected)) {
      appendAuditLog({
        actor: adminUser.name,
        role: adminUser.role,
        action: 'ADMIN_SIGN_IN_FAILED',
        entityType: 'AdminSession',
        entityId: email,
        summary: `Rejected admin sign-in for ${email} from ${ip}.`,
      });
      return NextResponse.json({ error: 'Invalid admin credentials.' }, { status: 401 });
    }

    if (!process.env.ADMIN_PASSCODE) {
      reportWarning('admin.auth', 'ADMIN_PASSCODE is not set; using the development passcode.');
    }

    const cookieVal = createAdminSessionCookieValue({
      email,
      name: adminUser.name,
      role: adminUser.role,
    });

    appendAuditLog({
      actor: adminUser.name,
      role: adminUser.role,
      action: 'ADMIN_SIGN_IN',
      entityType: 'AdminSession',
      entityId: email,
      summary: `${adminUser.name} (${adminUser.role}) signed into Admin CMS from ${ip}.`,
    });

    const res = NextResponse.json({
      authenticated: true,
      session: { email, name: adminUser.name, role: adminUser.role },
    });
    res.cookies.set(ADMIN_COOKIE_NAME, cookieVal, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch {
    return NextResponse.json({ error: 'Authentication failed.' }, { status: 500 });
  }
}

export async function DELETE() {
  const session = getAdminSession();
  if (session) {
    appendAuditLog({
      actor: session.name,
      role: session.role,
      action: 'ADMIN_SIGN_OUT',
      entityType: 'AdminSession',
      entityId: session.email,
      summary: `${session.name} signed out of Admin CMS.`,
    });
  }
  const res = NextResponse.json({ authenticated: false });
  res.cookies.delete(ADMIN_COOKIE_NAME);
  return res;
}
