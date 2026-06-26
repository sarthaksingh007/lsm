'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, defaultRouteForRole } from '@/lib/auth';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/login');
    else router.replace(defaultRouteForRole(user.role));
  }, [user, loading, router]);

  return (
    <main className="flex min-h-[60vh] items-center justify-center text-sm text-gray-500">
      Loading…
    </main>
  );
}
