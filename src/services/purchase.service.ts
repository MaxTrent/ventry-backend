
import crypto from 'crypto';
import config from '../config/env';
import logger from '../utils/logger';
import { Purchase } from '../models/purchase.model';
import { Car } from '../models/car.model';
import { Customer } from '../models/customer.model';
import { IPurchase, CreatePurchaseInput } from '../types/purchase.types';
import { Paystack } from 'paystack-sdk';
import { v4 as uuidv4 } from 'uuid';
import { GetTransactionResponse } from 'paystack-sdk/dist/transaction/interface';
import { BadRequest } from 'paystack-sdk/dist/interface';
import { sendPurchaseConfirmationEmail } from '../utils/email';
import { z } from 'zod';

const paystack = new Paystack(config.PAYSTACK_SECRET_KEY);

const purchaseSchema = z.object({
  carId: z.string().min(1, 'Car ID is required'),
  email: z.string().email('Valid email is required'),
});

const webhookPayloadSchema = z.object({
  event: z.string().min(1, 'Event type is required'),
  data: z.object({
    reference: z.string().min(1, 'Reference is required'),
    amount: z.number().optional(),
    status: z.string().optional(),
  }),
});

export const initiatePurchase = async (
  data: CreatePurchaseInput,
  customerId: string
): Promise<{ purchase: IPurchase; paymentUrl: string }> => {
  logger.debug({ data, customerId }, 'Initiating purchase');

  const validatedData = purchaseSchema.parse(data);

  const car = await Car.findById(validatedData.carId).lean();
  if (!car) {
    logger.warn({ carId: validatedData.carId }, 'Car not found');
    throw new Error('Car not found');
  }
  if (!car.isAvailable) {
    logger.warn({ carId: validatedData.carId }, 'Car not available');
    throw new Error('Car not available');
  }

  const customer = await Customer.findById(customerId).lean();
  if (!customer) {
    logger.warn({ customerId }, 'Customer not found');
    throw new Error('Customer not found');
  }

  const reference = `ventry_${uuidv4()}`;
  const amountInKobo = Math.round(car.price * 100); // Paystack uses kobo

  try {
    const payment = await paystack.transaction.initialize({
      email: validatedData.email,
      amount: amountInKobo.toString(),
      reference,
      callback_url: `${config.APP_URL}/api/purchases/callback`,
    });

    if (!payment.data?.authorization_url) {
      logger.error({ payment }, 'Payment initialization failed');
      throw new Error('Payment initialization failed');
    }

    const purchase = await Purchase.create({
      _id: reference,
      customerId,
      carId: validatedData.carId,
      amount: car.price,
      paymentReference: reference,
      paymentStatus: 'pending',
    });

    logger.info({ purchaseId: purchase._id }, 'Purchase initiated');
    return { purchase, paymentUrl: payment.data.authorization_url };
  } catch (error: any) {
    logger.error({ error: error.message, stack: error.stack }, 'Purchase initiation failed');
    throw new Error(`Purchase initiation failed: ${error.message}`);
  }
};

export const handlePaymentCallback = async (reference: string): Promise<IPurchase> => {
  logger.debug({ reference }, 'Verifying purchase');

  const purchase = await Purchase.findOne({ paymentReference: reference });
  if (!purchase) {
    logger.warn({ reference }, 'Purchase not found');
    throw new Error('Purchase not found');
  }

  try {
    const verification: BadRequest | GetTransactionResponse = await paystack.transaction.verify(reference);

    if ('data' in verification && verification.data && verification.data.status === 'success' && verification.data.amount === purchase.amount * 100) {
      purchase.paymentStatus = 'completed';
      await Car.findByIdAndUpdate(purchase.carId, { isAvailable: false });
      await purchase.save();

      // Fetch car and customer for email
      const car = await Car.findById(purchase.carId).lean();
      const customer = await Customer.findById(purchase.customerId).lean();
      if (car && customer) {
        try {
          await sendPurchaseConfirmationEmail(
            customer.email,
            car.brand,
            car.model,
            purchase.amount
          );
        } catch (emailError: any) {
          logger.error(
            { error: emailError.message, purchaseId: purchase._id },
            'Failed to send purchase confirmation email'
          );
        }
      } else {
        logger.warn({ purchaseId: purchase._id }, 'Car or customer not found for email');
      }

      logger.info({ purchaseId: purchase._id }, 'Purchase completed');
      return purchase;
    } else {
      purchase.paymentStatus = 'failed';
      await purchase.save();
      logger.warn({ reference, status: (verification as any).data?.status || 'unknown' }, 'Payment verification failed');
      throw new Error('Payment verification failed');
    }
  } catch (error: any) {
    logger.error({ error: error.message, stack: error.stack }, 'Verification failed');
    throw new Error(`Verification failed: ${error.message}`);
  }
};

export const handleWebhook = async (payload: any, signature: string): Promise<void> => {
  try {
    const hash = crypto
      .createHmac('sha512', config.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(payload))
      .digest('hex');
    if (hash !== signature) {
      logger.warn({ signature, computed: hash }, 'Invalid webhook signature');
      throw new Error('Invalid webhook signature');
    }

    
    const validatedPayload = webhookPayloadSchema.parse(payload);
    const { event, data } = validatedPayload;
    logger.debug({ event, data }, 'Processing webhook');

    if (event === 'charge.success') {
      const purchase = await Purchase.findOne({ paymentReference: data.reference });
      if (!purchase) {
        logger.warn({ reference: data.reference }, 'Purchase not found in webhook');
        throw new Error('Purchase not found');
      }

      if (purchase.paymentStatus !== 'completed') {
        purchase.paymentStatus = 'completed';
        await Car.findByIdAndUpdate(purchase.carId, { isAvailable: false });
        await purchase.save();

        const car = await Car.findById(purchase.carId).lean();
        const customer = await Customer.findById(purchase.customerId).lean();
        if (car && customer) {
          try {
            await sendPurchaseConfirmationEmail(
              customer.email,
              car.brand,
              car.model,
              purchase.amount
            );
          } catch (emailError: any) {
            logger.error(
              { error: emailError.message, purchaseId: purchase._id },
              'Failed to send purchase confirmation email in webhook'
            );
          }
        }

        logger.info({ purchaseId: purchase._id }, 'Purchase completed via webhook');
      }
    } else if (event === 'charge.failed') {
      const purchase = await Purchase.findOne({ paymentReference: data.reference });
      if (!purchase) {
        logger.warn({ reference: data.reference }, 'Purchase not found in webhook');
        throw new Error('Purchase not found');
      }

      purchase.paymentStatus = 'failed';
      await purchase.save();
      logger.info({ purchaseId: purchase._id }, 'Purchase failed via webhook');
    } else {
      logger.warn({ event }, 'Unhandled webhook event');
    }
  } catch (error: any) {
    logger.error({ error: error.message, stack: error.stack }, 'Webhook processing error');
    throw error;
  }
};
