import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_COOKIE_NAME,
  createAdminSessionCookieValue,
  getAdminSession,
} from '@/lib/store/auth';
import { appendAuditLog } from '@/lib/store/repository';
import type { AdminRole } from '@/lib/store/types';

export const dynamic = 'force-dynamic';

const ALLOWED_ADMINS: Record<string, { name: string; role: AdminRole }> = {
  'itsuniquebhattarai@gmail.com': { name: 'Store Owner', role: 'OWNER' },
  'owner@radhakrishna.com.np': { name: 'Store Owner', role: 'OWNER' },
  'manager@radhakrishna.com.np': { name: 'Store Manager', role: 'MANAGER' },
  'orders@radhakrishna.com.np': { name: 'Order Staff', role: 'ORDER_STAFF' },
  'editor@radhakrishna.com.np': { name: 'Content Editor', role: 'CONTENT_EDITOR' },
};

export async function GET() {
  const session = getAdminSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, session });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { email?: string; passcode?: string };
    const email = (body.email || '').trim().toLowerCase();
    const passcode = (body.passcode || '').trim();
    const expectedPasscode = process.env.ADMIN_PASSCODE || 'RKP-ADMIN-2026';

    const adminUser = ALLOWED_ADMINS[email];
    if (!adminUser) {
      return NextResponse.json(
        { error: 'This email is not on the authorized store admin allowlist.' },
        { status: 403 }
      );
    }

    if (passcode !== expectedPasscode) {
      return NextResponse.json({ error: 'Invalid admin passcode.' }, { status: 401 });
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
      summary: `${adminUser.name} (${adminUser.role}) signed into Admin CMS.`,
    });

    const res = NextResponse.json({
      authenticated: true,
      session: { email, name: adminUser.name, role: adminUser.role },
    });
    res.cookies.set(ADMIN_COOKIE_NAME, cookieVal, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch {
    return NextResponse.json({ error: 'Authentication failed.' }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ authenticated: false });
  res.cookies.delete(ADMIN_COOKIE_NAME);
  return res;
}
