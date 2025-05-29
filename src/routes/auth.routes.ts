import { Router } from 'express';
import { loginHandler } from '../controllers/auth.controller';
import logger from '../utils/logger';

const router = Router();

router.post('/login', loginHandler);

router.use((req, res, next) => {
  logger.info({ method: req.method, path: req.path }, 'Auth route accessed');
  next();
});

export default router;