import { Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { AuthedRequest } from '../types';

/**
 * Validates and coerces `req.body` against a Zod schema. On failure it returns
 * `422` with an `errors[]` array — the same contract the BRE uses — so the
 * frontend can render field errors uniformly. On success the parsed (and
 * coerced) value replaces `req.body`, letting controllers drop manual casts.
 */
export function validateBody(schema: ZodSchema) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map((issue) =>
        issue.path.length ? `${issue.path.join('.')}: ${issue.message}` : issue.message
      );
      return res.status(422).json({ message: 'Validation failed', errors });
    }
    req.body = result.data;
    return next();
  };
}
