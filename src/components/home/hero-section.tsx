import Link from "next/link";

export function HeroSection() {
  return (
    <section
      aria-label="Hero campaign"
      className="relative bg-[#25231F] min-h-[70vh] md:min-h-[85vh] flex items-center overflow-hidden"
    >
      {/* Background — replace with CMS banner image */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#25231F] via-[#25231F]/80 to-transparent" />

      <div className="container-store relative z-10 py-20">
        <div className="max-w-xl">
          <p className="text-[#B08A45] text-sm tracking-[0.3em] uppercase mb-4">
            Panchadhatu &amp; Steel Jewellery
          </p>
          <h1 className="font-heading text-5xl md:text-7xl text-white leading-[1.05] mb-6">
            Crafted with<br />
            <span className="text-[#B08A45]">Tradition</span>
          </h1>
          <p className="text-[#C9C3B8] text-lg mb-10 leading-relaxed">
            Discover our collection of authentic Panchadhatu and steel
            jewellery. Handcrafted for every occasion, delivered across Nepal.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/catalog"
              className="inline-flex items-center px-8 py-3.5 bg-[#B08A45] text-white font-medium rounded hover:bg-[#80612F] transition-colors"
            >
              Shop Now
            </Link>
            <Link
              href="/new-arrivals"
              className="inline-flex items-center px-8 py-3.5 border border-white/30 text-white font-medium rounded hover:border-[#B08A45] hover:text-[#B08A45] transition-colors"
            >
              New Arrivals
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
