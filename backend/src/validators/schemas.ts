import { z } from 'zod';

/**
 * Input-shape validation (presence, types, coercion). This is deliberately
 * separate from business rules: eligibility (BRE) lives in `bre.service.ts`
 * and loan-range rules live in `loan.service.ts`, both as pure, unit-testable
 * functions. Zod only guarantees the controller receives well-formed input.
 */

export const signupSchema = z.object({
  name: z.string().trim().min(1, 'name is required'),
  email: z.string().trim().toLowerCase().email('a valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('a valid email is required'),
  password: z.string().min(1, 'password is required'),
});

export const personalDetailsSchema = z.object({
  fullName: z.string().trim().min(1, 'fullName is required'),
  pan: z.string().trim().min(1, 'pan is required'),
  dob: z.string().min(1, 'dob is required'),
  monthlySalary: z.coerce
    .number({ invalid_type_error: 'monthlySalary must be a number' })
    .positive('monthlySalary must be a positive number'),
  employmentMode: z.enum(['salaried', 'self_employed', 'unemployed'], {
    errorMap: () => ({ message: 'employmentMode is invalid' }),
  }),
});

export const loanApplySchema = z.object({
  principal: z.coerce.number({ invalid_type_error: 'principal must be a number' }),
  tenureDays: z.coerce.number({ invalid_type_error: 'tenureDays must be a number' }),
});

export const paymentSchema = z.object({
  loanId: z.string().trim().min(1, 'loanId is required'),
  utr: z.string().trim().min(1, 'utr is required'),
  amount: z.coerce
    .number({ invalid_type_error: 'amount must be a number' })
    .positive('amount must be a positive number'),
  paidAt: z.string().optional(),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PersonalDetailsInput = z.infer<typeof personalDetailsSchema>;
export type LoanApplyInput = z.infer<typeof loanApplySchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
