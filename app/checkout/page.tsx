import { CheckoutClient } from '@/components/store/checkout-client';
import { getGoogleMapsApiKey } from '@/lib/maps/config';
import { getStore } from '@/lib/store/repository';

export const dynamic = 'force-dynamic';

export default function CheckoutPage() {
  const store = getStore();
  const mapsApiKey = getGoogleMapsApiKey();

  return (
    <CheckoutClient
      mapsApiKey={mapsApiKey}
      paymentOptions={{
        codEnabled: store.settings.codEnabled,
        esewaEnabled: store.settings.esewaEnabled,
        khaltiEnabled: store.settings.khaltiEnabled,
        fonepayEnabled: store.settings.fonepayEnabled,
      }}
    />
  );
}
