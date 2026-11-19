'use client';

import { useEffect, useState } from 'react';
import {
  APIProvider,
  AdvancedMarker,
  InfoWindow,
  Map as GoogleMap,
  Pin,
  useAdvancedMarkerRef,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { ExternalLink, MapPin, Phone } from 'lucide-react';
import { useStore } from '@/components/providers/store-provider';

interface StorePlaceDetails {
  lat: number;
  lng: number;
  title: string;
  formattedAddress: string;
}

function StoreLocationMarker({
  storeName,
  fallbackAddress,
  phone,
  mapUrl,
}: {
  storeName: string;
  fallbackAddress: string;
  phone: string;
  mapUrl: string;
}) {
  const placesLib = useMapsLibrary('places');
  const [placeDetails, setPlaceDetails] = useState<StorePlaceDetails | null>(null);
  const [infoOpen, setInfoOpen] = useState(true);
  const [markerRef, marker] = useAdvancedMarkerRef();

  useEffect(() => {
    if (!placesLib) return;
    let active = true;

    async function lookupStore() {
      try {
        const { Place } = placesLib!;
        const { places } = await Place.searchByText({
          textQuery: 'Yogikuti Santichowk Butwal Rupandehi Nepal',
          fields: ['displayName', 'formattedAddress', 'location'],
          region: 'NP',
        });
        if (!active) return;
        const first = places?.[0];
        if (first?.location) {
          setPlaceDetails({
            lat: first.location.lat(),
            lng: first.location.lng(),
            title: storeName,
            formattedAddress: first.formattedAddress || fallbackAddress,
          });
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (
          msg.includes('429') ||
          msg.includes('RESOURCE_EXHAUSTED') ||
          msg.includes('OVER_QUERY_LIMIT') ||
          msg.includes('Quota')
        ) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
      }
    }

    lookupStore();
    return () => {
      active = false;
    };
  }, [placesLib, storeName, fallbackAddress]);

  const center = placeDetails ? { lat: placeDetails.lat, lng: placeDetails.lng } : undefined;

  return (
    <GoogleMap
      defaultCenter={center ?? { lat: 27.674, lng: 83.465 }}
      center={center}
      defaultZoom={15}
      mapId="DEMO_MAP_ID"
      internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
      gestureHandling="cooperative"
      disableDefaultUI={false}
      className="h-full w-full"
    >
      {center && (
        <>
          <AdvancedMarker
            ref={markerRef}
            position={center}
            onClick={() => setInfoOpen(true)}
            title={storeName}
          >
            <Pin background="#B08A45" borderColor="#80612F" glyphColor="#FFFFFF" />
          </AdvancedMarker>
          {infoOpen && marker && (
            <InfoWindow anchor={marker} onCloseClick={() => setInfoOpen(false)}>
              <div className="max-w-[220px] p-1 text-ink">
                <p className="font-serif text-base font-semibold">{storeName}</p>
                <p className="mt-1 text-xs text-muted">{placeDetails?.formattedAddress || fallbackAddress}</p>
                <p className="mt-1 text-xs font-medium text-ink">Tel: {phone}</p>
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-gold-deep underline"
                >
                  Open Directions <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </InfoWindow>
          )}
        </>
      )}
    </GoogleMap>
  );
}

export function StoreMap({
  apiKey,
  storeName,
  address,
  cityLine,
  phone,
  mapUrl,
}: {
  apiKey: string;
  storeName: string;
  address: string;
  cityLine: string;
  phone: string;
  mapUrl: string;
}) {
  const { mapsQuotaExceeded } = useStore();

  if (!apiKey || mapsQuotaExceeded) {
    return (
      <div className="flex h-[360px] w-full flex-col justify-between rounded-2xl border border-line bg-[#EFECE5] p-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold-deep">
            Store Showroom · Butwal
          </p>
          <h3 className="mt-2 font-serif text-2xl font-semibold text-ink">{storeName}</h3>
          <p className="mt-2 flex items-start gap-2 text-sm text-muted">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" />
            <span>
              {address}, {cityLine}
            </span>
          </p>
          <p className="mt-2 flex items-center gap-2 text-sm text-ink">
            <Phone className="h-4 w-4 shrink-0 text-gold-deep" />
            <span className="tabular-nums">{phone}</span>
          </p>
        </div>
        <div className="border-t border-line pt-4">
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gold-deep"
          >
            Open in Google Maps <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[360px] w-full overflow-hidden rounded-2xl border border-line bg-[#EFECE5]">
      <APIProvider apiKey={apiKey} language="en" region="NP">
        <StoreLocationMarker
          storeName={storeName}
          fallbackAddress={`${address}, ${cityLine}`}
          phone={phone}
          mapUrl={mapUrl}
        />
      </APIProvider>
    </div>
  );
}
