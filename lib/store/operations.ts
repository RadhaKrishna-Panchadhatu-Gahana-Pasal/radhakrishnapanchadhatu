import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { appendAuditLog, getStore, nowIso, saveStore, uid } from './repository';
import { computeLoyaltyPoints, computeRefundablePaisa, PAYMENT_RESERVATION_MINUTES } from './pricing';
import { isDatabaseConfigured, writeBackupSnapshot } from './postgres';
import type {
  AbandonedCart,
  AbandonedCartItem,
  AdminRole,
  AnalyticsDay,
  BackupRecord,
  GiftCard,
  InventoryMovement,
  NotificationChannel,
  Order,
  PaymentEvent,
  SystemEvent,
} from './types';

/**
 * Post-launch store operations: notifications ledger, analytics counters,
 * abandoned carts, gift cards, refunds, reconciliation, stock release,
 * backups and system events.
 *
 * Kept separate from repository.ts so the checkout/catalogue core stays the
 * single source of truth for orders while these admin concerns sit beside it.
 */

const NEPAL_TZ = 'Asia/Kathmandu';

function nepalDate(date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: NEPAL_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/* ------------------------------------------------------------------ */
/* System events (error monitoring)                                     */
/* ------------------------------------------------------------------ */

export function recordSystemEvent(event: SystemEvent): void {
  const store = getStore();
  store.systemEvents.unshift(event);
  if (store.systemEvents.length > 200) store.systemEvents.length = 200;
  saveStore();
}

export function listSystemEvents(limit = 50): SystemEvent[] {
  return getStore().systemEvents.slice(0, Math.max(1, Math.min(200, limit)));
}

/* ------------------------------------------------------------------ */
/* Notification ledger (prevents duplicate emails / WhatsApp messages)  */
/* ------------------------------------------------------------------ */

export function wasNotificationSent(key: string): boolean {
  return getStore().notificationLog.some((entry) => entry.key === key && entry.status === 'SENT');
}

export function recordNotification(input: {
  channel: NotificationChannel;
  key: string;
  to: string;
  subject: string;
  status: 'SENT' | 'SKIPPED' | 'FAILED';
  detail?: string;
}): void {
  const store = getStore();
  store.notificationLog.unshift({
    id: uid('ntf'),
    channel: input.channel,
    key: input.key,
    to: input.to,
    subject: input.subject,
    status: input.status,
    detail: input.detail,
    createdAt: nowIso(),
  });
  if (store.notificationLog.length > 300) store.notificationLog.length = 300;
  saveStore();
}

export function listNotifications(limit = 50) {
  return getStore().notificationLog.slice(0, Math.max(1, Math.min(300, limit)));
}

/* ------------------------------------------------------------------ */
/* Consent-gated analytics (first-party, no third-party cookies)        */
/* ------------------------------------------------------------------ */

const ANALYTICS_EVENTS = [
  'catalog_view',
  'product_view',
  'add_to_cart',
  'checkout_start',
  'purchase',
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[number];

export function isAnalyticsEvent(name: string): name is AnalyticsEventName {
  return (ANALYTICS_EVENTS as readonly string[]).includes(name);
}

export function recordAnalyticsEvent(name: AnalyticsEventName, quantity = 1): void {
  const store = getStore();
  const date = nepalDate();
  let day = store.analyticsDaily.find((entry) => entry.date === date);
  if (!day) {
    day = { date, events: {} };
    store.analyticsDaily.unshift(day);
    if (store.analyticsDaily.length > 400) store.analyticsDaily.length = 400;
  }
  day.events[name] = (day.events[name] ?? 0) + Math.max(1, Math.min(1000, Math.round(quantity)));
  saveStore();
}

export interface AnalyticsSummary {
  days: AnalyticsDay[];
  totals: Record<string, number>;
  conversionRate: number | null;
}

export function getAnalyticsSummary(days = 30): AnalyticsSummary {
  const store = getStore();
  const slice = store.analyticsDaily.slice(0, Math.max(1, days));
  const totals: Record<string, number> = {};
  for (const day of slice) {
    for (const [name, count] of Object.entries(day.events)) {
      totals[name] = (totals[name] ?? 0) + count;
    }
  }
  const starts = totals.checkout_start ?? 0;
  const purchases = totals.purchase ?? 0;
  return {
    days: slice,
    totals,
    conversionRate: starts > 0 ? Math.round((purchases / starts) * 1000) / 10 : null,
  };
}

/* ------------------------------------------------------------------ */
/* Abandoned carts                                                     */
/* ------------------------------------------------------------------ */

export function captureAbandonedCart(input: {
  email: string;
  customerName?: string;
  phone?: string;
  items: AbandonedCartItem[];
  subtotalPaisa: number;
  recoveryToken?: string;
}): AbandonedCart | null {
  const email = input.email.trim().toLowerCase();
  if (!email || input.items.length === 0) return null;
  const store = getStore();
  const existing = store.abandonedCarts.find(
    (cart) => cart.email === email && !cart.recoveredOrderNumber
  );
  const timestamp = nowIso();

  if (existing) {
    existing.items = input.items;
    existing.subtotalPaisa = input.subtotalPaisa;
    existing.customerName = input.customerName || existing.customerName;
    existing.phone = input.phone || existing.phone;
    saveStore();
    return existing;
  }

  const cart: AbandonedCart = {
    id: uid('cart'),
    email,
    customerName: input.customerName,
    phone: input.phone,
    items: input.items,
    subtotalPaisa: input.subtotalPaisa,
    recoveryToken: input.recoveryToken || `rec_${crypto.randomBytes(12).toString('hex')}`,
    createdAt: timestamp,
  };
  store.abandonedCarts.unshift(cart);
  if (store.abandonedCarts.length > 500) store.abandonedCarts.length = 500;
  saveStore();
  return cart;
}

export function markAbandonedCartRecovered(email: string, orderNumber: string): void {
  const store = getStore();
  const normalized = email.trim().toLowerCase();
  let changed = false;
  for (const cart of store.abandonedCarts) {
    if (cart.email === normalized && !cart.recoveredOrderNumber) {
      cart.recoveredOrderNumber = orderNumber;
      changed = true;
    }
  }
  if (changed) saveStore();
}

/** Carts older than the delay that have never been reminded and never converted. */
export function cartsDueForReminder(delayMinutes = 60, limit = 20): AbandonedCart[] {
  const cutoff = Date.now() - delayMinutes * 60_000;
  return getStore()
    .abandonedCarts.filter(
      (cart) =>
        !cart.remindedAt &&
        !cart.recoveredOrderNumber &&
        new Date(cart.createdAt).getTime() <= cutoff
    )
    .slice(0, limit);
}

export function markAbandonedCartReminded(id: string): void {
  const cart = getStore().abandonedCarts.find((entry) => entry.id === id);
  if (!cart) return;
  cart.remindedAt = nowIso();
  saveStore();
}

export function listAbandonedCarts(limit = 50): AbandonedCart[] {
  return getStore().abandonedCarts.slice(0, limit);
}

/* ------------------------------------------------------------------ */
/* Gift cards                                                          */
/* ------------------------------------------------------------------ */

function giftCardCode(): string {
  const block = () => crypto.randomBytes(2).toString('hex').toUpperCase();
  return `RKP-GIFT-${block()}-${block()}`;
}

export function listGiftCards(): GiftCard[] {
  return getStore().giftCards;
}

export function issueGiftCard(input: {
  amountPaisa: number;
  note?: string;
  code?: string;
  actor: string;
  role: AdminRole;
}): { ok: true; giftCard: GiftCard } | { ok: false; error: string } {
  const amountPaisa = Math.round(input.amountPaisa);
  if (!Number.isFinite(amountPaisa) || amountPaisa <= 0) {
    return { ok: false, error: 'Gift card value must be greater than zero.' };
  }
  const store = getStore();
  const requested = input.code?.trim().toUpperCase();
  if (requested && store.giftCards.some((card) => card.code === requested)) {
    return { ok: false, error: 'That gift card code already exists.' };
  }
  const timestamp = nowIso();
  const giftCard: GiftCard = {
    id: uid('gift'),
    code: requested || giftCardCode(),
    initialPaisa: amountPaisa,
    balancePaisa: amountPaisa,
    active: true,
    note: input.note?.trim(),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  store.giftCards.unshift(giftCard);
  appendAuditLog({
    actor: input.actor,
    role: input.role,
    action: 'GIFT_CARD_ISSUED',
    entityType: 'GiftCard',
    entityId: giftCard.code,
    summary: `Issued gift card ${giftCard.code} for NPR ${(amountPaisa / 100).toLocaleString()}.`,
  });
  return { ok: true, giftCard };
}

export function setGiftCardActive(code: string, active: boolean): GiftCard | null {
  const card = getStore().giftCards.find((entry) => entry.code === code);
  if (!card) return null;
  card.active = active;
  card.updatedAt = nowIso();
  saveStore();
  return card;
}

export function findGiftCardByCode(code: string): GiftCard | null {
  const normalized = code.trim().toUpperCase();
  return getStore().giftCards.find((card) => card.code === normalized) ?? null;
}

/* ------------------------------------------------------------------ */
/* Stock release & reservations                                        */
/* ------------------------------------------------------------------ */

function restoreStock(order: Order, reason: string): void {
  if (!order.stockReserved || order.stockReleased) return;
  const store = getStore();
  const timestamp = nowIso();
  for (const item of order.items) {
    const product = store.products.find((entry) => entry.id === item.productId);
    if (!product || product.productType !== 'READY_STOCK') continue;
    const variant = item.variantId
      ? product.variants.find((entry) => entry.id === item.variantId)
      : undefined;
    if (variant) variant.stockQuantity += item.quantity;
    product.stockQuantity += item.quantity;
    const movement: InventoryMovement = {
      id: uid('mov'),
      productId: product.id,
      productName: product.name,
      variantId: variant?.id,
      quantityDelta: item.quantity,
      reason,
      actorName: 'Order System',
      createdAt: timestamp,
    };
    store.inventoryMovements.unshift(movement);
  }
  order.stockReleased = true;
  order.stockReserved = false;
  order.updatedAt = timestamp;
  saveStore();
}

/**
 * Expires unpaid online orders after the hold window: stock returns to the
 * shelf so a single abandoned gateway tab cannot block inventory forever.
 */
export function releaseExpiredReservations(now = new Date()): { released: number; orderNumbers: string[] } {
  const store = getStore();
  const released: string[] = [];
  for (const order of store.orders) {
    if (!order.stockReserved || order.stockReleased) continue;
    // Cash on delivery never holds stock waiting for a gateway, and an order
    // the team already picked/packed must not be swept because a field is old.
    if (order.paymentMethod === 'COD') continue;
    if (order.paymentStatus === 'PAID') continue;
    if (order.fulfilmentStatus !== 'ORDER_PLACED' && order.fulfilmentStatus !== 'ORDER_RECEIVED') {
      continue;
    }
    const expiresAt = order.reservationExpiresAt
      ? new Date(order.reservationExpiresAt).getTime()
      : new Date(order.createdAt).getTime() + PAYMENT_RESERVATION_MINUTES * 60_000;
    if (expiresAt > now.getTime()) continue;

    const timestamp = nowIso();
    if (order.paymentStatus === 'INITIATED' || order.paymentStatus === 'PROCESSING') {
      order.paymentStatus = 'EXPIRED';
      order.payment.status = 'EXPIRED';
    }
    order.timeline.push({
      id: uid('tl'),
      fromStatus: order.fulfilmentStatus,
      toStatus: order.fulfilmentStatus,
      publicNote:
        order.paymentStatus === 'EXPIRED'
          ? `Payment was not completed within ${PAYMENT_RESERVATION_MINUTES} minutes, so the reserved stock was released. You can place the order again or contact us on WhatsApp.`
          : 'Reserved stock was released because the order was not completed.',
      actor: 'Reservation Sweep',
      createdAt: timestamp,
    });
    order.updatedAt = timestamp;
    restoreStock(order, 'Reservation expired — stock released');
    released.push(order.orderNumber);
  }
  if (released.length > 0) saveStore();
  return { released: released.length, orderNumbers: released };
}

export function cancelOrder(input: {
  orderId: string;
  reason?: string;
  actor: string;
  role: AdminRole;
}): Order | null {
  const order = getStore().orders.find((entry) => entry.id === input.orderId);
  if (!order) return null;
  const timestamp = nowIso();
  const previous = order.fulfilmentStatus;
  order.fulfilmentStatus = 'CANCELLED';
  order.timeline.push({
    id: uid('tl'),
    fromStatus: previous,
    toStatus: 'CANCELLED',
    publicNote: input.reason?.trim() || 'Order cancelled by the store.',
    actor: input.actor,
    createdAt: timestamp,
  });
  order.updatedAt = timestamp;
  if (order.paymentStatus !== 'PAID' && order.paymentStatus !== 'REFUNDED') {
    order.paymentStatus = 'CANCELLED';
    order.payment.status = 'CANCELLED';
  }
  restoreStock(order, 'Order cancelled — stock released');
  appendAuditLog({
    actor: input.actor,
    role: input.role,
    action: 'ORDER_CANCELLED',
    entityType: 'Order',
    entityId: order.orderNumber,
    summary: `Cancelled ${order.orderNumber}: ${input.reason?.trim() || 'no reason given'}.`,
  });
  saveStore();
  return order;
}

/* ------------------------------------------------------------------ */
/* Refunds                                                             */
/* ------------------------------------------------------------------ */

export function recordRefund(input: {
  orderId: string;
  amountPaisa: number;
  reason: string;
  actor: string;
  role: AdminRole;
  gatewayReference?: string;
}): { ok: true; order: Order } | { ok: false; error: string } {
  const store = getStore();
  const order = store.orders.find((entry) => entry.id === input.orderId);
  if (!order) return { ok: false, error: 'Order not found.' };
  if (order.paymentStatus !== 'PAID' && order.paymentStatus !== 'PARTIALLY_REFUNDED') {
    return { ok: false, error: 'Only a paid order can be refunded.' };
  }

  const refunded = order.payment.refundedPaisa ?? 0;
  const refundable = computeRefundablePaisa({ totalPaisa: order.totalPaisa, refundedPaisa: refunded });
  const amountPaisa = Math.round(input.amountPaisa);
  if (amountPaisa <= 0) return { ok: false, error: 'Refund amount must be greater than zero.' };
  if (amountPaisa > refundable) {
    return {
      ok: false,
      error: `Refund exceeds the remaining balance of NPR ${(refundable / 100).toLocaleString()}.`,
    };
  }

  const timestamp = nowIso();
  const refund = {
    id: uid('ref'),
    amountPaisa,
    reason: input.reason.trim() || 'Customer refund',
    actor: input.actor,
    gatewayReference: input.gatewayReference,
    createdAt: timestamp,
  };
  order.payment.refunds = [...(order.payment.refunds ?? []), refund];
  order.payment.refundedPaisa = refunded + amountPaisa;
  const fullyRefunded = order.payment.refundedPaisa >= order.totalPaisa;
  order.paymentStatus = fullyRefunded ? 'REFUNDED' : 'PARTIALLY_REFUNDED';
  order.payment.status = order.paymentStatus;
  order.updatedAt = timestamp;
  order.timeline.push({
    id: uid('tl'),
    fromStatus: order.fulfilmentStatus,
    toStatus: order.fulfilmentStatus,
    publicNote: `Refund of NPR ${(amountPaisa / 100).toLocaleString()} recorded${
      fullyRefunded ? ' — order fully refunded.' : ' (partial refund).'
    }`,
    internalNote: refund.reason,
    actor: input.actor,
    createdAt: timestamp,
  });

  const event: PaymentEvent = {
    id: uid('pev'),
    orderId: order.id,
    orderNumber: order.orderNumber,
    providerReference: order.payment.providerReference,
    outcome: 'REFUNDED',
    source: 'ADMIN',
    amountPaisa,
    gatewayReference: input.gatewayReference,
    note: refund.reason,
    createdAt: timestamp,
  };
  store.paymentEvents.unshift(event);

  appendAuditLog({
    actor: input.actor,
    role: input.role,
    action: 'PAYMENT_REFUNDED',
    entityType: 'Order',
    entityId: order.orderNumber,
    summary: `Refunded NPR ${(amountPaisa / 100).toLocaleString()} on ${order.orderNumber} (${refund.reason}).`,
  });
  saveStore();
  return { ok: true, order };
}

/* ------------------------------------------------------------------ */
/* Reconciliation                                                      */
/* ------------------------------------------------------------------ */

export interface ReconciliationReport {
  checked: number;
  expired: number;
  flagged: string[];
  alreadyPaid: number;
  generatedAt: string;
}

/**
 * Nightly/manual payment reconciliation.
 *
 * The single source of truth for a payment is the gateway's server-to-server
 * verification at callback time. This sweep catches what the callback cannot:
 * abandoned gateway tabs (expire + release stock), orders paid without a stored
 * gateway reference (flag for a human), and status drift between the order and
 * its payment record.
 */
export function reconcilePayments(): ReconciliationReport {
  const store = getStore();
  const reservation = releaseExpiredReservations();
  const flagged: string[] = [];
  let checked = 0;
  let alreadyPaid = 0;

  for (const order of store.orders) {
    if (order.paymentStatus === 'PAID') {
      alreadyPaid += 1;
      if (order.payment.status !== 'PAID') {
        order.payment.status = 'PAID';
        order.updatedAt = nowIso();
      }
      if (!order.payment.gatewayReference && order.paymentMethod !== 'COD') {
        flagged.push(order.orderNumber);
      }
      continue;
    }
    if (order.paymentStatus === 'PARTIALLY_REFUNDED' || order.paymentStatus === 'REFUNDED') {
      continue;
    }
    if (order.paymentStatus === 'INITIATED' || order.paymentStatus === 'PROCESSING') {
      checked += 1;
      const ageMinutes = (Date.now() - new Date(order.createdAt).getTime()) / 60_000;
      if (ageMinutes > 60 * 24 && order.stockReleased) {
        order.paymentStatus = 'MANUAL_REVIEW';
        order.payment.status = 'MANUAL_REVIEW';
        order.updatedAt = nowIso();
        flagged.push(order.orderNumber);
      }
    }
  }

  const report: ReconciliationReport = {
    checked,
    expired: reservation.released,
    flagged: Array.from(new Set(flagged)),
    alreadyPaid,
    generatedAt: nowIso(),
  };
  appendAuditLog({
    actor: 'Reconciliation Sweep',
    role: 'OWNER',
    action: 'PAYMENTS_RECONCILED',
    entityType: 'Payment',
    entityId: 'all',
    summary: `Checked ${checked} pending payments, expired ${reservation.released} reservations, flagged ${report.flagged.length} orders.`,
  });
  saveStore();
  return report;
}

/* ------------------------------------------------------------------ */
/* Backups                                                             */
/* ------------------------------------------------------------------ */

const BACKUP_DIR = path.join(process.cwd(), '.data', 'backups');
const MAX_BACKUPS = 14;

/**
 * Copies the whole store snapshot. Postgres gets a dedicated `store_backups`
 * table (a second, independent row set from the live snapshot); the local file
 * backend writes a timestamped JSON file under .data/backups.
 */
export async function createStoreBackup(reason: string): Promise<BackupRecord> {
  const store = getStore();
  const payload = JSON.stringify(store);
  const record: BackupRecord = {
    id: uid('bak'),
    reason,
    orders: store.orders.length,
    products: store.products.length,
    sizeBytes: Buffer.byteLength(payload, 'utf8'),
    revision: null,
    createdAt: nowIso(),
  };

  if (isDatabaseConfigured()) {
    const revision = await writeBackupSnapshot(record.id, payload);
    record.revision = revision;
  } else {
    try {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
      const file = path.join(BACKUP_DIR, `${record.createdAt.replace(/[:.]/g, '-')}.json`);
      fs.writeFileSync(file, payload, 'utf8');
    } catch (error) {
      console.warn('[backup] Could not write local backup file.', error instanceof Error ? error.message : error);
    }
  }

  store.backups.unshift(record);
  if (store.backups.length > MAX_BACKUPS) store.backups.length = MAX_BACKUPS;
  saveStore();
  return record;
}

export function listBackups(): BackupRecord[] {
  return getStore().backups;
}

/** Full JSON export for the admin download button. */
export function exportStoreJson(): string {
  return JSON.stringify(getStore(), null, 2);
}

/* ------------------------------------------------------------------ */
/* Product CSV import                                                  */
/* ------------------------------------------------------------------ */

export interface ProductImportRow {
  sku: string;
  name: string;
  categorySlug?: string;
  material?: string;
  priceNpr: number;
  compareAtNpr?: number;
  stock: number;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  shortDescription?: string;
}

export interface ProductImportResult {
  created: number;
  updated: number;
  skipped: string[];
}

export function importProducts(rows: ProductImportRow[], actor: string): ProductImportResult {
  const store = getStore();
  const result: ProductImportResult = { created: 0, updated: 0, skipped: [] };
  const timestamp = nowIso();

  for (const row of rows) {
    const sku = row.sku?.trim().toUpperCase();
    if (!sku || !row.name?.trim() || !Number.isFinite(row.priceNpr) || row.priceNpr <= 0) {
      result.skipped.push(row.sku || '(blank sku)');
      continue;
    }
    const category =
      store.categories.find((entry) => entry.slug === row.categorySlug) ?? store.categories[0];
    const existing = store.products.find((entry) => entry.sku.toUpperCase() === sku);
    const pricePaisa = Math.round(row.priceNpr * 100);

    if (existing) {
      existing.name = row.name.trim();
      existing.pricePaisa = pricePaisa;
      existing.compareAtPaisa = row.compareAtNpr ? Math.round(row.compareAtNpr * 100) : null;
      existing.stockQuantity = Math.max(0, Math.round(row.stock));
      existing.categoryId = category?.id ?? existing.categoryId;
      existing.categoryName = category?.name ?? existing.categoryName;
      if (row.material) existing.material = row.material;
      if (row.shortDescription) existing.shortDescription = row.shortDescription;
      if (row.status) existing.status = row.status;
      existing.updatedAt = timestamp;
      result.updated += 1;
      continue;
    }

    const slugBase = row.name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    let slug = slugBase || sku.toLowerCase();
    let suffix = 2;
    while (store.products.some((entry) => entry.slug === slug)) {
      slug = `${slugBase}-${suffix++}`;
    }

    store.products.unshift({
      id: uid('prod'),
      name: row.name.trim(),
      slug,
      sku,
      shortDescription: row.shortDescription || row.name.trim(),
      description: row.shortDescription || row.name.trim(),
      material: row.material || 'Panchadhatu',
      categoryId: category?.id ?? 'cat-panchadhatu',
      categoryName: category?.name ?? 'Panchadhatu',
      pricePaisa,
      compareAtPaisa: row.compareAtNpr ? Math.round(row.compareAtNpr * 100) : null,
      stockQuantity: Math.max(0, Math.round(row.stock)),
      lowStockThreshold: 3,
      productType: 'READY_STOCK',
      careInstructions: 'Wipe gently with a dry cotton cloth after wear.',
      deliveryNote: 'Dispatched from Butwal across Nepal.',
      tags: [row.material?.toLowerCase() || 'panchadhatu'],
      images: [
        {
          id: uid('img'),
          url: '/images/product-necklace.jpg',
          alt: row.name.trim(),
          isPrimary: true,
        },
      ],
      variants: [],
      isFeatured: false,
      isNewArrival: true,
      isBestSeller: false,
      status: row.status ?? 'DRAFT',
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    result.created += 1;
  }

  appendAuditLog({
    actor,
    role: 'OWNER',
    action: 'PRODUCTS_IMPORTED',
    entityType: 'Product',
    entityId: 'csv',
    summary: `CSV import: ${result.created} created, ${result.updated} updated, ${result.skipped.length} skipped.`,
  });
  saveStore();
  return result;
}

/** Loyalty points accrue only once an order is delivered. */
export function loyaltyPointsForStore(): number {
  return getStore().orders
    .filter((order) => order.fulfilmentStatus === 'DELIVERED')
    .reduce((sum, order) => sum + (order.loyaltyPointsEarned ?? computeLoyaltyPoints(order.totalPaisa)), 0);
}
