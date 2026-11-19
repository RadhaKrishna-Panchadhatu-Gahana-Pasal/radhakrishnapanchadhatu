/**
 * eSewa ePay integration
 * Docs: https://developer.esewa.com.np/pages/Epay
 *
 * IMPORTANT: Sandbox and production use different base URLs and credentials.
 * Never commit real credentials — keep them in environment variables.
 */

import crypto from "crypto";
import type {
  PaymentProvider,
  PaymentInitiateParams,
  PaymentInitiateResult,
  PaymentVerifyParams,
  PaymentVerifyResult,
} from "../../payment.types";

const SANDBOX_BASE = "https://rc-epay.esewa.com.np";
const PRODUCTION_BASE = "https://epay.esewa.com.np";

function getBase(): string {
  return process.env.ESEWA_ENV === "production"
    ? PRODUCTION_BASE
    : SANDBOX_BASE;
}

function getProductCode(): string {
  const code = process.env.ESEWA_PRODUCT_CODE;
  if (!code) throw new Error("ESEWA_PRODUCT_CODE is not set");
  return code;
}

function getSecretKey(): string {
  const key = process.env.ESEWA_SECRET_KEY;
  if (!key) throw new Error("ESEWA_SECRET_KEY is not set");
  return key;
}

/**
 * Generate HMAC-SHA256 signature as required by eSewa ePay v2.
 * Message format: "total_amount=<amount>,transaction_uuid=<uuid>,product_code=<code>"
 */
function generateSignature(
  totalAmountNPR: string,
  transactionUUID: string
): string {
  const message = `total_amount=${totalAmountNPR},transaction_uuid=${transactionUUID},product_code=${getProductCode()}`;
  return crypto
    .createHmac("sha256", getSecretKey())
    .update(message)
    .digest("base64");
}

export class EsewaProvider implements PaymentProvider {
  name = "esewa" as const;

  async initiate(
    params: PaymentInitiateParams
  ): Promise<PaymentInitiateResult> {
    const transactionUUID = `${params.orderNumber}-${Date.now()}`;
    // eSewa expects NPR as a decimal string, e.g. "1500.00"
    const amountNPR = (params.amountPaisa / 100).toFixed(2);

    const signature = generateSignature(amountNPR, transactionUUID);

    const formData: Record<string, string> = {
      amount: amountNPR,
      tax_amount: "0",
      total_amount: amountNPR,
      transaction_uuid: transactionUUID,
      product_code: getProductCode(),
      product_service_charge: "0",
      product_delivery_charge: "0",
      success_url: params.returnUrl,
      failure_url: params.cancelUrl,
      signed_field_names: "total_amount,transaction_uuid,product_code",
      signature,
    };

    return {
      redirectUrl: `${getBase()}/api/epay/main/v2/form`,
      providerTransactionId: transactionUUID,
      paymentId: params.orderId,
      formData,
    };
  }

  async verify(params: PaymentVerifyParams): Promise<PaymentVerifyResult> {
    // eSewa returns encoded data on success URL — decode and verify server-side
    // The browser sends back base64-encoded JSON: { transaction_code, status, total_amount, etc. }
    const { encodedData } = params.providerData as { encodedData?: string };

    if (!encodedData) {
      return { verified: false, amountPaisa: 0, providerReference: "", status: "FAILED", raw: params.providerData };
    }

    let decoded: Record<string, string>;
    try {
      decoded = JSON.parse(Buffer.from(encodedData, "base64").toString("utf-8"));
    } catch {
      return { verified: false, amountPaisa: 0, providerReference: "", status: "FAILED", raw: encodedData };
    }

    // Verify signature returned by eSewa
    const signedFields = (decoded.signed_field_names || "").split(",");
    const signatureMessage = signedFields
      .map((f) => `${f}=${decoded[f]}`)
      .join(",");

    const expectedSig = crypto
      .createHmac("sha256", getSecretKey())
      .update(signatureMessage)
      .digest("base64");

    if (decoded.signature !== expectedSig) {
      return { verified: false, amountPaisa: 0, providerReference: decoded.transaction_code || "", status: "FAILED", raw: decoded };
    }

    if (decoded.status !== "COMPLETE") {
      return { verified: false, amountPaisa: 0, providerReference: decoded.transaction_code || "", status: "FAILED", raw: decoded };
    }

    const amountNPR = parseFloat(decoded.total_amount || "0");
    const amountPaisa = Math.round(amountNPR * 100);

    return {
      verified: true,
      amountPaisa,
      providerReference: decoded.transaction_code || "",
      status: "PAID",
      raw: decoded,
    };
  }
}
