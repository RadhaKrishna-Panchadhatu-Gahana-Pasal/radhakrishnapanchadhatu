'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export type ProductFormValues = {
  id?: string;
  name: string;
  slug: string;
  sku: string;
  category: string;
  material: string;
  price: string;
  compareAtPrice: string;
  stock: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  productType: 'READY_STOCK' | 'MADE_TO_ORDER' | 'CUSTOM_ORDER';
  featured: boolean;
  newArrival: boolean;
  shortDescription: string;
  description: string;
  careInstructions: string;
  deliveryNote: string;
  imageUrl: string;
};

const defaultValues: ProductFormValues = {
  name: '',
  slug: '',
  sku: '',
  category: 'Necklaces',
  material: 'Panchadhatu',
  price: '',
  compareAtPrice: '',
  stock: '10',
  status: 'PUBLISHED',
  productType: 'READY_STOCK',
  featured: false,
  newArrival: true,
  shortDescription: '',
  description: '',
  careInstructions: 'Wipe gently with a soft cotton cloth after wear.',
  deliveryNote: 'Dispatched from Butwal across Nepal.',
  imageUrl: '/images/product-necklace.jpg',
};

export function ProductForm({
  initialValues = defaultValues,
  mode = 'create',
  categories,
}: {
  categories: string[];
  initialValues?: Partial<ProductFormValues>;
  mode?: 'create' | 'edit';
}) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormValues>({ ...defaultValues, category: categories[0] ?? '', ...initialValues });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const updateField = (field: keyof ProductFormValues, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value as never }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const endpoint =
        mode === 'edit' && form.id
          ? `/api/admin/products/${form.id}`
          : '/api/admin/products';
      const method = mode === 'edit' ? 'PATCH' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          sku: form.sku || undefined,
          categoryName: form.category,
          material: form.material,
          priceNpr: form.price,
          compareAtNpr: form.compareAtPrice,
          stockQuantity: Number(form.stock) || 0,
          status: form.status,
          productType: form.productType,
          isFeatured: form.featured,
          isNewArrival: form.newArrival,
          shortDescription: form.shortDescription,
          description: form.description,
          careInstructions: form.careInstructions,
          deliveryNote: form.deliveryNote,
          imageUrl: form.imageUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: 'err', text: data.error || 'Could not save product.' });
      } else {
        setFeedback({
          type: 'ok',
          text: mode === 'edit' ? 'Product updated.' : 'Product created.',
        });
        router.push('/admin/products');
        router.refresh();
      }
    } catch {
      setFeedback({ type: 'err', text: 'Network error saving product.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 md:p-8">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep">
            Products
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-ink">
            {mode === 'edit' ? 'Edit Product' : 'Add New Product'}
          </h1>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block text-sm font-medium text-ink">
          Product Name *
          <input
            required
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-line bg-[#FAF8F4] px-4 py-2.5 text-sm outline-none focus:border-gold"
            placeholder="Sacred Mandala Panchadhatu Pendant"
          />
        </label>

        <label className="block text-sm font-medium text-ink">
          Slug *
          <input
            required
            value={form.slug}
            onChange={(e) => updateField('slug', e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-line bg-[#FAF8F4] px-4 py-2.5 text-sm outline-none focus:border-gold"
            placeholder="sacred-mandala-pendant"
          />
        </label>

        <label className="block text-sm font-medium text-ink">
          Category
          <select
            value={form.category}
            onChange={(e) => updateField('category', e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-line bg-[#FAF8F4] px-4 py-2.5 text-sm outline-none focus:border-gold"
          >
            {categories.map((name) => <option key={name}>{name}</option>)}
          </select>
        </label>

        <label className="block text-sm font-medium text-ink">
          Material
          <select
            value={form.material}
            onChange={(e) => updateField('material', e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-line bg-[#FAF8F4] px-4 py-2.5 text-sm outline-none focus:border-gold"
          >
            <option value="Panchadhatu">Panchadhatu</option>
            <option value="Steel">Steel</option>
            <option value="Mixed">Mixed</option>
          </select>
        </label>

        <label className="block text-sm font-medium text-ink">
          Price (NPR)
          <input
            type="number"
            min="0"
            step="1"
            value={form.price}
            onChange={(e) => updateField('price', e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-line bg-[#FAF8F4] px-4 py-2.5 text-sm outline-none focus:border-gold"
            placeholder="4200"
          />
        </label>

        <label className="block text-sm font-medium text-ink">
          Compare-at Price (NPR, optional)
          <input
            type="number"
            min="0"
            step="1"
            value={form.compareAtPrice}
            onChange={(e) => updateField('compareAtPrice', e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-line bg-[#FAF8F4] px-4 py-2.5 text-sm outline-none focus:border-gold"
            placeholder="4800"
          />
        </label>

        <label className="block text-sm font-medium text-ink">
          Stock Quantity
          <input
            type="number"
            min="0"
            value={form.stock}
            onChange={(e) => updateField('stock', e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-line bg-[#FAF8F4] px-4 py-2.5 text-sm outline-none focus:border-gold"
          />
        </label>

        <label className="block text-sm font-medium text-ink">
          Publishing Status
          <select
            value={form.status}
            onChange={(e) => updateField('status', e.target.value as ProductFormValues['status'])}
            className="mt-1.5 w-full rounded-xl border border-line bg-[#FAF8F4] px-4 py-2.5 text-sm outline-none focus:border-gold"
          >
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </label>

        <label className="block text-sm font-medium text-ink">
          Product Type
          <select
            value={form.productType}
            onChange={(e) =>
              updateField('productType', e.target.value as ProductFormValues['productType'])
            }
            className="mt-1.5 w-full rounded-xl border border-line bg-[#FAF8F4] px-4 py-2.5 text-sm outline-none focus:border-gold"
          >
            <option value="READY_STOCK">Ready Stock</option>
            <option value="MADE_TO_ORDER">Made to Order</option>
            <option value="CUSTOM_ORDER">Custom Order</option>
          </select>
        </label>

        <label className="block text-sm font-medium text-ink">
          Primary Image Path or URL
          <input
            value={form.imageUrl}
            onChange={(e) => updateField('imageUrl', e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-line bg-[#FAF8F4] px-4 py-2.5 text-sm outline-none focus:border-gold"
            placeholder="/images/product-necklace.jpg"
          />
        </label>

        <label className="flex items-center gap-3 rounded-xl border border-line bg-[#FAF8F4] p-4 text-sm font-medium text-ink">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => updateField('featured', e.target.checked)}
            className="h-4 w-4 accent-gold"
          />
          Featured on Homepage
        </label>

        <label className="flex items-center gap-3 rounded-xl border border-line bg-[#FAF8F4] p-4 text-sm font-medium text-ink">
          <input
            type="checkbox"
            checked={form.newArrival}
            onChange={(e) => updateField('newArrival', e.target.checked)}
            className="h-4 w-4 accent-gold"
          />
          Mark as New Arrival
        </label>

        {([['sku', 'SKU', 64], ['shortDescription', 'Short description', 400], ['careInstructions', 'Care instructions', 600], ['deliveryNote', 'Delivery note', 400]] as const).map(([field, label, maxLength]) => (
          <label key={field} className="block text-sm font-medium text-ink">
            {label}
            <input value={form[field]} maxLength={maxLength} onChange={(e) => updateField(field, e.target.value)} className="mt-1.5 w-full rounded-xl border border-line bg-[#FAF8F4] px-4 py-2.5 text-sm focus:border-gold" />
          </label>
        ))}
        <label className="block text-sm font-medium text-ink md:col-span-2">
          Product Description
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-line bg-[#FAF8F4] px-4 py-2.5 text-sm outline-none focus:border-gold"
            placeholder="Describe alloy craftsmanship, dimensions, and ceremonial or daily styling."
          />
        </label>
      </div>

      {feedback && (
        <p
          className={`mt-5 text-xs font-medium ${
            feedback.type === 'ok' ? 'text-success' : 'text-danger'
          }`}
        >
          {feedback.text}
        </p>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push('/admin/products')}
          className="rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-gold px-6 py-2.5 text-sm font-medium text-white hover:bg-gold-deep disabled:opacity-50"
        >
          {submitting ? 'Saving...' : mode === 'edit' ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  );
}

export default ProductForm;
