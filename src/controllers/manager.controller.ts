import { Request, Response, NextFunction } from 'express';
import { createManager } from '../services/manager.service';
import { sendResponse } from '../utils/response';
import logger from '../utils/logger';
import { z } from 'zod';

const createManagerSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.literal('manager'),
});

export const createManagerHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = createManagerSchema.parse(req.body);
    logger.debug({ email: data.email }, 'Received create manager request');
    const manager = await createManager(data);
    sendResponse(res, 201, manager);
  } catch (error) {
    logger.error({ error }, 'Error creating manager');
    next(error);
  }
};