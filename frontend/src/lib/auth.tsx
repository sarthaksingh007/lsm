'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  api,
  clearAuth,
  getStoredUser,
  getToken,
  setStoredUser,
  setToken,
} from './api';
import type { Role, User } from '@/types';

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredUser<User>();
    if (stored && getToken()) {
      setUser(stored);
      api<{ user: User }>('/auth/me')
        .then(({ user }) => {
          setUser(user);
          setStoredUser(user);
        })
        .catch(() => {
          clearAuth();
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      loading,
      async login(email, password) {
        const { token, user } = await api<{ token: string; user: User }>(
          '/auth/login',
          { method: 'POST', body: { email, password } }
        );
        setToken(token);
        setStoredUser(user);
        setUser(user);
        return user;
      },
      async signup(name, email, password) {
        const { token, user } = await api<{ token: string; user: User }>(
          '/auth/signup',
          { method: 'POST', body: { name, email, password } }
        );
        setToken(token);
        setStoredUser(user);
        setUser(user);
        return user;
      },
      logout() {
        clearAuth();
        setUser(null);
      },
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export function useRequireAuth(allowed?: Role[]) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname || '/')}`);
      return;
    }
    if (allowed && user.role !== 'admin' && !allowed.includes(user.role)) {
      router.replace(defaultRouteForRole(user.role));
    }
  }, [user, loading, router, pathname, allowed]);

  return { user, loading };
}

export function defaultRouteForRole(role: Role): string {
  if (role === 'borrower') return '/apply/personal';
  return '/dashboard';
}
