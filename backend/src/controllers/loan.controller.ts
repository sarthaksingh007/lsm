import { Response } from 'express';
import { Application } from '../models/Application';
import { Loan } from '../models/Loan';
import { calculateLoan, validateLoanConfig } from '../services/loan.service';
import { AuthedRequest, LoanStatus } from '../types';
import { LoanApplyInput } from '../validators/schemas';

export async function applyLoan(req: AuthedRequest, res: Response) {
  if (!req.user) return res.status(401).json({ message: 'Unauthenticated' });

  // Body is already validated/coerced by validateBody(loanApplySchema).
  const { principal, tenureDays } = req.body as LoanApplyInput;

  // Check eligibility prerequisites first — these gate whether the borrower may
  // apply at all, so they should take precedence over loan-config range errors.
  const application = await Application.findOne({ user: req.user.userId });
  if (!application || !application.breCleared) {
    return res.status(400).json({ message: 'Complete eligibility check first' });
  }
  if (!application.salarySlipPath) {
    return res.status(400).json({ message: 'Upload salary slip first' });
  }

  const existingActive = await Loan.findOne({
    user: req.user.userId,
    status: { $in: ['applied', 'sanctioned', 'disbursed'] },
  });
  if (existingActive) {
    return res
      .status(409)
      .json({ message: 'You already have an active loan application' });
  }

  const errs = validateLoanConfig(principal, tenureDays);
  if (errs.length) return res.status(422).json({ message: 'Invalid config', errors: errs });

  const calc = calculateLoan(principal, tenureDays);
  const loan = await Loan.create({
    user: req.user.userId,
    application: application._id,
    ...calc,
    status: 'applied',
  });
  return res.status(201).json({ loan });
}

export async function myLoans(req: AuthedRequest, res: Response) {
  if (!req.user) return res.status(401).json({ message: 'Unauthenticated' });
  const loans = await Loan.find({ user: req.user.userId }).sort({ createdAt: -1 });
  return res.json({ loans });
}

export async function listLoansByStatus(req: AuthedRequest, res: Response) {
  const { status } = req.query as { status?: LoanStatus };
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  const loans = await Loan.find(filter)
    .populate('user', 'name email')
    .populate('application')
    .sort({ updatedAt: -1 });
  return res.json({ loans });
}

export async function getLoan(req: AuthedRequest, res: Response) {
  const loan = await Loan.findById(req.params.id)
    .populate('user', 'name email')
    .populate('application');
  if (!loan) return res.status(404).json({ message: 'Loan not found' });
  return res.json({ loan });
}

export async function sanctionLoan(req: AuthedRequest, res: Response) {
  const { decision, reason } = req.body as {
    decision?: 'approve' | 'reject';
    reason?: string;
  };
  if (decision !== 'approve' && decision !== 'reject') {
    return res.status(400).json({ message: "decision must be 'approve' or 'reject'" });
  }
  const loan = await Loan.findById(req.params.id);
  if (!loan) return res.status(404).json({ message: 'Loan not found' });
  if (loan.status !== 'applied') {
    return res
      .status(409)
      .json({ message: `Cannot sanction a loan in status '${loan.status}'` });
  }

  if (decision === 'approve') {
    loan.status = 'sanctioned';
    loan.sanctionedAt = new Date();
  } else {
    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: 'reason is required when rejecting' });
    }
    loan.status = 'rejected';
    loan.rejectionReason = reason.trim();
  }
  await loan.save();
  return res.json({ loan });
}

export async function disburseLoan(req: AuthedRequest, res: Response) {
  const loan = await Loan.findById(req.params.id);
  if (!loan) return res.status(404).json({ message: 'Loan not found' });
  if (loan.status !== 'sanctioned') {
    return res
      .status(409)
      .json({ message: `Cannot disburse a loan in status '${loan.status}'` });
  }
  loan.status = 'disbursed';
  loan.disbursedAt = new Date();
  await loan.save();
  return res.json({ loan });
}
