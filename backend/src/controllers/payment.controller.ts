import { Response } from 'express';
import { Loan } from '../models/Loan';
import { Payment } from '../models/Payment';
import { round2 } from '../services/loan.service';
import { AuthedRequest } from '../types';
import { PaymentInput } from '../validators/schemas';

// Tolerance for float money comparisons (rupees stored as Number).
const EPSILON = 0.01;

export async function recordPayment(req: AuthedRequest, res: Response) {
  if (!req.user) return res.status(401).json({ message: 'Unauthenticated' });

  // Body is already validated/coerced by validateBody(paymentSchema).
  const { loanId, utr, amount, paidAt } = req.body as PaymentInput;

  const loan = await Loan.findById(loanId);
  if (!loan) return res.status(404).json({ message: 'Loan not found' });
  if (loan.status !== 'disbursed') {
    return res
      .status(409)
      .json({ message: `Cannot record payment on a loan in status '${loan.status}'` });
  }

  // Friendly up-front check. The authoritative overpay guard is the atomic
  // conditional update below — this just gives a clearer message in the common case.
  const outstanding = round2(loan.totalRepayment - loan.amountPaid);
  if (amount > outstanding + EPSILON) {
    return res.status(400).json({
      message: `Amount exceeds outstanding balance (₹${outstanding.toFixed(2)})`,
    });
  }

  const utrTrimmed = utr.trim().toUpperCase();

  // 1) Reserve the UTR. The unique index — not this app code — is the real
  //    guard: between a findOne() check and create() a concurrent request can
  //    slip through, so we let the index reject the duplicate and translate the
  //    Mongo E11000 into a clean 409 instead of leaking a 500.
  let payment;
  try {
    payment = await Payment.create({
      loan: loan._id,
      utr: utrTrimmed,
      amount,
      paidAt: paidAt ? new Date(paidAt) : new Date(),
      recordedBy: req.user.userId,
    });
  } catch (err) {
    if ((err as { code?: number }).code === 11000) {
      return res.status(409).json({ message: 'UTR has already been used' });
    }
    throw err;
  }

  // 2) Apply the payment to the loan atomically. The filter re-checks status and
  //    that amountPaid + amount stays within totalRepayment *inside the DB*, so two
  //    concurrent payments cannot both pass the read-time outstanding check and
  //    overpay. The pipeline update increments amountPaid and auto-closes the loan
  //    when fully paid — all in one atomic operation (no read-modify-write window).
  const updated = await Loan.findOneAndUpdate(
    {
      _id: loan._id,
      status: 'disbursed',
      $expr: {
        $lte: [{ $add: ['$amountPaid', amount] }, { $add: ['$totalRepayment', EPSILON] }],
      },
    },
    [
      {
        $set: {
          amountPaid: {
            $min: ['$totalRepayment', { $round: [{ $add: ['$amountPaid', amount] }, 2] }],
          },
        },
      },
      {
        $set: {
          status: {
            $cond: [
              { $gte: ['$amountPaid', { $subtract: ['$totalRepayment', EPSILON] }] },
              'closed',
              '$status',
            ],
          },
          closedAt: {
            $cond: [
              { $gte: ['$amountPaid', { $subtract: ['$totalRepayment', EPSILON] }] },
              '$$NOW',
              '$closedAt',
            ],
          },
        },
      },
    ],
    { new: true }
  );

  // A null result means a concurrent payment consumed the remaining balance (or
  // the loan changed status) after our read-time check. Roll back the UTR we
  // reserved so it can be reused, and tell the client to retry.
  if (!updated) {
    await Payment.deleteOne({ _id: payment._id });
    return res.status(409).json({
      message: 'Outstanding balance changed before this payment could be applied; please retry.',
    });
  }

  return res.status(201).json({ payment, loan: updated });
}

export async function listPaymentsForLoan(req: AuthedRequest, res: Response) {
  const { loanId } = req.params;
  const payments = await Payment.find({ loan: loanId }).sort({ paidAt: -1 });
  return res.json({ payments });
}
