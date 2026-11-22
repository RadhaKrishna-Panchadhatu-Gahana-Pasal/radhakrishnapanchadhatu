import { abandonedCartEmail, giftCardEmail, orderConfirmationEmail, orderStatusEmail } from '@/emails/templates';
import { sendEmail } from '@/lib/notifications/email';
import { sendWhatsAppOrderConfirmation, sendWhatsAppStatusUpdate } from '@/lib/notifications/whatsapp';
import { recordNotification, wasNotificationSent } from '@/lib/store/operations';
import type { Order } from '@/lib/store/types';

/**
 * Single place that decides who gets told about what. Every send is keyed in the
 * notification ledger, so a retried checkout, a refreshed callback or a repeated
 * admin save can never email the customer twice.
 */

function origin(): string {
  return (process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/+$/, '');
}

export function trackingUrlFor(order: Order): string {
  const base = origin();
  const path = `/track-order/${encodeURIComponent(order.trackingToken)}`;
  return base ? `${base}${path}` : path;
}

export interface DispatchOutcome {
  email: 'SENT' | 'SKIPPED' | 'FAILED' | 'DUPLICATE';
  whatsapp: 'SENT' | 'SKIPPED' | 'FAILED' | 'DUPLICATE';
}

export async function notifyOrderPlaced(order: Order): Promise<DispatchOutcome> {
  const emailKey = `order:${order.orderNumber}:placed`;
  const waKey = `order:${order.orderNumber}:wa-placed`;
  const outcome: DispatchOutcome = { email: 'SKIPPED', whatsapp: 'SKIPPED' };

  if (wasNotificationSent(emailKey)) {
    outcome.email = 'DUPLICATE';
  } else if (order.customerEmail) {
    const content = orderConfirmationEmail(order, trackingUrlFor(order));
    const result = await sendEmail({ to: order.customerEmail, ...content });
    outcome.email = result.sent ? 'SENT' : 'FAILED';
    recordNotification({
      channel: 'EMAIL',
      key: emailKey,
      to: order.customerEmail,
      subject: content.subject,
      status: result.sent ? 'SENT' : 'FAILED',
      detail: result.detail,
    });
  }

  if (wasNotificationSent(waKey)) {
    outcome.whatsapp = 'DUPLICATE';
  } else {
    const result = await sendWhatsAppOrderConfirmation({
      toPhone: order.customerPhone,
      customerName: order.customerName,
      orderNumber: order.orderNumber,
      totalPaisa: order.totalPaisa,
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      trackingUrl: trackingUrlFor(order),
      cod: order.paymentMethod === 'COD',
    });
    outcome.whatsapp = result.sent ? 'SENT' : 'SKIPPED';
    recordNotification({
      channel: 'WHATSAPP',
      key: waKey,
      to: order.customerPhone,
      subject: 'Order placed',
      status: result.sent ? 'SENT' : 'SKIPPED',
      detail: result.detail,
    });
  }

  return outcome;
}

export async function notifyOrderStatus(order: Order, note?: string): Promise<DispatchOutcome> {
  const entryId = order.timeline[order.timeline.length - 1]?.id ?? order.fulfilmentStatus;
  const emailKey = `order:${order.orderNumber}:status:${entryId}`;
  const waKey = `order:${order.orderNumber}:wa:${entryId}`;
  const outcome: DispatchOutcome = { email: 'SKIPPED', whatsapp: 'SKIPPED' };

  if (wasNotificationSent(emailKey)) {
    outcome.email = 'DUPLICATE';
  } else if (order.customerEmail) {
    const content = orderStatusEmail(order, trackingUrlFor(order), note);
    const result = await sendEmail({ to: order.customerEmail, ...content });
    outcome.email = result.sent ? 'SENT' : 'FAILED';
    recordNotification({
      channel: 'EMAIL',
      key: emailKey,
      to: order.customerEmail,
      subject: content.subject,
      status: result.sent ? 'SENT' : 'FAILED',
      detail: result.detail,
    });
  }

  if (wasNotificationSent(waKey)) {
    outcome.whatsapp = 'DUPLICATE';
  } else {
    const result = await sendWhatsAppStatusUpdate({
      toPhone: order.customerPhone,
      customerName: order.customerName,
      orderNumber: order.orderNumber,
      status: order.fulfilmentStatus,
      courierName: order.courierName,
      trackingReference: order.trackingReference,
      trackingUrl: trackingUrlFor(order),
    });
    outcome.whatsapp = result.sent ? 'SENT' : 'SKIPPED';
    recordNotification({
      channel: 'WHATSAPP',
      key: waKey,
      to: order.customerPhone,
      subject: `Status ${order.fulfilmentStatus}`,
      status: result.sent ? 'SENT' : 'SKIPPED',
      detail: result.detail,
    });
  }

  return outcome;
}

export async function notifyAbandonedCart(input: {
  id: string;
  email: string;
  customerName?: string;
  items: { name: string; quantity: number; unitPricePaisa: number }[];
  subtotalPaisa: number;
  recoveryToken: string;
}): Promise<'SENT' | 'FAILED' | 'DUPLICATE'> {
  const key = `cart:${input.recoveryToken}:reminder`;
  if (wasNotificationSent(key)) return 'DUPLICATE';
  const base = origin();
  const content = abandonedCartEmail({
    customerName: input.customerName,
    items: input.items,
    subtotalPaisa: input.subtotalPaisa,
    recoveryUrl: base ? `${base}/cart?recover=${encodeURIComponent(input.recoveryToken)}` : '/cart',
  });
  const result = await sendEmail({ to: input.email, ...content });
  recordNotification({
    channel: 'EMAIL',
    key,
    to: input.email,
    subject: content.subject,
    status: result.sent ? 'SENT' : 'FAILED',
    detail: result.detail,
  });
  return result.sent ? 'SENT' : 'FAILED';
}

export async function notifyGiftCard(input: {
  email: string;
  code: string;
  amountPaisa: number;
  note?: string;
  recipientName?: string;
}): Promise<'SENT' | 'FAILED'> {
  const content = giftCardEmail(input);
  const result = await sendEmail({ to: input.email, ...content });
  recordNotification({
    channel: 'EMAIL',
    key: `gift:${input.code}:${input.email}`,
    to: input.email,
    subject: content.subject,
    status: result.sent ? 'SENT' : 'FAILED',
    detail: result.detail,
  });
  return result.sent ? 'SENT' : 'FAILED';
}
