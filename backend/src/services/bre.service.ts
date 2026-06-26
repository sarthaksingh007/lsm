import { EmploymentMode } from '../types';

export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
export const MIN_SALARY = 25_000;
export const MIN_AGE = 23;
export const MAX_AGE = 50;

export interface BREInput {
  pan: string;
  dob: Date | string;
  monthlySalary: number;
  employmentMode: EmploymentMode;
}

export interface BREResult {
  ok: boolean;
  errors: string[];
}

export function calculateAge(dob: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

export function runBRE(input: BREInput): BREResult {
  const errors: string[] = [];

  if (!PAN_REGEX.test(input.pan.toUpperCase())) {
    errors.push('PAN format is invalid. Expected pattern: AAAAA1234A');
  }

  const dob = input.dob instanceof Date ? input.dob : new Date(input.dob);
  if (isNaN(dob.getTime())) {
    errors.push('Date of birth is invalid.');
  } else {
    const age = calculateAge(dob);
    if (age < MIN_AGE || age > MAX_AGE) {
      errors.push(`Age must be between ${MIN_AGE} and ${MAX_AGE}. You are ${age}.`);
    }
  }

  if (typeof input.monthlySalary !== 'number' || input.monthlySalary < MIN_SALARY) {
    errors.push(`Monthly salary must be at least ₹${MIN_SALARY.toLocaleString('en-IN')}.`);
  }

  if (input.employmentMode === 'unemployed') {
    errors.push('Unemployed applicants are not eligible.');
  }

  return { ok: errors.length === 0, errors };
}
