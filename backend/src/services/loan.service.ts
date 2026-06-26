export const INTEREST_RATE = 12;
export const MIN_PRINCIPAL = 50_000;
export const MAX_PRINCIPAL = 500_000;
export const MIN_TENURE_DAYS = 30;
export const MAX_TENURE_DAYS = 365;

export interface LoanCalc {
  principal: number;
  tenureDays: number;
  interestRate: number;
  interestAmount: number;
  totalRepayment: number;
}

export function calculateLoan(principal: number, tenureDays: number): LoanCalc {
  const interestAmount =
    (principal * INTEREST_RATE * tenureDays) / (365 * 100);
  const totalRepayment = principal + interestAmount;
  return {
    principal,
    tenureDays,
    interestRate: INTEREST_RATE,
    interestAmount: round2(interestAmount),
    totalRepayment: round2(totalRepayment),
  };
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function validateLoanConfig(principal: number, tenureDays: number): string[] {
  const errors: string[] = [];
  if (principal < MIN_PRINCIPAL || principal > MAX_PRINCIPAL) {
    errors.push(
      `Loan amount must be between ₹${MIN_PRINCIPAL.toLocaleString('en-IN')} and ₹${MAX_PRINCIPAL.toLocaleString('en-IN')}.`
    );
  }
  if (tenureDays < MIN_TENURE_DAYS || tenureDays > MAX_TENURE_DAYS) {
    errors.push(`Tenure must be between ${MIN_TENURE_DAYS} and ${MAX_TENURE_DAYS} days.`);
  }
  return errors;
}
