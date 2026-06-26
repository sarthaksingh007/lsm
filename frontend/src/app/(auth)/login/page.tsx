'use client';
import { FormEvent, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth, defaultRouteForRole } from '@/lib/auth';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { ApiError } from '@/lib/api';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const user = await login(email, password);
      const next = params.get('next');
      router.replace(next || defaultRouteForRole(user.role));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error && <Alert variant="error">{error}</Alert>}
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
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
      />
      <Button type="submit" disabled={busy} className="w-full">
        {busy ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="mx-auto mt-16 max-w-md px-4">
      <Card>
        <h1 className="mb-1 text-2xl font-semibold">Sign in</h1>
        <p className="mb-6 text-sm text-gray-500">
          Access the borrower portal or operations dashboard.
        </p>
        <Suspense fallback={<p className="text-sm text-gray-500">Loading…</p>}>
          <LoginForm />
        </Suspense>
        <p className="mt-4 text-sm text-gray-600">
          New here?{' '}
          <Link className="text-brand-700 hover:underline" href="/signup">
            Create a borrower account
          </Link>
        </p>
      </Card>
    </main>
  );
}
