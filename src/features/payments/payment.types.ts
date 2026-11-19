export type PaymentProviderName = "esewa" | "khalti" | "fonepay";

export interface PaymentInitiateParams {
  orderId: string;
  orderNumber: string;
  amountPaisa: number;
  returnUrl: string;
  cancelUrl: string;
}

export interface PaymentInitiateResult {
  redirectUrl: string;
  providerTransactionId: string;
  paymentId: string;
  formData?: Record<string, string>; // for form-POST providers
}

export interface PaymentVerifyParams {
  paymentId: string;
  providerData: Record<string, string>;
}

export interface PaymentVerifyResult {
  verified: boolean;
  amountPaisa: number;
  providerReference: string;
  status: "PAID" | "FAILED" | "PENDING";
  raw: unknown;
}

export interface PaymentProvider {
  name: PaymentProviderName;
  initiate(params: PaymentInitiateParams): Promise<PaymentInitiateResult>;
  verify(params: PaymentVerifyParams): Promise<PaymentVerifyResult>;
}
