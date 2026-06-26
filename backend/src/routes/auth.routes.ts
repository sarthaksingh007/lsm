import { Router } from 'express';
import { signup, login, me } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { signupSchema, loginSchema } from '../validators/schemas';

const router = Router();
router.post('/signup', validateBody(signupSchema), signup);
router.post('/login', validateBody(loginSchema), login);
router.get('/me', requireAuth, me);

export default router;
