import Link from "next/link";
import { MessageCircle, Sparkles } from "lucide-react";

export function CustomOrderCta() {
  return (
    <section
      aria-label="Custom design order"
      className="py-20 bg-surface"
    >
      <div className="container-store">
        <div className="max-w-2xl mx-auto text-center">
          <Sparkles size={36} className="text-[#B08A45] mx-auto mb-4" />
          <h2 className="font-heading text-3xl md:text-4xl text-primary-text mb-4">
            Have a Design in Mind?
          </h2>
          <p className="text-secondary-text text-lg mb-8">
            Share your reference image with us on WhatsApp and we will craft
            your custom Panchadhatu or steel jewellery to your exact vision.
          </p>
          <Link
            href="/custom-order"
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#25D366] text-white rounded font-medium hover:bg-[#1ebe5d] transition-colors text-base"
          >
            <MessageCircle size={20} />
            Start a Custom Order
          </Link>
        </div>
      </div>
    </section>
  );
}
