import { Request, Response, NextFunction } from 'express';
import { createManager, deleteManager, getManagers, updateManager } from '../services/manager.service';
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

const updateManagerSchema = z.object({
  email: z.string().email('Invalid email').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
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

export const getManagersHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = '1', limit = '10' } = req.query as { page?: string; limit?: string };
    logger.debug({ page, limit }, 'Received GET /managers request');
    const { managers, total } = await getManagers({
      page: Number(page),
      limit: Number(limit),
    });
    sendResponse(res, 200, { managers }, undefined, {
      page: Number(page),
      limit: Number(limit),
      total,
    });
  } catch (error) {
    logger.error({ error }, 'Error getting managers');
    next(error);
  }
};

export const updateManagerHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const data = updateManagerSchema.parse(req.body);
    logger.debug({ id, data }, 'Received PUT /managers/:id request');
    const manager = await updateManager(id, data);
    sendResponse(res, 200, manager);
  } catch (error) {
    logger.error({ error }, 'Error updating manager');
    next(error);
  }
};

export const deleteManagerHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    logger.debug({ id }, 'Received DELETE /managers/:id request');
    await deleteManager(id);
    sendResponse(res, 204, null);
  } catch (error) {
    logger.error({ error }, 'Error deleting manager');
    next(error);
  }
};