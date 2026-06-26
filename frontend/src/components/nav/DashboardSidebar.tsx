'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Role } from '@/types';

const MODULES: Array<{ href: string; label: string; role: Role }> = [
  { href: '/dashboard/sales', label: 'Sales', role: 'sales' },
  { href: '/dashboard/sanction', label: 'Sanction', role: 'sanction' },
  { href: '/dashboard/disbursement', label: 'Disbursement', role: 'disbursement' },
  { href: '/dashboard/collection', label: 'Collection', role: 'collection' },
];

export function DashboardSidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const visible = MODULES.filter((m) => role === 'admin' || m.role === role);

  return (
    <aside className="w-56 shrink-0 border-r border-gray-200 bg-white p-4">
      <nav className="space-y-1">
        {visible.map((m) => {
          const active = pathname === m.href;
          return (
            <Link
              key={m.href}
              href={m.href}
              className={`block rounded-md px-3 py-2 text-sm font-medium transition ${
                active
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {m.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
