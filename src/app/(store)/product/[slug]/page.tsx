import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  // TODO: Fetch product from DB and return real SEO metadata
  return {
    title: `Product — ${slug}`,
    description: "View product details, images, pricing, and reviews.",
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  // TODO: Fetch product from DB
  // const product = await getProductBySlug(slug);
  // if (!product) notFound();

  return (
    <div className="container-store py-10">
      <p className="text-secondary-text">Product: {slug}</p>
      {/* TODO: Full product page */}
    </div>
  );
}
