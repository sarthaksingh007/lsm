import jwt, { SignOptions } from 'jsonwebtoken';
import { AuthPayload } from '../types';

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'];

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyToken(token: string): AuthPayload {
  return jwt.verify(token, SECRET) as AuthPayload;
}
