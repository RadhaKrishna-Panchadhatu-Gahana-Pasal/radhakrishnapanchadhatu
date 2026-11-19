import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <div className="container-store py-16 max-w-3xl">
      <h1 className="font-heading text-4xl text-primary-text mb-8">Privacy Policy</h1>
      <p className="text-secondary-text">Privacy policy content is managed through the admin CMS.</p>
    </div>
  );
}
