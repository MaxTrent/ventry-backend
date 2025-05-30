import { Router } from 'express';
import { initiatePurchaseHandler, handlePaymentCallbackHandler, handleWebhookHandler } from '../controllers/purchase.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import logger from '../utils/logger';

const router = Router();


router.post('/', authMiddleware(['customer']), initiatePurchaseHandler);
router.get('/callback', handlePaymentCallbackHandler);
router.post('/webhook', handleWebhookHandler);

router.use((req, res, next) => {
  logger.info({ method: req.method, path: req.path }, 'Purchase route accessed');
  next();
});

export default router;
