import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Radha Krishna Panchha Dhatu — our story, traditional Panchadhatu craftsmanship, and our store in Yogikuti, Butwal.",
};

export default function AboutPage() {
  return (
    <div className="container-store py-16">
      <h1 className="font-heading text-4xl md:text-5xl text-primary-text mb-6">
        About Us
      </h1>
      <p className="text-secondary-text text-lg leading-relaxed max-w-2xl">
        Radha Krishna Panchha Dhatu is a traditional jewellery and ornaments store
        based in Yogikuti, Santichowk, Butwal. We specialise in Panchadhatu —
        the sacred five-metal alloy — and high-quality steel jewellery.
      </p>
      <div className="mt-8 p-6 bg-surface border border-border rounded-lg">
        <p className="text-secondary-text italic">
          Content for this page is managed through the CMS admin panel.
        </p>
      </div>
    </div>
  );
}
