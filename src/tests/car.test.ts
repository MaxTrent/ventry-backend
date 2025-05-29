import { getCars, createCar } from '../services/car.service';
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
    const mockCars = [
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
    ] as ICar[];

    const mockQuery = { page: 1, limit: 10 } as CarQuery;

    (Car.find as jest.Mock).mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(mockCars),
    });
    (Car.countDocuments as jest.Mock).mockResolvedValue(1);

    const result = await getCars(mockQuery);

    expect(Car.find).toHaveBeenCalledWith({});
    expect(Car.find().sort).toHaveBeenCalledWith('-createdAt');
    expect(Car.find().skip).toHaveBeenCalledWith(0);
    expect(Car.find().limit).toHaveBeenCalledWith(10);
    expect(Car.countDocuments).toHaveBeenCalledWith({});
    expect(result).toEqual({ cars: mockCars, total: 1 });
    logger.info({ result }, 'getCars unit test passed');
  });

  it('should create a car', async () => {
    const mockInput = {
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
    } as CreateCarInput;

    const mockCar = {
      _id: uuidv4(),
      ...mockInput,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as ICar;

    (Category.findById as jest.Mock).mockResolvedValue({ _id: mockInput.category });
    (Car.create as jest.Mock).mockResolvedValue(mockCar);

    const result = await createCar(mockInput);

    expect(Category.findById).toHaveBeenCalledWith(mockInput.category);
    expect(Car.create).toHaveBeenCalledWith(mockInput);
    expect(result).toEqual(mockCar);
    logger.info({ result }, 'createCar unit test passed');
  });
});

