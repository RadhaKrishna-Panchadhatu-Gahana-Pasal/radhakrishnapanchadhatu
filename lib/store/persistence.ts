import fs from 'fs';
import path from 'path';
import type { StoreDatabase } from './repository';

/**
 * Durable JSON store for the shop.
 *
 * The CMS, catalogue, orders and settings all live in a single StoreDatabase
 * object. Without this module that object only exists in memory, so every
 * server restart (or serverless cold start) wiped everything an admin saved.
 *
 * Writes are atomic (temp file + rename) and failures never throw: on hosts
 * with a read-only filesystem (e.g. Vercel) the app keeps working in memory
 * and logs a single warning.
 */

export const DEFAULT_STORE_FILE = '.data/store.json';

export function resolveStoreFilePath(): string {
  const configured = process.env.STORE_DATA_FILE?.trim();
  if (configured) return path.resolve(configured);
  return path.join(process.cwd(), DEFAULT_STORE_FILE);
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

function isStoreDatabase(value: unknown): value is StoreDatabase {
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

/** Writes the whole store atomically. Returns false when the filesystem refuses. */
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
          'Set STORE_DATA_FILE to a writable path, or run on a host with a persistent disk.',
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
