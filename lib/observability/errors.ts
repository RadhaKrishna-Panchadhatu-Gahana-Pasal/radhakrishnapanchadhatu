import type { SystemEvent } from '@/lib/store/types';

/**
 * Error capture for route handlers, payment reconciliation and background jobs.
 *
 * Every report is:
 *  - logged as one structured JSON line (picked up by Vercel logs),
 *  - kept in an in-memory ring buffer for /api/admin/system,
 *  - persisted into the store snapshot so the admin area can still show it
 *    after an instance recycles,
 *  - optionally POSTed to ERROR_WEBHOOK_URL (Slack/Discord/any collector).
 *
 * It never throws and never awaits the webhook, so it cannot break the request
 * that is already failing.
 */

const MAX_BUFFER = 50;

const globalForErrors = globalThis as unknown as {
  __rkpErrorBuffer?: SystemEvent[];
};

function buffer(): SystemEvent[] {
  if (!globalForErrors.__rkpErrorBuffer) globalForErrors.__rkpErrorBuffer = [];
  return globalForErrors.__rkpErrorBuffer;
}

export function getCapturedErrors(): SystemEvent[] {
  return [...buffer()];
}

export function clearCapturedErrors(): void {
  globalForErrors.__rkpErrorBuffer = [];
}

function describe(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  try {
    return JSON.stringify(error);
  } catch {
    return 'Unknown error';
  }
}

export function reportError(
  scope: string,
  error: unknown,
  context?: { detail?: string; path?: string }
): SystemEvent {
  const event: SystemEvent = {
    id: `err-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    level: 'ERROR',
    scope,
    message: describe(error).slice(0, 500),
    detail: context?.detail?.slice(0, 2000),
    path: context?.path,
    createdAt: new Date().toISOString(),
  };

  console.error(JSON.stringify({ level: 'error', scope, message: event.message, path: event.path }));

  const ring = buffer();
  ring.unshift(event);
  if (ring.length > MAX_BUFFER) ring.length = MAX_BUFFER;

  // Lazy import keeps this module usable in the edge build and in tests.
  void (async () => {
    try {
      const { recordSystemEvent } = await import('@/lib/store/operations');
      recordSystemEvent(event);
    } catch {
      // Persistence unavailable: the console line and ring buffer still exist.
    }
  })();

  const webhook = process.env.ERROR_WEBHOOK_URL?.trim();
  if (webhook) {
    const stack = error instanceof Error ? error.stack?.slice(0, 1500) : undefined;
    void fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `[${scope}] ${event.message}${event.path ? ` (${event.path})` : ''}`,
        scope,
        path: event.path,
        stack,
        at: event.createdAt,
      }),
    }).catch(() => {});
  }

  return event;
}

export function reportWarning(scope: string, message: string, detail?: string): SystemEvent {
  const event: SystemEvent = {
    id: `warn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    level: 'WARN',
    scope,
    message: message.slice(0, 500),
    detail: detail?.slice(0, 2000),
    createdAt: new Date().toISOString(),
  };
  console.warn(JSON.stringify({ level: 'warn', scope, message: event.message }));
  void (async () => {
    try {
      const { recordSystemEvent } = await import('@/lib/store/operations');
      recordSystemEvent(event);
    } catch {
      // ignore
    }
  })();
  return event;
}
