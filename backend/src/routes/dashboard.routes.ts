import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { salesLeads } from '../controllers/dashboard.controller';

const router = Router();
router.use(requireAuth);

router.get('/sales/leads', requireRole('sales'), salesLeads);

export default router;
