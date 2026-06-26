'use client';
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  children: ReactNode;
}

const styles: Record<NonNullable<Props['variant']>, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 disabled:bg-brand-600/60',
  secondary:
    'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 disabled:opacity-60',
  danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-600/60',
  ghost: 'text-gray-700 hover:bg-gray-100',
};

export function Button({ variant = 'primary', className = '', children, ...rest }: Props) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
