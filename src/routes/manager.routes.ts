import { Router } from 'express';
import { createManagerHandler } from '../controllers/manager.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import logger from '../utils/logger';

const router = Router();

router.post('/', authMiddleware(['superadmin']), createManagerHandler);

router.use((req, res, next) => {
  logger.info({ method: req.method, path: req.path }, 'Manager route accessed');
  next();
});

export default router;