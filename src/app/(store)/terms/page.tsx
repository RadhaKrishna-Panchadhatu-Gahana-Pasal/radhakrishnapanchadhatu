import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions",
};

export default function TermsPage() {
  return (
    <div className="container-store py-16 max-w-3xl">
      <h1 className="font-heading text-4xl text-primary-text mb-8">Terms & Conditions</h1>
      <p className="text-secondary-text">Terms and conditions are managed through the admin CMS.</p>
    </div>
  );
}
