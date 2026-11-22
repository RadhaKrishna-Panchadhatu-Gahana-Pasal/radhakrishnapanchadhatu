import { notFound } from 'next/navigation';
import { ProductForm } from '@/components/admin/product-form';
import { nprFromPaisa } from '@/lib/store/money';
import { getStore } from '@/lib/store/repository';

export const dynamic = 'force-dynamic';

export default function EditProductPage({ params }: { params: { id: string } }) {
  const product = getStore().products.find(
    (p) => p.id === params.id || p.slug === params.id
  );
  if (!product) {
    notFound();
  }

  return (
    <ProductForm
      mode="edit"
      categories={getStore().categories.filter((c) => c.isActive || c.id === product.categoryId).map((c) => c.name)}
      initialValues={{
        id: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        category: product.categoryName,
        material: product.material,
        price: product.pricePaisa !== null ? String(nprFromPaisa(product.pricePaisa)) : '',
        compareAtPrice:
          product.compareAtPaisa !== null ? String(nprFromPaisa(product.compareAtPaisa)) : '',
        stock: String(product.stockQuantity),
        status: product.status,
        productType: product.productType,
        featured: product.isFeatured,
        newArrival: product.isNewArrival,
        shortDescription: product.shortDescription,
        description: product.description,
        careInstructions: product.careInstructions,
        deliveryNote: product.deliveryNote,
        imageUrl: product.images[0]?.url || '/images/product-necklace.jpg',
      }}
    />
  );
}
