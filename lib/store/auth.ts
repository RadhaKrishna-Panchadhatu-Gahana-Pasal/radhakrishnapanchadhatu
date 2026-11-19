import crypto from 'crypto';
import { cookies } from 'next/headers';
import type { AdminRole } from './types';

const ADMIN_COOKIE_NAME = 'rkp_admin_session';
const CUSTOMER_COOKIE_NAME = 'rkp_customer_session';

function getSecret(): string {
  return process.env.AUTH_SECRET || 'radhakrishna-local-dev-auth-secret';
}

function signPayload(payloadB64: string): string {
  return crypto.createHmac('sha256', getSecret()).update(payloadB64).digest('base64url');
}

function encodeToken(data: Record<string, unknown>): string {
  const payloadB64 = Buffer.from(JSON.stringify(data), 'utf8').toString('base64url');
  const sig = signPayload(payloadB64);
  return `${payloadB64}.${sig}`;
}

function decodeToken<T>(token: string | undefined): T | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payloadB64, sig] = parts;
  const expected = signPayload(payloadB64);
  if (sig.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8')) as T & {
      exp?: number;
    };
    if (parsed.exp && Date.now() > parsed.exp) return null;
    return parsed;
  } catch {
    return null;
  }
}

export interface AdminSession {
  email: string;
  name: string;
  role: AdminRole;
  exp: number;
}

export interface CustomerSession {
  name: string;
  email?: string;
  phone?: string;
  exp: number;
}

export function createAdminSessionCookieValue(session: Omit<AdminSession, 'exp'>): string {
  return encodeToken({
    ...session,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
  });
}

export function getAdminSession(): AdminSession | null {
  const cookieStore = cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  return decodeToken<AdminSession>(token);
}

export function createCustomerSessionCookieValue(session: Omit<CustomerSession, 'exp'>): string {
  return encodeToken({
    ...session,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 14,
  });
}

export function getCustomerSession(): CustomerSession | null {
  const cookieStore = cookies();
  const token = cookieStore.get(CUSTOMER_COOKIE_NAME)?.value;
  return decodeToken<CustomerSession>(token);
}

export { ADMIN_COOKIE_NAME, CUSTOMER_COOKIE_NAME };
