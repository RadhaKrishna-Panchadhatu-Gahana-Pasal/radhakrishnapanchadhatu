import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/store/admin-guard';
import { exportStoreJson } from '@/lib/store/operations';
import { hydrateStore } from '@/lib/store/repository';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Full snapshot download — the "take a copy before a big edit" escape hatch. */
export async function GET() {
  const guard = requireAdmin(['OWNER', 'MANAGER']);
  if (!guard.ok) return guard.response;

  await hydrateStore();
  const date = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  return new NextResponse(exportStoreJson(), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="radhakrishna-store-${date}.json"`,
      'Cache-Control': 'no-store',
    },
  });
}
