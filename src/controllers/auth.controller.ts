import { Request, Response, NextFunction } from 'express';
import { login } from '../services/auth.service';
import { sendResponse } from '../utils/response';
import logger from '../utils/logger';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

export const loginHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = loginSchema.parse(req.body);
    logger.debug({ email: data.email }, 'Received login request');
    const result = await login(data);
    sendResponse(res, 200, result);
  } catch (error) {
    logger.error({ error }, 'Error during login');
    next(error);
  }
};