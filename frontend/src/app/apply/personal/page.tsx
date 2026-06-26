'use client';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { api, ApiError } from '@/lib/api';
import type { Application, EmploymentMode } from '@/types';

export default function PersonalDetailsPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [pan, setPan] = useState('');
  const [dob, setDob] = useState('');
  const [monthlySalary, setMonthlySalary] = useState('');
  const [employmentMode, setEmploymentMode] = useState<EmploymentMode>('salaried');
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<{ application: Application | null }>('/applications/me')
      .then(({ application }) => {
        if (!application) return;
        setFullName(application.fullName);
        setPan(application.pan);
        setDob(application.dob.slice(0, 10));
        setMonthlySalary(String(application.monthlySalary));
        setEmploymentMode(application.employmentMode);
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setErrors([]);
    setBusy(true);
    try {
      await api('/applications/personal', {
        method: 'POST',
        body: {
          fullName,
          pan: pan.toUpperCase(),
          dob,
          monthlySalary: Number(monthlySalary),
          employmentMode,
        },
      });
      router.push('/apply/salary-slip');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setErrors(err.errors || []);
      } else {
        setError('Submission failed');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && (
          <Alert variant="error">
            <div>{error}</div>
            {errors.length > 0 && (
              <ul className="mt-2 list-inside list-disc">
                {errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            )}
          </Alert>
        )}
        <Input
          label="Full name"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <Input
          label="PAN"
          required
          value={pan}
          onChange={(e) => setPan(e.target.value.toUpperCase())}
          placeholder="ABCDE1234F"
          maxLength={10}
          hint="Format: 5 letters, 4 digits, 1 letter."
        />
        <Input
          label="Date of birth"
          type="date"
          required
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          max={new Date().toISOString().slice(0, 10)}
        />
        <Input
          label="Monthly salary (₹)"
          type="number"
          required
          min={0}
          value={monthlySalary}
          onChange={(e) => setMonthlySalary(e.target.value)}
          hint="Minimum eligible salary: ₹25,000/month."
        />
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-700">
            Employment mode
          </span>
          <select
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-brand-500"
            value={employmentMode}
            onChange={(e) => setEmploymentMode(e.target.value as EmploymentMode)}
          >
            <option value="salaried">Salaried</option>
            <option value="self_employed">Self-Employed</option>
            <option value="unemployed">Unemployed</option>
          </select>
        </label>
        <Button type="submit" disabled={busy}>
          {busy ? 'Checking…' : 'Continue'}
        </Button>
      </form>
    </Card>
  );
}
