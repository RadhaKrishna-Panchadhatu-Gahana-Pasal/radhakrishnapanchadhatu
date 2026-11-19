export function getSiteBaseUrl(): string {
  const raw =
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'http://localhost:3000';
  try {
    return new URL(raw).toString().replace(/\/$/, '');
  } catch {
    return 'http://localhost:3000';
  }
}

export function toAbsoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }
  const base = getSiteBaseUrl();
  const normalized = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${base}${normalized}`;
}

export function formatMetaDescription(text: string, fallback: string): string {
  const cleaned = (text || fallback).replace(/\s+/g, ' ').trim();
  if (cleaned.length <= 160) return cleaned;
  return `${cleaned.slice(0, 157).trimEnd()}...`;
}
