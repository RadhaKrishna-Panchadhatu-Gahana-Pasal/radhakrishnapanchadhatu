/**
 * WhatsApp Cloud API order notifications.
 *
 * Used instead of paid SMS/OTP providers: the WhatsApp Cloud API has a free
 * tier, and the shop already takes orders over WhatsApp.
 *
 * Two things to know before relying on it in production:
 *  - Free-form text messages are only delivered inside an open 24-hour customer
 *    service window. For customers who have never messaged the shop, Meta
 *    requires a pre-approved message template.
 *  - If WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID is missing, this module
 *    is a silent no-op so checkout never fails because of notifications.
 */

const GRAPH_API_VERSION = 'v21.0';
const REQUEST_TIMEOUT_MS = 8000;

export interface WhatsAppOrderConfirmation {
  toPhone: string;
  customerName: string;
  orderNumber: string;
  totalPaisa: number;
  itemCount: number;
  trackingUrl?: string;
  /** Cash-on-delivery orders get a call-confirmation line instead of a payment line. */
  cod?: boolean;
}

export interface WhatsAppStatusUpdate {
  toPhone: string;
  customerName: string;
  orderNumber: string;
  status: string;
  courierName?: string;
  trackingReference?: string;
  trackingUrl?: string;
}

export interface WhatsAppSendResult {
  sent: boolean;
  detail?: string;
}

export function isWhatsAppCloudConfigured(): boolean {
  return Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}

/** Nepal numbers: 98XXXXXXXX -> 97798XXXXXXXX, keeping an existing country code. */
export function normalizeNepalPhone(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('977')) return digits;
  if (digits.startsWith('0') && digits.length === 11) return `977${digits.slice(1)}`;
  if (digits.length === 10) return `977${digits}`;
  return digits;
}

export function buildOrderConfirmationText(payload: WhatsAppOrderConfirmation): string {
  const total = `NPR ${Math.round(payload.totalPaisa / 100).toLocaleString('en-NP')}`;
  const lines = [
    `Namaste ${payload.customerName},`,
    '',
    `Your order ${payload.orderNumber} has been received by Radhakrishna Panchadhatu.`,
    `Items: ${payload.itemCount} · Total: ${total}`,
    payload.cod ? 'Payment: Cash on Delivery — we will call to confirm before dispatch.' : null,
    payload.trackingUrl ? `Track it here: ${payload.trackingUrl}` : null,
    '',
    'We will confirm dispatch from Butwal on this number.',
  ].filter((line): line is string => line !== null);

  return lines.join('\n');
}

async function sendWhatsAppText(rawPhone: string, body: string): Promise<WhatsAppSendResult> {
  if (!isWhatsAppCloudConfigured()) {
    return { sent: false, detail: 'WhatsApp Cloud API is not configured.' };
  }

  const to = normalizeNepalPhone(rawPhone);
  if (!to) {
    return { sent: false, detail: 'No customer phone number on the order.' };
  }

  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN as string;

  try {
    const response = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to,
          type: 'text',
          text: { preview_url: false, body },
        }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      }
    );

    if (!response.ok) {
      return { sent: false, detail: `WhatsApp API responded ${response.status}.` };
    }
    return { sent: true };
  } catch (error) {
    return {
      sent: false,
      detail: error instanceof Error ? error.message : 'Unknown WhatsApp API error.',
    };
  }
}

export async function sendWhatsAppOrderConfirmation(
  payload: WhatsAppOrderConfirmation
): Promise<WhatsAppSendResult> {
  return sendWhatsAppText(payload.toPhone, buildOrderConfirmationText(payload));
}

const STATUS_LINES: Record<string, string> = {
  ORDER_PLACED: 'has been received',
  ORDER_RECEIVED: 'is confirmed and with the store team',
  PROCESSING: 'is being prepared and polished in Butwal',
  READY_TO_DISPATCH: 'is packed and ready for the courier',
  DISPATCHED: 'has been dispatched from our Butwal store',
  IN_TRANSIT: 'is in transit with the courier',
  OUT_FOR_DELIVERY: 'is out for delivery today',
  DELIVERED: 'has been delivered. Thank you for shopping with us',
  CANCELLED: 'has been cancelled',
  RETURN_REQUESTED: '— we have received your return request',
  RETURNED: '— your return has been received and is being processed',
};

/** Order status update for the customer's WhatsApp (best effort, never throws). */
export async function sendWhatsAppStatusUpdate(
  payload: WhatsAppStatusUpdate
): Promise<WhatsAppSendResult> {
  const line = STATUS_LINES[payload.status] ?? `status is now ${payload.status.replaceAll('_', ' ').toLowerCase()}`;
  const body = [
    `Namaste ${payload.customerName},`,
    '',
    `Your order ${payload.orderNumber} ${line}.`,
    payload.courierName ? `Courier: ${payload.courierName}` : null,
    payload.trackingReference ? `Tracking ref: ${payload.trackingReference}` : null,
    payload.trackingUrl ? `Track: ${payload.trackingUrl}` : null,
    '',
    'Radhakrishna Panchadhatu · Butwal',
  ]
    .filter((row): row is string => row !== null)
    .join('\n');

  return sendWhatsAppText(payload.toPhone, body);
}
