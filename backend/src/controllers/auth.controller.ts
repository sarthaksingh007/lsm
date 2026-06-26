import { Request, Response } from 'express';
import { User, hashPassword } from '../models/User';
import { signToken } from '../utils/jwt';
import { AuthedRequest } from '../types';
import { SignupInput, LoginInput } from '../validators/schemas';

export async function signup(req: Request, res: Response) {
  // Body is already validated/coerced by validateBody(signupSchema); email is
  // normalised to lowercase there.
  const { name, email, password } = req.body as SignupInput;

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: 'Email is already registered' });

  const user = await User.create({
    name,
    email,
    passwordHash: await hashPassword(password),
    role: 'borrower',
  });

  const token = signToken({ userId: user._id.toString(), role: user.role });
  return res.status(201).json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
}

export async function login(req: Request, res: Response) {
  // Body is already validated/coerced by validateBody(loginSchema).
  const { email, password } = req.body as LoginInput;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const ok = await user.comparePassword(password);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

  const token = signToken({ userId: user._id.toString(), role: user.role });
  return res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
}

export async function me(req: AuthedRequest, res: Response) {
  if (!req.user) return res.status(401).json({ message: 'Unauthenticated' });
  const user = await User.findById(req.user.userId).select('-passwordHash');
  if (!user) return res.status(404).json({ message: 'User not found' });
  return res.json({
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
}
