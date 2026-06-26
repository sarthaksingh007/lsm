import { Schema, model, Document, Types } from 'mongoose';

export interface IPayment extends Document {
  _id: Types.ObjectId;
  loan: Types.ObjectId;
  utr: string;
  amount: number;
  paidAt: Date;
  recordedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    loan: { type: Schema.Types.ObjectId, ref: 'Loan', required: true, index: true },
    utr: { type: String, required: true, unique: true, trim: true, uppercase: true },
    amount: { type: Number, required: true, min: 1 },
    paidAt: { type: Date, required: true, default: () => new Date() },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const Payment = model<IPayment>('Payment', paymentSchema);
