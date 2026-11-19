import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Custom Design Order",
  description:
    "Request a custom Panchadhatu or steel jewellery design. Share your reference and we will craft it for you.",
};

export default function CustomOrderPage() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "9779846703068";
  const message = encodeURIComponent(
    "Hello, I would like to request a custom jewellery design. Here are my details:\n\nName:\nDescription:\nReference:"
  );

  return (
    <div className="container-store py-16">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="font-heading text-4xl md:text-5xl text-primary-text mb-4">
          Custom Design Order
        </h1>
        <p className="text-secondary-text text-lg mb-8">
          Have a specific design in mind? Share your reference image and
          description — we will discuss materials, crafting time, and pricing
          with you over WhatsApp.
        </p>

        <div className="bg-surface border border-border rounded-lg p-8 text-left space-y-4 mb-8">
          <h2 className="font-heading text-xl text-primary-text">How it works</h2>
          <ol className="list-decimal list-inside space-y-2 text-secondary-text">
            <li>Describe your desired jewellery design below</li>
            <li>Optionally share a reference image on WhatsApp</li>
            <li>We will review and contact you to discuss feasibility</li>
            <li>Once agreed, we begin crafting your unique piece</li>
          </ol>
          <p className="text-sm text-secondary-text pt-2">
            Custom orders are confirmed only after we agree on design, materials,
            price, and lead time. A deposit may be required.
          </p>
        </div>

        <a
          href={`https://wa.me/${whatsappNumber}?text=${message}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 px-8 py-4 bg-[#25D366] text-white rounded-md font-medium hover:bg-[#1ebe5d] transition-colors text-lg"
        >
          <MessageCircle size={22} />
          Start Custom Order on WhatsApp
        </a>
      </div>
    </div>
  );
}
