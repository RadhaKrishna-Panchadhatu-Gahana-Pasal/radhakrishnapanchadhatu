/**
 * Consent-gated, first-party funnel tracking.
 *
 * Nothing is sent unless the shopper accepted analytics in the cookie banner
 * (the same `rkp_cookie_consent_v1` record the banner writes). There are no
 * cookies, no identifiers or third-party scripts involved: the server only
 * increments daily counters.
 */

const CONSENT_KEY = 'rkp_cookie_consent_v1';

export type FunnelEvent = 'catalog_view' | 'product_view' | 'add_to_cart' | 'checkout_start' | 'purchase';

export function analyticsAllowed(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { analytics?: boolean };
    return parsed.analytics === true;
  } catch {
    return false;
  }
}

export function trackEvent(name: FunnelEvent, quantity = 1): void {
  if (!analyticsAllowed()) return;
  try {
    const body = JSON.stringify({ name, quantity });
    // keepalive lets the purchase event survive the redirect to the thank-you page.
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([body], { type: 'application/json' });
      if (navigator.sendBeacon('/api/analytics/events', blob)) return;
    }
    void fetch('/api/analytics/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // analytics must never break shopping
  }
}
