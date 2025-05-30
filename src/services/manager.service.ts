import { Manager } from '../models/manager.model';
import { CreateManagerInput, IManager, ManagerQuery } from '../types/manager.types';
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

export const getManagers = async (query: ManagerQuery): Promise<{ managers: IManager[]; total: number }> => {
  const { page = 1, limit = 10 } = query;
  logger.debug({ page, limit }, 'Processing managers query');

  const skip = (page - 1) * limit;
  const [managers, total] = await Promise.all([
    Manager.find({ role: 'manager' })
      .skip(skip)
      .limit(limit)
      .lean(),
    Manager.countDocuments({ role: 'manager' }),
  ]);

  logger.info({ total, returned: managers.length, page }, 'Fetched managers');
  return { managers, total };
};

export const updateManager = async (id: string, data: Partial<CreateManagerInput>): Promise<IManager> => {
  logger.debug({ id, data }, 'Processing manager update');
  if (data.email) {
    const existingManager = await Manager.findOne({ email: data.email, _id: { $ne: id } });
    if (existingManager) {
      logger.warn({ email: data.email }, 'Email already registered');
      throw new Error('Email already registered');
    }
  }

  const manager = await Manager.findByIdAndUpdate(id, data, { new: true }).lean();
  if (!manager) {
    logger.warn({ managerId: id }, 'Manager not found');
    throw new Error('Manager not found');
  }

  logger.info({ managerId: id, email: manager.email }, 'Manager updated');
  return manager;
};

export const deleteManager = async (id: string): Promise<void> => {
  logger.debug({ id }, 'Processing manager deletion');
  const manager = await Manager.findByIdAndDelete(id);
  if (!manager) {
    logger.warn({ managerId: id }, 'Manager not found');
    throw new Error('Manager not found');
  }
  logger.info({ managerId: id }, 'Manager deleted');
};