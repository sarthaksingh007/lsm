import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ message: 'Not found' });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large (max 5 MB)' });
    }
    return res.status(400).json({ message: err.message });
  }
  // Mongo duplicate-key (e.g. a unique index like UTR) — return 409, not 500/400.
  if ((err as { code?: number }).code === 11000) {
    return res.status(409).json({ message: 'Duplicate value violates a unique constraint' });
  }
  // Mongoose schema validation — surface as 422 with field errors.
  if (err instanceof Error && err.name === 'ValidationError') {
    const errors = Object.values(
      (err as unknown as { errors: Record<string, { message: string }> }).errors
    ).map((e) => e.message);
    return res.status(422).json({ message: 'Validation failed', errors });
  }
  if (err instanceof Error) {
    console.error('[error]', err.message);
    return res.status(400).json({ message: err.message });
  }
  console.error('[error] unknown', err);
  return res.status(500).json({ message: 'Internal server error' });
}
