import { Router } from 'express';
import {
  submitPersonalDetails,
  uploadSlip,
  myApplication,
} from '../controllers/application.controller';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { uploadSalarySlip } from '../middleware/upload';
import { validateBody } from '../middleware/validate';
import { personalDetailsSchema } from '../validators/schemas';

const router = Router();

router.use(requireAuth);
router.use(requireRole('borrower'));

router.get('/me', myApplication);
router.post('/personal', validateBody(personalDetailsSchema), submitPersonalDetails);
router.post('/salary-slip', uploadSalarySlip, uploadSlip);

export default router;
