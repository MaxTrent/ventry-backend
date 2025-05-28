import { getCars, createCar } from '../services/car.service';
import { Car } from '../models/car.model';
import { ICar, CreateCarInput } from '../types/car.types';
import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

jest.mock('../models/car.model');

describe('Car Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    logger.info('Cleared mocks for test');
  });

  it('should fetch cars with filters and pagination', async () => {
    const mockCars: ICar[] = [
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

    const mockQuery = {
      brand: 'Toyota',
      page: 1,
      limit: 10,
    };

    (Car.find as jest.Mock).mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(mockCars),
    });

    (Car.countDocuments as jest.Mock).mockResolvedValue(1);

    const result = await getCars(mockQuery);

    expect(Car.find).toHaveBeenCalledWith({ brand: { $regex: 'Toyota', $options: 'i' } });
    expect(Car.find().sort).toHaveBeenCalledWith('-createdAt');
    expect(Car.find().skip).toHaveBeenCalledWith(0);
    expect(Car.find().limit).toHaveBeenCalledWith(10);
    expect(Car.countDocuments).toHaveBeenCalledWith({ brand: { $regex: 'Toyota', $options: 'i' } });
    expect(result).toEqual({ cars: mockCars, total: 1 });
    logger.info({ result }, 'getCars unit test passed');
  });

  it('should create a car with default isAvailable', async () => {
    const mockInput: CreateCarInput = {
      brand: 'Honda',
      model: 'Civic',
      price: 20000,
      category: uuidv4(),
      year: 2023,
      fuelType: 'Petrol',
      transmission: 'Manual',
      color: 'Red',
    };

    const mockCar: ICar = {
      ...mockInput,
      _id: uuidv4(),
      isAvailable: true,
      mileage: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (Car.create as jest.Mock).mockResolvedValue(mockCar);

    const result = await createCar(mockInput);

    expect(Car.create).toHaveBeenCalledWith({ ...mockInput, isAvailable: true });
    expect(result).toEqual(mockCar);
    logger.info({ result }, 'createCar unit test passed');
  });
});