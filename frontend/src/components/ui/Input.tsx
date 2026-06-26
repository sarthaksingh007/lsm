'use client';
import { InputHTMLAttributes, forwardRef } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, hint, error, className = '', ...rest },
  ref
) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
      )}
      <input
        ref={ref}
        {...rest}
        className={`block w-full rounded-md border px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-brand-500 ${
          error ? 'border-red-400' : 'border-gray-300'
        } ${className}`}
      />
      {hint && !error && <span className="mt-1 block text-xs text-gray-500">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
});
