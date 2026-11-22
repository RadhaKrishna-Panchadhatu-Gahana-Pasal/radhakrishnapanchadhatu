import type { PaymentMethod } from '@/lib/store/types';

/**
 * Which payment methods a shopper may actually use, and how to label them.
 *
 * Rules for this shop:
 *  - Local development and Vercel previews run online methods in sandbox mode.
 *    Fonepay only becomes selectable there once its sandbox credentials exist,
 *    because it redirects to the real Fonepay test gateway (no simulation).
 *  - Production runs a method live only when that provider's merchant
 *    credentials are configured AND PAYMENTS_ALLOW_LIVE is "true".
 *
 * Only Fonepay merchant credentials are expected here today; eSewa and Khalti
 * stay visible as "Coming soon" until their onboarding completes.
 */

export type PaymentProviderStatus = 'LIVE' | 'SANDBOX' | 'COMING_SOON';
export type DeploymentStage = 'production' | 'preview' | 'development';

export interface PaymentProviderState {
  method: PaymentMethod;
  label: string;
  status: PaymentProviderStatus;
  selectable: boolean;
  note: string;
}

export interface PaymentSettings {
  codEnabled: boolean;
  esewaEnabled: boolean;
  khaltiEnabled: boolean;
  fonepayEnabled: boolean;
}

export interface ProviderCredentials {
  esewa: boolean;
  khalti: boolean;
  fonepay: boolean;
}

const PROVIDER_LABELS: Record<PaymentMethod, string> = {
  ESEWA: 'eSewa Wallet',
  KHALTI: 'Khalti Digital',
  FONEPAY: 'Fonepay QR',
  COD: 'Cash on Delivery',
};

const PROVIDER_DESCRIPTIONS: Record<PaymentMethod, string> = {
  ESEWA: 'Instant NPR wallet verification',
  KHALTI: 'Wallet and mobile banking',
  FONEPAY: 'Nepal bank QR verification',
  COD: 'Pay cash when the parcel arrives',
};

export function getDeploymentStage(): DeploymentStage {
  const vercelEnv = process.env.VERCEL_ENV;
  if (vercelEnv === 'production') return 'production';
  if (vercelEnv === 'preview') return 'preview';
  if (process.env.NODE_ENV !== 'production') return 'development';

  const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || '';
  if (/localhost|127\.0\.0\.1/.test(appUrl)) return 'development';
  return 'production';
}

function onlineProvider(input: {
  method: Exclude<PaymentMethod, 'COD'>;
  enabled: boolean;
  configured: boolean;
  liveApproved: boolean;
  stage: DeploymentStage;
  sandboxNote: string;
  requiresCredentialsInSandbox?: boolean;
}): PaymentProviderState {
  const label = PROVIDER_LABELS[input.method];

  if (!input.enabled) {
    return {
      method: input.method,
      label,
      status: 'COMING_SOON',
      selectable: false,
      note: 'Not enabled for this store yet.',
    };
  }

  if (input.stage !== 'production') {
    if (input.requiresCredentialsInSandbox && !input.configured) {
      return {
        method: input.method,
        label,
        status: 'COMING_SOON',
        selectable: false,
        note: 'Add the Fonepay sandbox merchant code and secret key to test this method.',
      };
    }
    return {
      method: input.method,
      label,
      status: 'SANDBOX',
      selectable: true,
      note: input.sandboxNote,
    };
  }

  if (input.configured && input.liveApproved) {
    return {
      method: input.method,
      label,
      status: 'LIVE',
      selectable: true,
      note: `${PROVIDER_DESCRIPTIONS[input.method]} — verified server-side.`,
    };
  }

  return {
    method: input.method,
    label,
    status: 'COMING_SOON',
    selectable: false,
    note: 'Coming soon — merchant onboarding in progress.',
  };
}

export function resolvePaymentProviders(input: {
  stage: DeploymentStage;
  settings: PaymentSettings;
  configured: ProviderCredentials;
  liveApproved: boolean;
}): PaymentProviderState[] {
  const sandboxNote = 'Sandbox / test mode — no real money is transferred.';

  return [
    onlineProvider({
      method: 'ESEWA',
      enabled: input.settings.esewaEnabled,
      configured: input.configured.esewa,
      liveApproved: input.liveApproved,
      stage: input.stage,
      sandboxNote,
    }),
    onlineProvider({
      method: 'KHALTI',
      enabled: input.settings.khaltiEnabled,
      configured: input.configured.khalti,
      liveApproved: input.liveApproved,
      stage: input.stage,
      sandboxNote,
    }),
    onlineProvider({
      method: 'FONEPAY',
      enabled: input.settings.fonepayEnabled,
      configured: input.configured.fonepay,
      liveApproved: input.liveApproved,
      stage: input.stage,
      sandboxNote: 'Sandbox / test mode — redirects to the Fonepay test gateway.',
      requiresCredentialsInSandbox: true,
    }),
    {
      method: 'COD',
      label: PROVIDER_LABELS.COD,
      status: input.settings.codEnabled ? 'LIVE' : 'COMING_SOON',
      selectable: input.settings.codEnabled,
      note: input.settings.codEnabled
        ? PROVIDER_DESCRIPTIONS.COD
        : 'Cash on Delivery is currently disabled.',
    },
  ];
}

/**
 * Server-side entry point: reads env credentials and the current stage.
 *
 * LIVE additionally requires PAYMENTS_ALLOW_LIVE="true" so a deployment cannot
 * start taking real money just because keys were added by accident.
 */
export function getPaymentProviderStates(settings: PaymentSettings): PaymentProviderState[] {
  const liveApproved = process.env.PAYMENTS_ALLOW_LIVE === 'true';

  return resolvePaymentProviders({
    stage: getDeploymentStage(),
    settings,
    liveApproved,
    configured: {
      esewa: Boolean(process.env.ESEWA_PRODUCT_CODE && process.env.ESEWA_SECRET_KEY),
      khalti: Boolean(process.env.KHALTI_SECRET_KEY),
      // The return URL is derived from APP_URL when set, otherwise from the request host.
      fonepay: Boolean(process.env.FONEPAY_MERCHANT_ID && process.env.FONEPAY_SECRET_KEY),
    },
  });
}
