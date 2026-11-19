import Link from "next/link";

export function PromoBannerSection() {
  // TODO: Fetch banner from CMS
  return (
    <section
      aria-label="Promotional banner"
      className="py-6 bg-[#F7F5F0]"
    >
      <div className="container-store">
        <div className="rounded-xl bg-[#B08A45]/10 border border-[#B08A45]/30 p-10 md:p-16 text-center">
          <h2 className="font-heading text-3xl md:text-4xl text-primary-text mb-3">
            New Season Collection
          </h2>
          <p className="text-secondary-text mb-6">
            Explore our latest Panchadhatu and steel pieces
          </p>
          <Link
            href="/new-arrivals"
            className="inline-flex px-8 py-3 bg-[#B08A45] text-white rounded hover:bg-[#80612F] transition-colors font-medium"
          >
            Discover Now
          </Link>
        </div>
      </div>
    </section>
  );
}
