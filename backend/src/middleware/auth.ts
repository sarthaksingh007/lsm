import { Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { AuthedRequest } from '../types';

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or malformed Authorization header' });
  }
  const token = header.slice('Bearer '.length).trim();
  try {
    req.user = verifyToken(token);
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}
