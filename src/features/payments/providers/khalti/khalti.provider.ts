/**
 * Khalti Payment Gateway integration
 * Docs: https://docs.khalti.com/khalti-epayment/
 *
 * IMPORTANT: Never expose KHALTI_SECRET_KEY to the browser.
 */

import type {
  PaymentProvider,
  PaymentInitiateParams,
  PaymentInitiateResult,
  PaymentVerifyParams,
  PaymentVerifyResult,
} from "../../payment.types";

const SANDBOX_BASE = "https://dev.khalti.com/api/v2";
const PRODUCTION_BASE = "https://khalti.com/api/v2";

function getBase(): string {
  return process.env.KHALTI_ENV === "production"
    ? PRODUCTION_BASE
    : SANDBOX_BASE;
}

function getSecretKey(): string {
  const key = process.env.KHALTI_SECRET_KEY;
  if (!key) throw new Error("KHALTI_SECRET_KEY is not set");
  return key;
}

export class KhaltiProvider implements PaymentProvider {
  name = "khalti" as const;

  async initiate(
    params: PaymentInitiateParams
  ): Promise<PaymentInitiateResult> {
    const response = await fetch(`${getBase()}/epayment/initiate/`, {
      method: "POST",
      headers: {
        Authorization: `Key ${getSecretKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        return_url: params.returnUrl,
        website_url: process.env.NEXT_PUBLIC_APP_URL,
        amount: params.amountPaisa, // Khalti uses paisa directly
        purchase_order_id: params.orderNumber,
        purchase_order_name: `Order ${params.orderNumber}`,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Khalti initiate failed: ${error}`);
    }

    const data = (await response.json()) as { pidx: string; payment_url: string };

    return {
      redirectUrl: data.payment_url,
      providerTransactionId: data.pidx,
      paymentId: params.orderId,
    };
  }

  async verify(params: PaymentVerifyParams): Promise<PaymentVerifyResult> {
    const { pidx } = params.providerData as { pidx?: string };

    if (!pidx) {
      return { verified: false, amountPaisa: 0, providerReference: "", status: "FAILED", raw: params.providerData };
    }

    const response = await fetch(`${getBase()}/epayment/lookup/`, {
      method: "POST",
      headers: {
        Authorization: `Key ${getSecretKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pidx }),
    });

    if (!response.ok) {
      return { verified: false, amountPaisa: 0, providerReference: pidx, status: "FAILED", raw: await response.text() };
    }

    const data = (await response.json()) as {
      status: string;
      total_amount: number;
      transaction_id: string;
      pidx: string;
    };

    if (data.status !== "Completed") {
      return {
        verified: false,
        amountPaisa: data.total_amount || 0,
        providerReference: data.transaction_id || pidx,
        status: data.status === "Pending" ? "PENDING" : "FAILED",
        raw: data,
      };
    }

    return {
      verified: true,
      amountPaisa: data.total_amount,
      providerReference: data.transaction_id,
      status: "PAID",
      raw: data,
    };
  }
}
