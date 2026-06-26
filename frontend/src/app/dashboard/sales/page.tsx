'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { api, ApiError } from '@/lib/api';
import type { Lead } from '@/types';

export default function SalesPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ leads: Lead[] }>('/dashboard/sales/leads')
      .then(({ leads }) => setLeads(leads))
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card>
      <h2 className="mb-1 text-lg font-semibold">Sales — Leads</h2>
      <p className="mb-4 text-sm text-gray-500">
        Registered borrowers who haven't completed an application yet.
      </p>
      {error && <Alert variant="error">{error}</Alert>}
      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : leads.length === 0 ? (
        <p className="text-sm text-gray-500">No pending leads.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Joined</th>
                <th className="px-3 py-2">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leads.map((l) => (
                <tr key={l.id}>
                  <td className="px-3 py-2 font-medium">{l.name}</td>
                  <td className="px-3 py-2 text-gray-600">{l.email}</td>
                  <td className="px-3 py-2 text-gray-600">
                    {new Date(l.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2">
                    {l.hasLoan ? (
                      <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
                        Loan submitted
                      </span>
                    ) : l.hasApplication ? (
                      <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800">
                        Started application
                      </span>
                    ) : (
                      <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                        New lead
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
