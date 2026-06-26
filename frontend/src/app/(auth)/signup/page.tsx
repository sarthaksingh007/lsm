'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { ApiError } from '@/lib/api';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await signup(name, email, password);
      router.replace('/apply/personal');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Signup failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto mt-16 max-w-md px-4">
      <Card>
        <h1 className="mb-1 text-2xl font-semibold">Create your account</h1>
        <p className="mb-6 text-sm text-gray-500">
          For borrowers only. Operations staff are seeded by the admin.
        </p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && <Alert variant="error">{error}</Alert>}
          <Input
            label="Full name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            hint="Minimum 8 characters."
            autoComplete="new-password"
          />
          <Button type="submit" disabled={busy} className="w-full">
            {busy ? 'Creating…' : 'Create account'}
          </Button>
        </form>
        <p className="mt-4 text-sm text-gray-600">
          Already have an account?{' '}
          <Link className="text-brand-700 hover:underline" href="/login">
            Sign in
          </Link>
        </p>
      </Card>
    </main>
  );
}
