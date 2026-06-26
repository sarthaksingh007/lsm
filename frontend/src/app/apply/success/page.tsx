'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { api } from '@/lib/api';
import type { Loan } from '@/types';
import { inr, inr2, statusColor } from '@/lib/format';

export default function SuccessPage() {
  const [loans, setLoans] = useState<Loan[]>([]);

  useEffect(() => {
    api<{ loans: Loan[] }>('/loans/mine').then(({ loans }) => setLoans(loans));
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-semibold text-green-700">
          Application submitted ✓
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Your loan is now under sanction review.{' '}
          <Link href="/apply/loan" className="text-brand-700 hover:underline">
            View status
          </Link>
          .
        </p>
      </Card>
      {loans.map((loan) => (
        <Card key={loan._id}>
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Loan #{loan._id.slice(-6)}</h3>
            <span
              className={`rounded px-2 py-0.5 text-xs uppercase ${statusColor(loan.status)}`}
            >
              {loan.status}
            </span>
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div>
              <dt className="text-gray-500">Principal</dt>
              <dd>{inr(loan.principal)}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Tenure</dt>
              <dd>{loan.tenureDays} days</dd>
            </div>
            <div>
              <dt className="text-gray-500">Interest</dt>
              <dd>{inr2(loan.interestAmount)}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Total repayment</dt>
              <dd>{inr2(loan.totalRepayment)}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Paid</dt>
              <dd>{inr2(loan.amountPaid)}</dd>
            </div>
          </dl>
          {loan.rejectionReason && (
            <p className="mt-3 text-sm text-red-700">
              <span className="font-medium">Rejection reason:</span>{' '}
              {loan.rejectionReason}
            </p>
          )}
        </Card>
      ))}
    </div>
  );
}
