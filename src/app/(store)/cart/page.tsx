import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Cart",
  robots: { index: false },
};

export default function CartPage() {
  return (
    <div className="container-store py-10">
      <h1 className="font-heading text-4xl text-primary-text mb-8">
        Your Cart
      </h1>
      {/* TODO: Cart items and summary */}
      <p className="text-secondary-text">Your cart is empty.</p>
    </div>
  );
}
