import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <div className="container-store py-10">
      <h1 className="font-heading text-4xl text-primary-text mb-8">
        Checkout
      </h1>
      {/* TODO: Multi-step checkout form */}
    </div>
  );
}
