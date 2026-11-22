import type { Order } from '@/lib/store/types';

/**
 * Plain HTML email templates (no JSX/React runtime needed in route handlers).
 * Styling is inline because every mail client strips <style> unpredictably.
 */

const INK = '#1b1917';
const MUTED = '#6b6152';
const GOLD = '#a07c3c';
const LINE = '#e3ded2';
const SAND = '#faf8f4';

function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function formatNprEmail(paisa: number): string {
  return `NPR ${(Math.round(paisa) / 100).toLocaleString('en-NP', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function money(paisa: number): string {
  return formatNprEmail(paisa);
}

function layout(input: { preview: string; heading: string; body: string }): string {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${esc(input.heading)}</title></head>
<body style="margin:0;padding:0;background:${SAND};font-family:Helvetica,Arial,sans-serif;color:${INK};">
<span style="display:none;visibility:hidden;opacity:0;height:0;width:0">${esc(input.preview)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${SAND};padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid ${LINE};border-radius:14px;overflow:hidden;">
<tr><td style="padding:22px 26px;border-bottom:1px solid ${LINE};">
  <div style="font-family:Georgia,'Times New Roman',serif;font-size:20px;font-weight:600;letter-spacing:.02em;">Radhakrishna Panchadhatu</div>
  <div style="font-size:11px;color:${GOLD};letter-spacing:.16em;text-transform:uppercase;margin-top:4px;">Butwal, Nepal · Since the craft</div>
</td></tr>
<tr><td style="padding:26px;">
  <h1 style="margin:0 0 14px;font-family:Georgia,'Times New Roman',serif;font-size:23px;font-weight:600;">${esc(input.heading)}</h1>
  ${input.body}
</td></tr>
<tr><td style="padding:16px 26px;border-top:1px solid ${LINE};font-size:11px;color:${MUTED};line-height:1.6;">
  Radhakrishna Panchadhatu, 3 Tilottama Path, Yogikuti, Butwal 32907, Rupandehi, Nepal.<br />
  Questions? Reply to this email or message us on WhatsApp at +977 984-670-3068.
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

function button(href: string, label: string): string {
  return `<a href="${esc(href)}" style="display:inline-block;margin:6px 0 2px;padding:12px 22px;background:${GOLD};color:#ffffff;text-decoration:none;border-radius:999px;font-size:14px;font-weight:600;">${esc(label)}</a>`;
}

function itemRows(order: Order): string {
  return order.items
    .map(
      (item) => `<tr>
  <td style="padding:8px 0;border-bottom:1px solid ${LINE};font-size:13px;">
    ${esc(item.productName)}${item.variantLabel ? ` <span style="color:${MUTED}">(${esc(item.variantLabel)})</span>` : ''}
    <div style="color:${MUTED};font-size:11px;">${esc(item.sku)} · Qty ${item.quantity}</div>
  </td>
  <td align="right" style="padding:8px 0;border-bottom:1px solid ${LINE};font-size:13px;white-space:nowrap;">${money(item.unitPricePaisa * item.quantity)}</td>
</tr>`
    )
    .join('');
}

function totalsRows(order: Order): string {
  const rows: string[] = [
    `<tr><td style="padding:4px 0;font-size:13px;color:${MUTED}">Subtotal</td><td align="right" style="padding:4px 0;font-size:13px;">${money(order.subtotalPaisa)}</td></tr>`,
  ];
  if (order.discountPaisa > 0) {
    rows.push(
      `<tr><td style="padding:4px 0;font-size:13px;color:${MUTED}">Discount${order.couponCode ? ` (${esc(order.couponCode)})` : ''}</td><td align="right" style="padding:4px 0;font-size:13px;">−${money(order.discountPaisa)}</td></tr>`
    );
  }
  if ((order.giftCardPaisa ?? 0) > 0) {
    rows.push(
      `<tr><td style="padding:4px 0;font-size:13px;color:${MUTED}">Gift card</td><td align="right" style="padding:4px 0;font-size:13px;">−${money(order.giftCardPaisa ?? 0)}</td></tr>`
    );
  }
  rows.push(
    `<tr><td style="padding:4px 0;font-size:13px;color:${MUTED}">Delivery</td><td align="right" style="padding:4px 0;font-size:13px;">${order.deliveryFeePaisa === 0 ? 'Free' : money(order.deliveryFeePaisa)}</td></tr>`,
    `<tr><td style="padding:10px 0 0;font-size:14px;font-weight:700;border-top:1px solid ${LINE}">Total paid</td><td align="right" style="padding:10px 0 0;font-size:14px;font-weight:700;border-top:1px solid ${LINE}">${money(order.totalPaisa)}</td></tr>`
  );
  return rows.join('');
}

function addressBlock(order: Order): string {
  const a = order.address;
  return `<p style="margin:0;font-size:13px;line-height:1.6;color:${INK}">
  <strong>${esc(a.fullName)}</strong><br />
  ${esc(a.phone)}${order.customerEmail ? `<br />${esc(order.customerEmail)}` : ''}<br />
  ${esc(a.street)}, Ward ${esc(a.ward)}<br />
  ${esc(a.municipality)}, ${esc(a.district)}<br />
  ${esc(a.province)}
</p>`;
}

export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

export function orderConfirmationEmail(order: Order, trackingUrl: string): EmailContent {
  const cod = order.paymentMethod === 'COD';
  const subject = `Order ${order.orderNumber} confirmed — Radhakrishna Panchadhatu`;
  const body = `
  <p style="margin:0 0 12px;font-size:14px;line-height:1.65;">Namaste ${esc(order.customerName)},</p>
  <p style="margin:0 0 18px;font-size:14px;line-height:1.65;">
    ${cod
      ? 'Thank you — your order is confirmed with Cash on Delivery. We will call to confirm before dispatch.'
      : `Thank you — we have received your order. Payment status: <strong>${esc(order.paymentStatus)}</strong>.`}
  </p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">${itemRows(order)}${totalsRows(order)}</table>
  <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:${MUTED}">Delivering to</p>
  ${addressBlock(order)}
  <p style="margin:20px 0 0;">${button(trackingUrl, 'Track your order')}</p>
  <p style="margin:14px 0 0;font-size:12px;color:${MUTED};line-height:1.6;">
    Order number <strong style="color:${INK}">${esc(order.orderNumber)}</strong>. Keep this email for exchanges within 7 days of delivery.
  </p>`;
  const text = [
    `Namaste ${order.customerName},`,
    '',
    `Order ${order.orderNumber} is confirmed (${order.paymentMethod}, ${order.paymentStatus}).`,
    ...order.items.map((i) => `- ${i.productName} x${i.quantity}: ${money(i.unitPricePaisa * i.quantity)}`),
    '',
    `Total: ${money(order.totalPaisa)}`,
    `Track: ${trackingUrl}`,
  ].join('\n');
  return { subject, html: layout({ preview: `Order ${order.orderNumber} confirmed`, heading: 'Your order is confirmed', body }), text };
}

const STATUS_COPY: Record<string, string> = {
  ORDER_PLACED: 'We have received your order.',
  ORDER_RECEIVED: 'Your payment is verified and the store has your order.',
  PROCESSING: 'Our artisans are preparing and polishing your piece in Butwal.',
  READY_TO_DISPATCH: 'Your jewellery is packed and waiting for the courier.',
  DISPATCHED: 'Your parcel has left our Butwal store.',
  IN_TRANSIT: 'Your parcel is moving through the courier network.',
  OUT_FOR_DELIVERY: 'Your parcel is out for delivery today.',
  DELIVERED: 'Your order has been delivered. We hope you love it.',
  CANCELLED: 'Your order has been cancelled.',
  RETURN_REQUESTED: 'We have received your return request.',
  RETURNED: 'Your return has been received and is being processed.',
};

export function orderStatusEmail(order: Order, trackingUrl: string, note?: string): EmailContent {
  const label = order.fulfilmentStatus.replaceAll('_', ' ').toLowerCase();
  const subject = `Order ${order.orderNumber}: ${label}`;
  const body = `
  <p style="margin:0 0 12px;font-size:14px;line-height:1.65;">Namaste ${esc(order.customerName)},</p>
  <p style="margin:0 0 14px;font-size:14px;line-height:1.65;">
    ${esc(STATUS_COPY[order.fulfilmentStatus] ?? 'Your order status has been updated.')}
  </p>
  ${
    order.courierName || order.trackingReference
      ? `<p style="margin:0 0 14px;padding:12px;border:1px solid ${LINE};border-radius:10px;font-size:13px;line-height:1.6;">
      ${order.courierName ? `<strong>Courier:</strong> ${esc(order.courierName)}<br />` : ''}
      ${order.trackingReference ? `<strong>Tracking ref:</strong> ${esc(order.trackingReference)}` : ''}
    </p>`
      : ''
  }
  ${note ? `<p style="margin:0 0 14px;font-size:13px;line-height:1.65;color:${MUTED}">${esc(note)}</p>` : ''}
  <p style="margin:0 0 18px;font-size:13px;color:${MUTED}">Order ${esc(order.orderNumber)} · ${esc(order.paymentMethod)} · ${esc(order.paymentStatus)}</p>
  <p style="margin:0;">${button(trackingUrl, 'View order status')}</p>`;
  const text = [
    `Namaste ${order.customerName},`,
    '',
    `Order ${order.orderNumber} is now ${order.fulfilmentStatus.replaceAll('_', ' ')}.`,
    order.courierName ? `Courier: ${order.courierName}` : '',
    order.trackingReference ? `Tracking: ${order.trackingReference}` : '',
    note ?? '',
    '',
    trackingUrl,
  ]
    .filter(Boolean)
    .join('\n');
  return { subject, html: layout({ preview: `Order ${order.orderNumber} update`, heading: `Order ${label}`, body }), text };
}

export function abandonedCartEmail(input: {
  customerName?: string;
  items: { name: string; quantity: number; unitPricePaisa: number }[];
  subtotalPaisa: number;
  recoveryUrl: string;
}): EmailContent {
  const subject = 'Still thinking about it? Your jewellery is waiting';
  const rows = input.items
    .map(
      (item) =>
        `<tr><td style="padding:6px 0;border-bottom:1px solid ${LINE};font-size:13px;">${esc(item.name)} × ${item.quantity}</td><td align="right" style="padding:6px 0;border-bottom:1px solid ${LINE};font-size:13px;">${money(item.unitPricePaisa * item.quantity)}</td></tr>`
    )
    .join('');
  const body = `
  <p style="margin:0 0 12px;font-size:14px;line-height:1.65;">Namaste ${esc(input.customerName || 'there')},</p>
  <p style="margin:0 0 16px;font-size:14px;line-height:1.65;">
    The pieces in your bag are still available. We hold only limited Panchadhatu stock, so we wanted to let you know before they are gone.
  </p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">${rows}</table>
  <p style="margin:0 0 16px;font-size:13px;color:${MUTED}">Bag subtotal ${money(input.subtotalPaisa)} · delivery calculated at checkout.</p>
  <p style="margin:0;">${button(input.recoveryUrl, 'Return to your bag')}</p>
  <p style="margin:14px 0 0;font-size:11px;color:${MUTED}">You received this because you started checkout with this email. Reply to opt out of reminders.</p>`;
  return {
    subject,
    html: layout({ preview: 'Your jewellery is still in your bag', heading: 'Your bag is still waiting', body }),
    text: `Namaste ${input.customerName || 'there'},\n\nYour bag is still saved: ${input.recoveryUrl}\n\nBag subtotal ${money(input.subtotalPaisa)}.`,
  };
}

export function giftCardEmail(input: {
  code: string;
  amountPaisa: number;
  note?: string;
  recipientName?: string;
}): EmailContent {
  const body = `
  <p style="margin:0 0 12px;font-size:14px;line-height:1.65;">Namaste ${esc(input.recipientName || 'there')},</p>
  <p style="margin:0 0 16px;font-size:14px;line-height:1.65;">A gift card from Radhakrishna Panchadhatu has been reserved for you.</p>
  <p style="margin:0 0 16px;padding:16px;border:1px dashed ${GOLD};border-radius:12px;text-align:center;">
    <span style="display:block;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:${MUTED}">Gift card value</span>
    <span style="display:block;font-family:Georgia,serif;font-size:26px;margin:4px 0 8px;">${money(input.amountPaisa)}</span>
    <span style="display:block;font-family:monospace;font-size:18px;letter-spacing:.12em;">${esc(input.code)}</span>
  </p>
  <p style="margin:0;font-size:13px;line-height:1.65;color:${MUTED}">Enter this code in the “Gift card” field at checkout. It can be used in part or in full, and any balance stays on the card.</p>
  ${input.note ? `<p style="margin:12px 0 0;font-size:13px;line-height:1.65;">${esc(input.note)}</p>` : ''}`;
  return {
    subject: `Your gift card — ${money(input.amountPaisa)}`,
    html: layout({ preview: 'Your gift card code is inside', heading: 'A gift from Butwal', body }),
    text: `Gift card ${input.code} for ${money(input.amountPaisa)}. Enter it at checkout.`,
  };
}
