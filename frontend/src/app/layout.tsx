import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '@/lib/auth';
import { TopBar } from '@/components/nav/TopBar';

export const metadata: Metadata = {
  title: 'LMS — Loan Management System',
  description: 'Borrower portal and operations dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <TopBar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
