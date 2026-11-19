import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Orders",
  robots: { index: false },
};

export default function MyOrdersPage() {
  return (
    <div className="container-store py-10">
      <h1 className="font-heading text-4xl text-primary-text mb-8">My Orders</h1>
      <p className="text-secondary-text">Your order history will appear here.</p>
    </div>
  );
}
