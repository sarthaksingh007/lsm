import { Schema, model, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import { Role, ALL_ROLES } from '../types';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(plain: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ALL_ROLES,
      default: 'borrower',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = function (plain: string) {
  return bcrypt.compare(plain, this.passwordHash);
};

export const User = model<IUser>('User', userSchema);

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}
