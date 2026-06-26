'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';

export function TopBar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.replace('/login');
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/" className="text-lg font-semibold text-brand-700">
          LMS
        </Link>
        {user && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              {user.name} <span className="text-xs text-gray-400">({user.role})</span>
            </span>
            <Button variant="secondary" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
