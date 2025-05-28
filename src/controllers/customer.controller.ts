import { Request, Response, NextFunction } from 'express';
import { signupCustomer, verifyOtp } from '../services/customer.service';
import { sendResponse } from '../utils/response';
import logger from '../utils/logger';
import { z } from 'zod';

const signupSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

const otpSchema = z.object({
  email: z.string().email('Invalid email'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

export const signupCustomerHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = signupSchema.parse(req.body);
    logger.debug({ email: data.email }, 'Received signup customer request');
    await signupCustomer(data);
    sendResponse(res, 200, null, undefined, undefined);
  } catch (error) {
    logger.error({ error }, 'Error during customer signup');
    next(error);
  }
};

export const verifyOtpHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = otpSchema.parse(req.body);
    logger.debug({ email: data.email }, 'Received OTP verification request');
    const token = await verifyOtp(data);
    sendResponse(res, 200, { token });
  } catch (error) {
    logger.error({ error }, 'Error verifying OTP');
    next(error);
  }
};