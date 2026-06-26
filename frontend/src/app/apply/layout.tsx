'use client';
import { useRequireAuth } from '@/lib/auth';
import { Steps } from '@/components/borrower/Steps';

export default function ApplyLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useRequireAuth(['borrower']);
  if (loading || !user) {
    return (
      <main className="mx-auto mt-16 max-w-3xl px-4 text-sm text-gray-500">
        Loading…
      </main>
    );
  }
  return (
    <main className="mx-auto mt-10 max-w-3xl px-4">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Loan Application</h1>
        <p className="text-sm text-gray-500">
          Complete each step to submit a loan request.
        </p>
      </div>
      <div className="mb-6">
        <Steps />
      </div>
      {children}
    </main>
  );
}
