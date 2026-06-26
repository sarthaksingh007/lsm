'use client';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { api, ApiError } from '@/lib/api';
import type { Application, Loan } from '@/types';
import { inr, inr2, statusColor } from '@/lib/format';

const MIN_PRINCIPAL = 50_000;
const MAX_PRINCIPAL = 500_000;
const MIN_TENURE = 30;
const MAX_TENURE = 365;
const RATE = 12;

export default function LoanConfigPage() {
  const router = useRouter();
  const [principal, setPrincipal] = useState(100_000);
  const [tenure, setTenure] = useState(180);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [existingLoan, setExistingLoan] = useState<Loan | null>(null);

  useEffect(() => {
    api<{ application: Application | null }>('/applications/me').then(({ application }) => {
      if (!application || !application.breCleared || !application.salarySlipPath) {
        router.replace('/apply/personal');
      }
    });
    api<{ loans: Loan[] }>('/loans/mine').then(({ loans }) => {
      const active = loans.find((l) =>
        ['applied', 'sanctioned', 'disbursed'].includes(l.status)
      );
      if (active) setExistingLoan(active);
    });
  }, [router]);

  const calc = useMemo(() => {
    const interest = (principal * RATE * tenure) / (365 * 100);
    return {
      interest: Math.round(interest * 100) / 100,
      total: Math.round((principal + interest) * 100) / 100,
    };
  }, [principal, tenure]);

  async function handleApply(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await api('/loans/apply', {
        method: 'POST',
        body: { principal, tenureDays: tenure },
      });
      router.push('/apply/success');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to submit loan');
    } finally {
      setBusy(false);
    }
  }

  if (existingLoan) {
    return (
      <Card>
        <h2 className="mb-2 text-lg font-semibold">Your active loan</h2>
        <p className="mb-4 text-sm text-gray-600">
          You already have a loan in progress. You can only submit a new application
          once it is closed or rejected.
        </p>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-gray-500">Principal</dt>
            <dd>{inr(existingLoan.principal)}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Tenure</dt>
            <dd>{existingLoan.tenureDays} days</dd>
          </div>
          <div>
            <dt className="text-gray-500">Total repayment</dt>
            <dd>{inr2(existingLoan.totalRepayment)}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Paid</dt>
            <dd>{inr2(existingLoan.amountPaid)}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Status</dt>
            <dd>
              <span
                className={`rounded px-2 py-0.5 text-xs uppercase ${statusColor(existingLoan.status)}`}
              >
                {existingLoan.status}
              </span>
            </dd>
          </div>
        </dl>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_320px]">
      <Card>
        <form className="space-y-6" onSubmit={handleApply}>
          {error && <Alert variant="error">{error}</Alert>}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Loan amount</label>
              <span className="text-sm font-semibold">{inr(principal)}</span>
            </div>
            <input
              type="range"
              min={MIN_PRINCIPAL}
              max={MAX_PRINCIPAL}
              step={5000}
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value))}
              className="w-full"
            />
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>{inr(MIN_PRINCIPAL)}</span>
              <span>{inr(MAX_PRINCIPAL)}</span>
            </div>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Tenure (days)</label>
              <span className="text-sm font-semibold">{tenure} days</span>
            </div>
            <input
              type="range"
              min={MIN_TENURE}
              max={MAX_TENURE}
              step={1}
              value={tenure}
              onChange={(e) => setTenure(Number(e.target.value))}
              className="w-full"
            />
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>{MIN_TENURE}</span>
              <span>{MAX_TENURE}</span>
            </div>
          </div>
          <Button type="submit" disabled={busy}>
            {busy ? 'Submitting…' : 'Apply for loan'}
          </Button>
        </form>
      </Card>
      <Card>
        <h2 className="mb-3 text-base font-semibold">Live calculation</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-600">Principal</dt>
            <dd className="font-medium">{inr(principal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600">Tenure</dt>
            <dd className="font-medium">{tenure} days</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600">Interest rate</dt>
            <dd className="font-medium">{RATE}% p.a.</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600">Simple interest</dt>
            <dd className="font-medium">{inr2(calc.interest)}</dd>
          </div>
          <div className="border-t border-gray-200 pt-2 flex justify-between">
            <dt className="font-semibold">Total repayment</dt>
            <dd className="font-semibold">{inr2(calc.total)}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-gray-500">
          SI = (P × R × T) / (365 × 100), where T is tenure in days.
        </p>
      </Card>
    </div>
  );
}
