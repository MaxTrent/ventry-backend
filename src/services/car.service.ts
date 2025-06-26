import { Car } from '../models/car.model';
import { Category } from '../models/category.model';
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
  logger.debug({ data }, 'Processing car creation');
  const category = await Category.findById(data.category).lean();
  if (!category) {
    logger.warn({ categoryId: data.category }, 'Category not found');
    throw new Error('Category not found');
  }

  const car = await Car.create({ ...data, isAvailable: data.isAvailable ?? true });
  logger.info({ carId: car._id, brand: car.brand, model: car.model }, 'Car created');
  return car;
};


export const updateCar = async (id: string, data: Partial<CreateCarInput>): Promise<ICar> => {
  logger.debug({ id, data }, 'Processing car update');
  if (data.category) {
    const category = await Category.findById(data.category).lean();
    if (!category) {
      logger.warn({ categoryId: data.category }, 'Category not found');
      throw new Error('Category not found');
    }
  }

  const car = await Car.findByIdAndUpdate(id, data, { new: true }).lean();
  if (!car) {
    logger.warn({ carId: id }, 'Car not found');
    throw new Error('Car not found');
  }

  logger.info({ carId: car._id, brand: car.brand, model: car.model }, 'Car updated');
  return car;
};

export const deleteCar = async (id: string): Promise<void> => {
  logger.debug({ id }, 'Processing car deletion');
  const car = await Car.findByIdAndDelete(id);
  if (!car) {
    logger.warn({ carId: id }, 'Car not found');
    throw new Error('Car not found');
  }
  logger.info({ carId: id }, 'Car deleted');
};

export const uploadCarPhotos = async (carId: string, files: Express.Multer.File[]): Promise<ICar> => {
  const photoUrls = files.map(file => `/uploads/cars/${file.filename}`);
  const car = await Car.findByIdAndUpdate(carId, { $push: { photos: { $each: photoUrls } } }, { new: true }).lean();

  if (!car) throw new Error('Car not found');

  logger.info({carId, photoCount: photoUrls.length}, 'Photos uploaded for car');
return car;
}


export const deleteCarPhoto = async (carId: string, photoUrl: string): Promise<ICar> => {
  const car = await Car.findByIdAndUpdate(carId, { $pull: { photos: photoUrl } }, { new: true }).lean();

  if (!car) throw new Error('Car not found');

  logger.info({carId, photoUrl}, 'Photo deleted for car');
  return car;
}