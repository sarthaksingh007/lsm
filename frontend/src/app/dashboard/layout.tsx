'use client';
import { useRequireAuth } from '@/lib/auth';
import { DashboardSidebar } from '@/components/nav/DashboardSidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useRequireAuth([
    'admin',
    'sales',
    'sanction',
    'disbursement',
    'collection',
  ]);

  if (loading || !user) {
    return (
      <main className="mx-auto mt-16 max-w-6xl px-4 text-sm text-gray-500">
        Loading…
      </main>
    );
  }

  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-6 py-6">
      <DashboardSidebar role={user.role} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
