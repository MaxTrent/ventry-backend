import { Router } from 'express';
import { signupCustomerHandler, verifyOtpHandler } from '../controllers/customer.controller';
import logger from '../utils/logger';

const router = Router();

router.post('/signup', signupCustomerHandler);
router.post('/verify-otp', verifyOtpHandler);

router.use((req, res, next) => {
  logger.info({ method: req.method, path: req.path }, 'Customer route accessed');
  next();
});

export default router;