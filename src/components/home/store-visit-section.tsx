import { MapPin, Phone, Clock } from "lucide-react";

export function StoreVisitSection() {
  return (
    <section
      aria-label="Visit our store"
      className="py-16 bg-[#F7F5F0]"
    >
      <div className="container-store">
        <div className="text-center mb-10">
          <h2 className="font-heading text-3xl md:text-4xl text-primary-text">
            Visit Our Store
          </h2>
          <p className="text-secondary-text mt-2">
            Come experience our jewellery collection in person
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div className="bg-surface border border-border rounded-lg p-6 text-center">
            <MapPin size={28} className="text-[#B08A45] mx-auto mb-3" />
            <h3 className="font-semibold text-primary-text mb-2">Location</h3>
            <p className="text-secondary-text text-sm">
              Yogikuti, Santichowk<br />
              Tilottama Path, Butwal<br />
              500m west of Yogikuti
            </p>
          </div>

          <div className="bg-surface border border-border rounded-lg p-6 text-center">
            <Phone size={28} className="text-[#B08A45] mx-auto mb-3" />
            <h3 className="font-semibold text-primary-text mb-2">Call Us</h3>
            <a
              href="tel:+9779846703068"
              className="text-secondary-text text-sm hover:text-[#B08A45] transition-colors block"
            >
              +977 984-670-3068
            </a>
            <a
              href="tel:+9779763678419"
              className="text-secondary-text text-sm hover:text-[#B08A45] transition-colors block"
            >
              +977 976-367-8419
            </a>
          </div>

          <div className="bg-surface border border-border rounded-lg p-6 text-center">
            <Clock size={28} className="text-[#B08A45] mx-auto mb-3" />
            <h3 className="font-semibold text-primary-text mb-2">Opening Hours</h3>
            <p className="text-secondary-text text-sm">
              To be confirmed by<br />the store owner via CMS
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
