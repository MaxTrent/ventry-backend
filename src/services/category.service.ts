import { Category } from '../models/category.model';
import { ICategory, CreateCategoryInput, UpdateCategoryInput, CategoryQuery } from '../types/category.types';
import logger from '../utils/logger';
import { z } from 'zod';

const categoryQuerySchema = z.object({
  name: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sort: z.string().optional(),
});

const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

const updateCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
});

export const createCategory = async (data: CreateCategoryInput): Promise<ICategory> => {
  const validatedData = createCategorySchema.parse(data);
  logger.debug({ name: validatedData.name }, 'Processing category creation');

  const existingCategory = await Category.findOne({ name: validatedData.name });
  if (existingCategory) {
    logger.warn({ name: validatedData.name }, 'Category already exists');
    throw new Error('Category already exists');
  }

  const category = await Category.create(validatedData);
  logger.info({ categoryId: category._id, name: category.name }, 'Category created');
  return category as ICategory;
};

export const getCategories = async (query: CategoryQuery): Promise<{ categories: ICategory[]; total: number }> => {
  const validatedQuery = categoryQuerySchema.parse(query);
  logger.debug({ query: validatedQuery }, 'Processing category query');

  const filter: any = {};
  if (validatedQuery.name) filter.name = { $regex: validatedQuery.name, $options: 'i' };
  if (validatedQuery.search) filter.name = { $regex: validatedQuery.search, $options: 'i' };

  const sort = validatedQuery.sort ? validatedQuery.sort.replace(':', ' ') : '-createdAt';
  const skip = (validatedQuery.page - 1) * validatedQuery.limit;

  const [categories, total] = await Promise.all([
    Category.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(validatedQuery.limit)
      .lean(),
    Category.countDocuments(filter),
  ]);

  logger.info({ total, returned: categories.length, page: validatedQuery.page }, 'Fetched categories');
  return { categories: categories as ICategory[], total };
};

export const getCategoryById = async (id: string): Promise<ICategory> => {
  logger.debug({ id }, 'Fetching category by ID');
  const category = await Category.findById(id).lean();
  if (!category) {
    logger.warn({ id }, 'Category not found');
    throw new Error('Category not found');
  }
  logger.info({ categoryId: category._id }, 'Category fetched');
  return category as ICategory;
};

export const updateCategory = async (id: string, data: UpdateCategoryInput): Promise<ICategory> => {
  const validatedData = updateCategorySchema.parse(data);
  logger.debug({ id, data: validatedData }, 'Processing category update');

  if (validatedData.name) {
    const existingCategory = await Category.findOne({ name: validatedData.name, _id: { $ne: id } });
    if (existingCategory) {
      logger.warn({ name: validatedData.name }, 'Category name already exists');
      throw new Error('Category name already exists');
    }
  }

  const category = await Category.findByIdAndUpdate(id, validatedData, { new: true }).lean();
  if (!category) {
    logger.warn({ id }, 'Category not found');
    throw new Error('Category not found');
  }
  logger.info({ categoryId: category._id }, 'Category updated');
  return category as ICategory;
};

export const deleteCategory = async (id: string): Promise<void> => {
  logger.debug({ id }, 'Processing category deletion');
  const category = await Category.findByIdAndDelete(id);
  if (!category) {
    logger.warn({ id }, 'Category not found');
    throw new Error('Category not found');
  }
  logger.info({ categoryId: id }, 'Category deleted');
};