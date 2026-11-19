import Link from "next/link";
import { MapPin, Phone, MessageCircle, Facebook } from "lucide-react";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Catalogue", href: "/catalog" },
  { label: "New Arrivals", href: "/new-arrivals" },
  { label: "Custom Order", href: "/custom-order" },
  { label: "Contact", href: "/contact" },
];

const POLICY_LINKS = [
  { label: "Shipping Policy", href: "/shipping-policy" },
  { label: "Return & Refund", href: "/return-refund-policy" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "FAQ", href: "/faq" },
];

export function Footer() {
  const year = new Date().getFullYear();
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "9779846703068";

  return (
    <footer className="bg-[#25231F] text-[#C9C3B8] mt-20">
      <div className="container-store py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div>
            <div className="mb-4">
              <p className="font-heading text-xl text-white leading-tight">
                Radha Krishna
              </p>
              <p className="text-xs text-[#B08A45] tracking-widest uppercase">
                Panchha Dhatu
              </p>
            </div>
            <p className="text-sm leading-relaxed">
              Traditional Panchadhatu and steel jewellery from Butwal, Nepal.
              Delivering quality ornaments across the country.
            </p>
            {/* Social */}
            <div className="flex items-center gap-3 mt-5">
              <a
                href="https://www.facebook.com/p/Radhahakrishna-panchadhatu-Butwal-Yogikuti-Santichock-61594098656803/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Facebook"
                className="hover:text-[#B08A45] transition-colors"
              >
                <Facebook size={20} />
              </a>
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat on WhatsApp"
                className="hover:text-[#B08A45] transition-colors"
              >
                <MessageCircle size={20} />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Shop
            </h3>
            <ul className="space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-[#B08A45] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Information
            </h3>
            <ul className="space-y-2">
              {POLICY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-[#B08A45] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Visit Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm">
                <MapPin size={16} className="text-[#B08A45] mt-0.5 flex-shrink-0" />
                <span>
                  Yogikuti, Santichowk<br />
                  Tilottama Path, Butwal<br />
                  Nepal
                </span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Phone size={16} className="text-[#B08A45] flex-shrink-0" />
                <div>
                  <a href="tel:+9779846703068" className="hover:text-[#B08A45] transition-colors block">
                    +977 984-670-3068
                  </a>
                  <a href="tel:+9779763678419" className="hover:text-[#B08A45] transition-colors block">
                    +977 976-367-8419
                  </a>
                </div>
              </li>
              <li>
                <a
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm bg-[#25D366] text-white px-3 py-1.5 rounded hover:bg-[#1ebe5d] transition-colors"
                >
                  <MessageCircle size={14} />
                  WhatsApp Us
                </a>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container-store py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#77736B]">
          <p>© {year} Radha Krishna Panchha Dhatu. All rights reserved.</p>
          <p>Butwal, Rupandehi, Nepal</p>
        </div>
      </div>
    </footer>
  );
}
