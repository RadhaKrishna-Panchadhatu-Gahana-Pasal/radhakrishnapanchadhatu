import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function NewArrivalsSection() {
  return (
    <section aria-label="New arrivals" className="py-16 bg-surface">
      <div className="container-store">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-heading text-3xl md:text-4xl text-primary-text">
              New Arrivals
            </h2>
            <p className="text-secondary-text mt-1">
              Fresh additions to our collection
            </p>
          </div>
          <Link
            href="/new-arrivals"
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
              className="bg-[#F7F5F0] rounded-lg aspect-[3/4] animate-pulse"
              aria-hidden="true"
            />
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/new-arrivals"
            className="text-sm text-[#B08A45] font-medium"
          >
            View All New Arrivals →
          </Link>
        </div>
      </div>
    </section>
  );
}
