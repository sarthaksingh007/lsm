'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { api, ApiError } from '@/lib/api';
import type { Loan, User } from '@/types';
import { inr, inr2, statusColor } from '@/lib/format';

export default function DisbursementPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const { loans } = await api<{ loans: Loan[] }>('/loans?status=sanctioned');
      setLoans(loans);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function disburse(id: string) {
    setActionError(null);
    setBusyId(id);
    try {
      await api(`/loans/${id}/disburse`, { method: 'POST' });
      await load();
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : 'Disbursement failed');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Card>
      <h2 className="mb-1 text-lg font-semibold">Disbursement — Sanctioned Loans</h2>
      <p className="mb-4 text-sm text-gray-500">
        Mark a loan as disbursed once funds have been released to the borrower.
      </p>
      {error && <Alert variant="error">{error}</Alert>}
      {actionError && <Alert variant="error">{actionError}</Alert>}
      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : loans.length === 0 ? (
        <p className="text-sm text-gray-500">No sanctioned loans pending disbursement.</p>
      ) : (
        <div className="space-y-3">
          {loans.map((loan) => {
            const u = loan.user as User;
            return (
              <div
                key={loan._id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-gray-200 p-4"
              >
                <div>
                  <div className="font-medium">
                    {u.name}{' '}
                    <span className="text-xs text-gray-500">({u.email})</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Loan #{loan._id.slice(-6)} • {inr(loan.principal)} for{' '}
                    {loan.tenureDays} days • Total {inr2(loan.totalRepayment)}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded px-2 py-0.5 text-xs uppercase ${statusColor(loan.status)}`}
                  >
                    {loan.status}
                  </span>
                  <Button
                    onClick={() => disburse(loan._id)}
                    disabled={busyId === loan._id}
                  >
                    Mark as Disbursed
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
