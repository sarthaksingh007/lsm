import { Request } from 'express';

export type Role =
  | 'admin'
  | 'sales'
  | 'sanction'
  | 'disbursement'
  | 'collection'
  | 'borrower';

export const ALL_ROLES: Role[] = [
  'admin',
  'sales',
  'sanction',
  'disbursement',
  'collection',
  'borrower',
];

export type EmploymentMode = 'salaried' | 'self_employed' | 'unemployed';

export type LoanStatus =
  | 'applied'
  | 'sanctioned'
  | 'rejected'
  | 'disbursed'
  | 'closed';

export interface AuthPayload {
  userId: string;
  role: Role;
}

export interface AuthedRequest extends Request {
  user?: AuthPayload;
}
