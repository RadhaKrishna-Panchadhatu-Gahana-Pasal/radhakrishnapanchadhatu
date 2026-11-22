import PagesEditor from '@/components/admin/pages-editor';
import { getStore } from '@/lib/store/repository';

export const dynamic = 'force-dynamic';

export default function AdminPages() {
  return <PagesEditor initialPages={getStore().pages} />;
}
