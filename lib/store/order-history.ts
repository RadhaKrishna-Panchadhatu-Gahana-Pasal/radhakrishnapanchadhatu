'use client';

const ORDER_TOKENS_STORAGE_KEY = 'rkp_order_tokens_v1';

export interface AccountOrderSummary {
  orderNumber: string;
  trackingToken?: string;
  totalPaisa: number;
  paymentStatus: string;
  fulfilmentStatus: string;
  createdAt: string;
  itemCount: number;
}

export interface MonthlySpendingPoint {
  monthKey: string;
  monthLabel: string;
  fullMonthLabel: string;
  spendPaisa: number;
  spendNpr: number;
  orderCount: number;
}

export interface SpendingSeriesSummary {
  series: MonthlySpendingPoint[];
  totalSpentPaisa: number;
  totalOrders: number;
  averageMonthlyPaisa: number;
}

export function getSavedTrackedOrderTokens(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ORDER_TOKENS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((t): t is string => typeof t === 'string' && t.trim().length > 0);
  } catch {
    return [];
  }
}

export function saveTrackedOrderToken(token: string | undefined | null): void {
  if (typeof window === 'undefined' || !token) return;
  const trimmed = token.trim();
  if (!trimmed) return;
  try {
    const current = getSavedTrackedOrderTokens();
    if (current.includes(trimmed)) return;
    const next = [trimmed, ...current].slice(0, 50);
    localStorage.setItem(ORDER_TOKENS_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore storage errors
  }
}

function parseTimestampToIso(value: unknown): string {
  if (typeof value === 'string') {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }
  if (value && typeof value === 'object') {
    const maybe = value as { toDate?: () => Date; seconds?: number };
    if (typeof maybe.toDate === 'function') {
      const d = maybe.toDate();
      if (!Number.isNaN(d.getTime())) return d.toISOString();
    }
    if (typeof maybe.seconds === 'number') {
      const d = new Date(maybe.seconds * 1000);
      if (!Number.isNaN(d.getTime())) return d.toISOString();
    }
  }
  return new Date().toISOString();
}

export function normalizeFirestoreOrder(raw: Record<string, unknown>): AccountOrderSummary | null {
  const orderNumber = typeof raw.orderNumber === 'string' ? raw.orderNumber.trim() : '';
  if (!orderNumber) return null;

  const totalPaisa =
    typeof raw.totalPaisa === 'number' && Number.isFinite(raw.totalPaisa) ? raw.totalPaisa : 0;

  const items = Array.isArray(raw.items) ? raw.items : [];
  const itemCount = items.reduce((sum, item) => {
    if (item && typeof item === 'object' && typeof (item as { quantity?: unknown }).quantity === 'number') {
      return sum + ((item as { quantity: number }).quantity || 1);
    }
    return sum + 1;
  }, 0);

  return {
    orderNumber,
    trackingToken: typeof raw.trackingToken === 'string' ? raw.trackingToken : undefined,
    totalPaisa,
    paymentStatus: typeof raw.paymentStatus === 'string' ? raw.paymentStatus : 'PENDING',
    fulfilmentStatus:
      typeof raw.fulfilmentStatus === 'string' ? raw.fulfilmentStatus : 'ORDER_PLACED',
    createdAt: parseTimestampToIso(raw.createdAt),
    itemCount: itemCount || items.length || 1,
  };
}

const EXCLUDED_FULFILMENT = new Set(['CANCELLED', 'RETURNED']);
const EXCLUDED_PAYMENT = new Set(['FAILED', 'CANCELLED', 'REFUNDED', 'EXPIRED']);

export function buildSixMonthSpendingSeries(
  orders: AccountOrderSummary[],
  referenceDate: Date = new Date()
): SpendingSeriesSummary {
  const buckets = new Map<string, MonthlySpendingPoint>();
  const orderedKeys: string[] = [];

  for (let offset = 5; offset >= 0; offset--) {
    const d = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - offset, 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const monthKey = `${year}-${month}`;
    const monthLabel = d.toLocaleDateString('en-US', { month: 'short' });
    const fullMonthLabel = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    orderedKeys.push(monthKey);
    buckets.set(monthKey, {
      monthKey,
      monthLabel,
      fullMonthLabel,
      spendPaisa: 0,
      spendNpr: 0,
      orderCount: 0,
    });
  }

  let totalSpentPaisa = 0;
  let totalOrders = 0;

  for (const order of orders) {
    if (
      EXCLUDED_FULFILMENT.has(order.fulfilmentStatus) ||
      EXCLUDED_PAYMENT.has(order.paymentStatus)
    ) {
      continue;
    }

    const created = new Date(order.createdAt);
    if (Number.isNaN(created.getTime())) continue;

    const key = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, '0')}`;
    const bucket = buckets.get(key);
    if (!bucket) continue;

    bucket.spendPaisa += order.totalPaisa;
    bucket.spendNpr = Math.round(bucket.spendPaisa / 100);
    bucket.orderCount += 1;

    totalSpentPaisa += order.totalPaisa;
    totalOrders += 1;
  }

  const series = orderedKeys.map((key) => buckets.get(key)!);

  return {
    series,
    totalSpentPaisa,
    totalOrders,
    averageMonthlyPaisa: Math.round(totalSpentPaisa / 6),
  };
}
