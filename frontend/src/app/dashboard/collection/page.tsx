'use client';
import { FormEvent, useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { api, ApiError } from '@/lib/api';
import type { Loan, Payment, User } from '@/types';
import { inr, inr2, statusColor } from '@/lib/format';

export default function CollectionPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [utr, setUtr] = useState('');
  const [amount, setAmount] = useState('');
  const [paidAt, setPaidAt] = useState(new Date().toISOString().slice(0, 10));
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [{ loans: disbursed }, { loans: closed }] = await Promise.all([
        api<{ loans: Loan[] }>('/loans?status=disbursed'),
        api<{ loans: Loan[] }>('/loans?status=closed'),
      ]);
      setLoans([...disbursed, ...closed]);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function loadPayments(loanId: string) {
    setSelected(loanId);
    setActionError(null);
    try {
      const { payments } = await api<{ payments: Payment[] }>(
        `/payments/loan/${loanId}`
      );
      setPayments(payments);
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : 'Failed to load payments');
    }
  }

  async function submitPayment(e: FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setActionError(null);
    setBusy(true);
    try {
      await api('/payments', {
        method: 'POST',
        body: { loanId: selected, utr, amount: Number(amount), paidAt },
      });
      setUtr('');
      setAmount('');
      await loadPayments(selected);
      await load();
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : 'Payment failed');
    } finally {
      setBusy(false);
    }
  }

  const selectedLoan = loans.find((l) => l._id === selected);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
      <Card>
        <h2 className="mb-1 text-lg font-semibold">Collection — Active Loans</h2>
        <p className="mb-4 text-sm text-gray-500">
          Click a loan to view payments and record collections.
        </p>
        {error && <Alert variant="error">{error}</Alert>}
        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : loans.length === 0 ? (
          <p className="text-sm text-gray-500">No disbursed loans.</p>
        ) : (
          <div className="space-y-2">
            {loans.map((loan) => {
              const u = loan.user as User;
              const outstanding = loan.totalRepayment - loan.amountPaid;
              const isActive = selected === loan._id;
              return (
                <button
                  key={loan._id}
                  onClick={() => loadPayments(loan._id)}
                  className={`block w-full rounded-md border p-3 text-left transition ${
                    isActive
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{u.name}</div>
                    <span
                      className={`rounded px-2 py-0.5 text-xs uppercase ${statusColor(loan.status)}`}
                    >
                      {loan.status}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-gray-600">
                    Loan #{loan._id.slice(-6)} • {inr(loan.principal)} •{' '}
                    Outstanding {inr2(outstanding)}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </Card>

      <Card>
        {!selectedLoan ? (
          <p className="text-sm text-gray-500">Select a loan to record payments.</p>
        ) : (
          <>
            <h3 className="text-base font-semibold">
              Loan #{selectedLoan._id.slice(-6)}
            </h3>
            <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-gray-500">Total repayment</dt>
                <dd>{inr2(selectedLoan.totalRepayment)}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Paid</dt>
                <dd>{inr2(selectedLoan.amountPaid)}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Outstanding</dt>
                <dd className="font-medium">
                  {inr2(selectedLoan.totalRepayment - selectedLoan.amountPaid)}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Status</dt>
                <dd>
                  <span
                    className={`rounded px-2 py-0.5 text-xs uppercase ${statusColor(selectedLoan.status)}`}
                  >
                    {selectedLoan.status}
                  </span>
                </dd>
              </div>
            </dl>

            {selectedLoan.status === 'disbursed' && (
              <form className="mt-4 space-y-3" onSubmit={submitPayment}>
                {actionError && <Alert variant="error">{actionError}</Alert>}
                <Input
                  label="UTR number"
                  required
                  value={utr}
                  onChange={(e) => setUtr(e.target.value.toUpperCase())}
                  hint="Must be unique across all payments."
                />
                <Input
                  label="Amount (₹)"
                  type="number"
                  required
                  min={1}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <Input
                  label="Payment date"
                  type="date"
                  required
                  value={paidAt}
                  onChange={(e) => setPaidAt(e.target.value)}
                  max={new Date().toISOString().slice(0, 10)}
                />
                <Button type="submit" disabled={busy}>
                  {busy ? 'Recording…' : 'Record payment'}
                </Button>
              </form>
            )}

            <div className="mt-6">
              <h4 className="mb-2 text-sm font-semibold text-gray-700">
                Payments
              </h4>
              {payments.length === 0 ? (
                <p className="text-sm text-gray-500">No payments recorded yet.</p>
              ) : (
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-2 py-1">Date</th>
                      <th className="px-2 py-1">UTR</th>
                      <th className="px-2 py-1 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {payments.map((p) => (
                      <tr key={p._id}>
                        <td className="px-2 py-1">
                          {new Date(p.paidAt).toLocaleDateString()}
                        </td>
                        <td className="px-2 py-1 font-mono text-xs">{p.utr}</td>
                        <td className="px-2 py-1 text-right">{inr2(p.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
