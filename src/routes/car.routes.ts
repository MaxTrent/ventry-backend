import { Router } from 'express';
import { getCarsHandler, createCarHandler } from '../controllers/car.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import logger from '../utils/logger';

const router = Router();

router.get('/', getCarsHandler);
router.post('/', authMiddleware(['superadmin', 'manager']), createCarHandler);

router.use((req, res, next) => {
  logger.info({ method: req.method, path: req.path }, 'Car route accessed');
  next();
});

export default router;