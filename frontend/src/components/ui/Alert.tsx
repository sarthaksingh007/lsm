import { ReactNode } from 'react';

interface Props {
  variant?: 'error' | 'success' | 'info';
  children: ReactNode;
}

const styles: Record<NonNullable<Props['variant']>, string> = {
  error: 'border-red-200 bg-red-50 text-red-800',
  success: 'border-green-200 bg-green-50 text-green-800',
  info: 'border-blue-200 bg-blue-50 text-blue-800',
};

export function Alert({ variant = 'info', children }: Props) {
  return (
    <div className={`rounded-md border px-3 py-2 text-sm ${styles[variant]}`}>
      {children}
    </div>
  );
}
