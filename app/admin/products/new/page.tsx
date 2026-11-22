import ProductForm from '@/components/admin/product-form';

import { getStore } from '@/lib/store/repository';

export const dynamic = 'force-dynamic';

export default function NewProductPage() {
  return (
    <div className="container-shell py-8">
      <ProductForm categories={getStore().categories.filter((c) => c.isActive).map((c) => c.name)} />
    </div>
  );
}
