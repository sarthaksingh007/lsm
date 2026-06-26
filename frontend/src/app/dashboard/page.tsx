'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, defaultRouteForRole } from '@/lib/auth';
import { Card } from '@/components/ui/Card';

const OPS_ROLES = ['sales', 'sanction', 'disbursement', 'collection'] as const;

export default function DashboardHome() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    if (user.role === 'admin') return;
    if ((OPS_ROLES as readonly string[]).includes(user.role)) {
      router.replace(`/dashboard/${user.role}`);
    } else {
      router.replace(defaultRouteForRole(user.role));
    }
  }, [user, router]);

  if (user?.role !== 'admin') {
    return (
      <Card>
        <p className="text-sm text-gray-500">Redirecting…</p>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="mb-2 text-lg font-semibold">Welcome, Admin</h2>
      <p className="text-sm text-gray-600">
        You can access every module from the sidebar — Sales, Sanction, Disbursement,
        Collection.
      </p>
    </Card>
  );
}
