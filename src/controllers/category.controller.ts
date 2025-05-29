import { Request, Response, NextFunction } from 'express';
import { createCategory, getCategories, getCategoryById, updateCategory, deleteCategory } from '../services/category.service';
import { sendResponse } from '../utils/response';
import { CategoryQuery, CreateCategoryInput, UpdateCategoryInput } from '../types/category.types';
import logger from '../utils/logger';
import { z } from 'zod';

const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

const updateCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
});

export const createCategoryHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = createCategorySchema.parse(req.body) as CreateCategoryInput;
    logger.debug({ name: data.name }, 'Received create category request');
    const category = await createCategory(data);
    sendResponse(res, 201, category);
  } catch (error) {
    logger.error({ error }, 'Error creating category');
    next(error);
  }
};

export const getCategoriesHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query = req.query as unknown as CategoryQuery;
    logger.debug({ query }, 'Received get categories request');
    const { categories, total } = await getCategories(query);
    sendResponse(res, 200, { categories }, undefined, {
      page: query.page || 1,
      limit: query.limit || 10,
      total,
    });
  } catch (error) {
    logger.error({ error }, 'Error fetching categories');
    next(error);
  }
};

export const getCategoryByIdHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id;
    logger.debug({ id }, 'Received get category by ID request');
    const category = await getCategoryById(id);
    sendResponse(res, 200, category);
  } catch (error) {
    logger.error({ error }, 'Error fetching category');
    next(error);
  }
};

export const updateCategoryHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id;
    const data = updateCategorySchema.parse(req.body) as UpdateCategoryInput;
    logger.debug({ id, data }, 'Received update category request');
    const category = await updateCategory(id, data);
    sendResponse(res, 200, category);
  } catch (error) {
    logger.error({ error }, 'Error updating category');
    next(error);
  }
};

export const deleteCategoryHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id;
    logger.debug({ id }, 'Received delete category request');
    await deleteCategory(id);
    sendResponse(res, 204, null);
  } catch (error) {
    logger.error({ error }, 'Error deleting category');
    next(error);
  }
};