import { Router } from 'express';
import { loginHandler, logoutHandler } from '../controllers/auth.controller';
import logger from '../utils/logger';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/login', loginHandler);
router.post('/logout', authMiddleware(['customer', 'manager', 'superadmin']), logoutHandler);

router.use((req, res, next) => {
  logger.info({ method: req.method, path: req.path }, 'Auth route accessed');
  next();
});

export default router;