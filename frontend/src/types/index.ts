export type Role =
  | 'admin'
  | 'sales'
  | 'sanction'
  | 'disbursement'
  | 'collection'
  | 'borrower';

export type EmploymentMode = 'salaried' | 'self_employed' | 'unemployed';

export type LoanStatus =
  | 'applied'
  | 'sanctioned'
  | 'rejected'
  | 'disbursed'
  | 'closed';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Application {
  _id: string;
  user: string;
  fullName: string;
  pan: string;
  dob: string;
  monthlySalary: number;
  employmentMode: EmploymentMode;
  salarySlipPath?: string;
  breCleared: boolean;
}

export interface Loan {
  _id: string;
  user: string | User;
  application: string | Application;
  principal: number;
  tenureDays: number;
  interestRate: number;
  interestAmount: number;
  totalRepayment: number;
  amountPaid: number;
  status: LoanStatus;
  rejectionReason?: string;
  sanctionedAt?: string;
  disbursedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  _id: string;
  loan: string;
  utr: string;
  amount: number;
  paidAt: string;
  recordedBy: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  hasApplication: boolean;
  hasLoan: boolean;
}
