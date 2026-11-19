import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Account",
  robots: { index: false },
};

export default function AccountPage() {
  return (
    <div className="container-store py-10">
      <h1 className="font-heading text-4xl text-primary-text mb-8">My Account</h1>
      {/* TODO: Account overview */}
      <p className="text-secondary-text">Account page coming soon.</p>
    </div>
  );
}
