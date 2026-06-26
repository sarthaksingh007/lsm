import { Schema, model, Document, Types } from 'mongoose';
import { LoanStatus } from '../types';

export interface ILoan extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  application: Types.ObjectId;
  principal: number;
  tenureDays: number;
  interestRate: number;
  interestAmount: number;
  totalRepayment: number;
  amountPaid: number;
  status: LoanStatus;
  rejectionReason?: string;
  sanctionedAt?: Date;
  disbursedAt?: Date;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const loanSchema = new Schema<ILoan>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    application: {
      type: Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
      index: true,
    },
    principal: { type: Number, required: true, min: 50_000, max: 500_000 },
    tenureDays: { type: Number, required: true, min: 30, max: 365 },
    interestRate: { type: Number, required: true, default: 12 },
    interestAmount: { type: Number, required: true },
    totalRepayment: { type: Number, required: true },
    amountPaid: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ['applied', 'sanctioned', 'rejected', 'disbursed', 'closed'],
      default: 'applied',
      required: true,
      index: true,
    },
    rejectionReason: { type: String },
    sanctionedAt: { type: Date },
    disbursedAt: { type: Date },
    closedAt: { type: Date },
  },
  { timestamps: true }
);

export const Loan = model<ILoan>('Loan', loanSchema);
