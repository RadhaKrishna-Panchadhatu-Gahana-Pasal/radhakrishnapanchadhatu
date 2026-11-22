import fs from 'fs';
import path from 'path';
import type { StoreDatabase } from './repository';
import { isDatabaseConfigured, readStoreSnapshot, writeStoreSnapshot } from './postgres';

/**
 * Durable storage for the shop database.
 *
 * Two backends:
 *  - Postgres (used whenever DATABASE_URL is set, e.g. Vercel + Neon/Supabase).
 *  - A local JSON file (used by local development with no DATABASE_URL).
 *
 * Reads are awaited once at startup and cached in memory, because the whole
 * repository API is synchronous. Writes are queued and flushed before the
 * request that caused them finishes, so a serverless instance can never be
 * frozen between a mutation and its save.
 */

export const DEFAULT_STORE_FILE = '.data/store.json';

export function resolveStoreFilePath(): string {
  const configured = process.env.STORE_DATA_FILE?.trim();
  if (configured) return path.resolve(configured);
  return path.join(process.cwd(), DEFAULT_STORE_FILE);
}

export function getPersistenceBackend(): 'database' | 'file' {
  return isDatabaseConfigured() ? 'database' : 'file';
}

const REQUIRED_COLLECTIONS = [
  'categories',
  'products',
  'banners',
  'announcements',
  'homepageSections',
  'pages',
  'shippingZones',
  'coupons',
  'orders',
  'reviews',
  'customOrderRequests',
  'contactEnquiries',
  'inventoryMovements',
  'mediaAssets',
  'auditLogs',
] as const;

let warnedAboutDisk = false;

export function isStoreDatabase(value: unknown): value is StoreDatabase {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  if (!record.settings || typeof record.settings !== 'object') return false;
  return REQUIRED_COLLECTIONS.every((key) => Array.isArray(record[key]));
}

/** Returns the saved store, or null when there is nothing usable on disk yet. */
export function loadStoreFromDisk(): StoreDatabase | null {
  const file = resolveStoreFilePath();
  try {
    if (!fs.existsSync(file)) return null;
    const parsed: unknown = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!isStoreDatabase(parsed)) {
      console.warn(
        `[store] ${file} does not look like a store database yet. Starting from seed data.`
      );
      return null;
    }
    return parsed;
  } catch (error) {
    console.warn(
      `[store] Could not read ${file}. Starting from seed data.`,
      error instanceof Error ? error.message : error
    );
    return null;
  }
}

/**
 * Loads the authoritative snapshot. Throws when Postgres is configured but
 * unreachable: falling back to seed data in that case would be dangerous,
 * because the next save would overwrite real orders.
 */
export async function loadStoreSnapshot(): Promise<StoreDatabase | null> {
  if (isDatabaseConfigured()) {
    const snapshot = await readStoreSnapshot();
    if (snapshot === null) return null;
    if (!isStoreDatabase(snapshot)) {
      console.warn('[store] The saved Postgres snapshot is not a store database. Keeping seed data.');
      return null;
    }
    return snapshot;
  }
  return loadStoreFromDisk();
}

/** Writes the whole store atomically to disk. Returns false when the filesystem refuses. */
export function saveStoreToDisk(database: StoreDatabase): boolean {
  const file = resolveStoreFilePath();
  const tempFile = `${file}.${process.pid}.tmp`;
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(tempFile, `${JSON.stringify(database, null, 2)}\n`, 'utf8');
    fs.renameSync(tempFile, file);
    return true;
  } catch (error) {
    if (!warnedAboutDisk) {
      warnedAboutDisk = true;
      console.warn(
        `[store] Content changes are not being saved: ${file} is not writable. ` +
          'Set DATABASE_URL to persist on a serverless host, or STORE_DATA_FILE to a writable path.',
        error instanceof Error ? error.message : error
      );
    }
    try {
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
    } catch {
      // temp cleanup is best-effort only
    }
    return false;
  }
}

// ---------------------------------------------------------------------------
// Postgres write queue
// ---------------------------------------------------------------------------

let writeQueue: Promise<void> = Promise.resolve();
let lastWriteOk = true;
let lastWriteError: string | null = null;
let warnedAboutDatabase = false;

/**
 * Queues a snapshot write. The payload is serialised immediately so the write
 * captures the state at the moment of the mutation, even though the network
 * call happens later.
 */
export function queueStoreSave(database: StoreDatabase): void {
  const payload = JSON.stringify(database);
  const run = async () => {
    try {
      await writeStoreSnapshot(payload);
      lastWriteOk = true;
      lastWriteError = null;
    } catch (error) {
      lastWriteOk = false;
      lastWriteError = error instanceof Error ? error.message : 'Unknown database error';
      if (!warnedAboutDatabase) {
        warnedAboutDatabase = true;
        console.warn(
          '[store] Could not save to Postgres. Recent changes are still in memory and will be ' +
            'retried on the next save.',
          lastWriteError
        );
      }
    }
  };
  writeQueue = writeQueue.then(run);
}

/** Waits for every queued Postgres write. Call before returning a mutation response. */
export async function flushStoreWrites(): Promise<boolean> {
  if (!isDatabaseConfigured()) return true;
  await writeQueue;
  return lastWriteOk;
}

export function getLastStoreWriteError(): string | null {
  return lastWriteError;
}
