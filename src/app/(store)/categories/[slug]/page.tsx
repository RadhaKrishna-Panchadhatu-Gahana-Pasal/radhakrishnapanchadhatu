import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Category — ${slug}` };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  return (
    <div className="container-store py-10">
      <h1 className="font-heading text-4xl text-primary-text mb-8 capitalize">
        {slug.replace(/-/g, " ")}
      </h1>
      {/* TODO: Category product grid */}
    </div>
  );
}
