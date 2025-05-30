
import { Request, Response, NextFunction } from 'express';
import { initiatePurchase, handlePaymentCallback, handleWebhook } from '../services/purchase.service';
import { sendResponse } from '../utils/response';
import logger from '../utils/logger';
import { AuthRequest } from 'middleware/auth.middleware';



export const initiatePurchaseHandler = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { carId, email } = req.body;
    const customerId = req.user?.id;
    if (!customerId) {
      logger.warn({ path: req.path }, 'Unauthorized');
      sendResponse(res, 401, null, 'Unauthorized');
      return;
    }
    const result = await initiatePurchase({ carId, email }, customerId);
    sendResponse(res, 200, result, 'Purchase initiated');
  } catch (error: any) {
    logger.error({ error: error.message }, 'Failed to initiate purchase');
    sendResponse(res, 500, null, error.message || 'Failed to initiate purchase');
    next(error);
  }
};

export const handlePaymentCallbackHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
    next(error);
  }
};

export const handleWebhookHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const signature = req.headers['x-paystack-signature'] as string;
    await handleWebhook(req.body, signature);
    res.status(200).send('Webhook processed');
  } catch (error: any) {
    logger.error({ error: error.message }, 'Webhook processing failed');
    res.status(400).send('Webhook processing failed');
    next(error);
  }
};
