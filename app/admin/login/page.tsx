import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/store/auth';

export const dynamic = 'force-dynamic';

export default function AdminLoginPage() {
  const session = getAdminSession();
  if (session) {
    redirect('/admin');
  }
  return null;
}
