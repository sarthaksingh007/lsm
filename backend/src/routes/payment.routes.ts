import { Router } from 'express';
import { recordPayment, listPaymentsForLoan } from '../controllers/payment.controller';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { validateBody } from '../middleware/validate';
import { paymentSchema } from '../validators/schemas';

const router = Router();
router.use(requireAuth);
router.use(requireRole('collection'));

router.post('/', validateBody(paymentSchema), recordPayment);
router.get('/loan/:loanId', listPaymentsForLoan);

export default router;
