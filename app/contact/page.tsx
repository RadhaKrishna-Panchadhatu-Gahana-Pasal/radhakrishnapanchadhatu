import { MapPin, MessageCircle, Phone, Clock } from 'lucide-react';
import { StoreMap } from '@/components/maps/store-map';
import { ContactForm } from '@/components/store/contact-form';
import { getGoogleMapsApiKey } from '@/lib/maps/config';
import { getStore } from '@/lib/store/repository';
import { buildWhatsAppUrl } from '@/lib/store/whatsapp';

export const dynamic = 'force-dynamic';

export default function ContactPage() {
  const { settings } = getStore();
  const mapsApiKey = getGoogleMapsApiKey();
  const whatsappHref = buildWhatsAppUrl(
    settings.whatsappDigits,
    'Namaste! I would like to connect with Radhakrishna Panchadhatu, Butwal.'
  );

  return (
    <div className="container-shell py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep">
        Showroom &amp; Support
      </p>
      <h1 className="section-title mt-2">Contact Us</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
        Visit our showroom at {settings.address}, {settings.cityLine}, call us directly, or send an enquiry below.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="card space-y-4 p-6 sm:p-8 text-sm">
            <h2 className="font-serif text-2xl font-semibold text-ink">{settings.storeName}</h2>
            <p className="flex items-start gap-2.5 text-muted">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" />
              <span className="text-ink">
                {settings.address}, {settings.cityLine}
              </span>
            </p>
            <p className="flex items-center gap-2.5 text-muted">
              <Phone className="h-4 w-4 shrink-0 text-gold-deep" />
              <a href={`tel:${settings.phone.replace(/[^\d+]/g, '')}`} className="tabular-nums font-medium text-ink hover:text-gold-deep">
                {settings.phone}
              </a>
            </p>
            <p className="flex items-center gap-2.5 text-muted">
              <Clock className="h-4 w-4 shrink-0 text-gold-deep" />
              <span>{settings.openingHours}</span>
            </p>
            <div className="pt-2">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-xs font-medium text-white hover:bg-gold-deep"
              >
                <MessageCircle className="h-4 w-4" />
                Chat on WhatsApp
              </a>
            </div>
          </div>

          <StoreMap
            apiKey={mapsApiKey}
            storeName={settings.storeName}
            address={settings.address}
            cityLine={settings.cityLine}
            phone={settings.phone}
            mapUrl={settings.mapUrl}
          />
        </div>

        <ContactForm />
      </div>
    </div>
  );
}
