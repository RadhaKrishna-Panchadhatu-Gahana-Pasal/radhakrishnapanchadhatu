import type { Metadata } from "next";
import { Phone, MapPin, Clock, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Radha Krishna Panchha Dhatu. Call us, WhatsApp us, or visit our store in Yogikuti, Santichowk, Butwal.",
};

export default function ContactPage() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "9779846703068";

  return (
    <div className="container-store py-16">
      <h1 className="font-heading text-4xl md:text-5xl text-primary-text mb-4">
        Contact Us
      </h1>
      <p className="text-secondary-text text-lg mb-12">
        We&apos;re here to help. Reach us by phone, WhatsApp, or visit our store.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Store details */}
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <MapPin className="text-gold-accent mt-1 flex-shrink-0" size={22} />
            <div>
              <p className="font-semibold text-primary-text">Store Address</p>
              <p className="text-secondary-text">
                Yogikuti, Santichowk<br />
                Tilottama Path, Butwal, Nepal<br />
                (500m west of Yogikuti)
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Phone className="text-gold-accent mt-1 flex-shrink-0" size={22} />
            <div>
              <p className="font-semibold text-primary-text">Phone</p>
              <a
                href="tel:+9779846703068"
                className="text-secondary-text hover:text-gold-accent transition-colors"
              >
                +977 984-670-3068
              </a>
              <br />
              <a
                href="tel:+9779763678419"
                className="text-secondary-text hover:text-gold-accent transition-colors"
              >
                +977 976-367-8419
              </a>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <MessageCircle className="text-gold-accent mt-1 flex-shrink-0" size={22} />
            <div>
              <p className="font-semibold text-primary-text">WhatsApp</p>
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-[#25D366] text-white rounded-md text-sm font-medium hover:bg-[#1ebe5d] transition-colors"
              >
                <MessageCircle size={16} />
                Chat on WhatsApp
              </a>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Clock className="text-gold-accent mt-1 flex-shrink-0" size={22} />
            <div>
              <p className="font-semibold text-primary-text">Opening Hours</p>
              <p className="text-secondary-text text-sm">
                (To be confirmed by store owner)
              </p>
            </div>
          </div>
        </div>

        {/* Map placeholder */}
        <div className="bg-surface border border-border rounded-lg h-72 flex items-center justify-center">
          <div className="text-center text-secondary-text">
            <MapPin size={40} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Map embed will be configured in CMS settings</p>
          </div>
        </div>
      </div>
    </div>
  );
}
