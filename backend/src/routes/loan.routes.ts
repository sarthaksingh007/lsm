import { Router } from 'express';
import {
  applyLoan,
  myLoans,
  listLoansByStatus,
  getLoan,
  sanctionLoan,
  disburseLoan,
} from '../controllers/loan.controller';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { validateBody } from '../middleware/validate';
import { loanApplySchema } from '../validators/schemas';

const router = Router();
router.use(requireAuth);

router.post('/apply', requireRole('borrower'), validateBody(loanApplySchema), applyLoan);
router.get('/mine', requireRole('borrower'), myLoans);

router.get('/', requireRole('sales', 'sanction', 'disbursement', 'collection'), listLoansByStatus);
router.get('/:id', requireRole('sales', 'sanction', 'disbursement', 'collection'), getLoan);

router.post('/:id/sanction', requireRole('sanction'), sanctionLoan);
router.post('/:id/disburse', requireRole('disbursement'), disburseLoan);

export default router;
