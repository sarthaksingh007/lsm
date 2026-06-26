'use client';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { api, ApiError, getToken, API_BASE } from '@/lib/api';
import type { Application } from '@/types';

export default function SalarySlipPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [existing, setExisting] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<{ application: Application | null }>('/applications/me')
      .then(({ application }) => {
        if (!application || !application.breCleared) {
          router.replace('/apply/personal');
          return;
        }
        setExisting(application.salarySlipPath);
      })
      .catch(() => {});
  }, [router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!file) {
      setError('Choose a file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large (max 5 MB)');
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('salarySlip', file);
      const res = await fetch(`${API_BASE}/applications/salary-slip`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new ApiError(data.message || 'Upload failed', res.status);
      router.push('/apply/loan');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && <Alert variant="error">{error}</Alert>}
        {existing && (
          <Alert variant="info">
            A salary slip is already on file. Uploading a new one will replace it.
          </Alert>
        )}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Salary slip
          </label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm"
          />
          <p className="mt-1 text-xs text-gray-500">PDF, JPG, or PNG. Max 5 MB.</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Back
          </Button>
          <Button type="submit" disabled={busy || !file}>
            {busy ? 'Uploading…' : 'Upload & Continue'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
