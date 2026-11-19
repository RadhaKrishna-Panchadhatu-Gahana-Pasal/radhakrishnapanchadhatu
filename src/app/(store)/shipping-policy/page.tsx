import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description: "Delivery information and shipping policy for orders across Nepal.",
};

export default function ShippingPolicyPage() {
  return (
    <div className="container-store py-16 max-w-3xl">
      <h1 className="font-heading text-4xl text-primary-text mb-8">Shipping Policy</h1>
      <p className="text-secondary-text">Shipping policy content is managed through the admin CMS.</p>
    </div>
  );
}
