'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { api, ApiError } from '@/lib/api';
import type { Loan, User } from '@/types';
import { inr, inr2, statusColor } from '@/lib/format';

export default function SanctionPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const { loans } = await api<{ loans: Loan[] }>('/loans?status=applied');
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

  async function act(id: string, decision: 'approve' | 'reject') {
    setActionError(null);
    setBusyId(id);
    try {
      await api(`/loans/${id}/sanction`, {
        method: 'POST',
        body: { decision, reason: reason[id] },
      });
      await load();
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : 'Action failed');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Card>
      <h2 className="mb-1 text-lg font-semibold">Sanction — Pending Approvals</h2>
      <p className="mb-4 text-sm text-gray-500">
        Review each applied loan. Approve to move to Disbursement, or reject with a reason.
      </p>
      {error && <Alert variant="error">{error}</Alert>}
      {actionError && <Alert variant="error">{actionError}</Alert>}
      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : loans.length === 0 ? (
        <p className="text-sm text-gray-500">No loans awaiting sanction.</p>
      ) : (
        <div className="space-y-4">
          {loans.map((loan) => {
            const u = loan.user as User;
            return (
              <div
                key={loan._id}
                className="rounded-md border border-gray-200 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="font-medium">
                      {u.name}{' '}
                      <span className="text-xs text-gray-500">({u.email})</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Loan #{loan._id.slice(-6)}
                    </div>
                  </div>
                  <span
                    className={`rounded px-2 py-0.5 text-xs uppercase ${statusColor(loan.status)}`}
                  >
                    {loan.status}
                  </span>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm md:grid-cols-4">
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
                </dl>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    placeholder="Rejection reason (required to reject)"
                    value={reason[loan._id] || ''}
                    onChange={(e) =>
                      setReason((r) => ({ ...r, [loan._id]: e.target.value }))
                    }
                    className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                  />
                  <Button
                    onClick={() => act(loan._id, 'approve')}
                    disabled={busyId === loan._id}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => act(loan._id, 'reject')}
                    disabled={busyId === loan._id || !reason[loan._id]?.trim()}
                  >
                    Reject
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
