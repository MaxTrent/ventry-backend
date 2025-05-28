import { Car } from '../models/car.model';
import { ICar, CarQuery, CreateCarInput } from '../types/car.types';
import logger from '../utils/logger';
import { z } from 'zod';

const carQuerySchema = z.object({
  brand: z.string().optional(),
  model: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  isAvailable: z.coerce.boolean().optional(),
  category: z.string().optional(),
  minYear: z.coerce.number().optional(),
  maxYear: z.coerce.number().optional(),
  fuelType: z.string().optional(),
  transmission: z.string().optional(),
  color: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sort: z.string().optional(),
});

export const getCars = async (query: CarQuery): Promise<{ cars: ICar[]; total: number }> => {
  const validatedQuery = carQuerySchema.parse(query);
  logger.debug({ query: validatedQuery }, 'Processing car query');

  const filter: any = {};
  if (validatedQuery.brand) filter.brand = { $regex: validatedQuery.brand, $options: 'i' };
  if (validatedQuery.model) filter.model = { $regex: validatedQuery.model, $options: 'i' };
  if (validatedQuery.minPrice) filter.price = { $gte: validatedQuery.minPrice };
  if (validatedQuery.maxPrice) filter.price = { ...filter.price, $lte: validatedQuery.maxPrice };
  if (validatedQuery.isAvailable !== undefined) filter.isAvailable = validatedQuery.isAvailable;
  if (validatedQuery.category) filter.category = validatedQuery.category;
  if (validatedQuery.minYear) filter.year = { $gte: validatedQuery.minYear };
  if (validatedQuery.maxYear) filter.year = { ...filter.year, $lte: validatedQuery.maxYear };
  if (validatedQuery.fuelType) filter.fuelType = validatedQuery.fuelType;
  if (validatedQuery.transmission) filter.transmission = validatedQuery.transmission;
  if (validatedQuery.color) filter.color = { $regex: validatedQuery.color, $options: 'i' };
  if (validatedQuery.search) {
    filter.$or = [
      { brand: { $regex: validatedQuery.search, $options: 'i' } },
      { model: { $regex: validatedQuery.search, $options: 'i' } },
    ];
  }

  const sort = validatedQuery.sort ? validatedQuery.sort.replace(':', ' ') : '-createdAt';
  const skip = (validatedQuery.page - 1) * validatedQuery.limit;

  const [cars, total] = await Promise.all([
    Car.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(validatedQuery.limit)
      .lean(),
    Car.countDocuments(filter),
  ]);

  logger.info({ total, returned: cars.length, page: validatedQuery.page }, 'Fetched cars');
  return { cars, total };
};

export const createCar = async (data: CreateCarInput): Promise<ICar> => {
  const car = await Car.create({ ...data, isAvailable: data.isAvailable ?? true });
  logger.info({ carId: car._id, brand: car.brand, model: car.model }, 'Car created');
  return car;
};