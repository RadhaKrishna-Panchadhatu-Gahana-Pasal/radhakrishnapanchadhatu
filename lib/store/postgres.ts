import type { PrismaClient } from '@prisma/client';
import type { StoreDatabase } from './repository';

/**
 * Postgres snapshot storage for the shop.
 *
 * The CMS, catalogue and orders already live in one StoreDatabase object, so
 * the cheapest durable home for them is a single JSONB row. That keeps the
 * whole domain (and every page that reads it) unchanged while making data
 * survive on hosts without a writable disk, such as Vercel.
 *
 * The table is created on first use, so no migration step is required.
 * Prisma is already a project dependency, so no new package is needed.
 */

const SNAPSHOT_ID = 'default';

const CREATE_TABLE_SQL = `CREATE TABLE IF NOT EXISTS store_state (
  id text PRIMARY KEY,
  data jsonb NOT NULL,
  revision bigint NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now()
)`;

const globalForPostgres = globalThis as unknown as {
  __rkpPrisma?: PrismaClient;
  __rkpTableReady?: boolean;
};

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

async function getClient(): Promise<PrismaClient> {
  if (globalForPostgres.__rkpPrisma) return globalForPostgres.__rkpPrisma;
  // Imported lazily so the file-store path (and the edge build) never needs it.
  const { PrismaClient: PrismaClientConstructor } = await import('@prisma/client');
  const client = new PrismaClientConstructor({ log: ['error'] });
  globalForPostgres.__rkpPrisma = client;
  return client;
}

async function ensureTable(client: PrismaClient): Promise<void> {
  if (globalForPostgres.__rkpTableReady) return;
  await client.$executeRawUnsafe(CREATE_TABLE_SQL);
  globalForPostgres.__rkpTableReady = true;
}

/** Reads the saved snapshot. Returns null when no row has been written yet. */
export async function readStoreSnapshot(): Promise<unknown | null> {
  const client = await getClient();
  await ensureTable(client);
  const rows = await client.$queryRawUnsafe<Array<{ data: unknown }>>(
    'SELECT data FROM store_state WHERE id = $1 LIMIT 1',
    SNAPSHOT_ID
  );
  const raw = rows[0]?.data;
  if (raw === undefined || raw === null) return null;
  if (typeof raw === 'string') {
    return JSON.parse(raw) as unknown;
  }
  return raw;
}

/** Upserts the whole snapshot in one atomic statement (last write wins). */
export async function writeStoreSnapshot(payloadJson: string): Promise<void> {
  const client = await getClient();
  await ensureTable(client);
  await client.$executeRawUnsafe(
    `INSERT INTO store_state (id, data, revision, updated_at)
     VALUES ($1, $2::jsonb, 1, now())
     ON CONFLICT (id) DO UPDATE
       SET data = EXCLUDED.data,
           revision = store_state.revision + 1,
           updated_at = now()`,
    SNAPSHOT_ID,
    payloadJson
  );
}

/** Diagnostics for the admin area / logs. Never exposes credentials. */
export async function getDatabaseStatus(): Promise<{
  configured: boolean;
  connected: boolean;
  updatedAt: string | null;
  revision: number | null;
  error: string | null;
}> {
  if (!isDatabaseConfigured()) {
    return { configured: false, connected: false, updatedAt: null, revision: null, error: null };
  }
  try {
    const client = await getClient();
    await ensureTable(client);
    const rows = await client.$queryRawUnsafe<
      Array<{ revision: bigint | number; updated_at: Date | string }>
    >('SELECT revision, updated_at FROM store_state WHERE id = $1 LIMIT 1', SNAPSHOT_ID);
    const row = rows[0];
    return {
      configured: true,
      connected: true,
      updatedAt: row ? new Date(row.updated_at).toISOString() : null,
      revision: row ? Number(row.revision) : null,
      error: null,
    };
  } catch (error) {
    return {
      configured: true,
      connected: false,
      updatedAt: null,
      revision: null,
      error: error instanceof Error ? error.message : 'Unknown database error',
    };
  }
}

export type { StoreDatabase };
