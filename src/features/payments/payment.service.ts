/**
 * Payment service — registry and dispatch layer.
 * Keeps provider selection logic out of API routes.
 */

import type { PaymentProvider, PaymentProviderName } from "./payment.types";
import { EsewaProvider } from "./providers/esewa/esewa.provider";
import { KhaltiProvider } from "./providers/khalti/khalti.provider";
import { FonepayProvider } from "./providers/fonepay/fonepay.provider";

const registry = new Map<PaymentProviderName, PaymentProvider>([
  ["esewa", new EsewaProvider()],
  ["khalti", new KhaltiProvider()],
  ["fonepay", new FonepayProvider()],
]);

export function getPaymentProvider(
  name: PaymentProviderName
): PaymentProvider {
  const provider = registry.get(name);
  if (!provider) {
    throw new Error(`Unknown payment provider: ${name}`);
  }
  return provider;
}
