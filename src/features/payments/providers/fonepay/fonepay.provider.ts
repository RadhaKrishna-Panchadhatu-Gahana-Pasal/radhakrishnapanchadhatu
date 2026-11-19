/**
 * Fonepay integration placeholder.
 *
 * The exact integration method, endpoint, payload structure, and
 * callback mechanism for Fonepay merchant accounts must be obtained
 * from Fonepay directly after merchant onboarding.
 *
 * Do NOT implement guessed behaviour here — wait for official docs.
 * See: https://fonepay.com/faqs
 */

import type {
  PaymentProvider,
  PaymentInitiateParams,
  PaymentInitiateResult,
  PaymentVerifyParams,
  PaymentVerifyResult,
} from "../../payment.types";

export class FonepayProvider implements PaymentProvider {
  name = "fonepay" as const;

  async initiate(
    _params: PaymentInitiateParams
  ): Promise<PaymentInitiateResult> {
    throw new Error(
      "Fonepay integration is not yet implemented. " +
        "Obtain official merchant integration documentation from Fonepay " +
        "after completing merchant onboarding. See https://fonepay.com/faqs"
    );
  }

  async verify(
    _params: PaymentVerifyParams
  ): Promise<PaymentVerifyResult> {
    throw new Error(
      "Fonepay verification is not yet implemented. " +
        "See https://fonepay.com/faqs for official documentation."
    );
  }
}
