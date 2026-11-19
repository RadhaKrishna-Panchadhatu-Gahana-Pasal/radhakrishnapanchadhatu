import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false },
};

export default function SearchPage() {
  return (
    <div className="container-store py-10">
      <h1 className="font-heading text-4xl text-primary-text mb-8">
        Search
      </h1>
      {/* TODO: Search results with filters */}
    </div>
  );
}
