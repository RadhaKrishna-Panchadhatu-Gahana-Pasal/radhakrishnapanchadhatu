'use client';

import { useEffect, useRef, useState } from 'react';
import { APIProvider, useMapsLibrary } from '@vis.gl/react-google-maps';
import { MapPin } from 'lucide-react';
import { useStore } from '@/components/providers/store-provider';

export interface ResolvedNepalAddress {
  street: string;
  municipality: string;
  district: string;
  province: string;
  formattedAddress: string;
}

const PROVINCE_MAP: Record<string, string> = {
  lumbini: 'Lumbini Province',
  bagmati: 'Bagmati Province',
  gandaki: 'Gandaki Province',
  koshi: 'Koshi Province',
  madhesh: 'Madhesh Province',
  karnali: 'Karnali Province',
  sudurpashchim: 'Sudurpashchim Province',
};

function normalizeProvince(raw: string): string {
  const lower = raw.toLowerCase();
  for (const [key, label] of Object.entries(PROVINCE_MAP)) {
    if (lower.includes(key)) return label;
  }
  return '';
}

function PlacesAutocompleteField({
  onSelectAddress,
}: {
  onSelectAddress: (addr: ResolvedNepalAddress) => void;
}) {
  const placesLib = useMapsLibrary('places');
  const [queryText, setQueryText] = useState('');
  const [suggestions, setSuggestions] = useState<
    Array<{
      description: string;
      placePrediction: google.maps.places.PlacePrediction;
    }>
  >([]);
  const [open, setOpen] = useState(false);
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);

  useEffect(() => {
    if (!placesLib) return;
    if (!sessionTokenRef.current) {
      sessionTokenRef.current = new placesLib.AutocompleteSessionToken();
    }
  }, [placesLib]);

  useEffect(() => {
    if (!placesLib || queryText.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const { AutocompleteSuggestion } = placesLib;
        const response = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: queryText,
          includedRegionCodes: ['NP'],
          sessionToken: sessionTokenRef.current ?? undefined,
        });
        if (!cancelled) {
          const items = (response.suggestions || [])
            .filter((s) => Boolean(s.placePrediction))
            .map((s) => ({
              description: s.placePrediction!.text.toString(),
              placePrediction: s.placePrediction!,
            }));
          setSuggestions(items);
          setOpen(items.length > 0);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (
          msg.includes('429') ||
          msg.includes('RESOURCE_EXHAUSTED') ||
          msg.includes('OVER_QUERY_LIMIT')
        ) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
      }
    }, 260);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [placesLib, queryText]);

  const handleChoose = async (item: {
    description: string;
    placePrediction: google.maps.places.PlacePrediction;
  }) => {
    setOpen(false);
    setQueryText(item.description);
    try {
      const place = item.placePrediction.toPlace();
      await place.fetchFields({ fields: ['formattedAddress', 'addressComponents', 'displayName'] });
      if (placesLib) {
        sessionTokenRef.current = new placesLib.AutocompleteSessionToken();
      }
      const components = place.addressComponents || [];
      let street = '';
      let municipality = '';
      let district = '';
      let province = '';

      for (const comp of components) {
        const types = comp.types || [];
        if (types.includes('route') || types.includes('sublocality_level_1') || types.includes('neighborhood')) {
          if (!street) street = comp.longText || '';
        }
        if (types.includes('locality') || types.includes('administrative_area_level_3')) {
          if (!municipality) municipality = comp.longText || '';
        }
        if (types.includes('administrative_area_level_2')) {
          district = comp.longText || '';
        }
        if (types.includes('administrative_area_level_1')) {
          province = normalizeProvince(comp.longText || '');
        }
      }

      onSelectAddress({
        street: street || place.displayName || item.description.split(',')[0] || '',
        municipality: municipality || district || '',
        district: district || '',
        province,
        formattedAddress: place.formattedAddress || item.description,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
        window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
      }
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-gold-deep" />
        <input
          type="text"
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder="Search Nepal area, tole, or landmark (e.g. Yogikuti, Butwal)"
          className="w-full rounded-xl border border-line bg-[#FAF8F4] py-2.5 pl-10 pr-4 text-sm text-ink outline-none transition focus:border-gold"
        />
      </div>
      {open && suggestions.length > 0 && (
        <ul className="absolute z-30 mt-1.5 max-h-56 w-full overflow-auto rounded-xl border border-line bg-surface p-1.5 shadow-soft">
          {suggestions.map((s, idx) => (
            <li key={`${s.description}-${idx}`}>
              <button
                type="button"
                onClick={() => handleChoose(s)}
                className="w-full rounded-lg px-3 py-2 text-left text-sm text-ink transition hover:bg-sand"
              >
                {s.description}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function AddressAutocomplete({
  apiKey,
  onSelectAddress,
}: {
  apiKey: string;
  onSelectAddress: (addr: ResolvedNepalAddress) => void;
}) {
  const { mapsQuotaExceeded } = useStore();
  if (!apiKey || mapsQuotaExceeded) return null;

  return (
    <div className="mb-5 rounded-xl border border-line bg-sand/60 p-4">
      <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-gold-deep">
        Quick Nepal Address Lookup
      </p>
      <APIProvider apiKey={apiKey} language="en" region="NP">
        <PlacesAutocompleteField onSelectAddress={onSelectAddress} />
      </APIProvider>
    </div>
  );
}
