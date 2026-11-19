import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function FeaturedSection() {
  return (
    <section aria-label="Featured collection" className="py-16 bg-[#F7F5F0]">
      <div className="container-store">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-heading text-3xl md:text-4xl text-primary-text">
              Featured Collection
            </h2>
            <p className="text-secondary-text mt-1">
              Handpicked by our artisans
            </p>
          </div>
          <Link
            href="/catalog"
            className="hidden sm:flex items-center gap-1 text-sm text-[#B08A45] hover:text-[#80612F] font-medium transition-colors"
          >
            View All <ArrowRight size={16} />
          </Link>
        </div>

        {/* Product grid placeholder */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface rounded-lg aspect-[3/4] animate-pulse"
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
