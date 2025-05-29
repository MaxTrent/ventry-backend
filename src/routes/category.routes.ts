import { Router } from 'express';
import {
  createCategoryHandler,
  getCategoriesHandler,
  getCategoryByIdHandler,
  updateCategoryHandler,
  deleteCategoryHandler,
} from '../controllers/category.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import logger from '../utils/logger';

const router = Router();

router.post('/', authMiddleware(['superadmin', 'manager']), createCategoryHandler);
router.get('/', getCategoriesHandler);
router.get('/:id', getCategoryByIdHandler);
router.put('/:id', authMiddleware(['superadmin', 'manager']), updateCategoryHandler);
router.delete('/:id', authMiddleware(['superadmin', 'manager']), deleteCategoryHandler);

router.use((req, res, next) => {
  logger.info({ method: req.method, path: req.path }, 'Category route accessed');
  next();
});

export default router;