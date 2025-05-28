import { Manager } from '../models/manager.model';
import { CreateManagerInput, IManager } from '../types/manager.types';
import logger from '../utils/logger';
import { z } from 'zod';

const createManagerSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.literal('manager'),
});

export const createManager = async (data: CreateManagerInput): Promise<IManager> => {
  const validatedData = createManagerSchema.parse(data);
  logger.debug({ email: validatedData.email }, 'Processing manager creation');

  const existingManager = await Manager.findOne({ email: validatedData.email });
  if (existingManager) {
    logger.warn({ email: validatedData.email }, 'Manager already exists');
    throw new Error('Email already registered');
  }

  const manager = await Manager.create(validatedData);
  logger.info({ managerId: manager._id, email: manager.email }, 'Manager created');
  return manager;
};