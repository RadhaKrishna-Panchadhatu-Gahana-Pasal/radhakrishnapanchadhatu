import path from 'path';
import { resolveStoreFilePath } from './persistence';

/**
 * Image uploads live next to the shop data file so a single backup copies both.
 * Default: <project>/.data/uploads
 */
export function getUploadsDirectory(): string {
  const configured = process.env.UPLOADS_DIR?.trim();
  if (configured) return path.resolve(configured);
  return path.join(path.dirname(resolveStoreFilePath()), 'uploads');
}

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export const UPLOAD_MIME_EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif',
};

export const CONTENT_TYPE_BY_EXTENSION: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
};
