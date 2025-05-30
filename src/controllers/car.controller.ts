import { Request, Response, NextFunction } from 'express';
import { getCars, createCar, updateCar, deleteCar } from '../services/car.service';
import { sendResponse } from '../utils/response';
import { CarQuery, CreateCarInput } from '../types/car.types';
import logger from '../utils/logger';
import { z } from 'zod';

const createCarSchema = z.object({
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  price: z.number().positive('Price must be positive'),
  isAvailable: z.boolean().optional(),
  category: z.string().min(1, 'Category ID is required'),
  year: z.number().int().min(1900).max(new Date().getFullYear(), 'Invalid year'),
  mileage: z.number().nonnegative('Mileage must be non-negative').optional(),
  fuelType: z.enum(['Petrol', 'Diesel', 'Electric', 'Hybrid'], {
    message: 'Invalid fuel type',
  }),
  transmission: z.enum(['Automatic', 'Manual'], {
    message: 'Invalid transmission type',
  }),
  color: z.string().min(1, 'Color is required'),
});

export const getCarsHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query = req.query as unknown as CarQuery;
    logger.debug({ query }, 'Received GET /cars request');
    const { cars, total } = await getCars(query);
    sendResponse(res, 200, { cars }, undefined, {
      page: query.page || 1,
      limit: query.limit || 10,
      total,
    });
  } catch (error) {
    logger.error({ error }, 'Error getting cars');
    next(error);
  }
};

export const createCarHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = createCarSchema.parse(req.body) as CreateCarInput;
    logger.debug({ data }, 'Received POST /cars request');
    const car = await createCar(data);
    sendResponse(res, 201, car);
  } catch (error) {
    logger.error({ error }, 'Error creating car');
    next(error);
  }
};

export const updateCarHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const data = createCarSchema.partial().parse(req.body) as Partial<CreateCarInput>;
    logger.debug({ id, data }, 'Received PUT /cars/:id request');
    const car = await updateCar(id, data);
    sendResponse(res, 200, car);
  } catch (error) {
    logger.error({ error }, 'Error updating car');
    next(error);
  }
};

export const deleteCarHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    logger.debug({ id }, 'Received DELETE /cars/:id request');
    await deleteCar(id);
    sendResponse(res, 204, null);
  } catch (error) {
    logger.error({ error }, 'Error deleting car');
    next(error);
  }
};