'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const STEPS = [
  { href: '/apply/personal', label: '1. Personal' },
  { href: '/apply/salary-slip', label: '2. Salary Slip' },
  { href: '/apply/loan', label: '3. Loan Config' },
];

export function Steps() {
  const pathname = usePathname();
  const activeIndex = STEPS.findIndex((s) => pathname?.startsWith(s.href));

  return (
    <ol className="flex flex-wrap gap-2 text-sm">
      {STEPS.map((s, i) => {
        const isActive = i === activeIndex;
        const isDone = i < activeIndex;
        return (
          <li key={s.href}>
            <Link
              href={s.href}
              className={`rounded-full px-3 py-1 transition ${
                isActive
                  ? 'bg-brand-600 text-white'
                  : isDone
                  ? 'bg-brand-100 text-brand-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {s.label}
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
