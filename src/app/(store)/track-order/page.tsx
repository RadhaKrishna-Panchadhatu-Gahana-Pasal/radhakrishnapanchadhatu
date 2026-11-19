import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track Your Order",
  description: "Track your Radha Krishna Panchha Dhatu order status.",
  robots: { index: false },
};

export default function TrackOrderPage() {
  return (
    <div className="container-store py-16">
      <div className="max-w-md mx-auto text-center">
        <h1 className="font-heading text-4xl text-primary-text mb-4">
          Track Your Order
        </h1>
        <p className="text-secondary-text mb-8">
          Enter your order number and phone number to track your order.
        </p>
        {/* TODO: Order tracking form */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <p className="text-secondary-text text-sm">
            Order tracking form coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}
