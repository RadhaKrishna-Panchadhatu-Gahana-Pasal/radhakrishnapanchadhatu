import { NextResponse } from 'next/server';
import { getDatabaseStatus } from '@/lib/store/postgres';
import { getStoreStorage, hydrateStore, isStoreHydrated } from '@/lib/store/repository';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Where the shop data is being read from and whether Postgres is reachable.
 * Deliberately exposes no credentials, hostnames or customer data: it exists so
 * a deployment can be checked without shell access.
 */
export async function GET() {
  await hydrateStore();
  const status = await getDatabaseStatus();

  return NextResponse.json(
    {
      storage: getStoreStorage(),
      hydrated: isStoreHydrated(),
      database: {
        configured: status.configured,
        connected: status.connected,
        revision: status.revision,
        updatedAt: status.updatedAt,
      },
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
