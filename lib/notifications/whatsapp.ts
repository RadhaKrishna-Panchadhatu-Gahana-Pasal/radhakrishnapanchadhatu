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
    payload.trackingUrl ? `Track it here: ${payload.trackingUrl}` : null,
    '',
    'We will confirm dispatch from Butwal on this number.',
  ].filter((line): line is string => line !== null);

  return lines.join('\n');
}

export async function sendWhatsAppOrderConfirmation(
  payload: WhatsAppOrderConfirmation
): Promise<WhatsAppSendResult> {
  if (!isWhatsAppCloudConfigured()) {
    return { sent: false, detail: 'WhatsApp Cloud API is not configured.' };
  }

  const to = normalizeNepalPhone(payload.toPhone);
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
          text: { preview_url: false, body: buildOrderConfirmationText(payload) },
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
