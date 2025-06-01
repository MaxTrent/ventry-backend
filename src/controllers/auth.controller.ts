import { Request, Response, NextFunction } from 'express';
import { login, logout } from '../services/auth.service';
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
  } catch (error: any) {
    logger.error({ error: error.message, email: req.body.email }, 'Error during login');
    if (error.message === 'Invalid credentials' || error.message === 'Account not verified') {
      sendResponse(res, 401, null, error.message);
    } else {
      next(error);
    }
  }
};

export const logoutHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      sendResponse(res, 401, null, 'No token provided');
      return;
    }
    await logout(token);
    sendResponse(res, 200, null, 'Logged out successfully');
  } catch (error: any) {
    logger.error({ error: error.message }, 'Error during logout');
    next(error);
  }
};