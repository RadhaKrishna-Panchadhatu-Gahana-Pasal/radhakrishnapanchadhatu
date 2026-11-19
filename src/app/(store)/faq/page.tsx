import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "Common questions about ordering, delivery, and our jewellery.",
};

export default function FaqPage() {
  return (
    <div className="container-store py-16 max-w-3xl">
      <h1 className="font-heading text-4xl text-primary-text mb-8">FAQ</h1>
      <p className="text-secondary-text">FAQ content is managed through the admin CMS.</p>
    </div>
  );
}
