import { getStore } from './store/repository';

export const storeConfig = {
  brandName: 'Radhakrishna Panchadhatu',
  currency: 'NPR',
  locale: 'Nepal',
};

export type ProductRecord = {
  id: string;
  name: string;
  slug: string;
  category: string;
  material: string;
  pricePaisa: number | null;
  stockQuantity: number;
  status: string;
};

export function getPlaceholderProducts(): ProductRecord[] {
  return getStore().products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    category: p.categoryName,
    material: p.material,
    pricePaisa: p.pricePaisa,
    stockQuantity: p.stockQuantity,
    status: p.status,
  }));
}

export const placeholderProducts: ProductRecord[] = [];
export const emptyStateMessage = 'No content has been added yet. Store content will be managed through the admin CMS.';
