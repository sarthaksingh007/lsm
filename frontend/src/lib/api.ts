export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5100/api';

const TOKEN_KEY = 'lms_token';
const USER_KEY = 'lms_user';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(t: string) {
  if (typeof window !== 'undefined') localStorage.setItem(TOKEN_KEY, t);
}
export function clearAuth() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}
export function setStoredUser<T>(user: T) {
  if (typeof window !== 'undefined')
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}
export function getStoredUser<T>(): T | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as T) : null;
}

export class ApiError extends Error {
  status: number;
  errors?: string[];
  constructor(message: string, status: number, errors?: string[]) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  formData?: FormData;
}

export async function api<T = unknown>(
  path: string,
  opts: RequestOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let body: BodyInit | undefined;
  if (opts.formData) {
    body = opts.formData;
  } else if (opts.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(opts.body);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: opts.method || 'GET',
    headers,
    body,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(
      data.message || res.statusText,
      res.status,
      data.errors
    );
  }
  return data as T;
}
