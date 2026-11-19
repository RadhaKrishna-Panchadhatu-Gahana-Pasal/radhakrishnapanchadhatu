import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Arrivals",
  description: "Discover the latest Panchadhatu and steel jewellery arrivals.",
};

export default function NewArrivalsPage() {
  return (
    <div className="container-store py-10">
      <h1 className="font-heading text-4xl text-primary-text mb-8">
        New Arrivals
      </h1>
      {/* TODO: New arrival product grid */}
      <p className="text-secondary-text">Latest products coming soon…</p>
    </div>
  );
}
