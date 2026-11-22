import { NextResponse } from 'next/server';
import { getAdminSession, type AdminSession } from '@/lib/store/auth';
import type { AdminRole } from '@/lib/store/types';

/**
 * One place that decides whether a request may touch the admin API.
 * Every admin route uses this instead of repeating cookie parsing.
 */
export type AdminGuard =
  | { ok: true; session: AdminSession }
  | { ok: false; response: NextResponse };

export function requireAdmin(roles?: AdminRole[]): AdminGuard {
  const session = getAdminSession();
  if (!session) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } }
      ),
    };
  }
  if (roles && roles.length > 0 && !roles.includes(session.role)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: `This action requires one of: ${roles.join(', ')}.` },
        { status: 403, headers: { 'Cache-Control': 'no-store' } }
      ),
    };
  }
  return { ok: true, session };
}
