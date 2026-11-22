'use client';

import { useEffect } from 'react';
import { trackEvent, type FunnelEvent } from '@/lib/analytics/client';

/** Fires one funnel event on mount, only when analytics consent exists. */
export function PageViewTracker({ event }: { event: FunnelEvent }) {
  useEffect(() => {
    trackEvent(event);
  }, [event]);
  return null;
}
