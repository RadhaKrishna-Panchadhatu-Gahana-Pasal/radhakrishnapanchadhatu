/**
 * Transactional email over an HTTP API (Resend-compatible).
 *
 * No SDK and no SMTP sockets, so it works from Vercel's serverless runtime.
 * Without RESEND_API_KEY the sender is a silent no-op: checkout must never fail
 * because email is not configured yet.
 *
 * Required env (Sites → Secrets / Vercel env):
 *   RESEND_API_KEY  — provider API key
 *   EMAIL_FROM      — verified sender, e.g. "Radhakrishna Panchadhatu <orders@radhakrishnapanchadhatu.com.np>"
 *   EMAIL_REPLY_TO  — optional reply address
 */

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export interface SendEmailResult {
  sent: boolean;
  providerId?: string;
  detail?: string;
}

function env(name: string): string {
  return process.env[name]?.trim() ?? '';
}

export function isEmailConfigured(): boolean {
  return Boolean(env('RESEND_API_KEY') && env('EMAIL_FROM'));
}

export function defaultReplyTo(): string | undefined {
  return env('EMAIL_REPLY_TO') || undefined;
}

export function looksLikeEmail(value: string | undefined | null): boolean {
  if (!value) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  if (!isEmailConfigured()) {
    return { sent: false, detail: 'Email is not configured (RESEND_API_KEY / EMAIL_FROM missing).' };
  }
  if (!looksLikeEmail(input.to)) {
    return { sent: false, detail: 'No valid recipient email address.' };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env('EMAIL_FROM'),
        to: [input.to.trim()],
        subject: input.subject,
        html: input.html,
        text: input.text,
        reply_to: input.replyTo || defaultReplyTo(),
      }),
      signal: controller.signal,
    });

    const payload = (await response.json().catch(() => ({}))) as { id?: string; message?: string };
    if (!response.ok) {
      return { sent: false, detail: payload.message || `Email provider responded ${response.status}.` };
    }
    return { sent: true, providerId: payload.id };
  } catch (error) {
    return {
      sent: false,
      detail: error instanceof Error ? error.message : 'Unknown email error.',
    };
  } finally {
    clearTimeout(timeout);
  }
}
