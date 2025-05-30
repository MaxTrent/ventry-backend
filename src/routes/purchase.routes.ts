import { Router } from 'express';
import { initiatePurchase, handlePaymentCallback } from '../services/purchase.service';
import { authMiddleware } from '../middleware/auth.middleware';
import logger from '../utils/logger';
import { sendResponse } from '../utils/response';

const router = Router();

// Initiate a car purchase
router.post('/', authMiddleware(['customer']), async (req: any, res) => {
  try {
    const { carId, email } = req.body;
    const customerId = req.user?.id;
    if (!customerId) {
      logger.warn({ path: req.path }, 'Unauthorized');
      return sendResponse(res, 401, null, 'Unauthorized');
    }
    const result = await initiatePurchase({ carId, email }, customerId);
    sendResponse(res, 200, result, 'Purchase initiated');
  } catch (error: any) {
    logger.error({ error: error.message }, 'Failed to initiate purchase');
    sendResponse(res, 500, null, error.message || 'Failed to initiate purchase');
  }
});

// Handle Paystack callback
router.get('/callback', async (req, res) => {
  try {
    const { reference } = req.query;
    if (typeof reference !== 'string') {
      throw new Error('Invalid reference');
    }
    const purchase = await handlePaymentCallback(reference);
    sendResponse(res, 200, purchase, 'Purchase verified');
  } catch (error: any) {
    logger.error({ error: error.message }, 'Verification failed');
    sendResponse(res, 500, null, error.message || 'Verification failed');
  }
});

export default router;