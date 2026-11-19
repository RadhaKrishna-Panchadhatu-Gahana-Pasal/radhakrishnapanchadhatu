import { AdminLoginGate } from '@/components/admin/admin-login-gate';
import { AdminShell } from '@/components/admin/admin-shell';
import { getAdminSession } from '@/lib/store/auth';

export const dynamic = 'force-dynamic';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = getAdminSession();

  if (!session) {
    return <AdminLoginGate />;
  }

  return <AdminShell session={session}>{children}</AdminShell>;
}
