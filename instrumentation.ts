/**
 * Next.js instrumentation hook.
 *
 * Runs once when a server instance starts (including each Vercel serverless
 * cold start), before the first request is handled. That is the right moment to
 * load the saved store from Postgres or the local JSON file, because the rest
 * of the repository API reads synchronously from memory.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  try {
    const { hydrateStore } = await import('./lib/store/repository');
    await hydrateStore();
  } catch (error) {
    console.error(
      '[store] Startup hydration failed.',
      error instanceof Error ? error.message : error
    );
  }
}
