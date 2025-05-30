import { getCars, createCar, updateCar, deleteCar } from '../services/car.service';
import { Car } from '../models/car.model';
import { Category } from '../models/category.model';
import { ICar, CarQuery, CreateCarInput } from '../types/car.types';
import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

jest.mock('../models/car.model', () => ({
  Car: {
    find: jest.fn(),
    countDocuments: jest.fn(),
    create: jest.fn(),
  },
}));
jest.mock('../models/category.model', () => ({
  Category: {
    findById: jest.fn(),
  },
}));

describe('Car Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    logger.info('Cleared mocks for test');
  });

  it('should fetch cars with filters and pagination', async () => {
    const query: CarQuery = { page: 1, limit: 10 };
    const cars: ICar[] = [
      {
        _id: uuidv4(),
        brand: 'Toyota',
        model: 'Camry',
        price: 25000,
        isAvailable: true,
        category: uuidv4(),
        year: 2022,
        mileage: 0,
        fuelType: 'Petrol',
        transmission: 'Automatic',
        color: 'Blue',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    (Car.find as jest.Mock).mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(cars),
    });
    (Car.countDocuments as jest.Mock).mockResolvedValue(1);

    const fetchResult = await getCars(query);

    expect(Car.find).toHaveBeenCalledWith({});
    expect(Car.find().sort).toHaveBeenCalledWith('-createdAt');
    expect(Car.find().skip).toHaveBeenCalledWith(0);
    expect(Car.find().limit).toHaveBeenCalledWith(10);
    expect(Car.countDocuments).toHaveBeenCalledWith({});
    expect(fetchResult).toEqual({ cars, total: 1 });
    logger.info({ result: fetchResult }, 'getCars unit test passed');
  });

  it('should create a car', async () => {
    const input: CreateCarInput = {
      brand: 'Toyota',
      model: 'Camry',
      price: 25000,
      isAvailable: true, // Explicitly set to ensure boolean
      category: uuidv4(),
      year: 2022,
      mileage: 0,
      fuelType: 'Petrol',
      transmission: 'Automatic',
      color: 'Blue',
    };

    const car: ICar = {
      _id: uuidv4(),
      ...input,
      isAvailable: input.isAvailable ?? true, // Default to true if undefined
      mileage: input.mileage ?? 0, // Default to 0 if undefined
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (Category.findById as jest.Mock).mockReturnValue({
      lean: jest.fn().mockResolvedValue({ _id: input.category }),
    });
    (Car.create as jest.Mock).mockResolvedValue(car);

    const createResult = await createCar(input);

    expect(Category.findById).toHaveBeenCalledWith(input.category);
    expect(Car.create).toHaveBeenCalledWith(input);
    expect(createResult).toEqual(car);
    logger.info({ result: createResult }, 'createCar unit test passed');
  });

  it('should update a car', async () => {
    const carId = uuidv4();
    const categoryId = uuidv4();
    const updatedData = { price: 26000, isAvailable: false };
    const category = { _id: categoryId, name: 'SUV' };
    const car = {
      _id: carId,
      brand: 'Toyota',
      model: 'Camry',
      price: 26000,
      isAvailable: false,
      category: categoryId,
      year: 2022,
    };

    (Category.findById as jest.Mock).mockReturnValue({
      lean: jest.fn().mockResolvedValue(category),
    });
    (Car.findByIdAndUpdate as jest.Mock).mockResolvedValue(car);

    const result = await updateCar(carId, updatedData);

    expect(Car.findByIdAndUpdate).toHaveBeenCalledWith(carId, updatedData, { new: true });
    expect(result).toEqual(car);
    logger.info({ result }, 'updateCar unit test passed');
  });

  it('should delete a car', async () => {
    const carId = uuidv4();
    const car = { _id: carId, brand: 'Toyota', model: 'Camry' };

    (Car.findByIdAndDelete as jest.Mock).mockResolvedValue(car);

    await deleteCar(carId);

    expect(Car.findByIdAndDelete).toHaveBeenCalledWith(carId);
    logger.info('deleteCar unit test passed');
  });
});

