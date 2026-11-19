import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catalogue",
  description:
    "Browse our full collection of Panchadhatu and steel jewellery. Filter by category, material, and price.",
};

export default function CatalogPage() {
  return (
    <div className="container-store py-10">
      <h1 className="font-heading text-4xl text-primary-text mb-8">
        Catalogue
      </h1>
      {/* TODO: Product grid with filters */}
      <p className="text-secondary-text">Products loading…</p>
    </div>
  );
}
