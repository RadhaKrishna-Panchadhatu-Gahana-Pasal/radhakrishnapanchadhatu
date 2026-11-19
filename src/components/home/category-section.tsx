import Link from "next/link";

// TODO: Fetch categories from database
const DEMO_CATEGORIES = [
  { name: "Panchadhatu", slug: "panchadhatu", emoji: "✨" },
  { name: "Steel Jewellery", slug: "steel", emoji: "💎" },
  { name: "Earrings", slug: "earrings", emoji: "👂" },
  { name: "Necklaces", slug: "necklaces", emoji: "📿" },
  { name: "Rings", slug: "rings", emoji: "💍" },
  { name: "Bracelets", slug: "bracelets", emoji: "🔮" },
];

export function CategorySection() {
  return (
    <section aria-label="Shop by category" className="py-16 bg-[#F7F5F0]">
      <div className="container-store">
        <div className="text-center mb-10">
          <h2 className="font-heading text-3xl md:text-4xl text-primary-text">
            Shop by Category
          </h2>
          <p className="text-secondary-text mt-2">
            Explore our curated collections
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {DEMO_CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className="flex flex-col items-center gap-3 p-5 bg-surface border border-border rounded-lg hover:border-[#B08A45] hover:shadow-sm transition-all group"
            >
              <span className="text-3xl">{cat.emoji}</span>
              <span className="text-sm font-medium text-primary-text group-hover:text-[#B08A45] transition-colors text-center">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
