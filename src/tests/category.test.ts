import { createCategory, getCategories, getCategoryById, updateCategory, deleteCategory } from '../services/category.service';
import { Category } from '../models/category.model';
import { ICategory, CreateCategoryInput } from '../types/category.types';
import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

jest.mock('../models/category.model');

describe('Category Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    logger.info('Cleared mocks for test');
  });

  it('should create a category', async () => {
    const mockInput = {
      name: 'SUV',
      description: 'Sport Utility Vehicles',
    } as CreateCategoryInput;

    const mockCategory = {
      _id: uuidv4(),
      ...mockInput,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as ICategory;

    (Category.findOne as jest.Mock).mockResolvedValue(null);
    (Category.create as jest.Mock).mockResolvedValue(mockCategory);

    const result = await createCategory(mockInput);

    expect(Category.findOne).toHaveBeenCalledWith({ name: mockInput.name });
    expect(Category.create).toHaveBeenCalledWith(mockInput);
    expect(result).toEqual(mockCategory);
    logger.info({ result }, 'createCategory unit test passed');
  });

  it('should fetch categories with pagination', async () => {
    const mockCategories = [
      {
        _id: uuidv4(),
        name: 'SUV',
        description: 'Sport Utility Vehicles',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ] as ICategory[];

    const mockQuery = { page: 1, limit: 10 };

    (Category.find as jest.Mock).mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(mockCategories),
    });

    (Category.countDocuments as jest.Mock).mockResolvedValue(1);

    const result = await getCategories(mockQuery);

    expect(Category.find).toHaveBeenCalledWith({});
    expect(Category.find().sort).toHaveBeenCalledWith('-createdAt');
    expect(Category.find().skip).toHaveBeenCalledWith(0);
    expect(Category.find().limit).toHaveBeenCalledWith(10);
    expect(Category.countDocuments).toHaveBeenCalledWith({});
    expect(result).toEqual({ categories: mockCategories, total: 1 });
    logger.info({ result }, 'getCategories unit test passed');
  });

  it('should fetch a category by ID', async () => {
    const mockId = uuidv4();
    const mockCategory = {
      _id: mockId,
      name: 'SUV',
      description: 'Sport Utility Vehicles',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as ICategory;

    (Category.findById as jest.Mock).mockReturnValue({
      lean: jest.fn().mockResolvedValue(mockCategory),
    });

    const result = await getCategoryById(mockId);

    expect(Category.findById).toHaveBeenCalledWith(mockId);
    expect(result).toEqual(mockCategory);
    logger.info({ result }, 'getCategoryById unit test passed');
  });

  it('should update a category', async () => {
    const mockId = uuidv4();
    const mockInput = { name: 'Updated SUV' };
    const mockCategory = {
      _id: mockId,
      name: 'Updated SUV',
      description: 'Sport Utility Vehicles',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as ICategory;

    (Category.findOne as jest.Mock).mockResolvedValue(null);
    (Category.findByIdAndUpdate as jest.Mock).mockReturnValue({
      lean: jest.fn().mockResolvedValue(mockCategory),
    });

    const result = await updateCategory(mockId, mockInput);

    expect(Category.findOne).toHaveBeenCalledWith({ name: mockInput.name, _id: { $ne: mockId } });
    expect(Category.findByIdAndUpdate).toHaveBeenCalledWith(mockId, mockInput, { new: true });
    expect(result).toEqual(mockCategory);
    logger.info({ result }, 'updateCategory unit test passed');
  });

  it('should delete a category', async () => {
    const mockId = uuidv4();
    const mockCategory = { _id: mockId };

    (Category.findByIdAndDelete as jest.Mock).mockResolvedValue(mockCategory);

    await deleteCategory(mockId);

    expect(Category.findByIdAndDelete).toHaveBeenCalledWith(mockId);
    logger.info('deleteCategory unit test passed');
  });
});