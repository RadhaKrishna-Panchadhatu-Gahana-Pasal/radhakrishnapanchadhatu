import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/catalog`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/new-arrivals`, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/contact`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/custom-order`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/faq`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/shipping-policy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/return-refund-policy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/privacy`, changeFrequency: "yearly", priority: 0.3 },
  ];

  // TODO: Add dynamic product and category routes from database
  // const products = await db.product.findMany({ where: { status: "PUBLISHED" } });
  // const productRoutes = products.map(p => ({
  //   url: `${baseUrl}/product/${p.slug}`,
  //   lastModified: p.updatedAt,
  //   changeFrequency: "weekly",
  //   priority: 0.7,
  // }));

  return staticRoutes;
}
